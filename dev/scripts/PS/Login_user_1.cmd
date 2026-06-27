@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Login_user_1.ps1" %*
if errorlevel 1 pause
