#!/bin/sh
export DISPLAY=:0

# Anti-veille/écran noir
xset -dpms; xset s off; xset s noblank

# Sortie vidéo
OUT="$(xrandr --listmonitors 2>/dev/null | awk 'NR==2{print $4}')"
[ -z "$OUT" ] && OUT="$(xrandr | awk '/ connected/{print $1; exit}')"
[ -n "$OUT" ] && xrandr --output "$OUT" --auto --primary

# Taille écran pour Chromium plein écran
SIZE="$(xdpyinfo 2>/dev/null | awk '/dimensions:/ {print $2; exit}')"
[ -z "$SIZE" ] && SIZE="1920x1080"
W="${SIZE%x*}"; H="${SIZE#*x}"

# Masquer le curseur après 3s d'inactivité (en tant que jucyla)
runuser -u jucyla -- bash -lc 'pgrep -x unclutter >/dev/null || \
  unclutter -idle 3 -jitter 2 -root -fork >/dev/null 2>&1'

# Lancer Chromium (toujours en tant que jucyla)
exec runuser -u jucyla -- /usr/bin/chromium-browser \
  --app="http://127.0.0.1:8099/prod/?ns=/ns&mode=tv&v=$(date +%s)" \
  --kiosk --start-fullscreen --force-device-scale-factor=1 \
  --user-data-dir=/home/jucyla/.config/chromium-rotate \
  --no-first-run --no-default-browser-check \
  --disable-translate --disable-session-crashed-bubble --disable-infobars \
  --password-store=basic --disk-cache-dir=/tmp/rot-cache \
  --overscroll-history-navigation=0 --disable-pinch --disable-gpu \
  --window-position=0,0 --window-size="${W},${H}"
