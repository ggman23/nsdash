#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[RESTORE] Web files -> /var/www/nsdash"
sudo mkdir -p /var/www/nsdash
sudo rsync -a --delete "$DIR/www/" /var/www/nsdash/

echo "[RESTORE] Services systemd"
for u in nsdash.service rotate-kiosk.service; do
  if [ -f "$DIR/systemd/$u" ]; then
    sudo install -D -m0644 "$DIR/systemd/$u" "/etc/systemd/system/$u"
  fi
done
if [ -f "$DIR/scripts/kiosk-xclient.sh" ]; then
  sudo install -D -m0755 "$DIR/scripts/kiosk-xclient.sh" /usr/local/bin/kiosk-xclient.sh
fi
sudo systemctl daemon-reload
sudo systemctl enable nsdash rotate-kiosk || true
sudo systemctl restart nsdash rotate-kiosk || true

echo "[RESTORE] Tailscale Serve"
[ -x "$DIR/tailscale/restore_tailscale.sh" ] && "$DIR/tailscale/restore_tailscale.sh" || true

echo "[RESTORE] Pour restaurer Mongo (si dump présent) :"
echo "  zcat infra/backups/mongo-*.archive.gz | docker exec -i nightscout-mongo-1 mongorestore --archive --gzip"
