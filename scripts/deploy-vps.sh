#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-147.79.71.98}"
VPS_USER="${VPS_USER:-hasan}"
VPS_PASS="${VPS_PASS:?Set VPS_PASS}"
REMOTE_DIR="${REMOTE_DIR:-/home/hasan/live-vehicles}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v sshpass >/dev/null 2>&1; then
  echo "Install sshpass first (brew install sshpass / apt install sshpass)"
  exit 1
fi

echo "==> Packaging project..."
TMP_TAR="$(mktemp /tmp/live-vehicles.XXXXXX)"
TMP_TAR="${TMP_TAR}.tar.gz"
tar -czf "$TMP_TAR" \
  -C "$ROOT" \
  --exclude api/node_modules \
  --exclude web/node_modules \
  --exclude web/.next \
  --exclude api/dist \
  --exclude .git \
  api web docker-compose.prod.yml deploy

echo "==> Uploading to ${VPS_USER}@${VPS_HOST}..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no "$TMP_TAR" "${VPS_USER}@${VPS_HOST}:/tmp/live-vehicles.tar.gz"

echo "==> Remote setup + docker compose..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_HOST}" "VPS_PASS='$VPS_PASS' REMOTE_DIR='$REMOTE_DIR' bash -s" <<'EOF'
set -euo pipefail
run_sudo() { echo "$VPS_PASS" | sudo -S "$@"; }

mkdir -p "$REMOTE_DIR"
tar -xzf /tmp/live-vehicles.tar.gz -C "$REMOTE_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  run_sudo usermod -aG docker "$USER" || true
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose not found"
  exit 1
fi

cd "$REMOTE_DIR"
run_sudo "${COMPOSE[@]}" -f docker-compose.prod.yml up -d --build
run_sudo "${COMPOSE[@]}" -f docker-compose.prod.yml ps
EOF

rm -f "$TMP_TAR"

echo "==> Smoke test..."
sleep 15
curl -fsS -o /dev/null -w "Web HTTP %{http_code}\n" "http://${VPS_HOST}/bn/login" || true
curl -fsS -o /dev/null -w "API docs HTTP %{http_code}\n" "http://${VPS_HOST}/backend-api/docs" || true

echo "Done. Open: http://${VPS_HOST}/bn/login"
echo "GT06 TCP: ${VPS_HOST}:5023"
