@echo off
:: 强制切换为 UTF-8 编码
chcp 65001 >nul
title Neo Dining Launcher
color 0A
cls

echo ========================================================
echo   Neo Dining - 调试版启动器
echo ========================================================

echo.
echo [1/3] 正在检查后端环境...
:: [修改] 移除了 >nul，让您能看到报错
pip install -r backend/requirements.txt
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Python 依赖安装失败！请检查网络或 Python 配置。
    pause
    exit /b
)
start "Backend Server" cmd /k "chcp 65001 && cd backend && python app.py"

echo.
echo [2/3] 正在检查前端环境...
cd frontend
:: [修改] 移除了 >nul，让您能看到报错
if not exist node_modules (
    echo 正在安装前端依赖（npm install），请耐心等待...
    call npm install
)

echo.
echo [3/3] 启动前端...
:: 启动前端
start "Frontend Server" cmd /k "chcp 65001 && npm run dev"
cd ..

echo.
echo 启动指令已发送。如果不自动弹出浏览器，请检查新窗口内的报错。
echo.
pause