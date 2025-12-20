<#
Neo Dining System - 一键启动脚本
PowerShell版本 - 增强版
支持：安装依赖、构建前端、启动服务、端口检查、日志记录
#>

# 设置控制台标题
$host.ui.RawUI.WindowTitle = "Neo Dining System - 一键启动器"

# 颜色定义
$Color_Header = "Cyan"
$Color_Info = "Green"
$Color_Warning = "Yellow"
$Color_Error = "Red"
$Color_Success = "Green"
$Color_Command = "Magenta"

# 清除控制台
Clear-Host

# 显示欢迎信息
Write-Host "=======================================================" -ForegroundColor $Color_Header
Write-Host "         Neo Dining System - 一键启动脚本 " -ForegroundColor $Color_Header
Write-Host "=======================================================" -ForegroundColor $Color_Header
Write-Host ""
Write-Host " 自动安装依赖 |  构建前端 |  启动服务 |  端口检查" -ForegroundColor $Color_Info
Write-Host ""
Write-Host "=======================================================" -ForegroundColor $Color_Header
Write-Host ""

# --- 1. 目录检查 ---
Write-Host "[1/6] 检查项目目录结构..." -ForegroundColor $Color_Info
if (-not (Test-Path -Path "backend" -PathType Container)) {
    Write-Host " [错误] 'backend' 文件夹未找到！" -ForegroundColor $Color_Error
    Write-Host "请确保在项目根目录下运行此脚本。" -ForegroundColor $Color_Warning
    Read-Host -Prompt "按 Enter 键退出"
    exit 1
}

Write-Host " 项目目录结构正常" -ForegroundColor $Color_Success
Write-Host ""

# --- 2. Python 检查 ---
Write-Host "[2/6] 检查 Python 环境..." -ForegroundColor $Color_Info
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Python not found"
    }
    Write-Host " Python 版本: $pythonVersion" -ForegroundColor $Color_Success
} catch {
    Write-Host " [错误] Python 未安装或未添加到环境变量！" -ForegroundColor $Color_Error
    Write-Host "请先安装 Python 3.7 或更高版本。" -ForegroundColor $Color_Warning
    Read-Host -Prompt "按 Enter 键退出"
    exit 1
}

Write-Host ""

# --- 3. Node.js 检查 ---
Write-Host "[3/6] 检查 Node.js 环境..." -ForegroundColor $Color_Info
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    $nodeVersion = node --version 2>&1
    Write-Host " Node.js 版本: $nodeVersion" -ForegroundColor $Color_Success
    Write-Host " npm 版本: $npmVersion" -ForegroundColor $Color_Success
} catch {
    Write-Host " [错误] Node.js 未安装或未添加到环境变量！" -ForegroundColor $Color_Error
    Write-Host "请先安装 Node.js 14 或更高版本。" -ForegroundColor $Color_Warning
    Read-Host -Prompt "按 Enter 键退出"
    exit 1
}

# --- 4. 安装后端依赖 ---
Write-Host ""
Write-Host "[4/6] 安装后端依赖..." -ForegroundColor $Color_Info

Push-Location -Path "backend"
if (Test-Path -Path "requirements.txt" -PathType Leaf) {
    Write-Host " 正在安装 Python 依赖包..." -ForegroundColor $Color_Info
    pip install -r requirements.txt --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host " [错误] 后端依赖安装失败！" -ForegroundColor $Color_Error
        Write-Host "请检查网络连接或 requirements.txt 文件。" -ForegroundColor $Color_Warning
        Pop-Location
        Read-Host -Prompt "按 Enter 键退出"
        exit 1
    }
    Write-Host " 后端依赖安装完成" -ForegroundColor $Color_Success
} else {
    Write-Host "  [警告] requirements.txt 文件未找到！" -ForegroundColor $Color_Warning
    Write-Host "跳过后端依赖安装..." -ForegroundColor $Color_Info
}
Pop-Location

# --- 5. 构建前端项目 ---
Write-Host ""
Write-Host "[5/6] 构建前端项目..." -ForegroundColor $Color_Info

Push-Location -Path "frontend"
# 检查并安装前端依赖
if (-not (Test-Path -Path "node_modules" -PathType Container)) {
    Write-Host " 正在安装 Node.js 依赖包..." -ForegroundColor $Color_Info
    npm install --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host " [错误] 前端依赖安装失败！" -ForegroundColor $Color_Error
        Write-Host "请检查网络连接或 package.json 文件。" -ForegroundColor $Color_Warning
        Pop-Location
        Read-Host -Prompt "按 Enter 键退出"
        exit 1
    }
    Write-Host " 前端依赖安装完成" -ForegroundColor $Color_Success
}

# 构建前端
Write-Host " 正在构建前端项目..." -ForegroundColor $Color_Info
npm run build --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host " [错误] 前端构建失败！" -ForegroundColor $Color_Error
    Write-Host "请检查前端代码是否有错误。" -ForegroundColor $Color_Warning
    Pop-Location
    Read-Host -Prompt "按 Enter 键退出"
    exit 1
}
Write-Host " 前端构建完成" -ForegroundColor $Color_Success
Pop-Location

# --- 6. 启动服务器 ---
Write-Host ""
Write-Host "[6/6] 启动服务..." -ForegroundColor $Color_Info
Write-Host "=======================================================" -ForegroundColor $Color_Header
Write-Host " 准备启动 Neo Dining System 服务..." -ForegroundColor $Color_Info
Write-Host " 后端访问地址: http://localhost:5001" -ForegroundColor $Color_Info
Write-Host " 前端访问地址: http://localhost:5173 (开发模式)" -ForegroundColor $Color_Info
Write-Host "  停止服务: 按 Ctrl+C 键" -ForegroundColor $Color_Info
Write-Host "=======================================================" -ForegroundColor $Color_Header

# --- 端口检查与服务启动 ---
# 检查端口 5001 是否被占用
Write-Host ""
Write-Host " 检查端口 5001 是否被占用..." -ForegroundColor $Color_Info

# 使用更可靠的端口检查方法
$portCheck = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue

if ($portCheck) {
    Write-Host "  [警告] 端口 5001 已被占用！" -ForegroundColor $Color_Warning
    Write-Host "正在尝试关闭占用端口的进程..." -ForegroundColor $Color_Info
    
    foreach ($connection in $portCheck) {
        try {
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction Stop
            Write-Host " 已终止进程 $($connection.OwningProcess) (占用端口 5001)" -ForegroundColor $Color_Success
        } catch {
            Write-Host " 无法终止进程 $($connection.OwningProcess)" -ForegroundColor $Color_Error
            Write-Host "错误: $($_.Exception.Message)" -ForegroundColor $Color_Error
        }
    }
} else {
    Write-Host " 端口 5001 可用" -ForegroundColor $Color_Success
}

# --- 启动服务器 ---
Write-Host ""
Write-Host "=======================================================" -ForegroundColor $Color_Header
Write-Host " 正在启动 Neo Dining System 服务..." -ForegroundColor $Color_Header
Write-Host "=======================================================" -ForegroundColor $Color_Header
Write-Host " 后端访问地址: http://localhost:5001" -ForegroundColor $Color_Info
Write-Host " 前端访问地址: http://localhost:5173 (开发模式)" -ForegroundColor $Color_Info
Write-Host " 服务日志将显示在下方..." -ForegroundColor $Color_Info
Write-Host "  停止服务: 按 Ctrl+C 键" -ForegroundColor $Color_Info
Write-Host "=======================================================" -ForegroundColor $Color_Header
Write-Host ""

# 启动后端服务
Push-Location -Path "backend"
try {
    # 启动服务器并显示实时日志
    python app.py
} catch {
    Write-Host " [错误] 服务启动失败！" -ForegroundColor $Color_Error
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor $Color_Error
    Pop-Location
    Read-Host -Prompt "按 Enter 键退出"
    exit 1
} finally {
    Pop-Location
}

# 服务停止后的处理
Write-Host ""
Write-Host "=======================================================" -ForegroundColor $Color_Header
Write-Host " Neo Dining System 服务已停止" -ForegroundColor $Color_Warning
Write-Host "=======================================================" -ForegroundColor $Color_Header
Write-Host "感谢使用 Neo Dining System！" -ForegroundColor $Color_Info
Write-Host ""
Read-Host -Prompt "按 Enter 键退出"
