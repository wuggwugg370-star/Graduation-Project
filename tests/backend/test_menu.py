# 测试菜单功能

import sys
import os

# 添加项目根目录到路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from backend.menu import get_menu, search_menu_items

def test_get_menu():
    """测试获取菜单功能"""
    print("测试获取菜单功能...")
    try:
        # 测试获取完整菜单
        menu = get_menu()
        assert isinstance(menu, dict), "菜单应该是字典格式"
        assert len(menu) > 0, "菜单不应该为空"
        
        # 测试每个分类下的菜品
        for category, items in menu.items():
            assert isinstance(items, list), f"分类 {category} 下的菜品应该是列表格式"
        
        print("✓ 获取菜单功能测试通过")
        return True
    except Exception as e:
        print(f"✗ 获取菜单功能测试失败: {str(e)}")
        return False

def test_search_menu():
    """测试搜索菜品功能"""
    print("测试搜索菜品功能...")
    try:
        # 获取完整菜单
        menu = get_menu()
        if not menu:
            print("菜单为空，跳过搜索测试")
            return True
        
        # 将字典格式的菜单转换为列表
        all_items = []
        for category, items in menu.items():
            all_items.extend(items)
            
        if not all_items:
            print("菜单中没有菜品，跳过搜索测试")
            return True
        
        # 测试搜索功能
        test_item = all_items[0]
        search_results = search_menu_items(test_item['name'][:3])
        assert len(search_results) > 0, "搜索应该返回结果"
        assert any(test_item['name'] in result['name'] for result in search_results), "搜索结果不正确"
        
        print("✓ 搜索菜品功能测试通过")
        return True
    except Exception as e:
        print(f"✗ 搜索菜品功能测试失败: {str(e)}")
        return False

if __name__ == "__main__":
    test_get_menu()
    test_search_menu()
