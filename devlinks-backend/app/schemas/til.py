from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class TILBase(BaseModel):
    title: str
    content: str
    tags: Optional[List[str]] = None
    project: Optional[str] = None

class TILCreate(TILBase):
    pass

class TILUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    project: Optional[str] = None

class TILResponse(TILBase):
    id: int
    likes: int
    views: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TILLikeResponse(BaseModel):
    id: int
    likes: int
    
    class Config:
        from_attributes = True
