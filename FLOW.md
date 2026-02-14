# Setup flow (before you build or install)

This document describes the full path from “nothing” to “merchant can accept Monero securely.” Follow this **before** you install or build the dashboard.

---

## 1. Roles

- **Deployer:** Sets up the VPS/hardware, Docker stack, Tailscale, wallet, and `.env`. Has server access.
- **Merchant:** Uses the dashboard on iPad, laptop, or phone to receive and send XMR. Does not touch the server. Must have the **seed** for recovery.

---

## 2. Deployer: prepare the environment

### 2.1 VPS or hardware

- Get a machine (VPS or local hardware) with enough disk (e.g. ~250GB for a local node, or ~5GB for a remote node).
- OS: Linux (e.g. Ubuntu/Debian).

### 2.2 Tailscale (recommended for security)

- Install Tailscale on the machine and log in so the machine is on your tailnet.
- Plan to **invite the merchant by email** later so only their devices can reach the dashboard.
- Optionally: firewall so the dashboard/MoneroPay are only reachable over Tailscale (not the public internet).

### 2.3 Wallet and seed

- Decide: **new wallet** (MoneroPay/wallet-rpc will create one on first run) or **restore from the merchant’s seed**.
- If **new:** after first run, export or backup the seed and give it to the merchant securely.
- If **restore:** the merchant provides the seed once; you restore, and they must keep the seed for recovery.
- The merchant **must** store the seed safely; it’s their only recovery if the server is lost.

---

## 3. Deployer: install and run the stack

### 3.1 Clone and configure

- Clone this repo (dashboard + docker-compose, etc.).
- Copy `.env.example` to `.env`.
- Edit `.env`: at least `POSTGRES_PASSWORD`; choose `NODE_MODE` (local vs remote), `MONEROPAY_ZERO_CONF`, and remote node host/port if needed.
- (Optional) Set `VITE_*` for the frontend build if you need custom API/node URLs; otherwise defaults for same-host are fine.

### 3.2 Build and start

- Build the dashboard image and start the stack (e.g. `docker compose --profile local up -d` or with your profile).
- Wait for sync if using a local node (or confirm the remote node is reachable).

### 3.3 Dashboard URL

- If using **Tailscale:** use the machine’s Tailscale IP or name (e.g. `http://100.x.x.x:3000` or `http://machine-name:3000`).
- **Do not** expose this URL on the public internet unless you add auth (e.g. a reverse proxy with login).

---

## 4. Merchant: one-time access setup (Tailscale)

### 4.1 Invite

- The deployer invites the merchant by email in Tailscale.
- The merchant receives the “invited to Tailscale” email.

### 4.2 Merchant on each device (iPad / Android / laptop)

- Open the invite link.
- Sign in (e.g. with Google or Apple, or email).
- Install the Tailscale app if needed; the device joins the tailnet.

### 4.3 Bookmark

- Open the dashboard URL (Tailscale address) in the browser and bookmark it.
- From then on: open Tailscale (if not always on), then open the bookmark. No per-use login in the dashboard.

---

## 5. Security summary

- **No auth in the dashboard:** Anyone who can reach the dashboard URL can use it (receive and send).
- **Tailscale:** Restricts “who can reach the URL” to the tailnet (e.g. deployer + merchant only).
- **Seed:** The merchant keeps the seed; if the server or access is lost, they can recover the wallet elsewhere.

---

## 6. Order of operations (checklist)

- [ ] Deployer: VPS/hardware ready
- [ ] Deployer: Tailscale on server (and optional firewall)
- [ ] Deployer: `.env` configured, stack running, wallet created or restored
- [ ] Deployer: Seed given to merchant (secure channel)
- [ ] Deployer: Merchant invited to Tailscale
- [ ] Merchant: Accept invite, install Tailscale on devices, open dashboard URL and bookmark
- [ ] Merchant: Use dashboard (receive/send); keep seed safe
