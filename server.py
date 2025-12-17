import logging
import os
import json
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from menu_store import MenuStore

# === 配置部分 ===
# 从环境变量读取配置，方便 Docker 部署时动态调整
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 5000))
DATA_DIR = Path("/app/data") if os.getenv("DOCKER_ENV") else Path(__file__).parent / "data"
MENU_FILE = DATA_DIR / "menu_data.json"

# 默认菜单数据（当文件不存在时使用）
DEFAULT_MENU = {
    "宫保鸡丁": 28.0, "鱼香肉丝": 24.0, "麻婆豆腐": 22.0, "黑椒牛柳": 46.0,
    "香煎三文鱼": 68.0, "红烧肉": 48.0, "水煮鱼": 58.0, "糖醋排骨": 38.0,
    "清蒸鲈鱼": 52.0, "蒜蓉粉丝扇贝": 36.0, "蟹粉狮子头": 42.0, "鲜虾云吞": 26.0,
    "口水鸡": 32.0, "扬州炒饭": 26.0, "干炒牛河": 28.0, "招牌牛肉面": 32.0,
    "米饭": 3.0, "椰汁西米露": 16.0, "手工酸奶": 15.0, "宇治抹茶拿铁": 28.0
}

# === 初始化应用 ===
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
app = Flask(__name__, static_folder="web", static_url_path="")
CORS(app)  # 允许跨域，方便开发

# 确保数据目录存在
if not DATA_DIR.exists():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

store = MenuStore(MENU_FILE, DEFAULT_MENU)

# === 路由定义 ===

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/api/menu", methods=["GET"])
def get_menu():
    """获取所有菜单"""
    return jsonify({"code": 200, "data": store.get_menu()})

@app.route("/api/order", methods=["POST"])
def place_order():
    """提交订单"""
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
    """更新菜品信息（改名、改价、改图）"""
    data = request.json or {}
    name = data.get("name")
    image = data.get("image")
    
    if not name:
        return jsonify({"code": 400, "msg": "缺少菜品名称"}), 400

    store.upsert_item(name, image=image)
    return jsonify({"code": 200, "msg": "更新成功", "data": store.get_menu()})

@app.route("/health")
def health_check():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    logging.info(f"Starting Neo Dining Server on {HOST}:{PORT}")
    app.run(host=HOST, port=PORT)