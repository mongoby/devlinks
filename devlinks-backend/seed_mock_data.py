from faker import Faker
from app.core.database import SessionLocal, Base, engine
from app.models.category import Category
from app.models.link import Link
from app.models.til import TIL
from app.models.mock import MockProject, MockSchema
import random

fake = Faker('zh_CN')

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    print("Clearing existing data...")
    db.query(Link).delete()
    db.query(TIL).delete()
    db.query(MockSchema).delete()
    db.query(MockProject).delete()
    db.query(Category).delete()
    db.commit()

    print("Generating 50 categories...")
    category_names = [
        "前端工具", "后端服务", "数据库", "DevOps", "监控告警",
        "API文档", "设计资源", "测试工具", "CI/CD", "代码仓库",
        "项目管理", "知识库", "内部系统", "第三方服务", "部署平台",
        "日志系统", "配置中心", "消息队列", "缓存服务", "认证服务"
    ]
    categories = []
    for i in range(50):
        cat = Category(
            name=category_names[i % len(category_names)] + f" {i+1}",
            parent_id=random.choice([None, None, None, random.randint(1, 5)]) if i >= 5 else None,
            sort=i
        )
        categories.append(cat)
        db.add(cat)
    db.commit()
    category_ids = [c.id for c in categories]
    print(f"Created {len(categories)} categories")

    print("Generating 50 links...")
    link_data = [
        ("React 官方文档", "https://react.dev", "React 官方文档，包含 Hooks、组件等"),
        ("Vue 官方文档", "https://vuejs.org", "Vue.js 3.x 官方文档"),
        ("TypeScript 手册", "https://www.typescriptlang.org", "TypeScript 官方手册"),
        ("Node.js 文档", "https://nodejs.org", "Node.js 官方 API 文档"),
        ("Python 文档", "https://docs.python.org", "Python 官方文档"),
        ("Docker 文档", "https://docs.docker.com", "Docker 官方文档和教程"),
        ("Kubernetes 文档", "https://kubernetes.io", "K8s 官方文档"),
        ("GitHub", "https://github.com", "代码托管平台"),
        ("GitLab", "https://gitlab.com", "代码托管和 CI/CD 平台"),
        ("Jenkins", "https://www.jenkins.io", "持续集成工具"),
        ("Grafana", "https://grafana.com", "监控可视化平台"),
        ("Prometheus", "https://prometheus.io", "监控系统"),
        ("Elasticsearch", "https://www.elastic.co", "搜索引擎"),
        ("Redis 文档", "https://redis.io", "Redis 官方文档"),
        ("MySQL 文档", "https://dev.mysql.com", "MySQL 官方文档"),
        ("PostgreSQL 文档", "https://www.postgresql.org", "PostgreSQL 官方文档"),
        ("Nginx 文档", "https://nginx.org", "Nginx 官方文档"),
        ("Webpack 文档", "https://webpack.js.org", "Webpack 打包工具文档"),
        ("Vite 文档", "https://vitejs.dev", "Vite 构建工具文档"),
        ("Tailwind CSS", "https://tailwindcss.com", "原子化 CSS 框架"),
        ("Ant Design", "https://ant.design", "企业级 UI 组件库"),
        ("Element Plus", "https://element-plus.org", "Vue 3 组件库"),
        ("Figma", "https://www.figma.com", "在线设计工具"),
        ("Postman", "https://www.postman.com", "API 测试工具"),
        ("Swagger", "https://swagger.io", "API 文档生成工具"),
        ("Jira", "https://www.atlassian.com/software/jira", "项目管理工具"),
        ("Confluence", "https://www.atlassian.com/software/confluence", "知识库工具"),
        ("Slack", "https://slack.com", "团队沟通工具"),
        ("Notion", "https://www.notion.so", "笔记和协作工具"),
        ("Vercel", "https://vercel.com", "前端部署平台"),
        ("Netlify", "https://www.netlify.com", "静态站点托管"),
        ("AWS 控制台", "https://aws.amazon.com", "亚马逊云服务"),
        ("阿里云控制台", "https://www.aliyun.com", "阿里云服务"),
        ("腾讯云控制台", "https://cloud.tencent.com", "腾讯云服务"),
        ("Sentry", "https://sentry.io", "错误监控平台"),
        ("Datadog", "https://www.datadoghq.com", "云监控平台"),
        ("Kibana", "https://www.elastic.co/kibana", "日志分析工具"),
        ("RabbitMQ", "https://www.rabbitmq.com", "消息队列"),
        ("Kafka", "https://kafka.apache.org", "分布式流平台"),
        ("Nacos", "https://nacos.io", "配置中心和服务发现"),
        ("Consul", "https://www.consul.io", "服务网格工具"),
        ("Terraform", "https://www.terraform.io", "基础设施即代码"),
        ("Ansible", "https://www.ansible.com", "自动化运维工具"),
        ("SonarQube", "https://www.sonarqube.org", "代码质量检查"),
        ("Jest", "https://jestjs.io", "JavaScript 测试框架"),
        ("Pytest", "https://docs.pytest.org", "Python 测试框架"),
        ("Cypress", "https://www.cypress.io", "E2E 测试工具"),
        ("Storybook", "https://storybook.js.org", "组件开发环境"),
        ("npm", "https://www.npmjs.com", "Node.js 包管理器"),
        ("PyPI", "https://pypi.org", "Python 包索引")
    ]
    environments = ["dev", "test", "pre", "pro"]
    statuses = ["active", "inactive", "archived"]

    for i, data in enumerate(link_data):
        if len(data) == 3:
            title, url, desc = data
        else:
            title, url = data
            desc = fake.sentence()
        link = Link(
            title=title,
            url=url,
            description=desc,
            category_id=random.choice(category_ids),
            tags=random.sample(["前端", "后端", "数据库", "运维", "工具", "文档", "监控", "测试"], k=random.randint(1, 3)),
            environment=random.choice(environments),
            status=random.choice(statuses),
            favicon=f"https://www.google.com/s2/favicons?domain={url}",
            preview_image=None
        )
        db.add(link)
    db.commit()
    print(f"Created {len(link_data)} links")

    print("Generating 50 TILs...")
    til_titles = [
        "React useEffect 清理函数的使用",
        "Vue 3 Composition API 最佳实践",
        "TypeScript 泛型约束技巧",
        "Python 装饰器的高级用法",
        "Docker 多阶段构建优化镜像大小",
        "Kubernetes Pod 健康检查配置",
        "Git rebase 与 merge 的区别",
        "SQL 窗口函数使用指南",
        "Redis 缓存穿透解决方案",
        "Nginx 反向代理配置",
        "Webpack Tree Shaking 原理",
        "CSS Grid 布局实战",
        "Node.js 事件循环机制",
        "Python 异步编程 asyncio",
        "MySQL 索引优化策略",
        "JWT Token 刷新机制",
        "OAuth 2.0 授权流程",
        "微服务架构设计模式",
        "CI/CD 流水线最佳实践",
        "前端性能优化技巧",
        "React Server Components 介绍",
        "Vue 3 响应式原理",
        "TypeScript 类型守卫",
        "Python 生成器与迭代器",
        "Docker Compose 多容器编排",
        "Kubernetes Service 类型对比",
        "Git 子模块使用指南",
        "PostgreSQL JSONB 查询",
        "Redis 分布式锁实现",
        "Nginx 负载均衡配置",
        "Vite 插件开发入门",
        "CSS 动画性能优化",
        "Node.js Stream 数据处理",
        "Python 上下文管理器",
        "MySQL 事务隔离级别",
        "GraphQL vs REST API",
        "WebSocket 实时通信",
        "gRPC 服务定义与实现",
        "前端错误监控方案",
        "日志收集与分析",
        "Prometheus 告警规则",
        "Elasticsearch 全文搜索",
        "RabbitMQ 消息确认机制",
        "Kafka 消费者组",
        "Terraform 状态管理",
        "Ansible Playbook 编写",
        "SonarQube 代码扫描",
        "Jest 单元测试技巧",
        "Cypress E2E 测试",
        "Storybook 组件文档"
    ]
    projects = ["前端项目", "后端服务", "基础设施", "数据平台", "监控系统"]

    for i, title in enumerate(til_titles):
        til = TIL(
            title=title,
            content="\n\n".join(fake.paragraphs(nb=random.randint(2, 5))),
            tags=random.sample(["React", "Vue", "Python", "Docker", "K8s", "Redis", "MySQL", "前端", "后端"], k=random.randint(1, 3)),
            project=random.choice(projects),
            likes=random.randint(0, 100),
            views=random.randint(10, 1000)
        )
        db.add(til)
    db.commit()
    print(f"Created {len(til_titles)} TILs")

    print("Generating 50 Mock Projects...")
    project_names = [
        "用户服务", "订单服务", "支付服务", "商品服务", "消息服务",
        "认证服务", "网关服务", "通知服务", "搜索服务", "推荐服务",
        "数据分析", "报表系统", "权限管理", "日志服务", "配置中心",
        "任务调度", "文件服务", "邮件服务", "短信服务", "审核服务"
    ]
    mock_projects = []
    for i in range(50):
        project = MockProject(
            name=project_names[i % len(project_names)] + f" V{i//20+1}",
            description=fake.sentence()
        )
        mock_projects.append(project)
        db.add(project)
    db.commit()
    project_ids = [p.id for p in mock_projects]
    print(f"Created {len(mock_projects)} mock projects")

    print("Generating 50 Mock Schemas...")
    methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    paths = [
        "/api/users", "/api/users/{id}", "/api/orders", "/api/orders/{id}",
        "/api/payments", "/api/payments/{id}", "/api/products", "/api/products/{id}",
        "/api/messages", "/api/auth/login", "/api/auth/register", "/api/gateway/health",
        "/api/notifications", "/api/search", "/api/recommendations", "/api/analytics",
        "/api/reports", "/api/permissions", "/api/logs", "/api/config",
        "/api/tasks", "/api/files", "/api/emails", "/api/sms", "/api/audit"
    ]
    for i in range(50):
        schema = MockSchema(
            project_id=random.choice(project_ids),
            path=random.choice(paths) + (f"/{i}" if i > 25 else ""),
            method=random.choice(methods),
            json_schema={
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "status": {"type": "string"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            }
        )
        db.add(schema)
    db.commit()
    print(f"Created 50 mock schemas")

    print("\nAll mock data generated successfully!")
    print(f"Categories: {db.query(Category).count()}")
    print(f"Links: {db.query(Link).count()}")
    print(f"TILs: {db.query(TIL).count()}")
    print(f"Mock Projects: {db.query(MockProject).count()}")
    print(f"Mock Schemas: {db.query(MockSchema).count()}")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
