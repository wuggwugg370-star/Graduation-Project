from db import create_db_connection
from mysql.connector import Error


def get_menu():
    """获取完整菜单数据"""
    menu_items = get_menu_items()
    if not menu_items:
        return None
    
    # 按分类组织菜单
    menu = {}
    for item in menu_items:
        category = item.get('category', '其他')
        menu.setdefault(category, []).append({
            'id': item.get('item_id', item.get('id', '')),
            'name': item.get('name', ''),
            'price': float(item.get('price', 0)),
            'image': item.get('image', ''),
            'description': item.get('description', '')
        })
    
    return menu


def get_menu_items():
    """获取所有菜品"""
    connection = create_db_connection()
    if not connection:
        return None

    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM menu_items ORDER BY category")
        return cursor.fetchall()
    except Error as e:
        print(f"获取菜品失败: {e}")
        return None
    finally:
        cursor.close()
        connection.close()


def get_menu_items_by_category(category):
    """根据分类获取菜品"""
    connection = create_db_connection()
    if not connection:
        return None

    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM menu_items WHERE category = %s AND is_available = TRUE", (category,))
        return cursor.fetchall()
    except Error as e:
        print(f"获取分类菜品失败: {e}")
        return None
    finally:
        cursor.close()
        connection.close()


def add_menu_item(name, category, price, description='', image=''):
    """添加菜品"""
    connection = create_db_connection()
    if not connection:
        return False, "数据库连接失败"

    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO menu_items (name, category, price, description, image) VALUES (%s, %s, %s, %s, %s)",
            (name, category, price, description, image)
        )
        connection.commit()
        return True, "添加菜品成功"
    except Error as e:
        connection.rollback()
        print(f"添加菜品失败: {e}")
        return False, f"添加菜品失败: {str(e)}"
    finally:
        cursor.close()
        connection.close()


def update_menu_item(item_id, name=None, category=None, price=None, description=None, image=None, is_available=None):
    """更新菜品"""
    connection = create_db_connection()
    if not connection:
        return False, "数据库连接失败"

    cursor = connection.cursor()
    try:
        # 构建更新语句
        update_fields = []
        update_values = []
        
        for field, value in [('name', name), ('category', category), ('price', price),
                           ('description', description), ('image', image), ('is_available', is_available)]:
            if value is not None:
                update_fields.append(f"{field} = %s")
                update_values.append(value)
        
        if not update_fields:
            return False, "没有需要更新的字段"
        
        # 添加item_id到参数列表
        update_values.append(item_id)
        
        # 执行更新
        update_query = f"UPDATE menu_items SET {', '.join(update_fields)} WHERE item_id = %s"
        cursor.execute(update_query, tuple(update_values))
        connection.commit()
        
        return (True, "更新菜品成功") if cursor.rowcount > 0 else (False, "菜品不存在")
    except Error as e:
        connection.rollback()
        print(f"更新菜品失败: {e}")
        return False, f"更新菜品失败: {str(e)}"
    finally:
        cursor.close()
        connection.close()


def delete_menu_item(item_id):
    """删除菜品（软删除）"""
    connection = create_db_connection()
    if not connection:
        return False, "数据库连接失败"

    cursor = connection.cursor()
    try:
        cursor.execute("UPDATE menu_items SET is_available = FALSE WHERE item_id = %s", (item_id,))
        connection.commit()
        return (True, "删除菜品成功") if cursor.rowcount > 0 else (False, "菜品不存在")
    except Error as e:
        connection.rollback()
        print(f"删除菜品失败: {e}")
        return False, f"删除菜品失败: {str(e)}"
    finally:
        cursor.close()
        connection.close()


def search_menu_items(keyword):
    """搜索菜品"""
    connection = create_db_connection()
    if not connection:
        return []

    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM menu_items WHERE name LIKE %s", (f"%{keyword}%",))
        return cursor.fetchall()
    except Error as e:
        print(f"搜索菜品失败: {e}")
        return None
    finally:
        cursor.close()
        connection.close()
