@echo off
setlocal
chcp 65001 >nul

echo =======================================================
echo        毕业设计启动诊断脚本 (Neo Dining)
echo =======================================================
echo.

:: --- 1. 检查当前位置 ---
if not exist "backend" (
    echo [致命错误] 当前目录下找不到 'backend' 文件夹！
    echo.
    echo 请确认：
    echo 1. 本脚本是否放在了项目的根目录？
    echo 2. 本脚本是否和 'backend', 'frontend' 文件夹在一起？
    echo.
    echo 当前所在路径: %cd%
    echo 目录内容预览:
    dir /b
    echo.
    pause
    exit /b
)

:: --- 2. 检查 Python ---
echo [检查] Python 环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 电脑未安装 Python 或未配置环境变量！
    pause
    exit /b
)

:: --- 3. 检查 Node.js ---
echo [检查] Node.js 环境...
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 电脑未安装 Node.js！
    pause
    exit /b
)

:: --- 4. 安装依赖并启动 ---
echo.
echo [1/3] 安装后端依赖...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [警告] 后端依赖安装可能有问题，尝试继续...
)
cd ..

echo.
echo [2/3] 构建前端...
cd frontend
if not exist "node_modules" call npm install
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 前端构建失败！请检查上方报错信息。
    cd ..
    pause
    exit /b
)
cd ..

echo.
echo [3/3] 启动服务器...
echo -------------------------------------------------------
echo 请在浏览器访问: http://localhost:5000
echo (关闭此窗口即可停止服务)
echo -------------------------------------------------------

cd backend
python app.py

pause