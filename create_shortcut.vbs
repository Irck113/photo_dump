Set objWShell = CreateObject("WScript.Shell")
strDesktop = objWShell.SpecialFolders("Desktop")

Set objShortcut = objWShell.CreateShortcut(strDesktop & "\Galería de Fotos.lnk")
objShortcut.TargetPath = "wscript.exe"
objShortcut.Arguments = """" & objWShell.CurrentDirectory & "\run_hidden.vbs"" """ & objWShell.CurrentDirectory & "\start_photo_gallery.bat"""
objShortcut.WorkingDirectory = objWShell.CurrentDirectory
objShortcut.IconLocation = "shell32.dll,156"
objShortcut.Description = "Galería de Fotos"
objShortcut.Save
