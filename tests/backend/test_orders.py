# 测试订单管理功能

import sys
import os
import time

# 添加项目根目录到路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from backend.orders import create_order

def test_generate_order_id():
    """测试订单ID生成功能"""
    print("测试订单ID生成功能...")
    try:
        # 测试订单数据
        test_items = [{'id': 1, 'name': '测试菜品', 'price': 10.0, 'quantity': 1}]
        test_total = 10.0
        
        # 生成订单ID
        order1 = create_order(test_items, test_total)
        order_id1 = order1.get('order_id')
        
        # 验证订单ID格式
        assert isinstance(order_id1, str), "订单ID应该是字符串类型"
        assert len(order_id1) > 0, "订单ID长度应该大于0"
        assert order_id1.startswith('DEMO-') or order_id1.startswith('ORD-'), "订单ID应该以DEMO-或ORD-开头"
        
        # 等待一小段时间，确保订单ID不同
        time.sleep(1)
        
        # 测试唯一性
        order2 = create_order(test_items, test_total)
        order_id2 = order2.get('order_id')
        assert order_id1 != order_id2, "两次生成的订单ID应该不同"
        
        print("✓ 订单ID生成测试通过")
        return True
    except Exception as e:
        print(f"✗ 订单ID生成测试失败: {str(e)}")
        return False

if __name__ == "__main__":
    test_generate_order_id()
