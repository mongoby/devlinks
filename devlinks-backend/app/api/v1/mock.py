from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.mock import MockProject, MockSchema, MockLog
from app.schemas.mock import (
    MockProjectCreate, MockProjectUpdate,
    MockSchemaCreate, MockSchemaUpdate
)
from app.services.mock_service import generate_mock_data
from app.core.response import success, error, page as page_response

router = APIRouter()

@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(MockProject).all()
    return success(data=projects)

@router.get("/projects/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(MockProject).filter(MockProject.id == project_id).first()
    if not project:
        return error(code=404, message="项目不存在")
    return success(data=project)

@router.post("/projects")
def create_project(project: MockProjectCreate, db: Session = Depends(get_db)):
    db_project = MockProject(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return success(data=db_project)

@router.put("/projects/{project_id}")
def update_project(project_id: int, project: MockProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(MockProject).filter(MockProject.id == project_id).first()
    if not db_project:
        return error(code=404, message="项目不存在")
    for key, value in project.model_dump(exclude_unset=True).items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return success(data=db_project)

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(MockProject).filter(MockProject.id == project_id).first()
    if not db_project:
        return error(code=404, message="项目不存在")
    db.delete(db_project)
    db.commit()
    return success(message="项目删除成功")

@router.get("/schemas")
def get_schemas(db: Session = Depends(get_db)):
    schemas = db.query(MockSchema).all()
    return success(data=schemas)

@router.get("/schemas/{schema_id}")
def get_schema(schema_id: int, db: Session = Depends(get_db)):
    schema = db.query(MockSchema).filter(MockSchema.id == schema_id).first()
    if not schema:
        return error(code=404, message="Schema 不存在")
    return success(data=schema)

@router.post("/schemas")
def create_schema(schema: MockSchemaCreate, db: Session = Depends(get_db)):
    db_schema = MockSchema(**schema.model_dump())
    db.add(db_schema)
    db.commit()
    db.refresh(db_schema)
    return success(data=db_schema)

@router.put("/schemas/{schema_id}")
def update_schema(schema_id: int, schema: MockSchemaUpdate, db: Session = Depends(get_db)):
    db_schema = db.query(MockSchema).filter(MockSchema.id == schema_id).first()
    if not db_schema:
        return error(code=404, message="Schema 不存在")
    for key, value in schema.model_dump(exclude_unset=True).items():
        setattr(db_schema, key, value)
    db.commit()
    db.refresh(db_schema)
    return success(data=db_schema)

@router.delete("/schemas/{schema_id}")
def delete_schema(schema_id: int, db: Session = Depends(get_db)):
    db_schema = db.query(MockSchema).filter(MockSchema.id == schema_id).first()
    if not db_schema:
        return error(code=404, message="Schema 不存在")
    db.delete(db_schema)
    db.commit()
    return success(message="Schema 删除成功")

@router.post("/generate")
def generate_mock(schema: dict):
    mock_data = generate_mock_data(schema)
    return success(data=mock_data)

@router.get("/logs")
def get_mock_logs(
    db: Session = Depends(get_db),
    schema_id: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200)
):
    query = db.query(MockLog)
    if schema_id and schema_id.strip():
        query = query.filter(MockLog.schema_id == int(schema_id))
    total = query.count()
    items = query.order_by(MockLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return success(data=page_response(items, total, page, page_size))

@router.delete("/logs")
def clear_mock_logs(db: Session = Depends(get_db)):
    deleted = db.query(MockLog).delete(synchronize_session=False)
    db.commit()
    return success(message=f"成功清空 {deleted} 条日志")


@router.api_route("/run/{project_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def mock_dynamic_endpoint(project_name: str, path: str, request: Request, db: Session = Depends(get_db)):
    project = db.query(MockProject).filter(MockProject.name == project_name).first()
    if not project:
        return JSONResponse(status_code=404, content=error(code=404, message="项目不存在"))

    method = request.method.upper()

    # Normalize path for matching: strip leading/trailing slashes for comparison
    normalized_path = path.strip("/")
    schemas = db.query(MockSchema).filter(
        MockSchema.project_id == project.id,
        MockSchema.method == method
    ).all()

    matched_schema = None
    # Support path parameter matching (e.g., /api/users/{id} matches /api/users/123)
    for schema in schemas:
        schema_path = schema.path.strip("/")
        schema_parts = schema_path.split("/")
        actual_parts = normalized_path.split("/")
        if len(schema_parts) != len(actual_parts):
            continue
        match = True
        for sp, ap in zip(schema_parts, actual_parts):
            if sp.startswith("{") and sp.endswith("}"):
                continue  # path parameter matches anything
            if sp != ap:
                match = False
                break
        if match:
            matched_schema = schema
            break

    if not matched_schema:
        return JSONResponse(
            status_code=404,
            content=error(code=404, message=f"未匹配到 {method} {path} 对应的 Schema")
        )

    # Generate mock data
    mock_data = generate_mock_data(matched_schema.json_schema)

    # Capture request details
    try:
        body = await request.json()
    except Exception:
        body = {}

    headers = dict(request.headers)

    # Record log
    log_entry = MockLog(
        schema_id=matched_schema.id,
        request_method=method,
        request_path=f"/{path}",
        request_headers=headers,
        request_body=body,
        response_data=mock_data,
    )
    db.add(log_entry)
    db.commit()

    return success(data=mock_data)


@router.get("/export/{project_id}")
def export_postman_collection(project_id: int, db: Session = Depends(get_db)):
    project = db.query(MockProject).filter(MockProject.id == project_id).first()
    if not project:
        return error(code=404, message="项目不存在")

    schemas = db.query(MockSchema).filter(MockSchema.project_id == project_id).all()

    items = []
    for schema in schemas:
        path_parts = [p for p in schema.path.strip("/").split("/") if p]
        item = {
            "name": f"{schema.method} {schema.path}",
            "request": {
                "method": schema.method,
                "header": [],
                "url": {
                    "raw": f"{{{{base_url}}}}{schema.path}",
                    "host": ["{{base_url}}"],
                    "path": path_parts,
                },
            },
        }
        items.append(item)

    collection = {
        "info": {
            "name": project.name,
            "description": project.description or "",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "item": items,
    }

    return success(data=collection)
