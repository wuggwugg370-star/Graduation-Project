from flask import Flask, jsonify, request, send_from_directory
import os
import json
import datetime

# 导入自定义模块
from config import Config
from db import create_db_connection, init_database
from menu import get_menu, search_menu_items, add_menu_item, update_menu_item, delete_menu_item
from orders import create_order, get_orders_by_user, get_all_orders, get_order, update_order_status
from auth import register_user, login_user, login_admin

# 设置Flask应用
app = Flask(__name__)
app.config.from_object(Config)

# 启用全局跨域资源共享
from flask_cors import CORS
CORS(app)

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
    except Exception as e:
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
    except Exception as e:
        print(f"保存菜单数据到数据库失败: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()

# 获取所有菜品
@app.route('/api/menu', methods=['GET'])
def get_menu_api():
    menu = load_menu()
    return jsonify({"code": 200, "data": menu})

# 用户注册
@app.route('/api/user/register', methods=['POST'])
def user_register():
    result = register_user(request.json)
    return jsonify(result)

# 用户登录
@app.route('/api/user/login', methods=['POST'])
def user_login_api():
    result = login_user(request.json)
    return jsonify(result)

# 管理员登录
@app.route('/api/admin/login', methods=['POST'])
def admin_login_api():
    result = login_admin(request.json)
    return jsonify(result)

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
    user_id = data.get('user_id')  # 获取用户ID
    
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
    order_id = f"ORD_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{os.urandom(4).hex().upper()}"
    
    # 调用订单创建模块
    result = create_order(items, total_price, user_id, order_id)
    return jsonify(result)

# 获取订单详情
@app.route('/api/order/<order_id>', methods=['GET'])
def get_order_api(order_id):
    result = get_order(order_id)
    return jsonify(result)

# 获取订单历史
@app.route('/api/orders', methods=['GET'])
def get_orders_api():
    user_id = request.args.get('user_id')  # 获取用户ID参数
    
    if user_id:
        result = get_orders_by_user(user_id)
    else:
        result = get_all_orders()
    
    return jsonify(result)

# 更新订单状态
@app.route('/api/order/<order_id>/status', methods=['PUT'])
def update_order_status_api(order_id):
    data = request.json
    status = data.get('status')
    
    result = update_order_status(order_id, status)
    return jsonify(result)

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