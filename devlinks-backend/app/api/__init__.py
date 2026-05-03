from fastapi import APIRouter
from app.api.v1 import links, til, mock, auth, categories

api_router = APIRouter()

api_router.include_router(links.router, prefix="/links", tags=["links"])
api_router.include_router(til.router, prefix="/til", tags=["til"])
api_router.include_router(mock.router, prefix="/mock", tags=["mock"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
