# Neo Dining - 智能餐饮点餐系统

## 项目简介

Neo Dining是一个基于前后端分离架构的智能餐饮点餐系统，旨在为用户提供便捷、高效的在线点餐体验。该系统支持菜品浏览、搜索、下单、支付等功能，同时为餐厅管理员提供菜品管理、订单处理等后台功能。

## 技术栈

### 前端技术栈
- **Vue.js 3**: 构建用户界面的渐进式JavaScript框架
- **Vite**: 下一代前端构建工具，提供快速的开发体验
- **Bootstrap 5**: 响应式前端UI框架
- **Axios**: 用于发送HTTP请求的JavaScript库

### 后端技术栈
- **Python 3**: 高级编程语言
- **Flask**: 轻量级Web应用框架
- **MySQL**: 关系型数据库
- **MySQL Connector**: Python连接MySQL数据库的驱动
- **Flask-CORS**: 处理跨域资源共享

## 项目结构

```
neo-dining/
├── backend/               # 后端代码目录
│   ├── app.py            # Flask应用入口
│   ├── config.py         # 配置文件
│   ├── db.py             # 数据库操作模块
│   ├── menu.py           # 菜单管理模块
│   ├── orders.py         # 订单管理模块
│   ├── auth.py           # 认证授权模块
│   ├── requirements.txt  # Python依赖包列表
│   ├── .env              # 环境变量配置
│   ├── static/           # 静态文件目录
│   └── data/             # 数据文件目录
├── frontend/             # 前端代码目录
│   ├── src/              # Vue.js源代码
│   ├── index.html        # HTML入口文件
│   ├── package.json      # Node.js依赖包列表
│   └── vite.config.js    # Vite配置文件
├── tests/                # 测试代码目录
│   └── backend/          # 后端测试
├── Dockerfile            # Docker构建文件
├── docker-compose.yml    # Docker Compose配置
└── README.md             # 项目说明文档
```

## 核心功能

### 用户功能
- **菜单浏览**: 按分类查看所有菜品
- **菜品搜索**: 根据关键词搜索菜品
- **购物车**: 添加、删除菜品，修改数量
- **订单管理**: 提交订单，查看订单历史
- **用户注册/登录**: 注册新用户，登录系统

### 管理员功能
- **菜品管理**: 添加、编辑、删除菜品
- **订单管理**: 查看、处理、完成订单
- **分类管理**: 管理菜品分类

## 安装与运行

### 环境要求
- Python 3.8+
- Node.js 14+
- MySQL 5.7+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd neo-dining
   ```

2. **配置环境变量**
   - 复制`.env.example`到`.env`
   - 修改`.env`文件中的数据库配置等信息

3. **安装后端依赖**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **安装前端依赖**
   ```bash
   cd frontend
   npm install
   ```

5. **初始化数据库**
   - 确保MySQL服务已启动
   - 运行后端应用自动创建数据库表结构
   ```bash
   cd backend
   python app.py
   ```

6. **启动后端服务**
   ```bash
   cd backend
   python app.py
   ```
   后端服务将在`http://localhost:5001`启动

7. **启动前端服务**
   ```bash
   cd frontend
   npm run dev
   ```
   前端服务将在`http://localhost:3000`启动

### 使用Docker运行

1. **构建并启动容器**
   ```bash
   docker-compose up -d
   ```

2. **访问应用**
   - 前端: `http://localhost:3000`
   - 后端API: `http://localhost:5001`

## API接口文档

### 菜单相关接口
- `GET /api/menu`: 获取完整菜单
- `GET /api/menu/search`: 搜索菜品
- `GET /api/menu/categories`: 获取所有分类

### 订单相关接口
- `POST /api/orders`: 创建订单
- `GET /api/orders`: 获取用户订单历史
- `GET /api/orders/:order_id`: 获取订单详情
- `PUT /api/orders/:order_id/status`: 更新订单状态

### 用户相关接口
- `POST /api/register`: 用户注册
- `POST /api/login`: 用户登录

## 测试

### 运行后端测试
```bash
cd neo-dining
python tests/backend/test_all.py
```

### 运行前端测试
```bash
cd frontend
npm run test
```

## 开发规范

### Python代码规范
- 使用PEP 8编码规范
- 使用类型提示
- 函数和模块要有适当的文档字符串

### Vue.js代码规范
- 组件命名使用PascalCase
- 代码风格遵循ESLint配置
- 组件要有清晰的结构和注释

## 项目维护

### 数据库备份
```bash
mysqldump -u <用户名> -p <数据库名> > backup.sql
```

### 日志查看
```bash
tail -f backend/logs/app.log
```

## 贡献指南

1. Fork项目
2. 创建新分支
3. 提交代码
4. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系项目维护者：
- 邮箱: example@example.com
- GitHub: https://github.com/example/neo-dining
