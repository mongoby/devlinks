"""Add clean test data for the Mock API feature."""
import sqlite3
import json
from datetime import datetime

DB_PATH = "data/devlinks.db"

def add_test_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if our test project already exists
    cursor.execute("SELECT id FROM mock_project WHERE name = ?", ("test-api",))
    if cursor.fetchone():
        print("Test data already exists, skipping.")
        conn.close()
        return

    # Create test project
    cursor.execute(
        "INSERT INTO mock_project (name, description, created_at) VALUES (?, ?, ?)",
        ("test-api", "测试项目 - 包含用户、文章、订单接口", datetime.utcnow().isoformat())
    )
    project_id = cursor.lastrowid
    print(f"Created project 'test-api' (id={project_id})")

    # Create test schemas
    test_schemas = [
        ("GET", "/api/users", {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "email": {"type": "string", "format": "email"},
                    "role": {"type": "string"}
                }
            },
            "maxItems": 5
        }),
        ("GET", "/api/users/{id}", {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "email": {"type": "string", "format": "email"},
                "role": {"type": "string"},
                "bio": {"type": "string"}
            }
        }),
        ("POST", "/api/users", {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "email": {"type": "string", "format": "email"},
                "role": {"type": "string"},
                "created_at": {"type": "string", "format": "date-time"}
            }
        }),
        ("GET", "/api/articles", {
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
                            "author": {"type": "string"},
                            "likes": {"type": "integer"},
                            "created_at": {"type": "string", "format": "date-time"}
                        }
                    },
                    "maxItems": 10
                }
            }
        }),
        ("GET", "/api/articles/{id}", {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "title": {"type": "string"},
                "content": {"type": "string"},
                "author": {"type": "string"},
                "tags": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "likes": {"type": "integer"},
                "created_at": {"type": "string", "format": "date-time"}
            }
        }),
        ("POST", "/api/orders", {
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
                }
            }
        }),
        ("DELETE", "/api/orders/{order_id}", {
            "type": "object",
            "properties": {
                "success": {"type": "boolean"},
                "message": {"type": "string"}
            }
        }),
    ]

    for method, path, schema in test_schemas:
        cursor.execute(
            "INSERT INTO mock_schema (project_id, path, method, schema, created_at) VALUES (?, ?, ?, ?, ?)",
            (project_id, path, method, json.dumps(schema), datetime.utcnow().isoformat())
        )
        print(f"  Schema: {method:7s} {path}")

    conn.commit()

    # Verify by querying
    cursor.execute("SELECT COUNT(*) FROM mock_schema WHERE project_id = ?", (project_id,))
    count = cursor.fetchone()[0]
    print(f"\n✅ Created {count} schemas for project 'test-api'")

    # Also test the dynamic route
    conn.close()

if __name__ == "__main__":
    add_test_data()
