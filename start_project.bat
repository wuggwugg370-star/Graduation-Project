@echo off
chcp 65001
echo =======================================================
echo        毕业设计一键启动脚本 (Neo Dining System)
echo =======================================================

:: 1. 检查 Python 环境
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python，请先安装 Python 并添加到环境变量。
    pause
    exit
)

:: 2. 检查 Node.js 环境
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js。
    pause
    exit
)

echo.
echo [1/4] 正在安装/更新后端依赖...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [警告] 后端依赖安装失败，请检查网络或配置。
)
cd ..

echo.
echo [2/4] 正在安装前端依赖 (首次运行可能较慢)...
cd frontend
if not exist node_modules (
    call npm install
) else (
    echo node_modules 已存在，跳过 npm install (如需更新请手动删除该目录)
)

echo.
echo [3/4] 正在构建前端资源...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 前端构建失败！
    pause
    exit
)
cd ..

echo.
echo [4/4] 启动系统...
echo -------------------------------------------------------
echo 请在浏览器访问: http://localhost:5000
echo (按 Ctrl+C 关闭服务器)
echo -------------------------------------------------------

cd backend
python app.py

pause