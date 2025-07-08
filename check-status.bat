@echo off
echo ========================================
echo Checking CryptoNewsPulse Server Status
echo ========================================
echo.

echo Checking Backend Server (Port 3001)...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend Server: RUNNING
) else (
    echo ❌ Backend Server: NOT RUNNING
)

echo.
echo Checking Frontend Server (Port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend Server: RUNNING
) else (
    echo ❌ Frontend Server: NOT RUNNING
)

echo.
echo ========================================
echo Status Check Complete
echo ========================================
pause 