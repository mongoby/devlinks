#!/bin/bash

echo "=========================================="
echo "DevLinks 项目启动脚本"
echo "=========================================="
echo ""

# 检查 Node.js
echo "检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js 18+"
    exit 1
fi
echo "[OK] Node.js 已安装"

# 检查 Python
echo "检查 Python 环境..."
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未检测到 Python，请先安装 Python 3.11+"
    exit 1
fi
echo "[OK] Python 已安装"

echo ""
echo "=========================================="
echo "启动后端服务"
echo "=========================================="
cd devlinks-backend

# 创建虚拟环境
if [ ! -d "venv" ]; then
    echo "创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "安装后端依赖..."
pip install -r requirements.txt

# 启动后端服务（在后台运行）
echo "启动后端服务..."
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

cd ..

echo ""
echo "=========================================="
echo "启动前端服务"
echo "=========================================="
cd devlinks-frontend

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

# 启动前端服务
echo "启动前端服务..."
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

cd ..

echo ""
echo "=========================================="
echo "项目启动完成！"
echo "=========================================="
echo "前端访问地址: http://localhost:3000"
echo "后端API地址: http://localhost:8000"
echo "API文档地址: http://localhost:8000/docs"
echo ""
echo "后端进程ID: $BACKEND_PID"
echo "前端进程ID: $FRONTEND_PID"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户输入
read -p ""

# 停止服务
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null

echo "服务已停止"
