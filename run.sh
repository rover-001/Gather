#!/usr/bin/env bash
set -e

# Gather Run Script — Starts Docker Postgres, Fastify Server & Vite Web App

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=========================================="
echo "✨ Starting Gather Services"
echo "=========================================="

# 1. Ensure Postgres Docker container is running
echo "🐘 Checking PostgreSQL container (pg-db)..."
if ! docker ps --format '{{.Names}}' | grep -q '^pg-db$'; then
  if docker ps -a --format '{{.Names}}' | grep -q '^pg-db$'; then
    echo "Starting existing pg-db container..."
    docker start pg-db
  else
    echo "Error: pg-db container not found. Please start Postgres."
    exit 1
  fi
fi

# Ensure database exists
docker exec -i pg-db psql -U rover -d keepsake -c "SELECT 1;" >/dev/null 2>&1 || {
  echo "Creating keepsake database..."
  docker exec -i pg-db psql -U rover -c "CREATE DATABASE keepsake;"
}

# 2. Cleanup existing background processes on exit
cleanup() {
  echo ""
  echo "🛑 Stopping Gather services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Start Backend Fastify Server
echo "🚀 Starting Fastify API & WebSocket server on http://0.0.0.0:8080 ..."
cd "$ROOT_DIR/server"
npx tsx watch src/index.ts &
SERVER_PID=$!

# Wait for server to be responsive
sleep 2

# 4. Start Frontend Vite Dev Server
echo "⚡ Starting Vite Frontend on https://0.0.0.0:5173 ..."
cd "$ROOT_DIR/web"
npm run dev -- --host &
WEB_PID=$!

# Detect Local / Hotspot LAN IP
LAN_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}')
if [ -z "$LAN_IP" ]; then
  LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

# Detect and configure Tailscale Funnel if enabled
TS_FUNNEL_URL=""
if command -v tailscale >/dev/null 2>&1; then
  if tailscale status 2>/dev/null | grep -q "Funnel on:"; then
    tailscale funnel --bg https+insecure://127.0.0.1:5173 >/dev/null 2>&1 || true
    TS_FUNNEL_URL=$(tailscale funnel status 2>/dev/null | grep -o 'https://[^ ]*' | head -n 1)
  fi
fi

echo "=========================================="
echo " ✨ Gather is Live & Ready (HTTPS Enabled)!"
echo " Local (Host PC):   https://localhost:5173"
if [ -n "$TS_FUNNEL_URL" ]; then
  echo " Public / Funnel:   ${TS_FUNNEL_URL}"
fi
if [ -n "$LAN_IP" ]; then
  echo " Phone / Hotspot:   https://${LAN_IP}:5173"
  echo " Phone / Cam View:  https://${LAN_IP}:5173/cam"
fi
echo " API Server:        http://localhost:8080"
echo " Health Status:     http://localhost:8080/api/health"
echo " Host Portal:       https://localhost:5173/host/setup"
echo " Passes:            https://localhost:5173/host/passes"
echo "=========================================="
echo "📱 Phone Tip (Brave / Chrome / Safari):"
echo " Open: https://${LAN_IP:-<PC_IP>}:5173"
echo " On first visit, tap 'Advanced' -> 'Proceed to ${LAN_IP:-<PC_IP>} (unsafe)'."
echo " Because it is HTTPS, the browser will allow full camera permissions!"
echo "=========================================="
echo "Press Ctrl+C to stop all services."

wait
