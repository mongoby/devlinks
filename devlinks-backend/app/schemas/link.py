from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class LinkBase(BaseModel):
    title: str
    url: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None
    environment: str = "dev"
    status: str = "active"
    favicon: Optional[str] = None
    preview_image: Optional[str] = None

class LinkCreate(LinkBase):
    pass

class LinkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None
    environment: Optional[str] = None
    status: Optional[str] = None
    favicon: Optional[str] = None
    preview_image: Optional[str] = None

class LinkResponse(LinkBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
