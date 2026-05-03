import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import init_db

if __name__ == "__main__":
    print("正在初始化数据库...")
    init_db()
    print("数据库初始化成功!")
