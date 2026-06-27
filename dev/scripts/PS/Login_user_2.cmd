@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Login_user_2.ps1" %*
if errorlevel 1 pause
