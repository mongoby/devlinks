"""Seed mock data into DevLinks database for testing."""
import sqlite3
import json
from datetime import datetime

DB_PATH = "data/devlinks.db"

def seed():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # List tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [t[0] for t in cursor.fetchall()]
    print("Tables:", tables)

    # Check if mock tables exist
    if "mock_project" not in tables:
        print("ERROR: mock_project table not found!")
        conn.close()
        return

    # Check existing data
    cursor.execute("SELECT COUNT(*) FROM mock_project")
    existing = cursor.fetchone()[0]
    print(f"Existing mock projects: {existing}")

    if existing > 0:
        print("Mock data already exists, skipping seed.")
        conn.close()
        return

    # Create mock projects
    projects = [
        ("user-service", "用户服务 - 用户注册、登录、信息管理"),
        ("blog-api", "博客 API - 文章、评论、分类接口"),
        ("payment", "支付网关 - 订单、支付、退款接口"),
    ]

    project_ids = {}
    for name, desc in projects:
        cursor.execute(
            "INSERT INTO mock_project (name, description, created_at) VALUES (?, ?, ?)",
            (name, desc, datetime.utcnow().isoformat())
        )
        project_ids[name] = cursor.lastrowid
        print(f"  Created project: {name} (id={project_ids[name]})")

    # Create mock schemas
    schemas = [
        # user-service schemas
        ("user-service", "GET", "/api/users", {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "email": {"type": "string", "format": "email"},
                    "role": {"type": "string"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            },
            "maxItems": 5
        }),
        ("user-service", "POST", "/api/users", {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "email": {"type": "string", "format": "email"},
                "role": {"type": "string"},
                "created_at": {"type": "string", "format": "date-time"}
            }
        }),
        ("user-service", "GET", "/api/users/{id}", {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "email": {"type": "string", "format": "email"},
                "role": {"type": "string"},
                "avatar": {"type": "string", "format": "url"},
                "created_at": {"type": "string", "format": "date-time"}
            }
        }),
        # blog-api schemas
        ("blog-api", "GET", "/api/posts", {
            "type": "object",
            "properties": {
                "total": {"type": "integer"},
                "page": {"type": "integer"},
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "integer"},
                            "title": {"type": "string"},
                            "summary": {"type": "string"},
                            "author": {"type": "string"},
                            "tags": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "likes": {"type": "integer"},
                            "created_at": {"type": "string", "format": "date-time"}
                        }
                    },
                    "maxItems": 8
                }
            }
        }),
        ("blog-api", "POST", "/api/posts", {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "title": {"type": "string"},
                "content": {"type": "string"},
                "author": {"type": "string"},
                "status": {"type": "string"},
                "created_at": {"type": "string", "format": "date-time"}
            }
        }),
        ("blog-api", "GET", "/api/posts/{id}/comments", {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "post_id": {"type": "integer"},
                    "author": {"type": "string"},
                    "content": {"type": "string"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            },
            "maxItems": 3
        }),
        # payment schemas
        ("payment", "POST", "/api/orders", {
            "type": "object",
            "properties": {
                "order_id": {"type": "string"},
                "amount": {"type": "number"},
                "currency": {"type": "string"},
                "status": {"type": "string"},
                "created_at": {"type": "string", "format": "date-time"}
            }
        }),
        ("payment", "GET", "/api/orders/{order_id}", {
            "type": "object",
            "properties": {
                "order_id": {"type": "string"},
                "user_id": {"type": "integer"},
                "amount": {"type": "number"},
                "currency": {"type": "string"},
                "status": {"type": "string"},
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "product": {"type": "string"},
                            "price": {"type": "number"},
                            "quantity": {"type": "integer"}
                        }
                    },
                    "maxItems": 3
                },
                "created_at": {"type": "string", "format": "date-time"}
            }
        }),
        ("payment", "POST", "/api/payments/refund", {
            "type": "object",
            "properties": {
                "refund_id": {"type": "string"},
                "order_id": {"type": "string"},
                "amount": {"type": "number"},
                "status": {"type": "string"},
                "reason": {"type": "string"},
                "processed_at": {"type": "string", "format": "date-time"}
            }
        }),
    ]

    for project_name, method, path, schema in schemas:
        project_id = project_ids[project_name]
        cursor.execute(
            "INSERT INTO mock_schema (project_id, path, method, schema, created_at) VALUES (?, ?, ?, ?, ?)",
            (project_id, path, method, json.dumps(schema), datetime.utcnow().isoformat())
        )
        print(f"  Created schema: {method} {path} (project={project_name})")

    conn.commit()
    conn.close()
    print(f"\n✅ Total: {len(projects)} projects, {len(schemas)} schemas created")

if __name__ == "__main__":
    seed()
