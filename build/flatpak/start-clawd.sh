#!/bin/bash
# Clawd on Desk — Flatpak launcher
#
# --ozone-platform=x11: force XWayland even when session type is Wayland.
#   Without this Electron auto-detects Wayland and fails (no --socket=wayland).
# --no-sandbox: Flatpak blocks SUID chrome-sandbox.

HOOKS_HOST_DIR="$HOME/.clawd/hooks"

# Sync hook scripts to a host-accessible path. Claude Code (and other agents)
# run outside the Flatpak sandbox and can't see /app, so hook commands must
# reference scripts under $HOME.
mkdir -p "$HOOKS_HOST_DIR"
cp -a /app/resources/app.asar.unpacked/hooks/* "$HOOKS_HOST_DIR/"

export PATH="$HOME/.local/bin:$PATH"
export CLAWD_HOOKS_DIR="$HOOKS_HOST_DIR"
exec /app/clawd-on-desk --no-sandbox --ozone-platform=x11 "$@"
