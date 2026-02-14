# MoneroPay Dashboard

A merchant-facing payment dashboard for accepting Monero payments. Powered by [MoneroPay](https://moneropay.eu).

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

4. Open http://localhost:3000

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
