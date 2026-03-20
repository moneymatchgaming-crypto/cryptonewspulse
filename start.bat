@echo off
title CryptoNewsPulse Admin
echo.
echo  =========================================
echo   CryptoNewsPulse - Starting Admin...
echo  =========================================
echo.

REM Check that node_modules exists
if not exist "node_modules" (
  echo  node_modules not found. Running setup first...
  call setup.bat
)

echo  Starting backend server...
start "CNP Backend" cmd /k "node server.cjs"

echo  Waiting for backend to start...
timeout /t 2 /nobreak >nul

echo  Starting frontend...
start "CNP Frontend" cmd /k "node node_modules/vite/bin/vite.js --port 5173"

echo  Waiting for frontend to start...
timeout /t 3 /nobreak >nul

echo  Opening admin panel in browser...
start http://localhost:5173/admin

echo.
echo  Admin is running at: http://localhost:5173/admin
echo  Default login: admin / admin123
echo.
echo  Close the two black terminal windows to shut down the server.
echo.
pause
