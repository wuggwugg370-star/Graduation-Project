import logging
import os
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from menu_store import MenuStore

# === 配置 ===
BASE_DIR = Path(__file__).parent.resolve()
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"
MENU_FILE = DATA_DIR / "menu_data.json"

if not DATA_DIR.exists():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

# 默认菜单数据
DEFAULT_MENU = {
    "宫保鸡丁": {"price": 28.0, "category": "中式经典", "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=80"},
    "澳洲M5牛排": {"price": 128.0, "category": "西式料理", "image": "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=400&q=80"},
    "冰美式": {"price": 15.0, "category": "饮品甜点", "image": "https://images.unsplash.com/photo-1556484687-306361646342?auto=format&fit=crop&w=400&q=80"},
}

# === 初始化 ===
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="")
CORS(app)
store = MenuStore(MENU_FILE, DEFAULT_MENU)

# === 路由 ===
@app.route("/")
def index():
    if (STATIC_DIR / "index.html").exists():
        return send_from_directory(STATIC_DIR, "index.html")
    return "Backend running. Please build frontend.", 200

@app.route("/api/menu", methods=["GET"])
def get_menu():
    return jsonify({"code": 200, "data": store.get_menu()})

@app.route("/api/order", methods=["POST"])
def place_order():
    data = request.json or {}
    items = data.get("items", [])
    if not items: return jsonify({"code": 400, "msg": "购物车为空"}), 400
    
    total, not_found, detail = store.calc_order(items)
    if not_found: return jsonify({"code": 400, "msg": f"缺货: {', '.join(not_found)}"}), 400

    logging.info(f"Order: {items} | Total: {total}")
    return jsonify({"code": 200, "msg": "下单成功", "data": {"total": total}})

# --- 管理员接口 ---

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    """简单的演示用登录接口"""
    data = request.json or {}
    password = data.get("password")
    # 演示用密码：123456
    if password == "123456":
        return jsonify({"code": 200, "msg": "登录成功"})
    return jsonify({"code": 401, "msg": "密码错误"}), 401

@app.route("/api/admin/item", methods=["POST"])
def save_item():
    """添加或修改菜品"""
    data = request.json or {}
    name = data.get("name")
    price = data.get("price")
    category = data.get("category")
    image = data.get("image")

    if not all([name, price, category]):
        return jsonify({"code": 400, "msg": "信息不完整"}), 400

    store.upsert_item(name, price, category, image)
    return jsonify({"code": 200, "msg": "保存成功"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)