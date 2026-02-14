# Merchant flows & failure modes

This document maps **what the merchant sees and does** in the dashboard, **what can go wrong**, and **what’s built vs still open**. Use it for the next iteration and to prioritise fixes.

---

## 1. High-level merchant flow

```
Open URL → Onboarding (blocked until ready) → Wallet backup reminder → Dashboard
                ↓
    [Dashboard] [Receive] [Send] [Settings]
         ↓           ↓        ↓
    Balance,     Create     Enter address
    Recent       payment    + amount →
    Payments,    → QR +     Confirm →
    Volume       status     Sent / error
    chart
```

- **First time:** Merchant hits the URL → sees onboarding (sync or “Setting up”) → then wallet backup screen → then dashboard.
- **Later:** Same URL → if system is ready, they go straight to dashboard (or land on a bookmarked subpath; router may still load then redirect).
- **If system not ready:** They stay on onboarding until MoneroPay + wallet + DB + (if local) node sync are OK.

---

## 2. Flow by screen (current state)

### 2.1 Onboarding (gate before dashboard)

| State | What merchant sees | What’s built |
|-------|--------------------|--------------|
| **MoneroPay unreachable** | “Cannot reach MoneroPay” + `docker compose up -d` + “Checking again in 10 seconds…” + **“If this persists, check that the server is running and the URL is correct.”** | ✅ Full screen, polling, persistence hint |
| **Services starting** | “Setting up your payment system” + checklist (Database, Wallet, MoneroPay, Node) + “This usually takes 1–2 minutes.” | ✅ Checklist with loading/ok states |
| **Local node syncing** | “Syncing Blockchain” + block height, progress bar, **%**, ETA, blocks/sec + “You cannot receive payments until…” | ✅ SyncProgress + SetupChecklist |
| **Just synced (local)** | Wallet backup screen → “I’ve backed up” → “Ready!” → redirect | ✅ WalletBackup, then redirect |
| **Already acknowledged backup** | Brief “Ready!” then redirect | ✅ |

**What can still go wrong / bad UX**

- **MoneroPay down for a long time:** We now show “If this persists…”. No distinction between “starting” vs “wrong URL” vs “firewall”. Could add a “Check the dashboard URL” or “If using Tailscale, ensure this device is on the same network.”
- **Node sync takes 24h:** ETA can be wrong if speed changes. “This usually takes 1–2 minutes” (on the non-sync screen) is still misleading for first-time local sync.
- **Remote node unreachable during onboarding:** Checklist may show Wallet as not up; copy doesn’t say “For remote mode, check REMOTE_NODE_HOST in .env.” (After onboarding we do show `RemoteNodeUnreachableBanner`.)
- **Wallet backup skipped:** They can click “I’ve backed up” without actually backing up. No enforcement; only a reminder.

---

### 2.2 Dashboard (home)

| State | What merchant sees | What’s built |
|-------|--------------------|--------------|
| **Happy path** | Balance (spendable / confirming / total), Recent Payments list, 7-day volume chart, TopBar spendable + health dot | ✅ |
| **No recent payments** | “No payments yet” in the Recent Payments card | ✅ |
| **Double spend (any recent)** | Red banner at very top of app (Layout): “DOUBLE SPEND DETECTED…” | ✅ |
| **Balance loading** | BalanceCard/TopBar show nothing until data arrives | ✅ (no crash) |
| **Balance API error** | **BalanceCard:** “Couldn’t load balance. Check connection.” + **Retry**. **TopBar:** “Balance unavailable” + **Retry** | ✅ Implemented |
| **Remote node unreachable** (NODE_MODE=remote, health/wallet down) | **Red banner** in Layout: “Remote node unreachable. Check REMOTE_NODE_HOST and REMOTE_NODE_PORT in .env…” | ✅ Implemented |
| **Health down** | HealthBadge red/warning; tooltip “Wallet” / “Database” etc. | ✅ |
| **Volume chart** | Chart + **“Sample data — volume not yet available from API.”** | ✅ Label added |

**What can still go wrong / bad UX**

- **Recent payments API fails per-address:** Each row is one query. If a query fails, that row still renders with `transactions: []` / `complete: false` so it shows as “Waiting” or incomplete. No per-row “Couldn’t load” or retry. List can look wrong with no explanation.
- **Double spend:** Banner shows tx hash; with many recent payments they may not know which payment it is (could add “for payment 0.5 XMR” or similar in a later iteration).
- **All balance requests fail:** Retry is there; if the backend is down long-term they keep clicking Retry. No “System may be down; check with your host” after many failures.

---

### 2.3 Receive

| State | What merchant sees | What’s built |
|-------|--------------------|--------------|
| **Create form** | Amount (XMR/fiat), description, “Create Payment Request” | ✅ |
| **Validation error** | “Enter a valid amount” under form | ✅ |
| **Create API error** | Red text: “Failed to create payment” or backend message | ✅ |
| **After create** | QR + address + amount, copy buttons, “Waiting for payment…”, ConfirmationProgress, partial payment bar, “New Payment” when complete | ✅ |
| **Payment status loading** | “Loading status…” under the QR block | ✅ |
| **Payment status error** | **“Trouble loading status. Refresh or try again.” + Retry** | ✅ Implemented |
| **Double spend on this payment** | DoubleSpendAlert above the QR block | ✅ |

**What can still go wrong / bad UX**

- **Create payment fails (network/5xx):** Generic “Failed to create payment” or backend message. **No “Check your connection” or explicit “Try again” CTA.** Merchant may retry blindly.
- **Customer sent wrong amount:** Partial payment bar shows “Waiting for more…”. No guidance like “You can accept partial and request the rest” or “Wait for full amount.”
- **Price (fiat) missing:** If CoinGecko fails, fiat amounts disappear (FiatAmount returns null). Receive form still works in XMR; no message like “Fiat rates temporarily unavailable.”
- **Merchant refreshes while on PaymentStatus:** They land back on Receive; the “active” payment is lost from local state. They’d have to find the address in Recent Payments or create a new one. No “Resume watching this payment?” for the same address.
- **Tab in background for a long time:** Status polling may throttle or fail; when they come back they might see the error state and Retry (good) or stale “Waiting for payment…” (retry helps).

---

### 2.4 Send

| State | What merchant sees | What’s built |
|-------|--------------------|--------------|
| **Form** | Address, amount (XMR/fiat), **“Loading balance…”** until balance loads, then “Available: X XMR (spendable)” | ✅ Balance loading state |
| **Validation** | “Invalid Monero address” / “Enter a valid amount” / insufficient balance (with unlocked vs locked and ~min) | ✅ |
| **Confirm dialog** | “Send X XMR to 84Ws…? Estimated fee: ~0.0001 XMR” | ✅ |
| **Sending** | “Sending…” on button | ✅ |
| **Success** | “Sent” + tx_hash + Copy + “Send again” | ✅ |
| **Transfer API error** | Error message + **“Your funds were not sent. You can try again.”**; confirm dialog closes so message is visible | ✅ Implemented |

**What can still go wrong / bad UX**

- **Invalid address:** Only validated by length and 4/8 prefix. Wrong checksum or typo could still be sent to backend; backend may return a technical error we show as-is.
- **Node/wallet temporarily down:** They get transfer error + reassurance. No “System temporarily unavailable” or link to check status/health.
- **Balance loads then backend goes down before they send:** They click Confirm Send and get error + reassurance. Acceptable; retry when backend is back.

---

### 2.5 Settings

| State | What merchant sees | What’s built |
|-------|--------------------|--------------|
| **Default currency** | Picker (USD, EUR, …), “The currency you show prices in…” | ✅ |
| **Node & backend** | “Your payment system is running in [local/remote] mode…” + info box + “For server admins” expandable | ✅ |
| **Zero-conf** | Short explanation + “configured when server is set up” + “For server admins” expandable | ✅ |
| **Wallet backup** | “Back up your wallet…” + “For server admins” with docker cp command | ✅ |

**What can still go wrong / bad UX**

- **Merchant expects to change node or zero-conf:** Copy says “can’t change from dashboard.” If they’re not technical, could add “Ask whoever set up the server.”
- **No “current balance” or “system status” in Settings:** They have to go back to Dashboard to see health/balance. Minor.

---

## 3. Cross-cutting failure modes (spec’s “9”)

| Failure mode | Where | What’s built | Still open |
|--------------|--------|--------------|------------|
| **MoneroPay unreachable** | Onboarding | Full screen + polling + “If this persists…” | Distinguish “wrong URL” vs “server down” (optional) |
| **Wallet/DB down** | Onboarding, HealthBadge | Checklist, red dot | — |
| **Node syncing** | Onboarding | Sync progress, block %, ETA | ETA can be wrong; “1–2 minutes” copy misleading for first sync |
| **Node down (local)** | Onboarding / later | Sync or checklist; after onboarding, HealthBadge | No dedicated “Node not responding” banner on dashboard (HealthBadge shows red) |
| **Remote node unreachable** | After onboarding | **RemoteNodeUnreachableBanner** in Layout | — |
| **Insufficient unlocked balance** | Send | Inline error with amounts and ~min | — |
| **Invalid address** | Send | “Invalid Monero address” (length + 4/8) | Backend errors for bad checksum etc. shown as-is |
| **Network timeout** | Any API | TanStack Query retry; balance/receive status have Retry; Send has reassurance | Create payment: no retry CTA; generic error only |
| **Double spend** | Receive, Layout | Banner at top + per-receive alert | Could tie banner to specific payment (e.g. amount) in UI |

---

## 4. “Destroy” or high-friction moments — status

| # | Moment | Status |
|---|--------|--------|
| 1 | Balance disappears when API fails | ✅ **Fixed** — message + Retry in BalanceCard and TopBar |
| 2 | “Waiting for payment…” forever if status fails | ✅ **Fixed** — “Trouble loading status” + Retry in PaymentStatus |
| 3 | “Transfer failed” without reassurance | ✅ **Fixed** — “Your funds were not sent. You can try again.” + dialog closes |
| 4 | Volume chart looks like real data | ✅ **Fixed** — “Sample data — volume not yet available from API.” |
| 5 | MoneroPay down with only “Checking again…” | ✅ **Fixed** — “If this persists, check that the server is running and the URL is correct.” |
| 6 | Remote node down, no clear banner | ✅ **Fixed** — RemoteNodeUnreachableBanner in Layout |
| 7 | Create payment fails, no “Try again” | ⚠️ **Open** — Error shown; no explicit “Check connection” or Retry CTA |
| 8 | Recent payments: one or more rows fail to load | ⚠️ **Open** — Rows show incomplete data; no per-row error or retry |

---

## 5. Additional flow variants (for next iteration)

Edge cases and flows worth considering:

- **Refresh / new tab on Receive while watching a payment:** Active payment state is lost; merchant must use Recent Payments or create new. Optional: “Resume watching” for same address from Recent Payments.
- **Multiple tabs:** Same dashboard open in two tabs; both poll. No conflict, but balance/status can look different until refetch. No special handling.
- **Very slow network:** Loading states and retries help; could add a global “Slow connection” hint if requests take > N seconds (optional).
- **Create payment succeeds but status never loads:** They see QR + “Loading status…” then error + Retry. Retry helps; if backend is down they can still share the QR (address/amount are correct).
- **Recent Payments: mix of loaded and failed queries:** Some rows show “Waiting” or wrong state when that row’s API call failed. Consider per-row error state or “Couldn’t load” + retry for the list.
- **Send with exactly 0 balance (new wallet):** Balance loads as 0; they get “Insufficient spendable balance” if they try to send. Clear.
- **Health recovers after showing Remote node unreachable:** Banner disappears on next successful health poll. Good.
- **Browser back from Receive (PaymentStatus) to Receive (form):** Active payment cleared; they see the create form again. No “You had a payment in progress” (could be confusing if they meant to go back to dashboard).

---

## 6. What’s built – quick reference

- **Onboarding:** MoneroPay unreachable (with “If this persists…”), checklist, sync progress (block, %, ETA), wallet backup, redirect when ready.
- **Dashboard:** Balance (with **error state + Retry**), Recent Payments (remove when Waiting), volume chart (**“Sample data” label**), TopBar (balance + **balance error + Retry**), global double-spend banner, **Remote node unreachable banner** when applicable.
- **Receive:** Create form (validation + API error), QR + status (**status error + Retry**), confirmation phases, partial payment, double-spend, “New Payment.”
- **Send:** **Balance loading state**, form, validation, insufficient balance, confirm dialog, success (tx_hash, copy), **transfer error + “Your funds were not sent. You can try again.”**
- **Settings:** Default currency, node/zero-conf/wallet copy and expandables.
- **Fiat:** Shown where implemented; disappears gracefully (null) when price fails.
- **Health:** Badge in TopBar; remote node unreachable banner when NODE_MODE=remote and health/wallet down.

---

## 7. Next iteration – suggested priorities

**Already done (this pass):** Balance failure + retry, receive status failure + retry, send failure reassurance + balance loading, volume chart label, onboarding “If this persists…”, remote node unreachable banner.

**Still open (pick for next iteration):**

1. **Create payment failure:** Add “Check your connection” or “Try again” when create payment API fails (e.g. under the error message or as a retry button).
2. **Recent Payments per-row failure:** When a receive-status query fails for one address, show “Couldn’t load” or a retry for that row instead of showing “Waiting” with wrong data.
3. **Onboarding remote mode:** When checklist shows Wallet down and NODE_MODE=remote, add a line: “For remote node, check REMOTE_NODE_HOST in .env.”
4. **Double-spend banner:** Optionally show which payment (e.g. amount) the double-spend relates to, not only the tx hash.
5. **Fiat rates unavailable:** When CoinGecko fails, show a short message (e.g. “Fiat rates temporarily unavailable”) where fiat would appear, instead of silently hiding.
6. **Optional:** After repeated balance retry failures, show “System may be unavailable. Check with your host or try again later.”

Use this doc to prioritise the next iteration without changing code here—then build.
