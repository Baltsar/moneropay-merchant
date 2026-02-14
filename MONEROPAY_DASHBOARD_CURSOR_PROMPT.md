# MoneroPay Merchant Dashboard — Complete Build Spec

## TL;DR
Build a **full-stack, Docker-deployable** Monero payment dashboard: React frontend + Nginx proxy + MoneroPay API + monerod node — all in one `docker-compose up`. Two modes: **local node** (full sovereignty, ~250GB disk, ~24h initial sync) or **remote node** (quick start in minutes, reduced privacy). Design philosophy: **"Square meets crypto"** — brutally simple, dark-only, Monero-orange (#FF6600) accent. A merchant running a taco stand or an online store should glance at this and instantly know: what's my balance, did I get paid, is anything wrong.

The dashboard handles a critical onboarding flow: when the node is still syncing, it shows sync progress and blocks payment features. Once synced, it transitions seamlessly to the full payment dashboard.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  BROWSER (merchant's device)                            │
│  React SPA served by Nginx                              │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP (port 3000)
┌─────────────────▼───────────────────────────────────────┐
│  NGINX (reverse proxy + SPA host)                       │
│  /              → serves React build                    │
│  /api/*         → proxy to MoneroPay :5000              │
│  /node/*        → proxy to monerod :18081/json_rpc      │
└────────┬──────────────────┬─────────────────────────────┘
         │                  │
┌────────▼────────┐  ┌──────▼──────────────────────────────┐
│  MONEROPAY      │  │  MONEROD (or remote node)            │
│  :5000          │  │  :18080 (p2p) :18081 (rpc)           │
│  Go binary      │  │  Blockchain storage                  │
└────────┬────────┘  └──────▲──────────────────────────────┘
         │                  │
┌────────▼────────┐  ┌──────┴──────────────────────────────┐
│  WALLET-RPC     ├──┤  Connects wallet to node              │
│  :28081         │  │  Creates/manages merchant wallet      │
└─────────────────┘  └────────────────────────────────────┘
         │
┌────────▼────────┐
│  POSTGRESQL     │
│  :5432          │
└─────────────────┘
```

**CRITICAL SECURITY**: Only Nginx port 3000 is exposed to the host. All other services communicate on internal Docker network. MoneroPay docs explicitly state it should NOT be exposed to public internet.

---

## Project Structure

```
moneropay-dashboard/
├── docker-compose.yml              # Full stack orchestration
├── docker-compose.override.yml     # Local customizations
├── .env                            # Configuration (NODE_MODE, etc.)
├── .env.example                    # Template for .env
├── nginx/
│   └── nginx.conf                  # Reverse proxy config
├── frontend/                       # React app
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── index.html
│   ├── Dockerfile                  # Multi-stage: build → nginx
│   ├── public/
│   │   └── monero-logo.svg
│   └── src/
│       ├── api/
│       │   ├── moneropay.ts        # All MoneroPay API calls + types
│       │   ├── node.ts             # monerod RPC calls (sync status)
│       │   └── mock.ts             # Mock API for development
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx     # Minimal sidebar nav
│       │   │   ├── TopBar.tsx      # Health + balance summary
│       │   │   └── Layout.tsx      # Wraps pages with sidebar/topbar
│       │   ├── onboarding/
│       │   │   ├── SyncProgress.tsx     # Blockchain sync progress
│       │   │   ├── SetupChecklist.tsx   # Service health checklist
│       │   │   └── WalletBackup.tsx     # Seed/backup reminder
│       │   ├── dashboard/
│       │   │   ├── BalanceCard.tsx      # Unlocked/locked split
│       │   │   ├── HealthBadge.tsx      # Green/red dot
│       │   │   ├── RecentPayments.tsx   # Live feed
│       │   │   └── VolumeChart.tsx      # 7-day volume (recharts)
│       │   ├── receive/
│       │   │   ├── CreatePayment.tsx    # Form: amount + description
│       │   │   ├── PaymentStatus.tsx    # 3-step confirmation tracker
│       │   │   └── QRCode.tsx          # QR for subaddress
│       │   ├── send/
│       │   │   └── SendForm.tsx        # Address + amount + confirm
│       │   └── shared/
│       │       ├── XMRAmount.tsx        # Piconero→XMR display
│       │       ├── FiatAmount.tsx       # XMR→fiat display
│       │       ├── ConfirmationProgress.tsx  # 3-step tracker
│       │       ├── DoubleSpendAlert.tsx      # Red alert banner
│       │       └── RemoteNodeBanner.tsx      # Privacy warning
│       ├── hooks/
│       │   ├── useBalance.ts           # Polls GET /api/balance
│       │   ├── useHealth.ts            # Polls GET /api/health
│       │   ├── usePaymentStatus.ts     # Polls GET /api/receive/:addr
│       │   ├── useXMRPrice.ts          # External price API
│       │   └── useSyncStatus.ts        # Polls node sync (POST /node/)
│       ├── lib/
│       │   ├── utils.ts               # piconeroToXMR, formatXMR, etc.
│       │   └── constants.ts           # Poll intervals, API paths
│       ├── pages/
│       │   ├── Onboarding.tsx         # Shown while node syncs
│       │   ├── Dashboard.tsx
│       │   ├── Receive.tsx
│       │   └── Send.tsx
│       ├── App.tsx                    # Router + sync gate
│       └── main.tsx
└── README.md                          # Setup instructions
```

---

## Tech Stack

### Frontend
- **Vite + React 18 + TypeScript**
- **shadcn/ui** — Button, Card, Badge, Table, Dialog, Progress, Tabs, Tooltip, Input, Select, Alert, Skeleton
- **Tailwind CSS** for layout
- **Recharts** for charts
- **Lucide React** for icons
- **React Router v6** for navigation (4 routes: onboarding, dashboard, receive, send)
- **TanStack Query (React Query v5)** for API polling & caching
- **qrcode.react** for QR code generation

### Infrastructure
- **Docker Compose** for orchestration
- **Nginx** (alpine) for reverse proxy + serving built SPA
- **monerod** (sethforprivacy/simple-monerod image or official) for local node
- **monero-wallet-rpc** (from same image, different entrypoint)
- **MoneroPay v2** (registry.gitlab.com/moneropay/moneropay:v2)
- **PostgreSQL 17** (alpine)

---

## Docker Compose — Full Spec

### .env.example
```bash
# ===== NODE MODE =====
# "local" = run own monerod (250GB disk, 6-24h initial sync, full privacy)
# "remote" = connect to external node (5GB disk, ready in minutes, reduced privacy)
NODE_MODE=local

# Remote node settings (only used when NODE_MODE=remote)
REMOTE_NODE_HOST=node.moneroworld.com
REMOTE_NODE_PORT=18089

# ===== MONEROD SETTINGS (local mode only) =====
# Pruned node saves ~60% disk space with no functional difference for merchants
PRUNE_BLOCKCHAIN=true

# ===== DATABASE =====
POSTGRES_USERNAME=moneropay
POSTGRES_PASSWORD=CHANGE_ME_RANDOM_STRING
POSTGRES_DATABASE=moneropay

# ===== MONEROPAY =====
MONEROPAY_BIND=0.0.0.0:5000
MONEROPAY_ZERO_CONF=false

# ===== DASHBOARD =====
# Port exposed to host — this is the only port merchants interact with
DASHBOARD_PORT=3000

# Fiat currency for price display (USD, EUR, GBP, MXN, etc.)
FIAT_CURRENCY=USD
```

### docker-compose.yml
```yaml
services:

  # ===== MONEROD (local mode only) =====
  monerod:
    image: sethforprivacy/simple-monerod:latest
    restart: unless-stopped
    volumes:
      - monero-data:/home/monero/.bitmonero
    command: >
      --rpc-bind-ip=0.0.0.0
      --rpc-bind-port=18081
      --rpc-restricted-bind-ip=0.0.0.0
      --rpc-restricted-bind-port=18089
      --no-igd
      --no-zmq
      --enable-dns-blocklist
      --prune-blockchain
      --sync-pruned-blocks
      --confirm-external-bind
    ports:
      - "18080:18080"  # P2P — open this for network contribution
    healthcheck:
      test: curl --fail http://localhost:18089/get_info || exit 1
      interval: 30s
      timeout: 10s
      retries: 3
    profiles:
      - local  # Only starts when NODE_MODE=local

  # ===== WALLET RPC =====
  wallet-rpc:
    image: sethforprivacy/simple-monerod:latest
    entrypoint: monero-wallet-rpc
    restart: unless-stopped
    command: >
      --wallet-dir=/wallet
      --disable-rpc-login
      --rpc-bind-ip=0.0.0.0
      --rpc-bind-port=28081
      --daemon-host=${DAEMON_HOST:-monerod}
      --daemon-port=${DAEMON_PORT:-18081}
      --trusted-daemon
      --non-interactive
    volumes:
      - wallet-data:/wallet
    depends_on:
      monerod:
        condition: service_healthy
        required: false  # Not required in remote mode
    healthcheck:
      test: curl --fail http://localhost:28081/json_rpc -d '{"jsonrpc":"2.0","id":"0","method":"get_version"}' || exit 1
      interval: 5s
      timeout: 5s
      retries: 10

  # ===== POSTGRESQL =====
  postgresql:
    image: postgres:17-alpine
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: ${POSTGRES_USERNAME}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DATABASE}
    healthcheck:
      test: pg_isready -U ${POSTGRES_USERNAME}
      interval: 5s
      timeout: 5s
      retries: 10

  # ===== MONEROPAY =====
  moneropay:
    image: registry.gitlab.com/moneropay/moneropay:v2
    restart: unless-stopped
    depends_on:
      wallet-rpc:
        condition: service_healthy
      postgresql:
        condition: service_healthy
    environment:
      - BIND=${MONEROPAY_BIND:-0.0.0.0:5000}
      - RPC_ADDRESS=http://wallet-rpc:28081/json_rpc
      - POSTGRESQL=postgresql://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@postgresql:5432/${POSTGRES_DATABASE}?sslmode=disable
      - ZERO_CONF=${MONEROPAY_ZERO_CONF:-false}
    healthcheck:
      test: curl --fail http://localhost:5000/health || exit 1
      interval: 5s
      timeout: 5s
      retries: 10

  # ===== NGINX + DASHBOARD =====
  dashboard:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "${DASHBOARD_PORT:-3000}:80"
    depends_on:
      moneropay:
        condition: service_healthy
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    environment:
      - NODE_MODE=${NODE_MODE:-local}

volumes:
  monero-data:      # Blockchain storage (~95GB pruned)
  wallet-data:      # Wallet files (CRITICAL — backup this!)
  postgres-data:    # Payment history
```

### nginx/nginx.conf
```nginx
upstream moneropay {
    server moneropay:5000;
}

upstream monerod_rpc {
    # In local mode: talks to monerod container
    # In remote mode: this won't be used (dashboard detects via /api/health)
    server monerod:18081;
}

server {
    listen 80;
    server_name _;

    # Serve React SPA
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback — all non-API routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy MoneroPay API
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://moneropay;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy monerod RPC (for sync status only)
    location /node/ {
        rewrite ^/node/(.*) /$1 break;
        proxy_pass http://monerod_rpc;
        proxy_set_header Host $host;
        proxy_set_header Content-Type application/json;
    }
}
```

### frontend/Dockerfile
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Design System

### Philosophy
Steal from **Square POS**: black/white, one accent color, huge readable numbers, zero clutter. A merchant should understand everything in 2 seconds.

### Colors (Tailwind config — extend theme)
```javascript
colors: {
  background:    '#0A0A0A',  // near-black
  surface:       '#141414',  // card backgrounds
  'surface-hover': '#1C1C1C',
  border:        '#262626',
  'text-primary':  '#FAFAFA',
  'text-secondary':'#8A8A8A',
  accent:        '#FF6600',  // Monero orange
  'accent-hover':  '#FF8533',
  success:       '#22C55E',
  warning:       '#EAB308',
  danger:        '#EF4444',
  locked:        '#6366F1',  // indigo — locked balance
}
```

### Typography
- **Headlines/amounts**: `font-mono` — large, bold, unmistakable numbers
- **UI labels**: `font-sans` (system/Geist) — clean, small, uppercase where appropriate
- **XMR amounts**: Always monospace, always 4 decimal places max (e.g., `1.3370 XMR`)

### Design Rules
1. **No bullshit** — every pixel serves a purpose
2. **Numbers are king** — balance and amounts are the largest text on screen
3. **Status via color** — green/orange/red communicate instantly without reading
4. **Dark mode only** — merchant tool, often on a counter or in a dark room
5. **Mobile responsive** — many merchants use tablets (360px minimum width)

---

## MoneroPay API Specification

Base URL: `/api` (proxied by Nginx to MoneroPay on :5000)

### GET /api/health
```json
Response 200:
{
  "status": 200,
  "services": {
    "walletrpc": true,
    "postgresql": true
  }
}
```

### GET /api/balance
```json
Response 200:
{
  "total": 2513444800,
  "unlocked": 800000000,
  "locked": 1713444800
}
```
All values in **piconero**. 1 XMR = 1,000,000,000,000 piconero (1e12).

### POST /api/receive
Create a new payment request. Returns a unique subaddress.
```json
Request:
{
  "amount": 123000000000,
  "description": "Order #1042",
  "callback_url": "http://..."
}

Response 200:
{
  "address": "84Wsptn...8Yqrg",
  "amount": 123000000000,
  "description": "Order #1042",
  "created_at": "2022-07-18T11:54:49.780542861Z"
}
```

### GET /api/receive/:address
Check status of a payment.
```json
Response 200:
{
  "amount": {
    "expected": 200000000000,
    "covered": {
      "total": 200000000000,
      "unlocked": 200000000000
    }
  },
  "complete": true,
  "description": "Order #1042",
  "created_at": "2022-07-11T19:04:24.574583Z",
  "transactions": [
    {
      "amount": 200000000000,
      "confirmations": 10,
      "double_spend_seen": false,
      "fee": 9200000,
      "height": 2402648,
      "timestamp": "2022-07-11T19:19:05Z",
      "tx_hash": "0c9a7b40...",
      "unlock_time": 0,
      "locked": false
    }
  ]
}
```

### POST /api/transfer
Send XMR out.
```json
Request:
{
  "destinations": [
    {
      "amount": 1337000000000,
      "address": "47stn..."
    }
  ]
}

Response 200:
{
  "amount": 1337000000000,
  "fee": 87438594,
  "tx_hash": "5ca34...",
  "tx_hash_list": ["5ca34..."],
  "destinations": [
    { "amount": 1337000000000, "address": "47stn..." }
  ]
}
```

### GET /api/transfer/:txhash
Check outgoing transaction status. Same transaction object format.

---

## monerod RPC (for Sync Status)

Proxied via `/node/json_rpc`. The dashboard sends POST requests to check blockchain sync.

### POST /node/json_rpc — get_info
```json
Request:
{
  "jsonrpc": "2.0",
  "id": "0",
  "method": "get_info"
}

Response:
{
  "result": {
    "height": 3241092,
    "target_height": 3300000,
    "synchronized": false,
    "busy_syncing": true,
    "database_size": 48318382080,
    "free_space": 180795802624,
    "status": "OK"
  }
}
```

Key fields for sync UI:
- `height` — current synced height
- `target_height` — network height (0 when fully synced — use `height` instead)
- `synchronized` — boolean, true when fully synced
- `busy_syncing` — boolean

**IMPORTANT EDGE CASE**: When `target_height` is 0 and `synchronized` is true, the node is fully synced. When `target_height` is 0 and `synchronized` is false, the node just started and hasn't discovered peers yet — show "Connecting to network..." state.

---

## CRITICAL: Onboarding Flow

This is the FIRST thing a new merchant sees. It must be reassuring, informative, and beautiful.

### App.tsx — The Sync Gate
```typescript
// Pseudocode for the routing logic in App.tsx
function App() {
  const { data: health } = useHealth();
  const { data: syncStatus } = useSyncStatus();
  const nodeMode = import.meta.env.VITE_NODE_MODE || 'local';

  // Determine system readiness
  const isMoneroPayReachable = health !== undefined;
  const isWalletRpcUp = health?.services?.walletrpc === true;
  const isDbUp = health?.services?.postgresql === true;
  const isNodeSynced = nodeMode === 'remote' || syncStatus?.synchronized === true;
  const isSystemReady = isMoneroPayReachable && isWalletRpcUp && isDbUp && isNodeSynced;

  if (!isSystemReady) {
    return <OnboardingPage health={health} syncStatus={syncStatus} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/send" element={<Send />} />
      </Routes>
    </Layout>
  );
}
```

**The dashboard BLOCKS all payment features until the system is fully ready.** No receive button, no send button. Only the onboarding view.

### Onboarding Page — States

**State 1: Cannot connect to anything**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    ⚠️  Cannot reach MoneroPay                            │
│                                                         │
│    Make sure all services are running:                   │
│    docker compose up -d                                  │
│                                                         │
│    Checking again in 10 seconds...                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**State 2: Services starting up**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    Setting up your payment system                       │
│                                                         │
│    🟢  Database          Connected                      │
│    🟠  Wallet Service    Starting...                    │
│    🔴  MoneroPay         Waiting for wallet...          │
│                                                         │
│    This usually takes 1-2 minutes.                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**State 3: Node syncing (LOCAL MODE ONLY — the big one)**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    🟠 Syncing Blockchain                                │
│                                                         │
│    Block 3,241,092 / 3,300,000                         │
│    ████████████████████████░░░░ 98.2%                  │
│                                                         │
│    ~35 minutes remaining                                │
│    Speed: ~120 blocks/sec                               │
│                                                         │
│    ─────────────────────────────────────────             │
│                                                         │
│    🟢  Database          Connected                      │
│    🟢  Wallet Service    Connected                      │
│    🟢  MoneroPay         Connected                      │
│    🟠  Monero Node       Syncing (98.2%)               │
│                                                         │
│    You cannot receive payments until the                │
│    blockchain is fully synced. This is a                │
│    one-time process.                                     │
│                                                         │
│    First sync can take 6-24 hours depending             │
│    on your internet speed and disk.                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Sync progress calculation:**
```typescript
// In useSyncStatus.ts
const calcSyncProgress = (height: number, targetHeight: number) => {
  if (targetHeight === 0) return height > 0 ? 100 : 0;
  return Math.min(99.9, (height / targetHeight) * 100);
  // Never show 100% until synchronized === true
};

const calcETA = (height: number, targetHeight: number, prevHeight: number, elapsed: number) => {
  const blocksRemaining = targetHeight - height;
  const blocksPerSec = (height - prevHeight) / (elapsed / 1000);
  if (blocksPerSec <= 0) return 'Calculating...';
  const secondsRemaining = blocksRemaining / blocksPerSec;
  if (secondsRemaining > 86400) return `~${Math.round(secondsRemaining / 3600)} hours`;
  if (secondsRemaining > 3600) return `~${Math.round(secondsRemaining / 3600)} hours`;
  if (secondsRemaining > 60) return `~${Math.round(secondsRemaining / 60)} minutes`;
  return 'Almost done...';
};
```

**Poll interval for sync status:** 10 seconds during sync, 60 seconds when synced.

**State 4: First-time wallet backup reminder (shown once after first sync)**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    ✅ System Ready                                      │
│                                                         │
│    ⚠️  IMPORTANT: Back up your wallet                    │
│                                                         │
│    Your wallet files are stored in the Docker            │
│    volume "wallet-data". If this volume is               │
│    deleted, your funds are PERMANENTLY LOST.             │
│                                                         │
│    To back up, run:                                      │
│    docker cp $(docker compose ps -q wallet-rpc):/wallet  │
│    ./wallet-backup/                                      │
│                                                         │
│    Store the backup securely offline.                    │
│                                                         │
│    [I've backed up my wallet — Enter Dashboard →]       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Store acknowledgment in localStorage: `moneropay_backup_acknowledged = true`

**State 5: Synced → Redirect to Dashboard**
Automatic transition with a brief "Ready!" animation (green checkmark, 1 second, then redirect).

---

## CRITICAL UX Requirements — Monero-Specific Edge Cases

### 1. The 20-Minute Confirmation Problem (HIGHEST PRIORITY)
Monero outputs require **10 confirmations (~20 minutes)** before spendable. This is a **protocol-level security feature** — not a preference. In September 2025, an 18-block deep reorg occurred on mainnet, rewriting 30+ minutes of history.

Build a **3-phase progress indicator** visible during every payment:

```
Phase 1: "Payment Detected"      — tx seen in mempool (0 conf)
         Color: Orange (#FF6600)
         Icon: animated radar pulse
         Text: "Transaction seen on network"

Phase 2: "Confirming (3/10)"     — between 1-9 confirmations
         Color: Orange→Green gradient based on progress
         Icon: animated progress ring
         Text: "3 of 10 confirmations • ~14 min remaining"
         Calc: remainingMinutes = (10 - confirmations) × 2

Phase 3: "Payment Complete"      — 10+ confirmations, locked=false
         Color: Green (#22C55E)
         Icon: checkmark with brief celebration animation
         Text: "Fully confirmed and unlocked"
```

This is THE most important UX component. The merchant stares at this while a customer waits. It must radiate confidence and calm.

### 2. Double Spend Alert (CRITICAL SAFETY)
If ANY transaction returns `double_spend_seen: true`, immediately show a **full-width, non-dismissable red banner** at the TOP of the entire application:

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ DOUBLE SPEND DETECTED — Transaction [short hash]     │
│ may be fraudulent. Do NOT release goods until fully      │
│ confirmed (10/10 confirmations).                         │
└─────────────────────────────────────────────────────────┘
```

This banner CANNOT be dismissed. It stays until the payment either reaches 10 confirmations or is dropped from the mempool. Background: In August 2025, a mining pool (Qubic) claimed majority hashrate, raising reorg attack risk.

### 3. Locked vs Unlocked Balance
The balance card MUST show two distinct numbers:

```
┌─────────────────────────────────────┐
│  Spendable                          │
│  ◉ 0.8000 XMR                      │  ← Large, white, font-mono
│    ~$132.40                         │  ← Smaller, gray, fiat
│                                     │
│  Confirming                         │
│  ◎ 1.7134 XMR                      │  ← Medium, indigo (#6366F1)
│    ~10 min until unlocked           │  ← Time estimate
│                                     │
│  Total                              │
│  2.5134 XMR                         │  ← Small, text-secondary
└─────────────────────────────────────┘
```

**NEVER** show just "total balance" without clarifying what's spendable. This confuses merchants who try to send locked funds.

**WHY funds get locked**: When you spend 20 XMR from a 100 XMR balance, the remaining 80 XMR gets locked for ~20 minutes because the change output requires 10 confirmations too. This is not a bug — it's how Monero works.

### 4. Piconero Conversion — NEVER Show Raw Atomic Units
All API amounts are in piconero (1 XMR = 1,000,000,000,000 piconero = 1e12).

```typescript
// lib/utils.ts
export const piconeroToXMR = (piconero: number): number => piconero / 1e12;
export const xmrToPiconero = (xmr: number): number => Math.round(xmr * 1e12);
export const formatXMR = (piconero: number): string => {
  const xmr = piconero / 1e12;
  return xmr.toFixed(4);  // Always 4 decimal places
};
```

Create a shared `<XMRAmount piconero={value} />` component. Use it **EVERYWHERE**. Never render raw numbers from the API.

### 5. Partial Payments
When `amount.covered.total < amount.expected`, show a progress bar:

```
Order #1042 — Partial Payment
████████░░░░ 0.0800 / 0.1000 XMR (80%)
Waiting for 0.0200 XMR more...
[Copy Address Again]   [Share QR]
```

The customer may have sent from a wallet that splits the payment. MoneroPay handles this — the dashboard should poll until `complete: true`.

### 6. Fiat Price Display
Fetch XMR price from CoinGecko:
```
https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd
```

- Cache for 60 seconds
- Show fiat equivalent in gray next to every XMR amount: `0.35 XMR (~$52.40)`
- Make fiat currency configurable via `VITE_FIAT_CURRENCY` env var (USD/EUR/GBP/MXN)
- If CoinGecko fails: hide fiat gracefully, show XMR only, no errors
- **WARNING**: During the ~20 min confirmation window, XMR/fiat rate can change. Show a small tooltip on fiat amounts: "Rate at time of request. Actual rate may vary."

### 7. Health Monitoring
Poll `GET /api/health` every 30 seconds. Show in TopBar:
- Both services up: Small green dot + "Connected"
- Any service down: Red dot + "Connection Issue" + which service
- API unreachable: Red dot + "Offline"

### 8. Payment Request Flow (Receive Page)

```
Step 1: Enter amount
        ┌─────────────────────────────────────┐
        │  Request Payment                     │
        │                                     │
        │  Amount:  [________] [USD ▼]        │
        │           = 0.3500 XMR              │
        │                                     │
        │  Description: [Order #1042_______]  │
        │                                     │
        │  [Create Payment Request]           │
        └─────────────────────────────────────┘
        - Toggle between fiat input and XMR input
        - Live conversion as you type
        - Description optional (order number, customer name)

Step 2: Show QR + Address
        ┌─────────────────────────────────────┐
        │       ┌───────────────┐             │
        │       │   QR CODE     │             │
        │       │               │             │
        │       └───────────────┘             │
        │                                     │
        │  84Wsptn...8Yqrg      [📋 Copy]    │
        │  0.3500 XMR           [📋 Copy]    │
        │                                     │
        │  ◉ Waiting for payment...           │
        │    (animated pulse)                  │
        └─────────────────────────────────────┘
        - QR encodes monero: URI (see QR section below)
        - Auto-poll GET /api/receive/:address every 5 seconds

Step 3: Live status tracking
        - Show the 3-phase confirmation progress
        - On complete: green success + "Payment Complete ✓"
        - [New Payment] button to create another
```

### 9. Send Page

```
┌─────────────────────────────────────┐
│  Send XMR                           │
│                                     │
│  Recipient Address:                 │
│  [____________________________]     │
│                                     │
│  Amount:  [________] XMR           │
│           ~$52.40                   │
│                                     │
│  Available: 0.8000 XMR (spendable) │
│                                     │
│  [Review Transaction]               │
└─────────────────────────────────────┘
```

- Address validation: starts with `4` (main) or `8` (sub), length ~95 chars
- Show estimated fee BEFORE confirming (use a pre-flight estimate or show "Fee: ~0.0001 XMR" as typical)
- Confirmation dialog: "Send 0.3500 XMR to 84Ws...Yqrg? Estimated fee: ~0.0001 XMR"
- After send: show tx_hash with copy button
- If insufficient **unlocked** balance: "Insufficient spendable balance. You have 0.8000 XMR unlocked but 1.7134 XMR is still confirming (~10 min)."

### 10. Dashboard Page

Top-to-bottom layout:
1. **Balance Card** (locked/unlocked as described above)
2. **Health Badge** (top-right in TopBar, visible on all pages)
3. **Recent Payments** — list of last 20 receive requests with status badges:
   - 🟢 Complete (green badge)
   - 🟠 Confirming 3/10 (orange badge with count)
   - 🔴 Double Spend (red badge — flashing)
   - ⚪ Waiting (gray badge — no tx yet)
4. **Volume Chart** (optional, if time — daily received XMR over 7 days using Recharts AreaChart)

### 11. Remote Node Privacy Warning
When `VITE_NODE_MODE=remote`, show a **persistent yellow banner** on all pages:

```
⚠️ Connected to external node — your privacy is reduced.
Run your own node for full privacy. [Learn More]
```

This banner is dismissable per-session (sessionStorage) but returns on next visit.

---

## Polling Strategy

```typescript
const POLL_INTERVALS = {
  health: 30_000,              // 30 sec
  balance: 15_000,             // 15 sec
  activePayment: 5_000,        // 5 sec (only when awaiting payment)
  price: 60_000,               // 60 sec
  syncStatus: 10_000,          // 10 sec (during sync)
  syncStatusSynced: 60_000,    // 60 sec (when synced, background check)
};
```

When a payment is active (waiting for confirmations), poll `GET /api/receive/:address` every 5 seconds. When no payment is active, don't poll receive — only balance and health. This prevents unnecessary load on MoneroPay.

---

## QR Code

Use `qrcode.react` library. Encode a Monero URI:
```
monero:ADDRESS?tx_amount=AMOUNT_IN_XMR&tx_description=DESCRIPTION
```

Example:
```
monero:84WsptnEBiRNDBnomU7JhirHxMi4h8hNrFZcE1A9dB3n3BcYbHVhkAMpZgK2RnC9ZA8bNX8k3ovEh2nTRKFhEAL8Yqrg?tx_amount=0.35&tx_description=Order%20%231042
```

- QR should be large (at least 200x200px on mobile, 280x280px on desktop)
- White QR on dark background (invert for readability)
- Include Monero logo in center of QR (optional, advanced)

---

## API Mock for Development

Since MoneroPay + monerod won't be running during frontend development, create `src/api/mock.ts`. Toggle with `VITE_USE_MOCK=true`.

The mock should simulate:

1. **Health**: All services up, toggleable
2. **Balance**: { total: 2513444800000, unlocked: 800000000000, locked: 1713444800000 }
3. **Sync Status**: Simulate progression from 0% to 100% over 30 seconds (accelerated)
4. **Payment confirmation**: New payment starts at 0 confirmations, increments every 2 seconds until 10 (simulating ~20 seconds instead of ~20 minutes)
5. **Partial payment**: Amount.covered.total starts at 50% of expected, jumps to 100% after 5 seconds
6. **Double spend**: Triggered by description containing "test-double-spend" — sets `double_spend_seen: true` on the transaction
7. **Price API**: Returns { monero: { usd: 165.42 } }

```typescript
// Mock toggle in api client
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const apiClient = useMock ? mockApi : realApi;
```

---

## Error States to Handle

1. **MoneroPay offline** → Full-screen overlay: "Cannot connect to MoneroPay at [URL]. Check that services are running: `docker compose ps`"
2. **Wallet RPC down** (health.services.walletrpc=false) → Yellow banner: "Wallet service disconnected. Payments may not be detected."
3. **Database down** (health.services.postgresql=false) → Yellow banner: "Database disconnected. Payment history unavailable."
4. **monerod down** (sync request fails) → In local mode: Red banner: "Monero node is not responding." In remote mode: "Remote node unreachable — check REMOTE_NODE_HOST in .env"
5. **Price API failed** → Hide fiat amounts, show XMR only, no error shown
6. **Invalid address on send** → Inline form validation: "Invalid Monero address"
7. **Insufficient unlocked balance** → "Insufficient spendable balance. You have X.XXXX XMR unlocked but X.XXXX XMR is still confirming (~Y min)."
8. **Network timeout** → Retry with exponential backoff via TanStack Query defaults
9. **Node still syncing + merchant tries to navigate** → Redirect back to onboarding with message "Blockchain not yet synced — payments disabled"

---

## Environment Variables (Frontend)

Set via Vite's `.env` files or Docker build args:

```bash
# .env.development
VITE_USE_MOCK=true
VITE_MONEROPAY_URL=http://localhost:5000
VITE_NODE_RPC_URL=http://localhost:18081
VITE_NODE_MODE=local
VITE_FIAT_CURRENCY=USD

# .env.production (built into Docker image)
VITE_USE_MOCK=false
VITE_MONEROPAY_URL=/api
VITE_NODE_RPC_URL=/node
VITE_NODE_MODE=local
VITE_FIAT_CURRENCY=USD
```

**In production**, the URLs are relative paths because Nginx proxies them. In development, they point to local ports for Vite's proxy config.

### vite.config.ts proxy (for local dev without Docker)
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/node': {
        target: 'http://localhost:18081',
        rewrite: (path) => path.replace(/^\/node/, ''),
      },
    },
  },
});
```

---

## Sidebar Navigation

Minimal, icon-based sidebar (expandable on hover/click):

```
┌────────────────────┐
│  ◉ MoneroPay       │  ← Logo/name
│                    │
│  📊 Dashboard      │  ← /
│  📥 Receive        │  ← /receive
│  📤 Send           │  ← /send
│                    │
│  ─────────────     │
│  💰 USD ▼          │  ← Fiat currency selector
│  🟢 Connected      │  ← Health status (compact)
└────────────────────┘
```

On mobile: bottom navigation bar with 3 icons (Dashboard, Receive, Send).

---

## What NOT to Build
- No authentication/login (MoneroPay has none — it's on local network)
- No transaction history persistence beyond what MoneroPay stores
- No settings page beyond fiat currency selector
- No multi-wallet support
- No exchange/swap integration
- No notification sounds
- No Tor/I2P configuration UI (advanced users do this in .env)
- No block explorer links (Monero is private — block explorers show limited info)
- No light mode (unnecessary scope creep)

---

## README.md Content (include in project root)

```markdown
# MoneroPay Dashboard

A merchant-facing payment dashboard for accepting Monero payments.
Powered by [MoneroPay](https://moneropay.eu).

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
     - Full privacy, ~6-24h initial blockchain sync
   - **Remote node** (quick start): Set `NODE_MODE=remote` in .env
     - Ready in minutes, reduced privacy

3. Start everything:
   ```bash
   docker compose --profile ${NODE_MODE:-local} up -d
   ```

4. Open http://localhost:3000

   The dashboard will show sync progress if using a local node.
   Once synced, you can start accepting payments.

### Backup Your Wallet
⚠️ **Critical**: Back up your wallet after first setup:
```bash
docker cp $(docker compose ps -q wallet-rpc):/wallet ./wallet-backup/
```
Store securely offline. If you lose this, you lose your funds.

### Updating
```bash
docker compose pull
docker compose up -d
```
```

---

## Final Checklist Before Shipping

- [ ] No raw piconero values visible anywhere in UI
- [ ] Locked/unlocked balance clearly separated everywhere
- [ ] `double_spend_seen` triggers visible non-dismissable red alert
- [ ] Confirmation progress shows estimated time remaining
- [ ] Health indicator visible on every page (TopBar)
- [ ] Mobile responsive (360px minimum width)
- [ ] All API calls go through configurable base URLs
- [ ] Mock mode works with `VITE_USE_MOCK=true`
- [ ] QR code renders correctly with `monero:` URI format
- [ ] Partial payment progress bar works
- [ ] Fiat amounts display next to all XMR amounts (with fallback)
- [ ] Error states handled gracefully for all 9 failure modes
- [ ] Onboarding/sync page blocks payment features until ready
- [ ] Sync progress shows block height, percentage, ETA
- [ ] Wallet backup reminder shown on first successful sync
- [ ] Remote node mode shows persistent privacy warning banner
- [ ] Docker Compose starts entire stack with one command
- [ ] Nginx proxies API and node requests correctly
- [ ] Dockerfile multi-stage build produces small production image
- [ ] `.env.example` documents all configuration options
- [ ] README explains both local and remote setup paths
