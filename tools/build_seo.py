"""Build the site's SEO layer. Re-run after changing pages or content.

  python3 tools/build_seo.py

It:
  * writes a managed <head> block (title, description, canonical, Open Graph/Twitter
    share tags, JSON-LD structured data) into every page, between <!-- seo:start/end -->
  * generates one copy per guide, blog post, Dubai living area, property, community,
    developer and legal page in s/ from the page templates in templates/, each with its
    own head block, so link previews and crawlers that don't run JavaScript see the right
    title, description and image (edit templates/*.html, never s/*.html)
  * writes sitemap.xml and robots.txt
  * updates vercel.json: rewrites (/blog?b=x serves s/blog-x.html, the address bar
    doesn't change), redirects for old .html links, and X-Robots-Tag: noindex on
    *.vercel.app so only the real domain is indexed

Data comes from xr-data.js and xr-content.js via tools/export_data.js (macOS osascript).
"""
import datetime, html, json, os, re, subprocess

SITE = 'https://www.xrealty.ae'          # production domain used for canonical URLs and the sitemap
STAGING_HOST = 'xrealty123.vercel.app'   # kept out of search results
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 's')
TPL = os.path.join(ROOT, 'templates')
TODAY = datetime.date.today().isoformat()

LOGO = 'https://res.cloudinary.com/dkhns25jh/image/upload/f_auto/v1733821293/xr_media/sqmxma6remiuh1mbv4x7.png'
HERO = 'https://res.cloudinary.com/dkhns25jh/image/upload/w_1200,f_auto,q_auto/v1783592438/xr_media/sehvczef0ido9pytdygz.webp'
VIEWPORT = '<meta name="viewport" content="width=device-width, initial-scale=1">'


def data():
    out = subprocess.run(['osascript', '-l', 'JavaScript', os.path.join(ROOT, 'tools', 'export_data.js'), ROOT],
                         check=True, capture_output=True, text=True).stdout
    d = json.loads(out)
    # Developers live in developers.html's own script
    s = open(os.path.join(TPL, 'developers.html'), encoding='utf-8').read()
    imgs = {k: f'https://res.cloudinary.com/dkhns25jh/image/upload/w_1200,f_auto,q_auto/{v}/xr_media/{i}.webp'
            for k, v, i in re.findall(r"(\w+): CL\('(v\d+)', '(\w+)'\)", s)}
    devs = []
    for m in re.finditer(r"\{ slug: '([a-z-]+)',.*?full: '([^']+)'.*?img: I\.(\w+),\s*tagline: '((?:[^'\\]|\\.)*)'", s, re.S):
        devs.append({'slug': m.group(1), 'full': m.group(2), 'img': imgs.get(m.group(3), HERO), 'tagline': m.group(4).replace("\\'", "'")})
    d['developers'] = devs
    return d


def og_img(u):
    return re.sub(r'/w_\d+,', '/w_1200,', u or HERO)


def clip(t, n=158):
    t = re.sub(r'\s+', ' ', t or '').strip()
    return t if len(t) <= n else t[:n].rsplit(' ', 1)[0].rstrip(',;:—-') + '…'


ORG = {
    '@type': 'RealEstateAgent', '@id': SITE + '/#org', 'name': 'Xperience Realty', 'url': SITE + '/', 'logo': LOGO, 'image': HERO,
    'telephone': '+971564080888', 'email': 'info@xrealty.ae',
    'address': {'@type': 'PostalAddress', 'addressLocality': 'Dubai Hills Estate, Dubai', 'addressCountry': 'AE'},
    'areaServed': 'Dubai',
    'sameAs': ['https://www.youtube.com/@xrealtyae', 'https://www.instagram.com/xperience.realty', 'https://www.linkedin.com/company/xrealty-ae',
               'https://x.com/xrealty_ae', 'https://www.facebook.com/profile.php?id=61562378023612'],
}


def crumbs(*items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + p} for i, (n, p) in enumerate(items)]}


def faq_ld(qas):
    return {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q['q'], 'acceptedAnswer': {'@type': 'Answer', 'text': q['a']}} for q in qas]}


def head_block(path, title, desc, img=HERO, kind='website', ld=(), robots=None):
    url = SITE + path
    graph = [ORG] + [x for x in ld if x]
    tags = [f'<title>{html.escape(title)}</title>',
            f'<meta name="description" content="{html.escape(clip(desc))}">']
    if robots:
        tags.append(f'<meta name="robots" content="{robots}">')
    else:
        tags.append(f'<link rel="canonical" href="{html.escape(url)}">')
    tags += [f'<meta property="og:type" content="{kind}">', '<meta property="og:site_name" content="Xperience Realty">',
             f'<meta property="og:title" content="{html.escape(title)}">', f'<meta property="og:description" content="{html.escape(clip(desc, 200))}">',
             f'<meta property="og:url" content="{html.escape(url)}">', f'<meta property="og:image" content="{html.escape(og_img(img))}">',
             '<meta name="twitter:card" content="summary_large_image">',
             '<script type="application/ld+json">' + json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('</', '<\\/') + '</script>']
    return '<!-- seo:start -->\n' + '\n'.join(tags) + '\n<!-- seo:end -->'


def apply_head(src, block):
    head, sep, body = src.partition('<body')
    head = re.sub(r'\n?<!-- seo:start -->.*?<!-- seo:end -->', '', head, flags=re.S)
    # tags from before the managed block existed
    head = re.sub(r'\n?<title>.*?</title>|\n?<meta (?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>|\n?<link rel="canonical"[^>]*>|\n?<script type="application/ld\+json">.*?</script>', '', head, flags=re.S)
    assert VIEWPORT in head
    return head.replace(VIEWPORT, VIEWPORT + '\n' + block, 1) + sep + body


def article_ld(path, title, desc, img, date=None):
    a = {'@type': 'Article', 'headline': title[:110], 'description': clip(desc), 'image': og_img(img), 'mainEntityOfPage': SITE + path,
         'author': {'@id': SITE + '/#org'}, 'publisher': {'@id': SITE + '/#org'}}
    if date:
        a['datePublished'] = a['dateModified'] = date
    return a


def blog_date(s):
    try:
        return datetime.datetime.strptime(s, '%b %d, %Y').date().isoformat()
    except ValueError:
        return None


def main():
    d = data()
    C = d['content']
    T = ' | Xperience Realty'
    pages = {  # file: (path, title, description, image, extra JSON-LD, robots)
        'index.html': ('/', 'Xperience Realty | Dubai real estate brokerage', 'Award-winning Dubai real estate brokerage. Buy, sell, rent or invest in off-plan and ready property with RERA-certified Xperts.', HERO,
                       [{'@type': 'WebSite', 'url': SITE + '/', 'name': 'Xperience Realty', 'publisher': {'@id': SITE + '/#org'}}], None),
        'search.html': ('/search', 'Properties for sale in Dubai' + T, 'Search off-plan apartments, villas and townhouses for sale across Dubai, with prices, payment plans and handover dates.', HERO, [], None),
        'guides.html': ('/guides', 'Dubai property guides' + T, 'Plain-English guides to buying, selling, renting and investing in Dubai property.', HERO, [], None),
        'insights.html': ('/insights', 'Dubai property insights' + T, 'Market updates, area spotlights and investment analysis from Xperience Realty.', HERO, [], None),
        'team.html': ('/team', 'XR Team' + T, 'Meet the Xperience Realty advisors: specialists in Dubai off-plan, luxury and investment property.', HERO, [], None),
        'about.html': ('/about', 'About Xperience Realty' + T, 'An award-winning Dubai brokerage built around the client, not the listing.', HERO, [], None),
        'contact.html': ('/contact', 'Contact us' + T, 'Talk to an Xperience Realty specialist by phone, WhatsApp or email, or visit us in Dubai Hills Estate.', HERO, [], None),
        'sell.html': ('/sell', 'Sell your property in Dubai' + T, 'Get a free, data-backed valuation and sell your Dubai property for the right price.', HERO, [], None),
        'rent.html': ('/rent', 'Rent in Dubai' + T, C['rent']['lede'], HERO, [faq_ld(C['rent']['faqs'])], None),
        'faqs.html': ('/faqs', 'Dubai property FAQs' + T, 'Answers to common questions about buying, selling, renting and investing in Dubai property.', HERO,
                      [faq_ld([q for g in C['site']['faqs'] for q in g['items']])], None),
        'careers.html': ('/careers', 'Careers' + T, C['site']['careers']['lede'], HERO, [], None),
        'compare.html': ('/compare', 'Compare properties' + T, 'Compare your shortlisted Dubai properties side by side.', HERO, [], 'noindex, follow'),
        '404.html': ('/404', 'Page not found' + T, 'This page could not be found.', HERO, [], 'noindex'),
    }
    sitemap = []
    for f, (path, title, desc, img, ld, robots) in pages.items():
        p = os.path.join(ROOT, f)
        new = apply_head(open(p, encoding='utf-8').read(), head_block(path, title, desc, img, ld=ld, robots=robots))  # read fully before reopening for write
        open(p, 'w', encoding='utf-8').write(new)
        if not robots and '?' not in path:
            sitemap.append(path)

    # One copy per item: (base file, copy name, canonical path, title, desc, image, kind, JSON-LD)
    items = [  # overview pages served at the bare template address
        ('living.html', 'living-index', '/living', 'Dubai living' + T, C['living']['index']['lede'], HERO, 'website', []),
        ('community.html', 'community-index', '/community', 'Dubai communities' + T, 'Compare Dubai communities by price per sq ft, rental yield, lifestyle and current projects.', HERO, 'website', []),
        ('developers.html', 'developer-index', '/developers', 'Dubai property developers' + T, 'Projects and track records from Emaar, Nakheel, Damac, Sobha, Meraas and other leading Dubai developers.', HERO, 'website', []),
    ]
    for g in C['guides']:
        path = '/guide?g=' + g['slug']
        items.append(('guide.html', 'guide-' + g['slug'], path, g['name'] + T, g['lede'], g['img'], 'article',
                      [article_ld(path, g['name'], g['lede'], g['img']), crumbs(('Home', '/'), ('Guides', '/guides'), (g['name'], path))]))
    for b in C['blogs']:
        path = '/blog?b=' + b['slug']
        items.append(('blog.html', 'blog-' + b['slug'], path, b['title'] + T, b.get('lede') or b['excerpt'], b['img'], 'article',
                      [article_ld(path, b['title'], b.get('lede') or b['excerpt'], b['img'], blog_date(b['date'])), crumbs(('Home', '/'), ('Insights', '/insights'), (b['title'], path))]))
    for a in C['living']['areas']:
        path = '/living?a=' + a['slug']
        items.append(('living.html', 'living-' + a['slug'], path, re.sub(r'(?i)\s*living$', '', a['name']) + ' living in Dubai' + T, a['lede'], a['img'], 'website',
                      [faq_ld(a['faqs']), crumbs(('Home', '/'), ('Dubai living', '/living'), (a['name'], path))]))
    for pr in d['properties']:
        path = '/property?p=' + pr['slug']
        title = f"{pr['name']}: {pr['type'].lower()}s from {pr['priceLabel']}" + T
        listing = {'@type': 'RealEstateListing', 'name': pr['name'], 'description': clip(pr.get('desc')), 'url': SITE + path, 'image': [og_img(u) for u in pr.get('gallery', [pr['img']])[:3]],
                   'offers': {'@type': 'Offer', 'price': pr['price'], 'priceCurrency': 'AED', 'availability': 'https://schema.org/PreOrder' if pr.get('status') == 'Off-plan' else 'https://schema.org/InStock'},
                   'provider': {'@id': SITE + '/#org'}}
        items.append(('property.html', 'property-' + pr['slug'], path, title, pr.get('desc') or pr['name'], pr['img'], 'website',
                      [listing, crumbs(('Home', '/'), ('Properties', '/search'), (pr['name'], path))]))
    for c in d['communities']:
        path = '/community?c=' + c['slug']
        desc = c.get('about') or c.get('tagline') or c['name']
        place = {'@type': 'Place', 'name': c['name'], 'url': SITE + path, 'description': clip(desc), 'image': og_img(c.get('img')),
                 'geo': {'@type': 'GeoCoordinates', 'latitude': c.get('lat'), 'longitude': c.get('lng')}}
        items.append(('community.html', 'community-' + c['slug'], path, c['name'] + ': homes, prices and projects' + T, desc, c.get('img'), 'website',
                      [place, crumbs(('Home', '/'), ('Communities', '/community'), (c['name'], path))]))
    for dv in d['developers']:
        path = '/developers?d=' + dv['slug']
        items.append(('developers.html', 'developer-' + dv['slug'], path, dv['full'] + ': projects in Dubai' + T, dv['tagline'], dv['img'], 'website',
                      [{'@type': 'Organization', 'name': dv['full'], 'description': clip(dv['tagline'])}, crumbs(('Home', '/'), ('Developers', '/developers'), (dv['full'], path))]))
    for key, title in (('privacy', 'Privacy policy'), ('terms', 'Terms of use')):
        path = '/legal?doc=' + key
        items.append(('legal.html', 'legal-' + key, path, title + T, C['site'][key]['intro'], HERO, 'website', []))

    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith('.html'):
            os.remove(os.path.join(OUT, f))
    for base, name, path, title, desc, img, kind, ld in items:
        src = open(os.path.join(TPL, base), encoding='utf-8').read()
        open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8').write(apply_head(src, head_block(path, title, desc, img, kind, ld)))
        sitemap.append(path)

    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        ''.join(f'  <url><loc>{html.escape(SITE + p)}</loc><lastmod>{TODAY}</lastmod></url>\n' for p in sitemap) + '</urlset>\n')
    open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8').write(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')

    # vercel.json: keep existing settings, regenerate the SEO routes
    vp = os.path.join(ROOT, 'vercel.json')
    with open(vp) as fh:
        v = json.load(fh)
    routes = {'guide': ('g', 'guide'), 'blog': ('b', 'blog'), 'living': ('a', 'living'), 'property': ('p', 'property'),
              'community': ('c', 'community'), 'developers': ('d', 'developer'), 'legal': ('doc', 'legal')}
    bare = {'guide': 'guide-buying', 'living': 'living-index', 'community': 'community-index', 'developers': 'developer-index', 'legal': 'legal-privacy'}
    # First matching rewrite wins: item copy by query value, then the bare address
    v['rewrites'] = ([{'source': '/' + page, 'has': [{'type': 'query', 'key': key, 'value': '^(?<slug>[a-z0-9-]+)$'}], 'destination': f'/s/{prefix}-:slug'}
                      for page, (key, prefix) in routes.items()] +
                     [{'source': '/' + page, 'destination': '/s/' + copy} for page, copy in bare.items()])
    keep = [r for r in v.get('redirects', []) if r['source'] == '/guide-article']
    v['redirects'] = keep + [
        {'source': '/blog', 'missing': [{'type': 'query', 'key': 'b'}], 'destination': '/insights', 'permanent': False},
        {'source': '/property', 'missing': [{'type': 'query', 'key': 'p'}], 'destination': '/search', 'permanent': False},
    ] + [{'source': f'/{page}.html', 'destination': f'/{page}', 'permanent': True} for page in routes]
    v['headers'] = [{'source': '/(.*)', 'has': [{'type': 'host', 'value': STAGING_HOST}], 'headers': [{'key': 'X-Robots-Tag', 'value': 'noindex, nofollow'}]},
                    {'source': '/(.*)', 'has': [{'type': 'host', 'value': '(?<sub>.+)\\.vercel\\.app'}], 'headers': [{'key': 'X-Robots-Tag', 'value': 'noindex, nofollow'}]}]
    with open(vp, 'w') as fh:
        fh.write(json.dumps(v, indent=2) + '\n')
    print(f'{len(pages)} pages, {len(items)} item copies in s/, {len(sitemap)} sitemap URLs')


if __name__ == '__main__':
    main()
