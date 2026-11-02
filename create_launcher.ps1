# --- create_launcher.ps1 ---
# Windows counterpart of create_launcher.sh: puts a "Straptoc" shortcut on
# the Desktop that runs start_straptoc.bat.
# Run with:  powershell -ExecutionPolicy Bypass -File create_launcher.ps1

$AppName = "Straptoc"
$AppDir  = $PSScriptRoot
# GetFolderPath follows a Desktop moved to OneDrive or localised ("Bureau").
$Desktop = [Environment]::GetFolderPath("Desktop")
$Link    = Join-Path $Desktop "$AppName.lnk"

$Shell    = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($Link)
$Shortcut.TargetPath       = Join-Path $AppDir "start_straptoc.bat"
$Shortcut.WorkingDirectory = $AppDir
$Shortcut.Description      = "Launch the Straptoc Node.js application"
$Shortcut.Save()

Write-Host "Shortcut created on the Desktop: $Link"
