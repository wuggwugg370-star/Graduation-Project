import mysql.connector
from mysql.connector import Error

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'database': 'neodining',
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci'
}

def test_db_connection():
    print("正在测试数据库连接...")
    try:
        # 尝试连接数据库
        connection = mysql.connector.connect(**DB_CONFIG)
        
        if connection.is_connected():
            print("✅ 数据库连接成功!")
            db_info = connection.get_server_info()
            print(f"MySQL 服务器版本: {db_info}")
            
            # 尝试执行简单查询
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE()")
            record = cursor.fetchone()
            print(f"当前数据库: {record[0]}")
            
            # 检查数据库表是否存在
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"数据库中的表: {[table[0] for table in tables]}")
            
            return True
    
    except Error as e:
        print(f"❌ 数据库连接失败: {e}")
        return False
    
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("数据库连接已关闭")

if __name__ == "__main__":
    test_db_connection()
