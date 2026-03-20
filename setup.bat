@echo off
title CryptoNewsPulse - First Time Setup
echo.
echo  =========================================
echo   CryptoNewsPulse - First Time Setup
echo  =========================================
echo.
echo  Installing dependencies...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo  ERROR: npm install failed. Make sure Node.js is installed.
  echo  Download Node.js from: https://nodejs.org
  pause
  exit /b 1
)
echo.
echo  Setup complete! Run start.bat to launch the admin.
echo.
pause
