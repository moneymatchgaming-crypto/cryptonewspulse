@echo off
echo ========================================
echo Starting CryptoNewsPulse - Full Stack
echo ========================================
echo.

echo Step 1: Killing any existing Node processes...
taskkill /f /im node.exe 2>nul
echo.

echo Step 2: Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd /d %~dp0 && node server.cjs"

echo Step 3: Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Step 4: Starting Frontend Development Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo The frontend will open automatically in your browser.
echo Press any key to close this window.
echo ========================================
pause 