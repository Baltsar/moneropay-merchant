# MoneroPay Dashboard

A merchant-facing payment dashboard for accepting Monero payments. Powered by [MoneroPay](https://moneropay.eu).

The dashboard shows balance, recent payments, **Receive** (create payment requests with QR/address), and **Send** (withdraw XMR). It runs in Docker alongside MoneroPay, wallet-rpc, and optionally your own node or a remote node.

## Before you start

**Setup flow:** For the full path from zero to a merchant accepting payments (including Tailscale so only the merchant can reach the dashboard URL), see [FLOW.md](./FLOW.md). Use it before building or installing.

**Testing:** For the fastest way to try the app (mock mode, no Docker) and how to test fully (Docker + remote node or VPS), see [docs/TESTING.md](./docs/TESTING.md).

## Quick Start

### Prerequisites

- Docker and Docker Compose
- 250GB SSD (local node, pruned) OR 5GB (remote node)
- 4GB RAM minimum

### Setup

1. Clone and configure:

   ```bash
   git clone <repo>
   cd moneropay-dashboard
   cp .env.example .env
   # Edit .env — at minimum change POSTGRES_PASSWORD
   ```

2. Choose your mode:

   - **Local node** (recommended): Keep `NODE_MODE=local` in .env  
     Full privacy, ~6-24h initial blockchain sync.
   - **Remote node** (quick start): Set `NODE_MODE=remote` in .env  
     Ready in minutes, reduced privacy.

3. Start everything:

   ```bash
   docker compose --profile ${NODE_MODE:-local} up -d
   ```

4. **Open the wallet** (required for remote mode; recommended after any `wallet-rpc` restart):

   ```bash
   ./scripts/open-wallet.sh
   ```

   The wallet is not opened automatically. Run this after starting the stack or after `docker compose restart wallet-rpc`.

5. Open http://localhost:3000

   The dashboard will show sync progress if using a local node. Once synced, you can start accepting payments.

### Backup Your Wallet

**Critical**: Back up your wallet after first setup:

```bash
docker cp $(docker compose ps -q wallet-rpc):/wallet ./wallet-backup/
```

Store securely offline. If you lose this, you lose your funds.

### Updating

```bash
docker compose pull
docker compose up -d
```

## Security

- **Change the database password:** Set a strong `POSTGRES_PASSWORD` in `.env` (do not use the example value in production).
- **Do not expose the dashboard on the public internet without authentication.** Use a reverse proxy with basic auth, VPN (e.g. Tailscale), or restrict access by IP. The dashboard has no built-in login.
- **Optional:** Set `DASHBOARD_PORT` in `.env` if you want the dashboard on a different port.

## Development

Run the frontend with mock API (no Docker required):

```bash
cd frontend
cp .env.development .env.local
# Ensure VITE_USE_MOCK=true
npm install
npm run dev
```

Open http://localhost:5173. The mock simulates health, balance, sync progress, and payment confirmations.

## License

MIT. See [LICENSE](./LICENSE).
