@echo off
rem --- start_straptoc.bat ---
rem Windows counterpart of the Linux .desktop launcher: starts the server
rem from this folder, then keeps the window open so errors stay readable.
cd /d "%~dp0"
node html_app.js
pause
