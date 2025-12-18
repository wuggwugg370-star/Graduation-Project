@echo off
setlocal

echo =======================================================
echo        Neo Dining System - Start Script
echo =======================================================
echo.

:: --- 1. Check Directory ---
if not exist "backend" (
    echo [ERROR] 'backend' folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b
)

:: --- 2. Check Python ---
echo [Check] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed.
    pause
    exit /b
)

:: --- 3. Check Node.js ---
echo [Check] Checking Node.js...
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    pause
    exit /b
)

:: --- 4. Install & Build ---
echo.
echo [1/3] Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo [2/3] Building Frontend...
cd frontend
if not exist "node_modules" call npm install
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    cd ..
    pause
    exit /b
)
cd ..

echo.
echo [3/3] Starting Server...
echo -------------------------------------------------------
echo Access URL: http://localhost:5000
echo (Close this window to stop)
echo -------------------------------------------------------

cd backend
python app.py
pause