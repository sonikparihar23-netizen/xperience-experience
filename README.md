# xperience-experience

XRealty marketing site: plain static HTML/JS, no build step. Deployed on Vercel.

## Pages

| URL | Source |
|---|---|
| `/` | `index.html` (home) |
| `/search`, `/sell`, `/rent`, `/guides`, `/insights`, `/team`, `/about`, `/contact`, `/compare`, `/faqs`, `/careers` | the matching `.html` file at the root |
| `/property?p=<slug>` | `templates/property.html` |
| `/community`, `/community?c=<slug>` | `templates/community.html` |
| `/developers`, `/developers?d=<slug>` | `templates/developers.html` |
| `/guide?g=<buying\|selling\|renting\|landlords\|off-plan\|investment>` | `templates/guide.html` |
| `/blog?b=<slug>` | `templates/blog.html` |
| `/living`, `/living?a=<area>` | `templates/living.html` |
| `/legal?doc=<privacy\|terms>` | `templates/legal.html` |
| `/dubai-map` | `dubai-map.html` (embedded on the home page) |
| any unknown URL | `404.html` |

Guide, blog, Dubai living, rentals, FAQ, careers and legal text lives in `xr-content.js`; listings and communities live in `xr-data.js`.

## SEO build (run after any change)

Pages in `templates/` aren't deployed directly. `python3 tools/build_seo.py` generates one copy per item in `s/` (for example `s/blog-<slug>.html`), each with its own title, description, canonical URL, share preview and structured data, and Vercel serves it at the normal address (`/blog?b=<slug>`) via the rewrites in `vercel.json`. The same script refreshes the head block of every root page, `sitemap.xml`, `robots.txt` and the routing in `vercel.json`. So after editing a page, `xr-content.js` or `xr-data.js`, run:

```bash
python3 tools/build_seo.py
```

Canonical URLs and the sitemap use `https://www.xrealty.ae` (`SITE` at the top of the script). Every `*.vercel.app` address sends `X-Robots-Tag: noindex`, so the staging site stays out of search results until the real domain is connected.

## Run locally

```bash
python3 tools/serve.py
```

Then open http://localhost:8766. Pages must be served over HTTP (not opened as files) because the runtime fetches the page source.

## Deploy

Import this repo in Vercel with framework preset **Other**, no build command, output directory `.` (repo root). `vercel.json` turns on clean URLs, so `/search.html` is served at `/search`.
