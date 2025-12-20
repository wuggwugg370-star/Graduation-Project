import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    # 数据库配置
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'neo_dining')
    
    # 应用配置
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
    DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    
    # API配置
    API_VERSION = 'v1'
