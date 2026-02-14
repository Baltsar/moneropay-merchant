# What's next (post-MVP)

The MVP dashboard is feature-complete for: receive, send, dashboard, settings, onboarding, sync progress, double-spend alert, and Docker deployment. Below are optional next steps.

## Security & access

- **Tailscale (or similar):** Recommended when the dashboard runs on a VPS. See [FLOW.md](./FLOW.md). No code changes; deployer sets up Tailscale and invites the merchant.
- **Auth in front of the app:** If you expose the URL on the public internet, put the dashboard behind a reverse proxy with HTTP basic auth or OAuth (e.g. Caddy, Nginx, Cloudflare Access). Not built into the dashboard today.

## UX & polish

- **Merchant flows & failure modes:** See [docs/MERCHANT_FLOWS_AND_FAILURE_MODES.md](./docs/MERCHANT_FLOWS_AND_FAILURE_MODES.md) for a full map of what the merchant sees, what can go wrong, and what’s already built. Use it to decide what to improve first.
- **Error states:** Refine copy and UI for all 9 failure modes (e.g. node down, insufficient balance, invalid address, timeout) so every error path is clear.
- **Mobile:** Confirm 360px minimum and touch targets; add viewport meta if needed.
- **Volume chart:** Backend support for 7-day volume (if MoneroPay adds an endpoint); otherwise keep mock/placeholder.

## Optional features (out of scope for MVP)

- Auto-sweep / forward received funds to a cold address (would require MoneroPay or wallet RPC support).
- Transaction history beyond “recent payments” (local list).
- Multi-wallet, Tor/I2P UI, notification sounds (per spec: not in scope).

## Operations

- **Rebuild dashboard after .env change:** If you change `NODE_MODE` or other `VITE_*` vars, rebuild the dashboard image:  
  `docker compose build dashboard && docker compose up -d dashboard`
- **Health checks:** Consider alerting (e.g. Uptime Kuma, healthchecks.io) on `GET /api/health` or the dashboard URL.
