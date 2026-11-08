#!/bin/bash
# --- create_launcher.sh ---
# Ce script crée un lanceur .desktop sur le Bureau pour ton app Node.js
# The server then runs with no window (start_straptoc.sh); its messages are
# read in the page with Ctrl+Shift+D, or in logs/server.log.

APP_NAME="Straptoc"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_FILE="$HOME/Bureau/${APP_NAME}.desktop"
NODE_BIN="$(command -v node)"

if [ -z "$NODE_BIN" ]; then
    echo "❌ Node.js introuvable : installe-le ou charge-le (nvm) puis relance ce script."
    exit 1
fi

echo "[Desktop Entry]
Version=1.0
Type=Application
Name=$APP_NAME
Comment=Lance l’application Node.js Straptoc
Exec=env NODE=\"$NODE_BIN\" \"$APP_DIR/start_straptoc.sh\"
Path=$APP_DIR
Icon=$APP_DIR/icons/straptoc.png
Terminal=false
Categories=Utility;" > "$DESKTOP_FILE"

chmod +x "$DESKTOP_FILE"
# GNOME shows an untrusted .desktop on the Desktop as a plain file.
gio set "$DESKTOP_FILE" metadata::trusted true 2>/dev/null

echo "✅ Icône créée sur le bureau : $DESKTOP_FILE"
