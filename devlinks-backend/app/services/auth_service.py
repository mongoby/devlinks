from typing import Optional, Dict, Any
from datetime import timedelta
from app.core.config import settings
from app.utils.security import create_access_token, get_password_hash, verify_password

MOCK_USERS = {
    "admin": {
        "id": 1,
        "username": "admin",
        "password_hash": get_password_hash("admin123"),
        "role": "admin"
    }
}

def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    user = MOCK_USERS.get(username)
    if user and verify_password(password, user["password_hash"]):
        return {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"]
        }
    return None

def create_user_token(user: Dict[str, Any]) -> str:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=access_token_expires
    )
    return access_token

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    for user in MOCK_USERS.values():
        if user["id"] == user_id:
            return {
                "id": user["id"],
                "username": user["username"],
                "role": user["role"]
            }
    return None
