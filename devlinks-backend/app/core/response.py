from typing import Any, Optional
from pydantic import BaseModel

class Response(BaseModel):
    code: int = 200
    message: str = "success"
    data: Optional[Any] = None

class PageResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int

def success(data: Any = None, message: str = "success") -> dict:
    return {"code": 200, "message": message, "data": data}

def error(code: int = 400, message: str = "error", data: Any = None) -> dict:
    return {"code": code, "message": message, "data": data}

def page(items: list, total: int, page: int, page_size: int) -> dict:
    return {"items": items, "total": total, "page": page, "page_size": page_size}
