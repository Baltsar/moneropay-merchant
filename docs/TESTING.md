# How to test the dashboard

Three ways to run and test, from **fastest** (no backend) to **full** (VPS or local node).

---

## Option A: Mock mode (fastest — no Docker, no node)

**Time:** ~2 minutes to be clicking around.  
**Good for:** UI flows, navigation, Receive/Send forms, confirmation progress, settings, error copy.  
**Not tested:** Real MoneroPay API, real balance, real sync, Tailscale, production build.

### Steps

1. **Frontend only with mock API**

   ```bash
   cd frontend
   npm install
   cp .env.development .env.local   # or create .env.local with:
   # VITE_USE_MOCK=true
   # VITE_NODE_MODE=local
   # VITE_FIAT_CURRENCY=USD
   npm run dev
   ```

2. Open **http://localhost:5173**

3. **First load:** Mock starts “synced” (health + wallet + DB OK, node “synced”), so you may go straight to the wallet backup screen, then dashboard. If mock sync is not finished, you’ll see onboarding (sync progress completes in ~30 seconds in mock).

4. **What you can test in mock**
   - Dashboard: balance, recent payments (empty until you create one), volume chart (“Sample data” label), TopBar, health dot.
   - Receive: create payment (amount + optional description) → QR + status; confirmation progresses over ~20s; “New Payment” when complete.
   - **Double-spend in mock:** Create a payment with description containing `test-double-spend` → red double-spend banner at top and on Receive.
   - **Partial payment in mock:** Description containing `partial` → partial payment bar (50% then 100% after a few seconds).
   - Send: enter address (e.g. 4 + 95 chars), amount → Review → Confirm → “Sent” + tx_hash.
   - Settings: default currency, node/zero-conf/wallet copy, expandables.
   - Remove payment: create a payment, go to Dashboard, find it in Recent Payments as “Waiting” → trash icon removes it.

5. **Error states in mock**  
   Mock doesn’t fail APIs by default. To test balance/status error and retry you need either:
   - **Option B** (real backend) and then stop MoneroPay or block network, or
   - Temporary code changes (e.g. make mock reject once) — not covered here.

**Verdict:** Fastest way to see the app and click through flows. Use this first to validate UI and copy.

---

## Option B: Docker + remote node (real backend, no sync wait)

**Time:** ~10–30 minutes (Docker pull, create wallet, services up).  
**Good for:** Real API, real balance/receive/send, onboarding when services start, health/sync (skipped for remote), and — by stopping services or blocking API — balance/status error + retry and remote-node unreachable banner.  
**Not tested:** Real blockchain sync, Tailscale, real VPS deployment.

### Steps

1. **Prerequisites:** Docker + Docker Compose, ~5GB disk (no blockchain).

2. **Configure**

   ```bash
   cp .env.example .env
   # Edit .env:
   # - POSTGRES_PASSWORD=something_secure
   # - NODE_MODE=remote
   # - REMOTE_NODE_HOST=node.moneroworld.com   (or another public node)
   # - REMOTE_NODE_PORT=18089
   # - DAEMON_HOST / DAEMON_PORT same as REMOTE_NODE_*
   ```

3. **Start stack**

   ```bash
   docker compose --profile remote up -d
   ```

4. Wait for services (MoneroPay, wallet-rpc, postgres) to be healthy. Check:

   ```bash
   docker compose ps
   curl -s http://localhost:3000/api/health
   ```

5. Open **http://localhost:3000** (or the port in `DASHBOARD_PORT`).

6. **First run:** Wallet may need to be created/restored by MoneroPay/wallet-rpc (see MoneroPay docs). Onboarding may show “Setting up…” then dashboard (no sync screen for remote). You may see the **remote node privacy** (yellow) banner.

7. **What you can test**
   - Everything from Option A, but with real balance (likely 0) and real create/receive/send (if you have a test wallet with funds).
   - **Balance error + retry:** Stop MoneroPay (`docker compose stop moneropay`) → reload dashboard → balance fails → “Couldn’t load balance” + Retry in card and TopBar. Start MoneroPay again and retry.
   - **Remote node unreachable:** Set in .env a wrong `REMOTE_NODE_HOST` or stop the remote node from being reachable, rebuild/restart, then open dashboard → red “Remote node unreachable” banner when health/wallet fails.
   - **Receive status error + retry:** Create a payment, then stop MoneroPay → on Receive page you should get “Trouble loading status” + Retry. Start MoneroPay and Retry.
   - **Send:** Only if wallet has unlocked balance; otherwise you’ll get insufficient balance (and can test that message). If you send to a real address, you get real tx_hash.

8. **Rebuild dashboard after .env change**

   If you change `NODE_MODE` or other settings that affect the frontend build:

   ```bash
   docker compose build dashboard && docker compose up -d dashboard
   ```

**Verdict:** Best balance of “real backend” and “quick to try” if you don’t want to run a full node. Use this to test error states and real API behaviour.

---

## Option C: Docker + local node, or VPS (full flow)

**Time:** Local node: 6–24h first sync (~250GB disk). VPS: same + deploy + optional Tailscale.  
**Good for:** Full onboarding (sync progress, ETA, %), wallet backup reminder, production-like URL (VPS), and optionally Tailscale.

### Local (your machine)

1. Same as Option B but in `.env`:
   - `NODE_MODE=local`
   - No need for `REMOTE_NODE_*` / `DAEMON_*` (or leave as-is; they’re ignored when `NODE_MODE=local`).

2. Start:

   ```bash
   docker compose --profile local up -d
   ```

3. Open http://localhost:3000. You’ll see **onboarding**: “Syncing Blockchain” with block height, %, ETA, progress bar. Wait until sync completes (or use mock for quick UI test).

4. After sync: wallet backup screen → “Ready!” → dashboard.

### VPS (production-like)

1. Follow [FLOW.md](../FLOW.md): VPS, Docker, .env, optional Tailscale.
2. Point dashboard at the VPS (e.g. `http://<vps-ip>:3000` or Tailscale URL).
3. Test the same flows as Option B; plus Tailscale (invite another device, open URL only on that network).
4. **HTTPS:** Put Nginx/Caddy in front with TLS if you want; not required for a quick test.

**Verdict:** Use when you need real sync UX or a real “production” test. Slowest.

---

## Testing checklist (what to verify)

Use this regardless of Option A, B, or C. Mark what you’ve tested.

### Onboarding

- [ ] MoneroPay unreachable: stop backend or wrong URL → “Cannot reach MoneroPay” + “If this persists, check that the server is running and the URL is correct.”
- [ ] Services starting: “Setting up your payment system” + checklist (Database, Wallet, MoneroPay, Node).
- [ ] Local sync (Option C only): “Syncing Blockchain” + block height, %, ETA, progress bar.
- [ ] Wallet backup screen after (local) sync; “Ready!” then redirect to dashboard.

### Dashboard

- [ ] Balance card: spendable / confirming / total; fiat next to spendable.
- [ ] Balance error: trigger API failure → “Couldn’t load balance. Check connection.” + Retry.
- [ ] TopBar: balance; on error “Balance unavailable” + Retry.
- [ ] Recent Payments: “No payments yet” when empty; after creating a payment (Receive), it appears; “Waiting” row has trash icon; remove works.
- [ ] Volume chart: “Sample data — volume not yet available from API.” visible.
- [ ] Health badge: green when OK; red/warning when health fails (e.g. stop MoneroPay).
- [ ] Double-spend: (mock: description `test-double-spend`) red banner at top of app.
- [ ] Remote node unreachable (Option B/C, NODE_MODE=remote): when health/wallet down, red banner “Remote node unreachable. Check REMOTE_NODE_HOST…”.

### Receive

- [ ] Create payment: amount (XMR/fiat), optional description → “Create Payment Request” → QR + address + amount, copy buttons.
- [ ] Status: “Waiting for payment…” then confirmation phases (Payment Detected → Confirming (x/10) → Payment Complete); “New Payment” when complete.
- [ ] Status error: trigger receive-status failure → “Trouble loading status. Refresh or try again.” + Retry.
- [ ] Partial payment (mock: description `partial`): partial bar, then 100%.
- [ ] Double-spend on this payment: DoubleSpendAlert above QR (mock: `test-double-spend`).
- [ ] Create payment API error: (Option B/C: e.g. stop backend, create payment) → error message (no retry CTA yet — known gap).

### Send

- [ ] “Loading balance…” when balance is loading; then “Available: X XMR (spendable)”.
- [ ] Validation: invalid address → “Invalid Monero address”; zero amount → “Enter a valid amount”; insufficient balance → message with unlocked/locked and ~min.
- [ ] Happy path: valid address + amount ≤ unlocked → Review → Confirm → “Sent” + tx_hash + Copy.
- [ ] Transfer error: trigger transfer failure (e.g. stop backend before Confirm) → error + “Your funds were not sent. You can try again.”; confirm dialog closes.

### Settings

- [ ] Default currency: picker works; copy “The currency you show prices in…”.
- [ ] Node & backend: “Your payment system is running in [local/remote] mode…” + “For server admins” expandable.
- [ ] Zero-conf: explanation + “For server admins” expandable.
- [ ] Wallet backup: “Back up your wallet…” + “For server admins” with backup command.

### Quick reference: how to trigger failures (Option B/C)

| What to test        | How to trigger                                      |
|---------------------|-----------------------------------------------------|
| Balance error + retry | Stop MoneroPay, reload dashboard                    |
| Receive status error + retry | Create payment, then stop MoneroPay, stay on Receive |
| Transfer error + reassurance | Enter send details, stop MoneroPay, Confirm Send     |
| Remote node unreachable | NODE_MODE=remote, wrong REMOTE_NODE_HOST or unreachable node |
| Health down         | Stop MoneroPay or postgres → red health dot         |

---

## Recommendation

- **Fastest way to try:** **Option A (mock)**. Run `npm run dev` with `VITE_USE_MOCK=true`, open localhost:5173, and click through all screens and flows in a few minutes.
- **Fast way with real backend:** **Option B (Docker + remote node)**. No sync wait; you can test real API, real errors, and retry flows by stopping services.
- **Full test (sync + production-like):** **Option C** (local node or VPS) when you need sync UX or deployment verification.

Start with Option A; if the UI and flows look good, run Option B to confirm behaviour against the real MoneroPay API and error handling.
