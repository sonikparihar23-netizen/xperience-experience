"""Pre-render every page so its content is in the HTML before any JavaScript runs.

  python3 tools/prerender.py        (tools/build_seo.py runs this at the end)

For each page it starts tools/serve.py, renders the page in headless Google Chrome at
phone size (Google indexes the mobile version), and embeds a static snapshot:
  * <div id="xr-prerender"> before <x-dc> in <body>: the rendered markup, minus scripts,
    iframes and videos, with <image-slot> turned into plain <img>
  * <style id="xr-prerender-css"> plus font links in <head>, between <!-- prerender:start/end -->
support.js shows the snapshot until the live page has rendered, then swaps them in one frame.
Visitors and crawlers that don't run JavaScript see the snapshot.
"""
import concurrent.futures, html, os, re, socket, subprocess, sys, tempfile, time, urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
ROOT_PAGES = ['index', 'search', 'sell', 'rent', 'guides', 'insights', 'team', 'about', 'contact', 'faqs', 'careers', 'compare']
HEAD_START, HEAD_END = '<!-- prerender:start -->', '<!-- prerender:end -->'
BODY_RE = re.compile(r'\n?<div id="xr-prerender"[^>]*>.*?<!-- /xr-prerender --></div>', re.S)


def free_port():
    with socket.socket() as s:
        s.bind(('', 0)); return s.getsockname()[1]


def page_url(f):
    """Local URL that serves this file (copies in s/ are served at their canonical address)."""
    if f.startswith('s/'):
        canon = re.search(r'<link rel="canonical" href="https://[^/]+([^"]*)"', open(os.path.join(ROOT, f), encoding='utf-8').read())
        return html.unescape(canon.group(1)) if canon else None
    name = f[:-5]
    return '/' if name == 'index' else '/' + name


def render(url, port, profile):
    out = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
                          f'--user-data-dir={profile}', '--window-size=375,812', '--virtual-time-budget=7000',
                          '--dump-dom', f'http://localhost:{port}{url}'], capture_output=True, text=True, timeout=90)
    return out.stdout


def inner_div(dom, open_tag_re):
    """Inner HTML of the first div matching open_tag_re, with nested divs balanced."""
    m = re.search(open_tag_re, dom)
    if not m:
        return None
    depth, i = 1, m.end()
    for t in re.finditer(r'<(/?)div\b[^>]*>', dom[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            return dom[i:i + t.start()]
    return None


def snapshot(dom):
    body = inner_div(dom, r'<div id="dc-root"[^>]*>')
    if body is None:
        return None, None
    body = re.sub(r'<script\b.*?</script>|<iframe\b.*?</iframe>|<video\b.*?</video>|<style\b.*?</style>', '', body, flags=re.S)
    def slot(mm):
        a = mm.group(1); src = re.search(r'\ssrc="([^"]*)"', a); alt = re.search(r'\splaceholder="([^"]*)"', a)
        cls = re.search(r'\sclassname="([^"]*)"', a)
        if not src:
            return ''
        return (f'<img src="{src.group(1)}" alt="{alt.group(1) if alt else ""}" loading="lazy" decoding="async"'
                f'{(" class=" + chr(34) + cls.group(1) + chr(34)) if cls else ""} style="display:block;width:100%;height:100%;object-fit:cover">')
    body = re.sub(r'<image-slot\b([^>]*)>.*?</image-slot>', slot, body, flags=re.S)
    body = re.sub(r'\sdata-dc-tpl="[^"]*"', '', body)
    head = dom.split('<body', 1)[0]
    styles = [t for t in re.findall(r'<style\b[^>]*>(.*?)</style>', head, re.S) if 'x-dc{display:none' not in t]
    fonts = [l for l in re.findall(r'<link [^>]*>', head) if 'fonts.googleapis.com/css2' in l]
    return body, (fonts, '\n'.join(styles))


def embed(f, body, assets):
    p = os.path.join(ROOT, f)
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'\n?' + re.escape(HEAD_START) + r'.*?' + re.escape(HEAD_END), '', s, flags=re.S)
    s = BODY_RE.sub('', s)
    fonts, css = assets
    block = HEAD_START + '\n' + '\n'.join(fonts) + '\n<style id="xr-prerender-css">' + css.replace('</', '<\\/') + '</style>\n' + HEAD_END
    s = s.replace('</head>', block + '\n</head>', 1)
    s = s.replace('<x-dc>', '<div id="xr-prerender">' + body + '<!-- /xr-prerender --></div>\n<x-dc>', 1)
    open(p, 'w', encoding='utf-8').write(s)


def main():
    if not os.path.exists(CHROME):
        print('prerender: Google Chrome not found, skipped'); return
    files = [p + '.html' for p in ROOT_PAGES] + sorted('s/' + f for f in os.listdir(os.path.join(ROOT, 's')) if f.endswith('.html'))
    port = free_port()
    server = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tools', 'serve.py'), str(port)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                urllib.request.urlopen(f'http://localhost:{port}/robots.txt', timeout=1); break
            except Exception:
                time.sleep(0.2)
        tmp = tempfile.mkdtemp(prefix='xr-prerender-')
        def job(i_f):
            i, f = i_f
            url = page_url(f)
            if not url:
                return f, 'no url'
            body, assets = snapshot(render(url, port, os.path.join(tmp, str(i))))
            if not body or len(re.sub(r'<[^>]+>|\s+', '', body)) < 200:
                return f, 'render failed'
            embed(f, body, assets)
            return f, 'ok'
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
            results = list(ex.map(job, enumerate(files)))
    finally:
        server.terminate()
    bad = [r for r in results if r[1] != 'ok']
    print(f'prerender: {len(results) - len(bad)} of {len(results)} pages' + (f'; problems: {bad}' if bad else ''))


if __name__ == '__main__':
    main()
