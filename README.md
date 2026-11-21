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

The build also runs `tools/prerender.py`, which renders every page in headless Google Chrome (at phone size) and embeds the result as a static snapshot, so the content is in the HTML before any JavaScript runs. `support.js` swaps the snapshot for the live page once it has rendered. It takes about a minute; add `--no-prerender` to skip it while experimenting, but run the full build before pushing.

Canonical URLs and the sitemap use `https://www.xrealty.ae` (`SITE` at the top of the script). Every `*.vercel.app` address sends `X-Robots-Tag: noindex`, so the staging site stays out of search results until the real domain is connected.

## Run locally

```bash
python3 tools/serve.py
```

Then open http://localhost:8766. Pages must be served over HTTP (not opened as files) because the runtime fetches the page source.

## Deploy

Import this repo in Vercel with framework preset **Other**, no build command, output directory `.` (repo root). `vercel.json` turns on clean URLs, so `/search.html` is served at `/search`.

## Enquiry delivery and privacy

Every form now uses `xr-forms.js`. The local server returns a contact handoff rather than claiming that a lead was delivered. Visitors explicitly review their message and choose WhatsApp or email. New enquiries are never written to localStorage. Any records left by the previous version are not automatically erased or uploaded; the owner should review and clear those separately.

The Vercel function `api/enquiry.js` accepts validated enquiries. Configure `XR_CRM_WEBHOOK_URL` (HTTPS) and, if required, `XR_CRM_TOKEN` as **server environment variables**. Never put a token in public JavaScript. Success is shown only after the destination acknowledges the request. Without configuration or on delivery failure, the contact handoff remains available. Basic request-size, origin, field and per-instance rate checks are included; configure platform-wide abuse protection for a public launch.

`xr-config.js` contains only public business details. The ORN and trade-licence fields remain null because no verified numbers were found on the public XRealty pages checked. Add approved values there to display them. No licence number has been invented.

External analytics tracking is disabled. Consent-aware `xr-analytics` events contain action names and local paths only, never form fields. Connecting them to an external analytics service requires a reviewed configuration and authorization.

## Shared data and conversion

- `xr-catalogue.js`: current published project prices, handovers, unit types, payment plans and available size ranges; includes source links and a checked date.
- `xr-data.js`: shared catalogue used on home, search, details, maps and comparison. Unit-level prices and sizes are no longer interpolated. Unverified market yields and automatic valuations are replaced with advisor requests.
- `xr-team.js`: all 34 public directory records. Matching includes all published languages and uses only expertise described in their profiles or the pre-existing curated records.
- `xr-currency.js`: consistent display currency, INR lakh/crore, a daily public rate source with timestamp and attribution, cached rates and a clearly labelled indicative fallback. Website conversion is not a transaction quote.
- Brand fonts are served as WOFF2. Original supplied files are retained.

Run `node --test tests/improvements.test.js` for data/currency and enquiry endpoint checks. Run `python3 tools/check_release.py` after refreshing snapshots. `tools/prerender.py` now exits unsuccessfully if any rendering fails, instead of silently passing incomplete output. Always review the build result before deployment.

Use `python3 tools/sync_live_catalogue.py` for a read-only comparison with the recorded public project pages; add `--write` to update shared project facts. A missing or unrecognized source field aborts the update. This tool does not publish, send enquiries, replace photos, or invent unit prices. Rebuild metadata and snapshots after an approved data update.
