# 测试数据库连接功能

import sys
import os

# 添加项目根目录到路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from backend.db import create_db_connection

def test_db_connection():
    """测试数据库连接是否正常"""
    print("测试数据库连接...")
    try:
        conn = create_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        assert result[0] == 1, "数据库连接失败"
        conn.close()
        print("✓ 数据库连接测试通过")
        return True
    except Exception as e:
        print(f"✗ 数据库连接测试失败: {str(e)}")
        return False

if __name__ == "__main__":
    test_db_connection()
