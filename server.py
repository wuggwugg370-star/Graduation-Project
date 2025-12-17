import logging
import os
import json
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from menu_store import MenuStore

# === 路径配置 (核心修复) ===
# 获取当前 server.py 所在的绝对路径
BASE_DIR = Path(__file__).parent.resolve()
# 强制指定 web 文件夹的绝对路径
WEB_DIR = BASE_DIR / "web"
MENU_FILE = BASE_DIR / "data" / "menu_data.json"

# 确保 data 目录存在
(BASE_DIR / "data").mkdir(parents=True, exist_ok=True)

# 环境变量配置
HOST = os.getenv("HOST", "0.0.0.0") # 允许局域网访问
PORT = int(os.getenv("PORT", 5000))

# 默认菜单
DEFAULT_MENU = {
    "宫保鸡丁": 28.0, "鱼香肉丝": 24.0, "麻婆豆腐": 22.0, "黑椒牛柳": 46.0,
    "香煎三文鱼": 68.0, "红烧肉": 48.0, "水煮鱼": 58.0, "糖醋排骨": 38.0,
    "清蒸鲈鱼": 52.0, "蒜蓉粉丝扇贝": 36.0, "蟹粉狮子头": 42.0, "鲜虾云吞": 26.0,
    "口水鸡": 32.0, "扬州炒饭": 26.0, "干炒牛河": 28.0, "招牌牛肉面": 32.0,
    "米饭": 3.0, "椰汁西米露": 16.0, "手工酸奶": 15.0, "宇治抹茶拿铁": 28.0
}

# === 初始化应用 ===
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 检查 web 目录是否存在，不存在则警告
if not WEB_DIR.exists():
    logging.error(f"严重错误: 找不到 web 文件夹! 请确保路径正确: {WEB_DIR}")
else:
    logging.info(f"Web 目录路径: {WEB_DIR}")

# static_folder 使用绝对路径，彻底解决 404 问题
app = Flask(__name__, static_folder=str(WEB_DIR), static_url_path="")
CORS(app)

store = MenuStore(MENU_FILE, DEFAULT_MENU)

# === 路由定义 ===

@app.route("/")
def index():
    # 尝试直接返回 index.html
    return app.send_static_file("index.html")

@app.route("/api/menu", methods=["GET"])
def get_menu():
    return jsonify({"code": 200, "data": store.get_menu()})

@app.route("/api/order", methods=["POST"])
def place_order():
    data = request.json or {}
    items = data.get("items", [])
    
    if not items:
        return jsonify({"code": 400, "msg": "购物车为空"}), 400

    total, not_found, detail = store.calc_order(items)
    
    if not_found:
        return jsonify({"code": 400, "msg": f"商品已售罄或不存在: {', '.join(not_found)}"}), 400

    logging.info(f"New Order: {items} | Total: {total}")
    return jsonify({
        "code": 200, 
        "msg": "下单成功", 
        "data": {"total": total, "detail": detail}
    })

@app.route("/api/admin/menu", methods=["POST"])
def update_item():
    data = request.json or {}
    name = data.get("name")
    image = data.get("image")
    
    if not name:
        return jsonify({"code": 400, "msg": "缺少菜品名称"}), 400

    store.upsert_item(name, image=image)
    return jsonify({"code": 200, "msg": "更新成功", "data": store.get_menu()})

if __name__ == "__main__":
    logging.info(f"Starting Neo Dining Server on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=True)