<p align="center">
  <h1 align="center">DevLinks 🚀</h1>
  <p align="center">一站式开发者工作台 — 链接不再乱、知识不丢失、Mock 不求人</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Ant_Design-5-0170FE?logo=antdesign" alt="Ant Design">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/license-MIT-orange" alt="License">
</p>

---

## 它解决什么问题？

每个开发者都有这些痛点：

| 😫 痛点 | 💡 DevLinks 怎么解决 |
|---------|---------------------|
| 收藏夹里几百个链接，找半天找不到 | **链接管理** — 分类 + 环境标记 + 标签搜索，秒定位 |
| 踩过的坑、学到的技巧，过几天就忘了 | **TIL 知识墙** — Markdown 记录 + 按项目归档，知识不丢失 |
| 前后端联调等后端接口，进度卡住 | **Mock API 工厂** — 写个 Schema，接口立刻能用 |
| 每次打开浏览器搜「Base64 在线」「时间戳转换」 | **开发者工具** — 本地一站式，不依赖任何在线工具 |

一个 Docker 命令全搞定，不需要注册、不连外网、数据完全在你手里。

---

## 📸 一览

| 仪表盘 | 链接管理 |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Links](screenshots/links.png) |

| TIL 知识墙 | Mock API 工厂 |
|:---:|:---:|
| ![TIL](screenshots/til.png) | ![Mock API](screenshots/mock-api.png) |

| 开发者工具 | 登录 |
|:---:|:---:|
| ![Tools](screenshots/tools.png) | ![Login](screenshots/login.png) |

---

## 🚀 30 秒跑起来

### Docker 部署（推荐）

```bash
# 1. 克隆
git clone https://github.com/mongoby/devlinks.git
cd devlinks

# 2. 配置（可选，默认即可用）
cp .env.example .env

# 3. 启动
docker compose up -d
```

浏览器打开 `http://localhost`，完成。

> 默认账号：`admin` / `admin123`

### 手动启动（开发模式）

**后端**
```bash
cd devlinks-backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**前端**
```bash
cd devlinks-frontend
npm install
npm run dev
```

然后访问 `http://localhost:3000`

---

## 📖 怎么用

### 链接管理

把散落在浏览器收藏夹、笔记、聊天记录里的链接统一管起来：

1. 创建分类（如：文档、工具、API 参考）
2. 添加链接，打上环境标签（开发/测试/预发布/生产）
3. 一键检测所有链接是否失效
4. 支持批量操作：删除、导出

> 再也不用翻 300 个书签找那个「上次看到一半的 API 文档」了。

### TIL 知识墙

> TIL = Today I Learned

把你每天学到的东西随手记下来：

1. Markdown 写作，支持代码高亮
2. 绑定到具体项目，按项目归档
3. 按「本周」「本月」自动聚合
4. 支持点赞互动

> 写下来，记下来，以后直接搜，不用再踩一遍同样的坑。

### Mock API 工厂

前端开发最怕「等后端接口」。Mock API 让你自给自足：

1. 定义 JSON Schema（就像写接口文档的数据结构）
2. 系统自动生成 HTTP 接口，支持 GET / POST / PUT / DELETE / PATCH
3. 直接 `curl` 或 `fetch` 调用，拿到逼真的假数据
4. 每个请求都有日志，调试清清楚楚
5. 一键导出 Postman Collection

```bash
# 在 DevLinks 中定义 Schema 后，直接 curl
curl http://localhost:8000/api/mock/run/my-project/api/users

# → {"data": [{"id": 1, "name": "John", "email": "john@example.com"}]}
```

### 开发者工具

再也不用打开一堆在线工具网站：

| 工具 | 功能 |
|------|------|
| Base64 | 编解码，复制即用 |
| 时间戳 | 秒级实时时间戳 → 可读日期，双向转换 |
| JSON | 一键格式化 / 压缩，语法高亮 |

---

## 🛠 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 18 · Vite 5 · Ant Design 5 · React Router 6 |
| 后端 | Python 3.11+ · FastAPI · SQLAlchemy 2.0 · Pydantic 2.0 |
| 数据库 | SQLite（零配置，数据一个文件） |
| 部署 | Docker · Docker Compose · Nginx |

---

## 🏗 项目结构

```
devlinks/
├── devlinks-frontend/    # React 前端
│   ├── src/pages/        # 页面：Dashboard / Links / TIL / MockAPI / Tools
│   ├── src/services/     # API 请求封装
│   └── src/utils/        # 工具函数
├── devlinks-backend/     # FastAPI 后端
│   ├── app/api/v1/       # RESTful 接口
│   ├── app/models/       # SQLAlchemy 模型
│   ├── app/schemas/      # Pydantic 校验
│   └── app/services/     # 业务逻辑
├── screenshots/          # 截图
├── docker-compose.yml    # 一键部署
└── .env.example          # 环境变量模板
```

---

## 📄 License

MIT © 2026 mongoby
