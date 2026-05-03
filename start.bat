@echo off
chcp 65001

echo ==========================================
echo DevLinks 项目启动脚本
echo ==========================================
echo.

REM 检查是否安装了Node.js
echo 检查 Node.js 环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)
echo [OK] Node.js 已安装

REM 检查是否安装了Python
echo 检查 Python 环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python，请先安装 Python 3.11+
    pause
    exit /b 1
)
echo [OK] Python 已安装

echo.
echo ==========================================
echo 启动后端服务
echo ==========================================
cd devlinks-backend

REM 检查虚拟环境
if not exist venv (
    echo 创建 Python 虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate

REM 安装依赖
echo 安装后端依赖...
pip install -r requirements.txt

REM 启动后端服务（在后台运行）
echo 启动后端服务...
start "DevLinks Backend" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

cd ..

echo.
echo ==========================================
echo 启动前端服务
echo ==========================================
cd devlinks-frontend

REM 检查 node_modules
if not exist node_modules (
    echo 安装前端依赖...
    npm install
)

REM 启动前端服务
echo 启动前端服务...
start "DevLinks Frontend" cmd /k "npm run dev"

cd ..

echo.
echo ==========================================
echo 项目启动完成！
echo ==========================================
echo 前端访问地址: http://localhost:3000
echo 后端API地址: http://localhost:8000
echo API文档地址: http://localhost:8000/docs
echo.
echo 按任意键关闭所有服务窗口...
pause

REM 关闭所有相关进程
taskkill /FI "WINDOWTITLE eq DevLinks Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq DevLinks Frontend" /F >nul 2>&1
