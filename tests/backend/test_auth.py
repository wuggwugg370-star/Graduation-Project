# 测试用户认证功能

import sys
import os

# 添加项目根目录到路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from werkzeug.security import generate_password_hash, check_password_hash

def test_password_hashing():
    """测试密码哈希和验证功能"""
    print("测试密码哈希功能...")
    try:
        # 测试密码
        test_password = "test_password_123"
        
        # 哈希密码
        hashed = generate_password_hash(test_password)
        assert hashed != test_password, "密码哈希失败"
        assert len(hashed) > 20, "哈希值太短"
        
        # 验证密码
        assert check_password_hash(hashed, test_password), "密码验证失败"
        assert not check_password_hash(hashed, "wrong_password"), "错误密码验证通过"
        
        print("✓ 密码哈希和验证测试通过")
        return True
    except Exception as e:
        print(f"✗ 密码哈希和验证测试失败: {str(e)}")
        return False

if __name__ == "__main__":
    test_password_hashing()
