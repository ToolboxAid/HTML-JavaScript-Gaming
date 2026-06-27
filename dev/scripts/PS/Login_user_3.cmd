@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Login_user_3.ps1" %*
if errorlevel 1 pause
