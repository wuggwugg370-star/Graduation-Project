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

def detailed_db_check():
    print("正在进行详细的数据库检查...\n")
    try:
        # 尝试连接数据库
        connection = mysql.connector.connect(**DB_CONFIG)
        
        if connection.is_connected():
            print("✅ 数据库连接成功!")
            print(f"服务器版本: {connection.server_info}")
            print(f"当前数据库: {connection.database}\n")
            
            cursor = connection.cursor()
            
            # 1. 检查数据库表结构
            print("1. 检查数据库表结构:")
            tables = ['menu_items', 'orders', 'operation_logs']
            for table in tables:
                print(f"\n   表: {table}")
                cursor.execute(f"DESCRIBE {table}")
                columns = cursor.fetchall()
                print("   字段结构:")
                for column in columns:
                    print(f"     {column[0]}: {column[1]}")
            
            # 2. 检查数据量
            print("\n2. 检查表数据量:")
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"   {table}: {count} 条记录")
            
            # 3. 检查管理员用户表（如果存在）
            print("\n3. 检查管理员用户表:")
            try:
                cursor.execute("SELECT * FROM admin_users")
                admin_users = cursor.fetchall()
                print(f"   admin_users 表存在，有 {len(admin_users)} 条记录")
                if admin_users:
                    print("   管理员用户名:", [user[1] for user in admin_users])
            except Error as e:
                print(f"   admin_users 表不存在或无法访问: {e}")
            
            # 4. 检查订单表的最新数据
            print("\n4. 检查订单表最新数据:")
            cursor.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 3")
            orders = cursor.fetchall()
            for order in orders:
                print(f"   订单ID: {order[0]}, 状态: {order[1]}, 总金额: {order[2]}")
            
            # 5. 检查菜单表的最新数据
            print("\n5. 检查菜单表最新数据:")
            cursor.execute("SELECT * FROM menu_items ORDER BY id DESC LIMIT 3")
            menu_items = cursor.fetchall()
            for item in menu_items:
                print(f"   菜单项ID: {item[0]}, 名称: {item[1]}, 价格: {item[3]}")
            
            return True
    
    except Error as e:
        print(f"❌ 数据库操作失败: {e}")
        return False
    
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("\n数据库连接已关闭")

if __name__ == "__main__":
    detailed_db_check()
