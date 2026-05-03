from fastapi import APIRouter, Depends
from app.schemas.auth import LoginRequest, UserResponse
from app.services.auth_service import authenticate_user, create_user_token
from app.core.response import success, error
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/login")
def login(login_data: LoginRequest):
    user = authenticate_user(login_data.username, login_data.password)
    if not user:
        return error(code=401, message="用户名或密码错误")
    
    token = create_user_token(user)
    user_response = UserResponse(id=user["id"], username=user["username"], role=user["role"])
    
    return success(data={
        "access_token": token,
        "token_type": "bearer",
        "user": user_response.dict()
    })

@router.post("/logout")
def logout():
    return success(message="退出登录成功")

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return success(data=current_user)
