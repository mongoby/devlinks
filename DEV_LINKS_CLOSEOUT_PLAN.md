# DevLinks 收尾工作计划

> 目标：用最少的时间，把项目做到「可展示、可售卖、可发布」的完工状态
>
> 预计总工时：5-7 天
>
> 策略：只做最亮的功能收尾，不做无意义的堆砌

---

## 📋 任务总览

| # | 任务 | 工时 | 产出 |
|---|------|:----:|------|
| 1 | Mock Server 动态路由（最亮的功能） | 0.5天 | 真正的 Mock HTTP 接口 |
| 2 | Postman Collection 导出 | 0.5天 | 可从 Postman 导入使用 |
| 3 | 代码清理 + 规范检查 | 0.5天 | 干净可发布的代码 |
| 4 | 补全缺少的后端接口 | 1天 | 前后端完全打通 |
| 5 | 完善 README 和文档 | 1天 | 专业的项目介绍 |
| 6 | 截图 + 产品页素材 | 0.5天 | 宣传材料 |
| 7 | 打 Docker 镜像 + 一键部署 | 0.5天 | 开箱即用 |
| 8 | 写技术文章 + 发布 | 1天 | 掘金/V2EX/知乎曝光 |
| 9 | 挂到售卖平台 | 0.5天 | Gumroad/闲鱼上架 |

---

## 一、亮点功能补充（1天）

### 1.1 Mock Server 动态路由（半天）

**当前问题：** Mock API 只能手动点「生成数据」，不是真正的 HTTP 接口。

**目标效果：** 用户在 DevLinks 里定义 Schema 后，直接向 `http://localhost:8000/mock/{project_name}/{path}` 发 HTTP 请求，就能拿到假数据。

**实现方案：**

在 `devlinks-backend/app/api/v1/mock.py` 中新增动态路由捕获：

```python
@router.api_route("/run/{project_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
def mock_dynamic_endpoint(
    project_name: str,
    path: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """动态 Mock 接口：根据 project_name 和 path 匹配 Schema 并返回 Mock 数据"""
    # 1. 查找项目
    project = db.query(MockProject).filter(MockProject.name == project_name).first()
    if not project:
        return JSONResponse(
            status_code=404,
            content={"code": 404, "message": f"Mock project '{project_name}' not found"}
        )

    # 2. 匹配 Schema（method + path）
    schema = db.query(MockSchema).filter(
        MockSchema.project_id == project.id,
        MockSchema.path == f"/{path}",
        MockSchema.method == request.method
    ).first()
    if not schema:
        return JSONResponse(
            status_code=404,
            content={"code": 404, "message": f"No schema matched: {request.method} /{path}"}
        )

    # 3. 生成 Mock 数据
    from app.services.mock_service import generate_mock_data
    mock_data = generate_mock_data(schema.json_schema)

    # 4. 记录请求日志
    try:
        from app.models.mock import MockLog
        log = MockLog(
            schema_id=schema.id,
            request_method=request.method,
            request_path=f"/{path}",
            request_headers=dict(request.headers),
            response_data=mock_data
        )
        db.add(log)
        db.commit()
    except Exception:
        pass  # 日志不影响主流程

    return mock_data
```

**需要新建的 Model（MockLog）：**

在 `devlinks-backend/app/models/mock.py` 追加：

```python
class MockLog(Base):
    __tablename__ = "mock_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    schema_id = Column(Integer, ForeignKey("mock_schema.id"), nullable=True)
    request_method = Column(String(10), nullable=False)
    request_path = Column(String(500), nullable=False)
    request_headers = Column(JSON, nullable=True)
    response_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

**前端显示 Mock URL：**
在现有 Mock API 列表页，每条 Schema 旁边显示可直接调用的 URL：

```
Mock 地址: http://localhost:8000/api/mock/run/{project}/{path}
[复制链接]
```

修改 `devlinks-frontend/src/pages/MockAPI.jsx`，在表格列中增加「Mock URL」列：

```jsx
{
  title: 'Mock 地址',
  key: 'mock_url',
  width: 350,
  render: (_, record) => {
    const projectName = projects.find(p => p.id === record.project_id)?.name || 'unknown'
    const url = `http://localhost:8000/api/mock/run/${projectName}${record.path}`
    return (
      <Space>
        <Text code style={{ fontSize: 12 }}>{url}</Text>
        <Button
          size="small"
          type="link"
          icon={<CopyOutlined />}
          onClick={() => {
            navigator.clipboard.writeText(url)
            message.success('已复制 Mock 地址')
          }}
        />
      </Space>
    )
  }
}
```

### 1.2 Postman Collection 导出（半天）

在后端 `devlinks-backend/app/api/v1/mock.py` 新增接口：

```python
@router.get("/export/{project_id}")
def export_postman_collection(project_id: int, db: Session = Depends(get_db)):
    """导出 Postman Collection JSON"""
    project = db.query(MockProject).filter(MockProject.id == project_id).first()
    if not project:
        return error(code=404, message="项目不存在")

    schemas = db.query(MockSchema).filter(MockSchema.project_id == project_id).all()

    items = []
    base_url = f"{{base_url}}/api/mock/run/{project.name}"

    for schema in schemas:
        items.append({
            "name": f"{schema.method} {schema.path}",
            "request": {
                "method": schema.method,
                "header": [],
                "url": {
                    "raw": f"{base_url}{schema.path}",
                    "host": [base_url],
                    "path": schema.path.strip("/").split("/")
                }
            },
            "response": []
        })

    collection = {
        "info": {
            "name": f"DevLinks Mock - {project.name}",
            "description": project.description or "",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": items
    }

    return success(data=collection)
```

---

## 二、代码清理 + 接口补全（1.5天）

### 2.1 补全后端缺失的接口（1天）

对照前端已调用的接口，补全后端缺失的部分：

| 接口 | 状态 | 工时 | 说明 |
|------|:----:|:----:|------|
| `POST /api/auth/logout` | 缺 | 0.5h | 返回成功即可，JWT 无需服务端注销 |
| `GET /api/auth/me` | 缺 | 0.5h | 返回当前用户信息 |
| `DELETE /api/links/batch` | 缺 | 0.5h | 批量删除 |
| `POST /api/links/check` | 缺 | 1h | 遍历所有链接，HEAD 请求检测状态 |
| `POST /api/til/{id}/like` | 缺 | 0.5h | 点赞计数 |
| `GET /api/mock/logs` | 缺 | 0.5h | 返回最近 50 条请求日志 |
| `DELETE /api/mock/logs` | 缺 | 0.5h | 清空日志 |

**批量删除接口示例：**
```python
@router.delete("/links/batch")
def batch_delete_links(ids: List[int], db: Session = Depends(get_db)):
    """批量删除链接"""
    deleted = db.query(Link).filter(Link.id.in_(ids)).delete(synchronize_session=False)
    db.commit()
    return success(message=f"成功删除 {deleted} 个链接")
```

**链接检测接口示例：**
```python
import httpx

@router.post("/links/check")
async def check_links(db: Session = Depends(get_db)):
    """检测链接有效性"""
    links = db.query(Link).filter(Link.status == "active").all()
    async with httpx.AsyncClient(timeout=5, verify=False) as client:
        for link in links:
            try:
                resp = await client.head(link.url, follow_redirects=True)
                if resp.status_code >= 400:
                    link.status = "inactive"
            except Exception:
                link.status = "inactive"
    db.commit()
    return success(message=f"检测完成，共检测 {len(links)} 个链接")
```

### 2.2 代码清理（0.5天）

```
[ ] 删除前端 dist/ 目录（放 .gitignore）
[ ] 删除 node_modules 引用（已在 .gitignore 就不用管）
[ ] 统一响应格式 — 确认所有接口返回 { code, message, data } 格式
[ ] 检查前端所有 console.error 是否要保留还是优化
[ ] 配置变量抽离到环境变量（后端 .env + 前端 .env）
[ ] 删除没用到的 import 和变量
[ ] 运行一次 npm run lint 修复警告
```

---

## 三、文档完善（1天）

### 3.1 重写 README.md

替换现有 README，改为一个专业的开源项目介绍页：

```markdown
# DevLinks 🚀

> 轻量级开发者工作台 — 链接管理 · 知识沉淀 · Mock API · 开发工具

[![GitHub stars](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourname/devlinks)
[![Tech Stack](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Tech Stack](https://img.shields.io/badge/FastAPI-0.110-green)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

---

## ✨ 功能

| 模块 | 截图 | 说明 |
|------|------|------|
| 📌 链接管理 | [截图] | 分类管理、环境标记、失效检测、批量操作 |
| 📝 TIL 知识墙 | [截图] | Markdown 编辑、项目绑定、标签归档 |
| 🎭 Mock API 工厂 | [截图] | Schema 定义、动态 Mock 接口、请求日志、Postman 导出 |
| 🔧 开发者工具 | [截图] | Base64、时间戳、JSON 格式化 |

## 🚀 快速开始

### 方式一：Docker 一键部署（推荐）

```bash
docker compose up -d
```

访问 http://localhost:3000

默认账号: admin / admin123

### 方式二：手动启动

见下方「开发」章节。

## 🛠 技术栈

**前端：** React 18 + Vite 5 + Ant Design 5 + React Router 6
**后端：** Python 3.11 + FastAPI + SQLAlchemy + SQLite
**部署：** Docker Compose

## 📸 项目截图

> 建议放 3-5 张截图，展示各页面效果

![Dashboard](screenshots/dashboard.png)
![Links](screenshots/links.png)
![Mock API](screenshots/mock-api.png)

## 🔥 亮点功能

### Mock Server（真正的动态接口）

定义 Schema 后，直接请求 HTTP 接口即可返回 Mock 数据：

```bash
# 定义好 Schema 后
curl http://localhost:8000/api/mock/run/my-project/api/users
# → { "data": [{ "id": 1, "name": "张三" }] }
```

支持 GET/POST/PUT/DELETE，自动记录请求日志，一键导出 Postman Collection。

## 🏗 项目结构

```
devlinks/
├── devlinks-frontend/     # React 前端
│   └── src/
│       ├── pages/         # 页面组件
│       ├── services/      # API 封装
│       ├── hooks/         # 自定义 Hooks
│       └── utils/         # 工具函数
├── devlinks-backend/      # FastAPI 后端
│   └── app/
│       ├── api/v1/        # API 路由
│       ├── models/        # 数据库模型
│       ├── schemas/       # 数据校验
│       └── services/      # 业务逻辑
└── docker-compose.yml
```

## 🧑‍💻 开发

```bash
# 后端
cd devlinks-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端
cd devlinks-frontend
npm install
npm run dev
```

## 📄 License

MIT
```

### 3.2 创建 SCREENSHOTS 目录

```bash
mkdir -p screenshots
```

启动项目后截图：
- Dashboard 仪表盘
- 链接管理列表页（带搜索筛选）
- 添加/编辑链接弹窗
- TIL 知识墙列表页
- Mock API 列表页（显示 Mock URL）
- 开发者工具页面

### 3.3 补充 LICENSE 文件

```markdown
MIT License

Copyright (c) 2026 [你的名字]

Permission is hereby granted...
（标准 MIT License 全文，约 20 行）
```

---

## 四、部署打包（0.5天）

### 4.1 检查 Docker Compose

当前 `docker-compose.yml` 已经可以工作，确认：

```
[ ] Dockerfile 能正常构建
[ ] 前端 nginx.conf 配置正确（反向代理到后端）
[ ] docker compose up -d 一次成功
[ ] 访问 http://localhost:80 能打开页面
[ ] 后端 Swagger 文档可访问 http://localhost:8000/docs
```

### 4.2 创建 .env.example 文件

确保所有敏感配置都在环境变量中：

**后端 `.env.example`：**
```
DATABASE_URL=sqlite:///./data/devlinks.db
SECRET_KEY=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**前端 `.env.example`：**
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4.3 最终验证清单

```
[ ] git clone 项目到新目录
[ ] docker compose up -d 启动
[ ] 前端页面正常打开
[ ] 登录成功（admin / admin123）
[ ] 创建链接 + 筛选 + 删除
[ ] 发布 TIL + Markdown 渲染
[ ] 定义 Mock Schema + 请求 Mock 接口
[ ] 导出 Postman Collection
[ ] 使用 Base64 / 时间戳 / JSON 工具
```

---

## 五、发布推广（1.5天）

### 5.1 写技术文章（1天）

**标题建议：**
- 「从零到一：我用 FastAPI + React 独立开发了一个开发者工作台」
- 「独立开发 3 个月，我做了个轻量版 Postman + Notion」
- 「一个全栈项目从开发到开源收尾的全过程」

**文章结构：**

```
1. 为什么做这个项目（背景）
   - 开发团队日常痛点：链接散落、API 定义混乱、知识没法沉淀

2. 技术选型
   - 前端：React + Vite + Ant Design
   - 后端：FastAPI + SQLAlchemy
   - 为什么这么选

3. 功能展示（贴截图）
   - 链接管理
   - TIL 知识墙
   - Mock API + 动态路由（重点讲，这个最亮）
   - 开发者工具

4. 开发过程中的收获和坑
   - 前后端分离的项目结构
   - Ant Design 表单和表格的使用经验
   - FastAPI 动态路由的妙用

5. 开源和后续
   - 项目开源地址
   - Docker 一键部署
   - 下一步计划

6. 总结
   - 独立开发一个完整项目对技术成长的帮助
```

**发布平台（按优先级排序）：**

| 平台 | 适合内容 | 受众 | 预期曝光 |
|------|---------|:----:|:--------:|
| 掘金 | 技术教程类 | 前端/全栈开发者 | 高 |
| V2EX | 分享创造节点 | 技术人 | 高 |
| 知乎 | 项目经验分享 | 泛技术人群 | 中 |
| GitHub Trending | 开源项目 | 全球开发者 | 靠运气 |
| 小红书 | 简短展示 | 年轻开发者 | 中 |

### 5.2 上架售卖平台（0.5天）

**国内：**

| 平台 | 上架方式 | 定价建议 |
|------|---------|:--------:|
| 闲鱼 | 搜索「开发者工具源码」「内部工具台源码」 | ¥49-99 |
| 掘金商城 | 申请成为作者，上架源码 | ¥49-99 |
| 程序员客栈 | 作为作品展示 | 引流为主 |

**国外：**

| 平台 | 上架方式 | 定价建议 |
|------|---------|:--------:|
| Gumroad | 上传 ZIP + 描述，PayPal/信用卡收款 | $9-19 |
| CodeCanyon | 审核制，需要截图和演示 | $12-25 |

**Gumroad 商品描述模板：**

```
DevLinks - Developer Tool Platform

A lightweight internal developer portal for small teams.
Manage links, share knowledge, mock APIs, and use dev tools
in one place.

✅ Features:
- Link management with categories, tags, environments
- TIL knowledge wall with Markdown support
- Mock API factory with dynamic routes
- Postman Collection export
- Developer utilities (Base64, Timestamp, JSON)
- Docker one-click deployment

Tech Stack: React + Vite + Ant Design + FastAPI + SQLAlchemy
```

### 5.3 发布到 GitHub（0.5天）

```
步骤：
  1. 创建 GitHub 仓库（公开）
  2. 推送代码
  3. 设置仓库 Topics: react, fastapi, developer-tools, ant-design, mock-api
  4. 开启 Issues（可以接定制需求）
  5. 在 README 顶部加 GitHub Star 徽章
  6. 设置 GitHub Pages 或 Vercel 部署 Demo（可选）
```

---

## 六、可选增强（做了更好，不做也行）

以下功能不加也不影响项目完工，但加了会明显提升吸引力：

| 功能 | 工时 | 效果 |
|------|:----:|------|
| 浏览器书签导入（解析 Chrome 导出的 HTML） | 半天 | 用户一键把书签搬进来 |
| 暗黑模式 | 半天 | 截图更好看，开发者喜欢 |
| 增加 3-5 个工具（URL编解码/UUID生成/正则测试/颜色转换/JWT解码） | 半天 | 工具集看起来更丰满 |
| 响应式布局（手机能看到基础内容） | 半天 | 截图更专业 |
| favicon.ico 替换 | 10分钟 | 细节到位 |

---

## 七、时间线汇总

```
Day 1
  上午 → Mock Server 动态路由
  下午 → Postman 导出 + 补全缺失接口

Day 2
  上午 → 代码清理 + 校验
  下午 → 重写 README + 截图

Day 3
  上午 → Docker 验证 + 打包
  下午 → 写文章初稿

Day 4
  上午 → 文章发布 + 上架售卖平台
  下午 → GitHub 推送 + 收工
```

---

## 八、收工检查清单

**发布前必须确认的：**
- [ ] 项目能在新环境 docker compose up -d 一次启动成功
- [ ] 所有前端页面能正常打开
- [ ] Mock Server 动态路由正常工作
- [ ] README 完整包含：功能介绍、截图、技术栈、快速开始
- [ ] LICENSE 文件存在
- [ ] .gitignore 包含 node_modules, venv, __pycache__, dist, .env
- [ ] 敏感信息（密码、密钥）不在代码中硬编码

**发布后可以做的：**
- [ ] 观察 GitHub Star / 文章反馈
- [ ] 如果有人问定制需求，按需报价
- [ ] 如果 Star 多，考虑维护
- [ ] 如果无人问津，没关系——项目已完成使命

---

> 文档结束 | 最后更新：2026-05-03
