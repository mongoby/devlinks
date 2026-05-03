from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db

# OAuth2密码Bearer模式
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# 获取当前用户（模拟实现）
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # 这里应该验证token并返回用户信息
    # 暂时返回模拟用户
    user = {
        "id": 1,
        "username": "admin",
        "role": "admin"
    }
    return user

# 验证管理员权限
def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
