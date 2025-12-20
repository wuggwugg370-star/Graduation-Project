# 运行所有后端测试

import sys
import os

# 添加项目根目录到路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from test_db import test_db_connection
from test_auth import test_password_hashing
from test_menu import test_get_menu, test_search_menu
from test_orders import test_generate_order_id

def run_all_tests():
    """运行所有后端测试"""
    print("====================================")
    print("开始运行所有后端测试...")
    print("====================================")
    
    # 测试结果统计
    passed = 0
    total = 0
    
    # 运行数据库连接测试
    total += 1
    if test_db_connection():
        passed += 1
    
    # 运行密码哈希测试
    total += 1
    if test_password_hashing():
        passed += 1
    
    # 运行菜单功能测试
    total += 1
    if test_get_menu():
        passed += 1
    
    total += 1
    if test_search_menu():
        passed += 1
    
    # 运行订单功能测试
    total += 1
    if test_generate_order_id():
        passed += 1
    
    print("\n====================================")
    print(f"测试完成: {passed}/{total} 个测试通过")
    print("====================================")
    
    return passed == total

if __name__ == "__main__":
    run_all_tests()
