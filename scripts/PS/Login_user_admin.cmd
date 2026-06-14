@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Login_user_admin.ps1" %*
if errorlevel 1 pause
