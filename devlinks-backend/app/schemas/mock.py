from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class MockProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class MockProjectCreate(MockProjectBase):
    pass

class MockProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class MockProjectResponse(MockProjectBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class MockSchemaBase(BaseModel):
    project_id: Optional[int] = None
    path: str
    method: str
    json_schema: Dict[str, Any]

    class Config:
        from_attributes = True
        populate_by_name = True

class MockSchemaCreate(MockSchemaBase):
    pass

class MockSchemaUpdate(BaseModel):
    project_id: Optional[int] = None
    path: Optional[str] = None
    method: Optional[str] = None
    json_schema: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class MockSchemaResponse(MockSchemaBase):
    id: int
    created_at: datetime
