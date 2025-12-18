@echo off
:: 强制切换为 UTF-8 编码，解决中文乱码
chcp 65001 >nul
title Neo Dining Launcher
color 0A
cls

echo ========================================================
echo   Neo Dining - 最终完美版启动器
echo ========================================================

echo.
echo [1/3] 正在检查后端环境...
pip install -r backend/requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python 依赖安装失败，请检查 Python 是否安装。
    pause
    exit /b
)
:: 启动后端
start "Backend Server" cmd /k "chcp 65001 && cd backend && python app.py"

echo.
echo [2/3] 正在检查前端环境...
cd frontend
if not exist node_modules call npm install >nul 2>&1
:: 启动前端 (会读取 package.json 中的 --open 自动打开浏览器)
start "Frontend Server" cmd /k "chcp 65001 && npm run dev"
cd ..

echo.
echo [3/3] 启动成功！
echo.
echo   请留意自动弹出的浏览器窗口。
echo   如果没有弹出，请手动访问: http://localhost:5173
echo.
echo ========================================================
pause