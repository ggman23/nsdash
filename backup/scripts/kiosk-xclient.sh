#!/bin/bash
exec >>/tmp/kiosk.log 2>&1
set -x
echo "=== $(date) kiosk-xclient start ==="
export DISPLAY=:0

xset -dpms || true; xset s off || true; xset s noblank || true
OUT="$(xrandr --query 2>/dev/null | awk '/ connected/{print $1; exit}')"
[ -n "$OUT" ] && { xrandr --output "$OUT" --mode 1920x1080 --rate 60 --primary 2>/dev/null || true; xrandr --fb 1920x1080 2>/dev/null || true; }
unclutter -idle 2 -root &

URL="http://127.0.0.1:8099/prod/?ns=/ns&mode=tv&v=$(date +%s)"
exec /usr/bin/chromium-browser \
  --app="$URL" \
  --kiosk --start-fullscreen \
  --incognito --bwsi --no-first-run --no-default-browser-check --test-type --noerrdialogs \
  --disable-gpu --disable-gpu-compositing --disable-gpu-rasterization \
  --use-gl=swiftshader --disable-features=UseOzonePlatform,TouchpadOverscrollHistoryNavigation \
  --user-data-dir=/home/jucyla/.config/chromium-nsdash-8099 \
  --password-store=basic --disk-cache-dir=/tmp/rot-cache \
  --overscroll-history-navigation=0 --disable-pinch \
  --window-size=1920,1080 --window-position=0,0
