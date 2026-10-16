"""Local server that behaves like Vercel with cleanUrls (for testing).

/page.html redirects to /page, /page serves page.html, unknown paths get 404.html.
Usage: python3 tools/serve.py [port]
"""
import http.server, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8766


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        path, _, q = self.path.partition('?')
        qs = '?' + q if q else ''
        if path.endswith('.html'):
            clean = path[:-5]
            if clean.endswith('/index'):
                clean = clean[:-5] or '/'
            self.send_response(308); self.send_header('Location', clean + qs); self.end_headers(); return
        fs = os.path.join(ROOT, path.lstrip('/'))
        if path != '/' and not os.path.splitext(path)[1] and os.path.isfile(fs + '.html'):
            self.path = path + '.html' + qs
        elif not (path == '/' or os.path.exists(fs)):
            body = open(os.path.join(ROOT, '404.html'), 'rb').read()
            self.send_response(404); self.send_header('Content-Type', 'text/html'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        return super().do_GET()


http.server.ThreadingHTTPServer(('', PORT), Handler).serve_forever()
