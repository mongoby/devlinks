# DevLinks 后端 API 需求清单

> 📋 文档版本：v1.0 ｜ 日期：2026-04-22
>
> 💡 技术栈：Python 3.11 + FastAPI + SQLite + SQLAlchemy

---

## 一、通用规范

### 1.1 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码：200 成功，400 参数错误，401 未登录，403 无权限，500 服务器错误 |
| message | string | 提示信息 |
| data | any | 返回数据 |

### 1.2 分页格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

### 1.3 认证方式

- 请求头携带：`Authorization: Bearer <token>`
- 登录接口返回 token，前端存入 localStorage

---

## 二、数据库表设计

### 2.1 用户表（users）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto Increment | 用户 ID |
| username | String | Unique, Not Null | 用户名 |
| password_hash | String | Not Null | 密码哈希 |
| created_at | DateTime | Default now() | 创建时间 |
| updated_at | DateTime | Default now() | 更新时间 |

### 2.2 分类表（categories）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto Increment | 分类 ID |
| name | String | Not Null | 分类名称 |
| parent_id | Integer | FK -> categories.id, Null | 父分类 ID（支持多级） |
| sort | Integer | Default 0 | 排序权重 |
| created_at | DateTime | Default now() | 创建时间 |

### 2.3 链接表（links）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto Increment | 链接 ID |
| title | String | Not Null | 链接标题 |
| url | String | Not Null | 链接 URL |
| description | Text | Null | 链接描述 |
| category_id | Integer | FK -> categories.id, Null | 所属分类 |
| tags | JSON | Null | 标签数组，如 `["前端", "框架"]` |
| environment | String | Default "dev" | 环境标记：dev/test/pre/pro |
| status | String | Default "active" | 状态：active/inactive（失效） |
| favicon | String | Null | 网站图标 URL |
| preview_image | String | Null | 网站截图 URL |
| created_at | DateTime | Default now() | 创建时间 |
| updated_at | DateTime | Default now() | 更新时间 |

### 2.4 TIL 表（tils）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto Increment | TIL ID |
| title | String | Not Null | 标题 |
| content | Text | Not Null | Markdown 内容 |
| tags | JSON | Null | 标签数组 |
| project | String | Null | 所属项目（前端/后端/小程序/运维） |
| likes | Integer | Default 0 | 点赞数 |
| views | Integer | Default 0 | 浏览量 |
| created_at | DateTime | Default now() | 创建时间 |
| updated_at | DateTime | Default now() | 更新时间 |

### 2.5 Mock 项目表（mock_projects）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto Increment | 项目 ID |
| name | String | Not Null | 项目名称 |
| description | Text | Null | 项目描述 |
| created_at | DateTime | Default now() | 创建时间 |

### 2.6 Mock Schema 表（mock_schemas）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto Increment | Schema ID |
| project_id | Integer | FK -> mock_projects.id, Not Null | 所属项目 |
| path | String | Not Null | API 路径，如 `/api/users` |
| method | String | Not Null | 请求方法：GET/POST/PUT/DELETE |
| schema | JSON | Not Null | JSON Schema 定义 |
| created_at | DateTime | Default now() | 创建时间 |
| updated_at | DateTime | Default now() | 更新时间 |

### 2.7 Mock 请求日志表（mock_logs）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto Increment | 日志 ID |
| schema_id | Integer | FK -> mock_schemas.id | 关联 Schema |
| request_method | String | Not Null | 请求方法 |
| request_path | String | Not Null | 请求路径 |
| request_headers | JSON | Null | 请求头 |
| response_data | JSON | Null | 返回数据 |
| created_at | DateTime | Default now() | 请求时间 |

### 2.8 环境表（environments）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto Increment | 环境 ID |
| name | String | Not Null, Unique | 环境名称：dev/test/pre/pro |
| domain | String | Null | 域名/网关前缀 |
| remark | String | Null | 说明 |
| is_disabled | Boolean | Default False | 是否下线 |
| created_at | DateTime | Default now() | 创建时间 |

### 2.9 操作日志表（operation_logs）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto Increment | 日志 ID |
| operator | String | Null | 操作人 |
| module | String | Null | 模块：link/til/mock/env |
| content | Text | Null | 操作内容 |
| created_at | DateTime | Default now() | 操作时间 |

---

## 三、API 接口清单

### 3.1 认证模块（/api/auth）

| 接口 | 方法 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| `/auth/login` | POST | 用户登录 | `{ username, password }` | `{ token, user }` |
| `/auth/logout` | POST | 用户登出 | - | `{ message }` |
| `/auth/me` | GET | 获取当前用户信息 | - | `{ user }` |

### 3.2 分类模块（/api/categories）

| 接口 | 方法 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| `/categories` | GET | 获取分类列表 | - | `{ items: [Category] }` |
| `/categories` | POST | 创建分类 | `{ name, parent_id?, sort? }` | `{ category }` |
| `/categories/:id` | GET | 获取分类详情 | - | `{ category }` |
| `/categories/:id` | PUT | 更新分类 | `{ name?, parent_id?, sort? }` | `{ category }` |
| `/categories/:id` | DELETE | 删除分类 | - | `{ message }` |

### 3.3 链接模块（/api/links）

| 接口 | 方法 | 说明 | 请求体/参数 | 响应 |
|------|------|------|-------------|------|
| `/links` | GET | 获取链接列表（分页+筛选） | `?page=1&page_size=10&category_id=&search=&environment=` | `{ items: [Link], total }` |
| `/links` | POST | 创建链接 | `{ title, url, description?, category_id?, tags?, environment? }` | `{ link }` |
| `/links/:id` | GET | 获取链接详情 | - | `{ link }` |
| `/links/:id` | PUT | 更新链接 | `{ title?, url?, description?, category_id?, tags?, environment? }` | `{ link }` |
| `/links/:id` | DELETE | 删除链接 | - | `{ message }` |
| `/links/batch` | DELETE | 批量删除链接 | `{ ids: [1, 2, 3] }` | `{ message }` |
| `/links/check` | POST | 触发链接失效检测 | - | `{ message }` |

### 3.4 TIL 模块（/api/til）

| 接口 | 方法 | 说明 | 请求体/参数 | 响应 |
|------|------|------|-------------|------|
| `/til` | GET | 获取 TIL 列表（分页+筛选） | `?page=1&page_size=10&search=&tags=&project=&archive=week/month` | `{ items: [TIL], total }` |
| `/til` | POST | 创建 TIL | `{ title, content, tags?, project? }` | `{ til }` |
| `/til/:id` | GET | 获取 TIL 详情 | - | `{ til }` |
| `/til/:id` | PUT | 更新 TIL | `{ title?, content?, tags?, project? }` | `{ til }` |
| `/til/:id` | DELETE | 删除 TIL | - | `{ message }` |
| `/til/:id/like` | POST | 点赞 TIL | - | `{ likes }` |

### 3.5 Mock API 模块（/api/mock）

| 接口 | 方法 | 说明 | 请求体/参数 | 响应 |
|------|------|------|-------------|------|
| `/mock/projects` | GET | 获取 Mock 项目列表 | - | `{ items: [Project] }` |
| `/mock/projects` | POST | 创建 Mock 项目 | `{ name, description? }` | `{ project }` |
| `/mock/projects/:id` | PUT | 更新 Mock 项目 | `{ name?, description? }` | `{ project }` |
| `/mock/projects/:id` | DELETE | 删除 Mock 项目 | - | `{ message }` |
| `/mock/schemas` | GET | 获取 Schema 列表 | `?project_id=` | `{ items: [Schema] }` |
| `/mock/schemas` | POST | 创建 Schema | `{ project_id, path, method, schema }` | `{ schema }` |
| `/mock/schemas/:id` | PUT | 更新 Schema | `{ path?, method?, schema? }` | `{ schema }` |
| `/mock/schemas/:id` | DELETE | 删除 Schema | - | `{ message }` |
| `/mock/generate` | POST | 根据 Schema 生成 Mock 数据 | `{ schema }` | `{ data }` |
| `/mock/logs` | GET | 获取请求日志 | `?schema_id=&limit=50` | `{ items: [Log] }` |
| `/mock/export` | GET | 导出 Postman Collection | `?project_id=` | Postman JSON |

### 3.6 环境模块（/api/env）

| 接口 | 方法 | 说明 | 请求体/参数 | 响应 |
|------|------|------|-------------|------|
| `/env` | GET | 获取环境列表 | - | `{ items: [Environment] }` |
| `/env` | POST | 创建环境 | `{ name, domain?, remark? }` | `{ environment }` |
| `/env/:id` | PUT | 更新环境 | `{ domain?, remark?, is_disabled? }` | `{ environment }` |
| `/env/:id` | DELETE | 删除环境 | - | `{ message }` |
| `/env/current` | GET | 获取当前激活环境 | - | `{ environment }` |
| `/env/current` | PUT | 切换当前环境 | `{ env_id }` | `{ environment }` |

### 3.7 统计模块（/api/dashboard）

| 接口 | 方法 | 说明 | 请求体/参数 | 响应 |
|------|------|------|-------------|------|
| `/dashboard/summary` | GET | 获取统计概览 | - | `{ total_links, total_tils, total_mocks, today_active_mocks, today_new_tils }` |
| `/dashboard/trends` | GET | 获取趋势数据 | `?days=7` | `{ links: [{date, count}], tils: [{date, count}], mocks: [{date, count}] }` |

### 3.8 操作日志模块（/api/logs）

| 接口 | 方法 | 说明 | 请求体/参数 | 响应 |
|------|------|------|-------------|------|
| `/logs` | GET | 获取操作日志列表 | `?module=&operator=&page=1&page_size=20` | `{ items: [Log], total }` |

---

## 四、前端已实现的 Service 调用

以下是前端已经封装好的 Service 方法，后端接口需与之匹配：

### link.js
```javascript
getLinks: () => api.get('/links')
getLink: (id) => api.get(`/links/${id}`)
createLink: (data) => api.post('/links', data)
updateLink: (id, data) => api.put(`/links/${id}`, data)
deleteLink: (id) => api.delete(`/links/${id}`)
```

### category.js
```javascript
getCategories: () => api.get('/categories')
getCategory: (id) => api.get(`/categories/${id}`)
createCategory: (data) => api.post('/categories', data)
updateCategory: (id, data) => api.put(`/categories/${id}`, data)
deleteCategory: (id) => api.delete(`/categories/${id}`)
```

### til.js
```javascript
getTILs: () => api.get('/til')
getTIL: (id) => api.get(`/til/${id}`)
createTIL: (data) => api.post('/til', data)
updateTIL: (id, data) => api.put(`/til/${id}`, data)
deleteTIL: (id) => api.delete(`/til/${id}`)
likeTIL: (id) => api.post(`/til/${id}/like`)
```

### mock.js
```javascript
getProjects: () => api.get('/mock/projects')
createProject: (data) => api.post('/mock/projects', data)
updateProject: (id, data) => api.put(`/mock/projects/${id}`, data)
deleteProject: (id) => api.delete(`/mock/projects/${id}`)

getSchemas: () => api.get('/mock/schemas')
getSchema: (id) => api.get(`/mock/schemas/${id}`)
createSchema: (data) => api.post('/mock/schemas', data)
updateSchema: (id, data) => api.put(`/mock/schemas/${id}`, data)
deleteSchema: (id) => api.delete(`/mock/schemas/${id}`)

generateMockData: (schema) => api.post('/mock/generate', schema)
```

---

## 五、优先级建议

| 优先级 | 模块 | 说明 |
|--------|------|------|
| 🔴 P0 | 认证 + 分类 + 链接 | 基础功能，前端已就绪，可立即联调 |
| 🟡 P1 | TIL + Mock | 核心功能，前端基本就绪 |
| 🟢 P2 | 环境 + 统计 + 日志 | 增值功能，可后续开发 |

---

## 六、注意事项

1. **CORS 配置**：需允许前端开发服务器（`http://localhost:5173`）跨域访问
2. **数据库迁移**：建议使用 Alembic 管理数据库版本
3. **索引优化**：链接表的 `title`、`url`、`category_id` 建议加索引
4. **JSON 字段**：SQLite 3.38+ 支持 JSON 函数，`tags` 和 `schema` 字段建议使用 JSON 类型
5. **错误码统一**：业务错误请使用 `{ code: 400, message: "具体错误信息" }` 格式

---

*文档结束*
