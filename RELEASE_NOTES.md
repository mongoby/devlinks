# DevLinks v1.0.0 发行说明

## 轻量级开发者工作台 — 链接管理 · 知识沉淀 · Mock API · 实用工具

---

### 功能

| 模块 | 说明 |
|------|------|
| 链接管理 | 分类存储、环境标记(dev/test/staging/prod)、失效检测、批量操作、标签筛选 |
| TIL知识墙 | Markdown编辑、项目绑定、时间归档(本周/本月)、点赞互动 |
| Mock API工厂 | JSON Schema定义 -> 动态HTTP接口(GET/POST/PUT/DELETE)、请求日志、Postman导出 |
| 开发者工具 | Base64编解码、时间戳转换、JSON格式化/压缩 |

### 部署

```bash
cp .env.example .env
docker compose up -d
```

访问 http://localhost  
默认账号: admin / admin123

### 技术栈

前端: React 18 + Vite 5 + Ant Design 5  
后端: Python 3.11 / FastAPI / SQLAlchemy / SQLite  
部署: Docker Compose + Nginx

---

> 许可证: MIT  
> 作者: mongoby  
> GitHub: https://github.com/mongoby/devlinks
