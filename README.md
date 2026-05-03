# DevLinks — 轻量级开发者工作台

一站式开发资源管理平台，集链接管理、TIL 知识墙、Mock API 工厂和开发者工具于一体。

## 功能模块

| 模块 | 说明 |
|------|------|
| **链接管理** | 链接分类存储、卡片式展示、环境标签、批量操作、链接有效性检测 |
| **TIL 知识墙** | Markdown 发布、标签/项目/时间多维筛选、知识沉淀与检索 |
| **Mock API 工厂** | JSON Schema 定义、动态接口生成、请求日志追踪、一键复制 Mock 地址 |
| **开发者工具** | Base64 编解码、时间戳转换、JSON 格式化/压缩/语法高亮 |

## 技术栈

| 层 | 技术 |
|---|------|
| **前端** | React 18 + Vite 5 + Ant Design 5 + React Router 6 + Axios |
| **后端** | Python 3.11+ / FastAPI 0.110+ / SQLAlchemy 2.0+ / Pydantic 2.0+ / SQLite |
| **部署** | Docker / Docker Compose |

## 快速开始

### 方式一：Docker 一键部署（推荐）

```bash
cd devlinks-backend
docker compose up -d
```

### 方式二：手动启动

**后端**

```bash
cd devlinks-backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**前端**

```bash
cd devlinks-frontend
npm install
npm run dev
```

### 访问地址

- 前端页面：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

### 默认账号

- 用户名：`admin`
- 密码：`admin123`

## 亮点功能：Mock Server 动态接口

Mock API 工厂支持通过 JSON Schema 动态生成 RESTful 接口，无需手写数据。

```
POST /api/mock/schemas  → 注册 Schema
GET  /api/mock/run/{project}{path}  → 动态生成响应数据
```

每个注册的 Schema 会自动生成一个可访问的 Mock 端点，支持 GET/POST/PUT/DELETE 四种方法，并提供完整的请求日志。

## 项目结构

```
devlinks/
├── devlinks-frontend/          # 前端项目
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   ├── components/         # 公共组件
│   │   ├── services/           # API 请求封装
│   │   ├── hooks/              # 自定义 Hooks
│   │   └── utils/              # 工具函数
│   ├── package.json
│   └── vite.config.js
│
└── devlinks-backend/           # 后端项目
    ├── app/
    │   ├── api/                # API 路由
    │   ├── models/             # 数据库模型
    │   ├── schemas/            # Pydantic 数据验证
    │   ├── core/               # 核心配置与异常
    │   ├── services/           # 业务逻辑
    │   └── utils/              # 工具函数
    ├── data/                   # SQLite 数据库文件
    ├── requirements.txt
    └── Dockerfile
```

## 开发说明

```bash
# 前端
cd devlinks-frontend
npm run dev        # 启动开发服务器
npm run build      # 生产构建

# 后端
cd devlinks-backend
python -m uvicorn app.main:app --reload
```

## 许可证

MIT License © 2026 钟明豪
