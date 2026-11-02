@echo off
rem --- create_launcher.bat ---
rem Double-clickable wrapper: Windows opens a .ps1 in Notepad instead of
rem running it, and the default execution policy would refuse it anyway.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create_launcher.ps1"
pause
