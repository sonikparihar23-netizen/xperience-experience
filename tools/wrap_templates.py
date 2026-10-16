"""Wrap each page's <x-dc> template in an inert <script type="text/x-dc-template">.

The browser then treats the template as plain text, so it doesn't fetch the template's
images, iframes and videos before support.js renders the page. Safe to re-run.

Usage: python3 tools/wrap_templates.py [site_dir]
"""
import os, re, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..')
MARK = '<script type="text/x-dc-template">'

for f in sorted(os.listdir(ROOT)) + ['templates/' + t for t in sorted(os.listdir(os.path.join(ROOT, 'templates')))]:
    if not f.endswith('.html'):
        continue
    p = os.path.join(ROOT, f)
    s = open(p, encoding='utf-8').read()
    m = re.search(r'<x-dc(\s[^>]*)?>', s)
    if not m or MARK in s:
        continue
    a, b = m.end(), s.rindex('</x-dc>')
    # support.js reverses these two escapes when it reads the template
    body = s[a:b].replace('</script', '<\\/script').replace('</SCRIPT', '<\\/SCRIPT').replace('<!--', '<\\!--')
    open(p, 'w', encoding='utf-8').write(s[:a] + MARK + body + '</script>' + s[b:])
    print('wrapped', f)
