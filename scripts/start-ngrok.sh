#!/usr/bin/env bash
# Merge global ngrok config (authtoken) + project tunnel(s).
# Default: web only (phone HTTPS). TCP needs NGROK_TCP=1 (card required on free tier).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GLOBAL_CONFIG="${HOME}/Library/Application Support/ngrok/ngrok.yml"
PROJECT_CONFIG="${ROOT}/ngrok.yml"

ENABLE_TCP=0
for arg in "$@"; do
  if [[ "$arg" == "--tcp" ]]; then
    ENABLE_TCP=1
  fi
done
if [[ "${NGROK_TCP:-}" == "1" ]]; then
  ENABLE_TCP=1
fi

if [[ ! -f "$GLOBAL_CONFIG" ]]; then
  echo "Missing ngrok authtoken. Run once:"
  echo "  ngrok config add-authtoken YOUR_TOKEN"
  echo "  https://dashboard.ngrok.com/get-started/your-authtoken"
  exit 1
fi

# Stop stale ngrok (fixes ERR_NGROK_334 "endpoint already online")
if curl -sf http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1; then
  echo "Stopping existing ngrok session..."
  pkill -f "ngrok start" 2>/dev/null || true
  sleep 1
fi

if [[ "$ENABLE_TCP" == "1" ]]; then
  echo "Starting ngrok (web :3000 + gps-tcp :5023)..."
  echo "Note: ngrok free requires a card for TCP (ERR_NGROK_8013 without it)."
  echo "TCP public address: http://127.0.0.1:4040 (look for gps-tcp tunnel)"
  exec ngrok start \
    --config "$GLOBAL_CONFIG" \
    --config "$PROJECT_CONFIG" \
    web gps-tcp
else
  echo "Starting ngrok (web :3000 — API proxied via Next.js /backend-api)..."
  echo "For TCP GPS tunnel: NGROK_TCP=1 ./scripts/start-ngrok.sh  (card required on free ngrok)"
  exec ngrok start \
    --config "$GLOBAL_CONFIG" \
    --config "$PROJECT_CONFIG" \
    web
fi
