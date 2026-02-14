# Deploy a clickable demo (no backend)

This lets anyone **try the dashboard in the browser** with mock data — no Docker, no MoneroPay, no install. The demo stays in sync with this repo: deploy from the same repo and every push updates the demo.

## How it works

- **Frontend only** is built and served (e.g. on Vercel).
- **`VITE_USE_MOCK=true`** is set at build time. The app then uses in-browser mock API only: no requests to MoneroPay, node, or CoinGecko.
- **No backend** is involved. The demo cannot affect any real server or wallet.

## Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → Import the **same repo** as the real dashboard (e.g. `Baltsar/moneropay-merchant`).

2. **Project settings:**
   - **Root Directory:** `frontend` (so Vercel builds only the frontend).
   - **Build Command:** `npm run build` (default).
   - **Output Directory:** `dist` (default for Vite).
   - **Environment variable:**  
     - Name: `VITE_USE_MOCK`  
     - Value: `true`  
     - Environment: Production (and Preview if you want).

3. **Deploy.** Vercel will build the frontend with mock mode and serve the SPA. Visitors can click through Dashboard, Receive, Send, Settings with fake data and flows.

4. **Stays updated:** Every push to the connected branch (e.g. `main`) triggers a new build. One repo = one source of truth; no separate “demo repo” to sync.

## Optional: second Vercel project for “production” UI

If you later deploy the **real** dashboard (with a real backend) somewhere else, you can have two Vercel projects from the same repo:

- **Demo:** Root `frontend`, `VITE_USE_MOCK=true` → clickable demo.
- **Production (if used):** Root `frontend`, `VITE_USE_MOCK=false`, `VITE_MONEROPAY_URL=…` → points at your real API. Usually the “real” deploy is on your own server with Docker; then you only need the one **demo** project on Vercel.

## Summary

| Concern | Answer |
|--------|--------|
| Does the demo touch any backend? | No. With `VITE_USE_MOCK=true`, all API calls use the in-browser mock. |
| How does the demo stay in sync with the real repo? | Deploy from the **same** repo; each push rebuilds the demo. |
| Do I need a separate “demo repo”? | No. One repo, one Vercel project with Root = `frontend` and `VITE_USE_MOCK=true`. |
