#!/usr/bin/env sh
# Open the Monero wallet in wallet-rpc so MoneroPay (and the dashboard) stay healthy.
# Run this after starting the stack or after any wallet-rpc restart (e.g. docker compose restart wallet-rpc).
#
# Requires: wallet-rpc port exposed on host (default 28081). If using Docker, ensure docker-compose
# exposes it: wallet-rpc has ports: - "28081:28081".
#
# Usage: ./scripts/open-wallet.sh [WALLET_RPC_URL]
#   WALLET_RPC_URL defaults to http://127.0.0.1:28081

set -e

WALLET_RPC_URL="${1:-http://127.0.0.1:28081}"
JSON_RPC="${WALLET_RPC_URL}/json_rpc"

# Wait for wallet-rpc to be up (get_version works)
echo "Waiting for wallet-rpc at ${WALLET_RPC_URL}..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf -X POST "$JSON_RPC" -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":"0","method":"get_version"}' >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 10 ]; then
    echo "Error: wallet-rpc did not become ready in time."
    exit 1
  fi
  sleep 2
done
echo "wallet-rpc is up."

# Open the default wallet (no password; created by MoneroPay on first run)
echo "Opening wallet..."
RESP=$(curl -sf -X POST "$JSON_RPC" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"0","method":"open_wallet","params":{"filename":"wallet","password":""}}')

if echo "$RESP" | grep -q '"error"'; then
  echo "Error opening wallet: $RESP"
  exit 1
fi

echo "Wallet opened successfully. Dashboard and MoneroPay should report healthy shortly."
