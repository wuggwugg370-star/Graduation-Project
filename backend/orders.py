import json
from datetime import datetime
from db import create_db_connection
import mysql.connector
from mysql.connector import Error


def create_order(items, total_price, user_id=None):
    """
    创建订单
    """
    connection = create_db_connection()
    if connection is None:
        # 演示模式：返回模拟订单信息
        print("数据库连接失败，使用演示模式创建订单")
        return {
            'order_id': f'DEMO-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }

    cursor = connection.cursor()
    try:
        # 生成订单ID
        order_id = f'ORD-{datetime.now().strftime("%Y%m%d%H%M%S")}'
        
        # 将items转换为JSON字符串
        items_json = json.dumps(items)
        
        # 插入订单 - 使用更安全的方式，避免依赖user_id列
        try:
            if user_id:
                cursor.execute(
                    "INSERT INTO orders (order_id, items, total_price, user_id, status) VALUES (%s, %s, %s, %s, %s)",
                    (order_id, items_json, total_price, user_id, 'pending')
                )
            else:
                cursor.execute(
                    "INSERT INTO orders (order_id, items, total_price, status) VALUES (%s, %s, %s, %s)",
                    (order_id, items_json, total_price, 'pending')
                )
        except Error as e:
            # 回退到最基本的插入方式，只使用必须的列
            cursor.execute(
                "INSERT INTO orders (order_id, items, total_price) VALUES (%s, %s, %s)",
                (order_id, items_json, total_price)
            )
        connection.commit()
        
        return {
            'order_id': order_id,
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }
    except Error as e:
        connection.rollback()
        print(f"创建订单失败: {e}")
        return None
    finally:
        cursor.close()
        connection.close()


def get_order(order_id):
    """
    获取订单详情
    """
    connection = create_db_connection()
    if connection is None:
        return None

    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM orders WHERE order_id = %s", (order_id,))
        order = cursor.fetchone()
        if order:
            # 将JSON字符串转换为Python对象
            order['items'] = json.loads(order['items'])
        return order
    except Error as e:
        print(f"获取订单详情失败: {e}")
        return None
    finally:
        cursor.close()
        connection.close()


def get_orders_by_user(user_id):
    """
    获取用户的所有订单
    """
    connection = create_db_connection()
    if connection is None:
        return []

    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
        orders = cursor.fetchall()
        for order in orders:
            order['items'] = json.loads(order['items'])
        return orders
    except Error as e:
        print(f"获取用户订单失败: {e}")
        return []
    finally:
        cursor.close()
        connection.close()


def get_all_orders():
    """
    获取所有订单（管理员用）
    """
    connection = create_db_connection()
    if connection is None:
        return []

    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
        orders = cursor.fetchall()
        for order in orders:
            order['items'] = json.loads(order['items'])
        return orders
    except Error as e:
        print(f"获取所有订单失败: {e}")
        return []
    finally:
        cursor.close()
        connection.close()


def update_order_status(order_id, status):
    """
    更新订单状态
    """
    valid_statuses = ['pending', 'processing', 'completed', 'cancelled']
    if status not in valid_statuses:
        return False, "无效的订单状态"

    connection = create_db_connection()
    if connection is None:
        return False, "数据库连接失败"

    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE orders SET status = %s WHERE order_id = %s",
            (status, order_id)
        )
        connection.commit()
        if cursor.rowcount > 0:
            return True, "订单状态更新成功"
        else:
            return False, "订单不存在"
    except Error as e:
        connection.rollback()
        print(f"更新订单状态失败: {e}")
        return False, f"更新订单状态失败: {str(e)}"
    finally:
        cursor.close()
        connection.close()


def log_operation(operation):
    """
    记录操作日志
    """
    connection = create_db_connection()
    if connection is None:
        print("数据库连接失败，无法记录操作日志")
        return

    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO operation_logs (operation) VALUES (%s)",
            (operation,)
        )
        connection.commit()
    except Error as e:
        print(f"记录操作日志失败: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()
