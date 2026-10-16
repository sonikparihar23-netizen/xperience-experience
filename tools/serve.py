"""Local server that follows vercel.json the way Vercel does (for testing).

Supports cleanUrls, redirects (with `missing` query conditions), rewrites (with `has`
query conditions and :param / named-group substitution) and 404.html.
Usage: python3 tools/serve.py [port]
"""
import http.server, json, os, re, sys
from urllib.parse import parse_qs

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8766


def config():
    with open(os.path.join(ROOT, 'vercel.json')) as fh:
        return json.load(fh)


def match(rule, path, query):
    """Return substitution params if the rule matches, else None."""
    pat = '^' + re.sub(r':(\w+)', r'(?P<\1>[^/]+)', re.escape(rule['source']).replace('\\:', ':')) + '$'
    m = re.match(pat, path)
    if not m:
        return None
    params = dict(m.groupdict())
    for cond in rule.get('has', []):
        vals = query.get(cond['key'])
        if cond['type'] != 'query' or not vals:
            return None
        if 'value' in cond:
            vm = re.search(cond['value'].replace('(?<', '(?P<'), vals[0])
            if not vm:
                return None
            params.update(vm.groupdict())
    for cond in rule.get('missing', []):
        if cond['type'] == 'query' and query.get(cond['key']):
            return None
    return params


def fill(dest, params):
    return re.sub(r':(\w+)', lambda m: params.get(m.group(1), m.group(0)), dest)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def redirect(self, to, code=308):
        self.send_response(code); self.send_header('Location', to); self.end_headers()

    def do_GET(self):
        cfg = config()
        path, _, q = self.path.partition('?')
        qs = '?' + q if q else ''
        query = parse_qs(q)
        for r in cfg.get('redirects', []):
            p = match(r, path, query)
            if p is not None:
                dest = fill(r['destination'], p)
                return self.redirect(dest + (('&' if '?' in dest else '?') + q if q and '?' not in r['destination'] else ''), 308 if r.get('permanent') else 307)
        if path.endswith('.html'):
            clean = path[:-5]
            return self.redirect((clean[:-5] or '/' if clean.endswith('/index') else clean) + qs)
        target = path
        fs = os.path.join(ROOT, path.lstrip('/'))
        if not (path == '/' or os.path.isfile(fs) or os.path.isfile(fs + '.html')):
            for r in cfg.get('rewrites', []):
                p = match(r, path, query)
                if p is not None:
                    target = fill(r['destination'], p)
                    break
        fs = os.path.join(ROOT, target.lstrip('/'))
        if target != '/' and not os.path.splitext(target)[1] and os.path.isfile(fs + '.html'):
            self.path = target + '.html' + qs
        elif target == '/' or os.path.isfile(fs):
            self.path = target + qs
        else:
            body = open(os.path.join(ROOT, '404.html'), 'rb').read()
            self.send_response(404); self.send_header('Content-Type', 'text/html'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        return super().do_GET()


http.server.ThreadingHTTPServer(('', PORT), Handler).serve_forever()
