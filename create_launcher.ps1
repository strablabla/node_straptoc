# --- create_launcher.ps1 ---
# Windows counterpart of create_launcher.sh: puts a "Straptoc" shortcut on
# the Desktop that starts the server without a window (start_straptoc.vbs).
# Its messages: Ctrl+Shift+D in the page, or logs\server.log.
# Run with:  powershell -ExecutionPolicy Bypass -File create_launcher.ps1

$AppName = "Straptoc"
$AppDir  = $PSScriptRoot
# GetFolderPath follows a Desktop moved to OneDrive or localised ("Bureau").
$Desktop = [Environment]::GetFolderPath("Desktop")
$Link    = Join-Path $Desktop "$AppName.lnk"

$Shell    = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($Link)
$Shortcut.TargetPath       = Join-Path $env:WINDIR "System32\wscript.exe"
$Shortcut.Arguments        = '"' + (Join-Path $AppDir "start_straptoc.vbs") + '"'
$Shortcut.WorkingDirectory = $AppDir
$Shortcut.Description      = "Launch the Straptoc Node.js application"
# without it, Windows shows the generic gears of a .bat file
$Shortcut.IconLocation     = (Join-Path $AppDir "icons\straptoc.ico") + ",0"
$Shortcut.Save()

Write-Host "Shortcut created on the Desktop: $Link"
