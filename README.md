# Volleyrot

Volleyball rotation trainer for beginners: pick a system (6-6, 4-2, 6-2, 5-1) and watch one team rotate on a tilted court, through lineup, serve, serve receive, switch and defense.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173/
npm test         # unit + component tests
npm run build    # static site in dist/
```

## Deploy (GitHub Pages)
Live site: **https://mojtabarezaei4.github.io/** (repo `mojtabarezaei4/mojtabarezaei4.github.io`, public).

1. Repo → Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Push to `main`. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes the site.

This is a *user site* repo, so it is served from the root and Vite `base` is `'/'`. If the app ever moves to a normal repo (e.g. `volleyrot`), set `base: '/volleyrot/'`.

### Custom domain (later)
Keep `base: '/'`, add `public/CNAME` containing the domain, add the domain under Settings → Pages, point DNS at GitHub (CNAME to `<user>.github.io` for a subdomain), verify the domain in your GitHub settings, then tick "Enforce HTTPS".

## Project layout
- `src/domain` – pure rotation logic (systems, rotation, libero, overlap rule, formations, receive)
- `src/view` – court projection, SVG court, tokens, screens
- `src/state` – reducer and autoplay
- `docs/superpowers` – spec and implementation plan · `.ai/` – handover notes for Claude
