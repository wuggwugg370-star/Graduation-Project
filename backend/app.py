import logging
import os
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from menu_store import MenuStore

# === 配置 ===
BASE_DIR = Path(__file__).parent.resolve()
# 生产环境：前端构建产物会放在 ./static 目录下
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"
MENU_FILE = DATA_DIR / "menu_data.json"

if not DATA_DIR.exists():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_MENU = {
    "宫保鸡丁": 28.0, "鱼香肉丝": 24.0, "麻婆豆腐": 22.0, "黑椒牛柳": 46.0,
    "米饭": 3.0, "酸奶": 15.0
}

# === 初始化 ===
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="")
CORS(app)
store = MenuStore(MENU_FILE, DEFAULT_MENU)

# === 路由 ===
@app.route("/")
def index():
    # 生产环境返回 index.html
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
    store.upsert_item(data.get("name"), image=data.get("image"))
    return jsonify({"code": 200, "msg": "更新成功"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)