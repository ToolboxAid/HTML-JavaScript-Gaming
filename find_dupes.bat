@echo off
setlocal enabledelayedexpansion

set "temp_raw=%temp%\js_raw.txt"
set "temp_sorted=%temp%\js_sorted.txt"

:: Clean up old files
if exist "%temp_raw%" del "%temp_raw%"

echo Searching for functions...

:: Extract potential function names
:: This looks for 'function NAME(' or 'NAME = function' or 'NAME: function'
for /r %%f in (*.js) do (
    findstr /r /c:"function [a-zA-Z0-9_]*(" /c:"[a-zA-Z0-9_]* = function" /c:"[a-zA-Z0-9_]*: function" "%%f" >> "%temp_raw%" 2>nul
)

if not exist "%temp_raw%" (
    echo No JS files or functions found.
    pause
    exit /b
)

echo Checking for duplicates...
echo -----------------------

:: Sort the raw lines to bring duplicates together
sort "%temp_raw%" > "%temp_sorted%"

set "prev="
set "found=0"

:: Compare current line to previous line
for /f "tokens=*" %%g in (%temp_sorted%) do (
    if "%%g"=="!prev!" (
        echo Duplicate line: %%g
        set "found=1"
    )
    set "prev=%%g"
)

if %found%==0 echo No duplicates found.

:: Cleanup
del "%temp_raw%"
del "%temp_sorted%"
pause
