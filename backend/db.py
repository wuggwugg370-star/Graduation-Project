import mysql.connector
import sys
import os
from mysql.connector import Error
from config import Config

# 添加当前目录到模块搜索路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_db_connection():
    """创建数据库连接，如果数据库不存在则创建"""
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.DB_NAME}")
        cursor.execute(f"USE {Config.DB_NAME}")
        cursor.close()
        
        return connection
    except Error as e:
        print(f"创建数据库连接失败: {e}")
        return None


def init_database():
    """初始化数据库表"""
    connection = create_db_connection()
    if not connection:
        print("数据库连接失败，无法初始化数据库")
        return False

    cursor = connection.cursor()
    try:
        # 创建菜品类目表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                category_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 创建菜品表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS menu_items (
                item_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                image VARCHAR(255),
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)

        # 创建管理员表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_users (
                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 创建用户表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 创建订单表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                order_id VARCHAR(20) PRIMARY KEY,
                items TEXT,
                total_price DECIMAL(10, 2),
                user_id INT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # 创建操作日志表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS operation_logs (
                log_id INT AUTO_INCREMENT PRIMARY KEY,
                operation VARCHAR(50) NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 插入默认菜品类目
        categories = ['recommend', 'hot', 'breakfast', 'lunch', 'dinner', 'dessert', 'drink']
        for category in categories:
            cursor.execute("INSERT IGNORE INTO categories (name) VALUES (%s)", (category,))

        # 插入默认菜品数据
        cursor.execute("SELECT COUNT(*) FROM menu_items")
        if cursor.fetchone()[0] == 0:
            menu_data = {
                'recommend': [
                    {'name': '红烧肉', 'price': 38.00, 'image': 'https://picsum.photos/id/100/300/200'},
                    {'name': '宫保鸡丁', 'price': 28.00, 'image': 'https://picsum.photos/id/101/300/200'},
                    {'name': '糖醋排骨', 'price': 35.00, 'image': 'https://picsum.photos/id/102/300/200'}
                ],
                'hot': [
                    {'name': '麻辣香锅', 'price': 42.00, 'image': 'https://picsum.photos/id/103/300/200'},
                    {'name': '水煮鱼', 'price': 48.00, 'image': 'https://picsum.photos/id/104/300/200'},
                    {'name': '毛血旺', 'price': 45.00, 'image': 'https://picsum.photos/id/105/300/200'}
                ],
                'breakfast': [
                    {'name': '豆浆油条', 'price': 8.00, 'image': 'https://picsum.photos/id/106/300/200'},
                    {'name': '小笼包', 'price': 12.00, 'image': 'https://picsum.photos/id/107/300/200'},
                    {'name': '鸡蛋灌饼', 'price': 10.00, 'image': 'https://picsum.photos/id/108/300/200'}
                ],
                'lunch': [
                    {'name': '鱼香肉丝盖饭', 'price': 18.00, 'image': 'https://picsum.photos/id/109/300/200'},
                    {'name': '回锅肉盖饭', 'price': 20.00, 'image': 'https://picsum.photos/id/110/300/200'},
                    {'name': '青椒肉丝盖饭', 'price': 16.00, 'image': 'https://picsum.photos/id/111/300/200'}
                ],
                'dinner': [
                    {'name': '清蒸鱼', 'price': 58.00, 'image': 'https://picsum.photos/id/112/300/200'},
                    {'name': '蒜蓉粉丝蒸扇贝', 'price': 68.00, 'image': 'https://picsum.photos/id/113/300/200'},
                    {'name': '上汤娃娃菜', 'price': 22.00, 'image': 'https://picsum.photos/id/114/300/200'}
                ],
                'dessert': [
                    {'name': '提拉米苏', 'price': 28.00, 'image': 'https://picsum.photos/id/115/300/200'},
                    {'name': '芒果布丁', 'price': 18.00, 'image': 'https://picsum.photos/id/116/300/200'},
                    {'name': '巧克力蛋糕', 'price': 25.00, 'image': 'https://picsum.photos/id/117/300/200'}
                ],
                'drink': [
                    {'name': '可乐', 'price': 5.00, 'image': 'https://picsum.photos/id/118/300/200'},
                    {'name': '雪碧', 'price': 5.00, 'image': 'https://picsum.photos/id/119/300/200'},
                    {'name': '橙汁', 'price': 8.00, 'image': 'https://picsum.photos/id/120/300/200'}
                ]
            }

            for category, items in menu_data.items():
                for item in items:
                    cursor.execute(
                        "INSERT INTO menu_items (name, category, price, image) VALUES (%s, %s, %s, %s)",
                        (item['name'], category, item['price'], item['image'])
                    )

        # 创建默认管理员账户
        cursor.execute("SELECT COUNT(*) FROM admin_users")
        if cursor.fetchone()[0] == 0:
            from werkzeug.security import generate_password_hash
            admin_password = generate_password_hash('admin123')
            cursor.execute(
                "INSERT INTO admin_users (username, password_hash) VALUES (%s, %s)",
                ('admin', admin_password)
            )

        connection.commit()
        print("数据库初始化完成")
        return True

    except Error as e:
        print(f"数据库初始化失败: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()


def get_menu_items():
    """获取所有菜品"""
    connection = create_db_connection()
    if not connection:
        return None

    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category")
        return cursor.fetchall()
    except Error as e:
        print(f"获取菜品失败: {e}")
        return None
    finally:
        cursor.close()
        connection.close()
