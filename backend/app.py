from flask import Flask, jsonify, request, send_from_directory
import os
import json
import mysql.connector
from mysql.connector import Error
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'neo_dining_secret_key'

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

# 创建数据库连接
def create_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"数据库连接失败: {e}")
        return None

# 初始化数据库表
def init_database():
    connection = create_db_connection()
    if connection is None:
        return False
    
    cursor = connection.cursor()
    
    try:
        # 创建菜品表
        create_menu_table = """
        CREATE TABLE IF NOT EXISTS menu_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            category VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            image VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        """
        
        # 创建订单表
        create_orders_table = """
        CREATE TABLE IF NOT EXISTS orders (
            order_id VARCHAR(255) PRIMARY KEY,
            items JSON NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        """
        
        # 创建操作日志表
        create_logs_table = """
        CREATE TABLE IF NOT EXISTS operation_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_type VARCHAR(50) NOT NULL,
            operation_type VARCHAR(50) NOT NULL,
            operation_details JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_menu_table)
        cursor.execute(create_orders_table)
        cursor.execute(create_logs_table)
        connection.commit()
        
        # 强制使用默认菜单数据并清空现有数据
        cursor.execute("TRUNCATE TABLE menu_items")
        
        # 使用默认菜单数据填充数据库
        for name, item in DEFAULT_MENU.items():
            cursor.execute(
                "INSERT INTO menu_items (name, category, price, image) VALUES (%s, %s, %s, %s)",
                (name, item['category'], item['price'], item['image'])
            )
        connection.commit()
        
        return True
    except Error as e:
        print(f"数据库初始化失败: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()

# 记录操作日志
def log_operation(user_type, operation_type, operation_details):
    connection = create_db_connection()
    if connection is None:
        return
    
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO operation_logs (user_type, operation_type, operation_details) VALUES (%s, %s, %s)",
            (user_type, operation_type, json.dumps(operation_details, ensure_ascii=False))
        )
        connection.commit()
    except Error as e:
        print(f"记录操作日志失败: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

# 菜品数据文件路径
MENU_FILE = os.path.join('data', 'menu_data.json')

# 确保数据目录存在
os.makedirs('data', exist_ok=True)

# 默认菜品数据
DEFAULT_MENU = {
    "冬阴功汤": {"category": "东南亚风味", "price": 45.0, "image": ""},
    "冰美式": {"category": "饮品甜点", "price": 15.0, "image": ""},
    "凯撒沙拉": {"category": "西式料理", "price": 32.0, "image": ""},
    "奶油蘑菇汤": {"category": "西式料理", "price": 28.0, "image": ""},
    "宫保鸡丁": {"category": "中式经典", "price": 28.0, "image": ""},
    "手作酸奶": {"category": "饮品甜点", "price": 18.0, "image": ""},
    "提拉米苏": {"category": "饮品甜点", "price": 25.0, "image": ""},
    "泰式咖喱鸡": {"category": "东南亚风味", "price": 168.0, "image": ""},
    "海南鸡饭": {"category": "东南亚风味", "price": 35.0, "image": ""},
    "澳洲M5牛排": {"category": "西式料理", "price": 128.0, "image": ""},
    "米饭": {"category": "中式经典", "price": 3.0, "image": ""},
    "越式春卷": {"category": "东南亚风味", "price": 26.0, "image": ""},
    "鱼香肉丝": {"category": "中式经典", "price": 24.0, "image": ""},
    "麻婆豆腐": {"category": "中式经典", "price": 22.0, "image": ""},
    "黑椒意大利面": {"category": "西式料理", "price": 58.0, "image": ""}
}

# 加载菜单数据
def load_menu():
    # 从数据库加载菜单数据
    connection = create_db_connection()
    if connection is None:
        # 如果数据库连接失败，尝试从JSON文件加载
        if os.path.exists(MENU_FILE):
            try:
                with open(MENU_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"从JSON文件加载菜单数据失败: {e}")
        # 如果都失败，返回默认数据
        return DEFAULT_MENU
    
    cursor = connection.cursor(dictionary=True)
    menu = {}
    
    try:
        cursor.execute("SELECT name, category, price, image FROM menu_items")
        items = cursor.fetchall()
        
        for item in items:
            menu[item['name']] = {
                'category': item['category'],
                'price': float(item['price']),
                'image': item['image']
            }
        
        return menu
    except Error as e:
        print(f"从数据库加载菜单数据失败: {e}")
        return DEFAULT_MENU
    finally:
        cursor.close()
        connection.close()

# 保存菜单数据
def save_menu(menu_data):
    # 保存到JSON文件作为备份
    try:
        with open(MENU_FILE, 'w', encoding='utf-8') as f:
            json.dump(menu_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"保存菜单数据到JSON文件失败: {e}")
    
    # 同步到数据库
    connection = create_db_connection()
    if connection is None:
        return False
    
    cursor = connection.cursor()
    
    try:
        # 更新或插入菜品数据
        for name, item in menu_data.items():
            cursor.execute(
                "INSERT INTO menu_items (name, category, price, image) VALUES (%s, %s, %s, %s) "
                "ON DUPLICATE KEY UPDATE category = %s, price = %s, image = %s",
                (name, item['category'], item['price'], item['image'],
                 item['category'], item['price'], item['image'])
            )
        
        connection.commit()
        return True
    except Error as e:
        print(f"保存菜单数据到数据库失败: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()

# 获取所有菜品
@app.route('/api/menu', methods=['GET'])
def get_menu():
    menu = load_menu()
    return jsonify({"code": 200, "data": menu})

# 管理员登录
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    password = data.get('password', '')
    if password == 'admin123':
        return jsonify({"code": 200, "msg": "登录成功"})
    else:
        return jsonify({"code": 401, "msg": "密码错误"})

# 保存菜品（添加/编辑）
@app.route('/api/admin/item', methods=['POST'])
def save_item():
    menu = load_menu()
    item_data = request.json
    
    name = item_data.get('name', '').strip()
    if not name:
        return jsonify({"code": 400, "msg": "菜品名称不能为空"})
    
    try:
        price = float(item_data.get('price', 0))
        if price < 0:
            return jsonify({"code": 400, "msg": "价格不能为负数"})
    except ValueError:
        return jsonify({"code": 400, "msg": "价格必须是数字"})
    
    category = item_data.get('category', '').strip() or '未分类'
    image = item_data.get('image', '').strip()
    
    menu[name] = {"category": category, "price": price, "image": image}
    
    if save_menu(menu):
        return jsonify({"code": 200, "msg": "保存成功"})
    else:
        return jsonify({"code": 500, "msg": "保存失败"})

# 提交订单
@app.route('/api/order', methods=['POST'])
def submit_order():
    data = request.json
    items = data.get('items', [])
    
    if not items:
        return jsonify({"code": 400, "msg": "订单不能为空"})
    
    # 计算订单总价
    total_price = 0
    menu = load_menu()
    
    # 验证订单中的菜品和价格
    for item in items:
        name = item.get('name')
        quantity = item.get('quantity', 1)
        
        if name not in menu:
            return jsonify({"code": 400, "msg": f"菜品 '{name}' 不存在"})
        
        total_price += menu[name]['price'] * quantity
    
    # 生成唯一订单号
    order_id = f"ORD_{datetime.now().strftime('%Y%m%d%H%M%S')}_{os.urandom(4).hex().upper()}"
    
    # 保存订单到数据库
    connection = create_db_connection()
    if connection is None:
        # 如果数据库连接失败，返回成功但不保存到数据库
        return jsonify({"code": 200, "msg": "订单提交成功", "order_id": order_id, "total_price": total_price})
    
    cursor = connection.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO orders (order_id, items, total_price, status) VALUES (%s, %s, %s, %s)",
            (order_id, json.dumps(items, ensure_ascii=False), total_price, 'pending')
        )
        connection.commit()
        
        # 记录操作日志
        log_operation('customer', 'place_order', {
            'order_id': order_id,
            'items': items,
            'total_price': total_price
        })
        
        return jsonify({
            "code": 200, 
            "msg": "订单提交成功", 
            "order_id": order_id, 
            "total_price": total_price,
            "status": "pending",
            "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    except Error as e:
        print(f"保存订单到数据库失败: {e}")
        connection.rollback()
        return jsonify({
            "code": 200, 
            "msg": "订单提交成功", 
            "order_id": order_id, 
            "total_price": total_price
        })
    finally:
        cursor.close()
        connection.close()

# 获取订单详情
@app.route('/api/order/<order_id>', methods=['GET'])
def get_order(order_id):
    connection = create_db_connection()
    if connection is None:
        return jsonify({"code": 500, "msg": "数据库连接失败"})
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM orders WHERE order_id = %s", (order_id,))
        order = cursor.fetchone()
        
        if order is None:
            return jsonify({"code": 404, "msg": "订单不存在"})
        
        return jsonify({
            "code": 200, 
            "data": {
                "order_id": order['order_id'],
                "items": json.loads(order['items']),
                "total_price": float(order['total_price']),
                "status": order['status'],
                "created_at": order['created_at'].strftime('%Y-%m-%d %H:%M:%S'),
                "updated_at": order['updated_at'].strftime('%Y-%m-%d %H:%M:%S')
            }
        })
    except Error as e:
        print(f"获取订单详情失败: {e}")
        return jsonify({"code": 500, "msg": "获取订单详情失败"})
    finally:
        cursor.close()
        connection.close()

# 获取订单历史
@app.route('/api/orders', methods=['GET'])
def get_orders():
    connection = create_db_connection()
    if connection is None:
        return jsonify({"code": 500, "msg": "数据库连接失败"})
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
        orders = cursor.fetchall()
        
        formatted_orders = []
        for order in orders:
            formatted_orders.append({
                "order_id": order['order_id'],
                "items": json.loads(order['items']),
                "total_price": float(order['total_price']),
                "status": order['status'],
                "created_at": order['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return jsonify({"code": 200, "data": formatted_orders})
    except Error as e:
        print(f"获取订单历史失败: {e}")
        return jsonify({"code": 500, "msg": "获取订单历史失败"})
    finally:
        cursor.close()
        connection.close()

# 提供静态文件
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    if path == '':
        return send_from_directory('static', 'index.html')
    else:
        return send_from_directory('static', path)

if __name__ == '__main__':
    # 初始化数据库
    init_database()
    # 启动时确保有默认菜品数据
    load_menu()
    print("🚀 Neo Dining 后端服务启动成功")
    print("📡 API地址: http://localhost:5001")
    print("🔧 管理员密码: admin123")
    app.run(debug=True, host='0.0.0.0', port=5001)