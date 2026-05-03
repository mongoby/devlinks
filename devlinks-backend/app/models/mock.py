from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class MockProject(Base):
    __tablename__ = "mock_project"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MockSchema(Base):
    __tablename__ = "mock_schema"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("mock_project.id"), nullable=True)
    path = Column(String(200), nullable=False)
    method = Column(String(10), nullable=False)
    json_schema = Column("schema", JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MockLog(Base):
    __tablename__ = "mock_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    schema_id = Column(Integer, ForeignKey("mock_schema.id"), nullable=True)
    request_method = Column(String(10), nullable=False)
    request_path = Column(String(500), nullable=False)
    request_headers = Column(JSON, nullable=True)
    request_body = Column(JSON, nullable=True)
    response_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
