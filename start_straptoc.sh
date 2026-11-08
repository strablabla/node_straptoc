#!/bin/sh
# --- start_straptoc.sh ---
# Run by the desktop launcher: starts the server from this folder, with no
# window. Its messages go to logs/server.log, started afresh each time, and
# show in the page with Ctrl+Shift+D.
# The launcher gives Node's absolute path in NODE: a .desktop started from a
# menu does not get the shell's PATH (nvm).
cd "$(dirname "$0")" || exit 1
mkdir -p logs
exec "${NODE:-node}" html_app.js > logs/server.log 2>&1
