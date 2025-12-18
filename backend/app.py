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

# [新增] 完整分类菜单
DEFAULT_MENU = {
    # 中式经典
    "宫保鸡丁": {"price": 28.0, "category": "中式经典"},
    "鱼香肉丝": {"price": 24.0, "category": "中式经典"},
    "麻婆豆腐": {"price": 22.0, "category": "中式经典"},
    "米饭": {"price": 3.0, "category": "中式经典"},
    
    # 西式料理
    "澳洲M5牛排": {"price": 128.0, "category": "西式料理"},
    "黑松露意面": {"price": 58.0, "category": "西式料理"},
    "凯撒沙拉": {"price": 32.0, "category": "西式料理"},
    "奶油蘑菇汤": {"price": 28.0, "category": "西式料理"},

    # 东南亚风味
    "冬阴功汤": {"price": 45.0, "category": "东南亚风味"},
    "泰式咖喱蟹": {"price": 168.0, "category": "东南亚风味"},
    "海南鸡饭": {"price": 35.0, "category": "东南亚风味"},
    "越式春卷": {"price": 26.0, "category": "东南亚风味"},

    # 饮品甜点
    "冰美式": {"price": 15.0, "category": "饮品甜点"},
    "提拉米苏": {"price": 25.0, "category": "饮品甜点"},
    "手作酸奶": {"price": 18.0, "category": "饮品甜点"}
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
    return "Backend is running! (Frontend not built yet)", 200

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

@app.route("/api/admin/menu", methods=["POST"])
def update_item():
    data = request.json or {}
    # [优化] 透传所有字段，允许修改价格、图片和分类
    store.upsert_item(
        data.get("name"), 
        price=data.get("price"),
        image=data.get("image"),
        category=data.get("category")
    )
    return jsonify({"code": 200, "msg": "更新成功"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)