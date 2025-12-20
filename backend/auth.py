from werkzeug.security import generate_password_hash, check_password_hash
from db import create_db_connection
import mysql.connector
from mysql.connector import Error


def register_user(username, password, phone):
    """
    用户注册
    """
    connection = create_db_connection()
    if connection is None:
        return False, "数据库连接失败"

    cursor = connection.cursor()
    try:
        # 检查用户名是否已存在
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            return False, "用户名已存在"

        # 检查手机号是否已存在
        cursor.execute("SELECT * FROM users WHERE phone = %s", (phone,))
        if cursor.fetchone():
            return False, "手机号已被注册"

        # 创建密码哈希
        password_hash = generate_password_hash(password)

        # 插入新用户
        cursor.execute(
            "INSERT INTO users (username, password_hash, phone) VALUES (%s, %s, %s)",
            (username, password_hash, phone)
        )
        connection.commit()
        return True, "注册成功"
    except Error as e:
        connection.rollback()
        return False, f"注册失败: {str(e)}"
    finally:
        cursor.close()
        connection.close()


def login_user(username, password):
    """
    用户登录
    """
    connection = create_db_connection()
    if connection is None:
        return False, "数据库连接失败", None

    cursor = connection.cursor(dictionary=True)
    try:
        # 查找用户
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return False, "用户名不存在", None

        # 验证密码
        if not check_password_hash(user['password_hash'], password):
            return False, "密码错误", None

        return True, "登录成功", {
            'user_id': user['user_id'],
            'username': user['username'],
            'phone': user['phone']
        }
    except Error as e:
        return False, f"登录失败: {str(e)}", None
    finally:
        cursor.close()
        connection.close()


def login_admin(username, password):
    """
    管理员登录
    """
    connection = create_db_connection()
    if connection is None:
        return False, "数据库连接失败"

    cursor = connection.cursor(dictionary=True)
    try:
        # 查找管理员
        cursor.execute("SELECT * FROM admin_users WHERE username = %s", (username,))
        admin = cursor.fetchone()

        if not admin:
            return False, "管理员不存在"

        # 验证密码
        if not check_password_hash(admin['password_hash'], password):
            return False, "密码错误"

        return True, "登录成功"
    except Error as e:
        return False, f"登录失败: {str(e)}"
    finally:
        cursor.close()
        connection.close()


def get_user_by_id(user_id):
    """
    根据用户ID获取用户信息
    """
    connection = create_db_connection()
    if connection is None:
        return None

    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        return cursor.fetchone()
    except Error as e:
        print(f"获取用户信息失败: {e}")
        return None
    finally:
        cursor.close()
        connection.close()
