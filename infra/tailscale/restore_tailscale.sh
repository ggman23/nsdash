#!/usr/bin/env bash
set -euo pipefail
echo "[TS] Reset Serve…"
sudo tailscale serve reset || true
# CLI récente
if tailscale serve --bg http://127.0.0.1:8099 2>/dev/null; then
  tailscale serve --bg --set-path=/ns   http://127.0.0.1:1337 || true
  tailscale serve --bg --set-path=/dash http://127.0.0.1:8099 || true
else
  # Fallback anciennes syntaxes
  tailscale serve https / proxy http://127.0.0.1:8099 || true
  tailscale serve https /ns proxy http://127.0.0.1:1337 || true
  tailscale serve https /dash proxy http://127.0.0.1:8099 || true
fi
tailscale serve status
