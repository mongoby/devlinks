from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

class CustomException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

# 全局异常处理
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# 添加异常处理器到FastAPI应用
def add_exception_handlers(app: FastAPI):
    app.add_exception_handler(CustomException, custom_exception_handler)
