# xperience-experience

XRealty marketing site: plain static HTML/JS, no build step. Deployed on Vercel.

## Pages

| URL | File |
|---|---|
| `/` | `index.html` (home) |
| `/search` | `search.html` |
| `/property?p=<slug>` | `property.html` |
| `/community?c=<slug>` | `community.html` |
| `/developers` | `developers.html` |
| `/guides` | `guides.html` |
| `/guide-article` | `guide-article.html` |
| `/insights` | `insights.html` |
| `/team` | `team.html` |
| `/about` | `about.html` |
| `/contact` | `contact.html` |
| `/compare` | `compare.html` |
| `/sell` | `sell.html` |
| `/dubai-map` | `dubai-map.html` (embedded on the home page) |
| any unknown URL | `404.html` |

`home-v1.html` and `home-v2.html` are earlier home page versions, kept for reference.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Pages must be served over HTTP (not opened as files) because the runtime fetches the page source.

## Deploy

Import this repo in Vercel with framework preset **Other**, no build command, output directory `.` (repo root). `vercel.json` turns on clean URLs, so `/search.html` is served at `/search`.
