' --- start_straptoc.vbs ---
' Run by the Desktop shortcut: starts the server with no window, which a .bat
' cannot do. Its messages go to logs\server.log, started afresh each time, and
' show in the page with Ctrl+Shift+D. start_straptoc.bat, which keeps a window
' open, remains for looking into a server that does not start.
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
shell.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)
If Not fso.FolderExists("logs") Then fso.CreateFolder("logs")
If shell.Run("cmd /c where node", 0, True) <> 0 Then
    MsgBox "Node.js was not found. Install it from https://nodejs.org", vbCritical, "Straptoc"
    WScript.Quit 1
End If
' A Straptoc already running keeps logs\server.log locked, and cmd, unable to
' redirect into it, would give up before starting node, silently, the window
' being hidden. The second start then writes elsewhere: node finds the port
' taken, opens the running Straptoc in the browser and stops.
logFile = "logs\server.log"
On Error Resume Next
Set probe = fso.OpenTextFile(logFile, 8, True)
If Err.Number <> 0 Then
    logFile = "logs\second_start.log"
Else
    probe.Close
End If
Err.Clear
On Error GoTo 0
shell.Run "cmd /c node html_app.js > " & logFile & " 2>&1", 0, False
