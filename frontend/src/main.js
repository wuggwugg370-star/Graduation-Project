// 导入玻璃态效果样式
import './styles/glassmorphism.css';

// API配置
const API_BASE_URL = '/api';

// 全局变量
let menu = {};
let cart = [];
let orders = [];

// 全局DOM元素引用
let menuGrid;
let searchInput;
let searchBtn;
let categoryTabs;
let cartBtn;
let cartCount;
let adminLoginBtn;

// 模态框元素
let cartModal;
let adminLoginModal;
let addItemModal;
let orderSuccessModal;
let orderHistoryModal;

// 模态框关闭按钮
let closeCartModal;
let closeAdminLoginModal;
let closeAddItemModal;
let closeOrderSuccessModal;
let closeOrderHistoryModal;

// 表单元素
let adminLoginForm;
let addItemForm;

// 按钮元素
let clearCartBtn;
let submitOrderBtn;
let continueShoppingBtn;
let viewHistoryBtn;
let closeHistoryBtn;

// 初始化应用
async function initApp() {
    console.log('开始初始化应用...');
    try {
        // 加载菜单数据
        console.log('调用loadMenu()');
        await loadMenu();
        console.log('loadMenu()调用完成');
        // 渲染菜单
        console.log('调用renderMenu()');
        renderMenu();
        console.log('renderMenu()调用完成');
        // 加载购物车数据
        console.log('调用loadCart()');
        loadCart();
        console.log('loadCart()调用完成');
        // 更新购物车数量
        console.log('调用updateCartCount()');
        updateCartCount();
        console.log('updateCartCount()调用完成');
        // 加载订单历史
        console.log('调用loadOrderHistory()');
        await loadOrderHistory();
        console.log('loadOrderHistory()调用完成');
        console.log('应用初始化完成');
    } catch (error) {
        console.error('初始化应用失败:', error);
        showNotification('应用初始化失败，请刷新页面重试', 'error');
    }
}

// 加载菜单数据
async function loadMenu() {
    console.log('开始加载菜单数据...');
    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        console.log('菜单API响应:', response);
        const data = await response.json();
        console.log('菜单API数据:', data);
        if (data.code === 200) {
            // 直接使用对象格式的数据
            menu = data.data;
            console.log('最终菜单数据:', menu);
        } else {
            throw new Error('加载菜单数据失败');
        }
    } catch (error) {
        console.error('加载菜单失败:', error);
        // 使用默认菜单数据
        console.log('使用默认菜单数据');
        menu = {
            "冬阴功汤": {"category": "东南亚风味", "price": 45.0, "image": ""},
            "冰美式": {"category": "饮品甜点", "price": 15.0, "image": ""},
            "凯撒沙拉": {"category": "西式料理", "price": 32.0, "image": ""},
            "奶油蘑菇汤": {"category": "西式料理", "price": 28.0, "image": ""},
            "宫保鸡丁": {"category": "中式经典", "price": 28.0, "image": ""},
            "手作酸奶": {"category": "饮品甜点", "price": 18.0, "image": ""},
            "提拉米苏": {"category": "饮品甜点", "price": 25.0, "image": ""},
            "泰式咖喱鸡": {"category": "东南亚风味", "price": 168.0, "image": ""},
            "海南鸡饭": {"category": "东南亚风味", "price": 35.0, "image": ""},
            "澳洲M5牛排": {"category": "西式料理", "price": 128.0, "image": ""},
            "米饭": {"category": "中式经典", "price": 3.0, "image": ""},
            "越式春卷": {"category": "东南亚风味", "price": 26.0, "image": ""},
            "鱼香肉丝": {"category": "中式经典", "price": 24.0, "image": ""},
            "麻婆豆腐": {"category": "中式经典", "price": 22.0, "image": ""},
            "黑椒意大利面": {"category": "西式料理", "price": 58.0, "image": ""}
        };
        console.log('默认菜单数据:', menu);
    }
}

// 渲染菜单
function renderMenu(filteredMenu = null) {
    console.log('开始渲染菜单...');
    console.log('菜单网格元素:', menuGrid);
    const displayMenu = filteredMenu || menu;
    console.log('要渲染的菜单数据:', displayMenu);
    
    if (Object.keys(displayMenu).length === 0) {
        console.log('菜单数据为空，显示空状态');
        menuGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>没有找到菜品</h3>
                <p>请尝试其他搜索关键词或分类</p>
            </div>
        `;
        return;
    }
    
    console.log('开始生成菜单HTML...');
    const menuHTML = Object.entries(displayMenu).map(([name, item]) => `
        <div class="menu-item glass-effect">
            <div class="menu-item-image" style="background-image: url(${item.image || 'https://via.placeholder.com/320x250?text=No+Image'});">
            </div>
            <div class="menu-item-content">
                <div class="menu-item-category">${item.category}</div>
                <h3 class="menu-item-title">${name}</h3>
                <div class="menu-item-price">¥${item.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-item-name="${name}">
                    <i class="fas fa-shopping-cart"></i> 添加到购物车
                </button>
            </div>
        </div>
    `).join('');
    
    console.log('生成的菜单HTML:', menuHTML);
    menuGrid.innerHTML = menuHTML;
    console.log('菜单渲染完成');
}

// 搜索功能
async function searchMenu() {
    const keyword = searchInput.value.toLowerCase();
    const filteredMenu = {};
    
    Object.entries(menu).forEach(([name, item]) => {
        if (name.toLowerCase().includes(keyword) || item.category.toLowerCase().includes(keyword)) {
            filteredMenu[name] = item;
        }
    });
    
    renderMenu(filteredMenu);
}

// 分类筛选
function filterMenuByCategory(category) {
    if (category === 'all') {
        renderMenu();
    } else {
        const filteredMenu = {};
        Object.entries(menu).forEach(([name, item]) => {
            if (item.category === category) {
                filteredMenu[name] = item;
            }
        });
        renderMenu(filteredMenu);
    }
}

// 添加到购物车
function addToCart(itemName) {
    const item = menu[itemName];
    if (!item) {
        console.error('商品不存在:', itemName);
        showNotification('商品不存在', 'error');
        return;
    }
    
    // 检查购物车中是否已存在该商品
    const existingItemIndex = cart.findIndex(item => item.name === itemName);
    
    if (existingItemIndex >= 0) {
        // 如果已存在，增加数量
        cart[existingItemIndex].quantity += 1;
    } else {
        // 如果不存在，添加到购物车
        cart.push({
            name: itemName,
            category: item.category,
            price: item.price,
            quantity: 1,
            image: item.image
        });
    }
    
    // 保存购物车数据
    saveCart();
    // 更新购物车数量显示
    updateCartCount();
    // 显示添加成功通知
    showNotification(`${itemName} 已添加到购物车`, 'success');
}



// 从购物车移除
function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    saveCart();
    updateCartCount();
    renderCartItems();
    calculateCartTotal();
}

// 更新购物车商品数量
function updateCartItemQuantity(itemName, change) {
    const item = cart.find(item => item.name === itemName);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemName);
    } else {
        saveCart();
        renderCartItems();
        calculateCartTotal();
    }
}

// 更新购物车数量显示
function updateCartCount() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        const cartCount = cartBtn.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
}

// 清空购物车
function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    renderCartItems();
    calculateCartTotal();
    showNotification('购物车已清空', 'info');
}

// 渲染购物车商品
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>购物车是空的</h3>
                <p>快去添加一些美食吧！</p>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">¥${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="ctrl-btn" onclick="updateCartItemQuantity('${item.name}', -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button class="ctrl-btn" onclick="updateCartItemQuantity('${item.name}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="ctrl-btn delete-btn" onclick="removeFromCart('${item.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 计算购物车总价
function calculateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = `¥${total.toFixed(2)}`;
    return total;
}

// 保存购物车到本地存储
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// 从本地存储加载购物车
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// 提交订单
async function submitOrder() {
    if (cart.length === 0) {
        showNotification('购物车是空的，请先添加商品', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: cart })
        });
        
        const data = await response.json();
        
        if (data.code === 200) {
            // 订单提交成功
            showOrderSuccess(data);
            // 清空购物车
            clearCart();
            // 加载订单历史
            await loadOrderHistory();
        } else {
            throw new Error(data.msg || '订单提交失败');
        }
    } catch (error) {
        console.error('提交订单失败:', error);
        showNotification('订单提交失败，请稍后重试', 'error');
    }
}

// 显示订单成功信息
function showOrderSuccess(orderData) {
    const orderDetails = document.getElementById('orderDetails');
    
    orderDetails.innerHTML = `
        <div class="order-id">订单号: ${orderData.order_id}</div>
        <p>下单时间: ${orderData.created_at}</p>
        <p>订单金额: ¥${orderData.total_price.toFixed(2)}</p>
        <p>订单状态: ${orderData.status}</p>
    `;
    
    // 显示订单成功模态框
    orderSuccessModal.classList.add('show');
}

// 加载订单历史
async function loadOrderHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        const data = await response.json();
        
        if (data.code === 200) {
            orders = data.data;
        } else {
            throw new Error('加载订单历史失败');
        }
    } catch (error) {
        console.error('加载订单历史失败:', error);
        orders = [];
    }
}

// 显示订单历史
async function viewOrderHistory() {
    // 先加载最新的订单历史
    await loadOrderHistory();
    
    const orderHistoryList = document.getElementById('orderHistoryList');
    
    if (orders.length === 0) {
        orderHistoryList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>暂无订单历史</h3>
                <p>快去下单享受美食吧！</p>
            </div>
        `;
    } else {
        orderHistoryList.innerHTML = orders.map(order => `
            <div class="order-history-item">
                <div class="order-history-header">
                    <div class="order-history-id">订单号: ${order.order_id}</div>
                    <div class="order-history-status ${order.status}">
                        ${order.status === 'pending' ? '处理中' : '已完成'}
                    </div>
                </div>
                <div class="order-history-details">
                    <p>下单时间: ${order.created_at}</p>
                    <p>订单金额: ¥${order.total_price.toFixed(2)}</p>
                    <p>商品数量: ${order.items.length} 件</p>
                </div>
            </div>
        `).join('');
    }
    
    // 显示订单历史模态框
    orderHistoryModal.classList.add('show');
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 3秒后自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 模态框控制函数
function openModal(modal) {
    modal.classList.add('show');
}

function closeModal(modal) {
    modal.classList.remove('show');
}

// 关闭所有模态框
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', async () => {
    // 获取DOM元素
    menuGrid = document.getElementById('menuGrid');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    categoryTabs = document.querySelectorAll('.tab-btn');
    cartBtn = document.getElementById('cartBtn');
    cartCount = document.getElementById('cartCount');
    adminLoginBtn = document.getElementById('adminLoginBtn');
    
    // 获取模态框元素
    cartModal = document.getElementById('cartModal');
    adminLoginModal = document.getElementById('adminLoginModal');
    addItemModal = document.getElementById('addItemModal');
    orderSuccessModal = document.getElementById('orderSuccessModal');
    orderHistoryModal = document.getElementById('orderHistoryModal');
    
    // 获取模态框关闭按钮
    closeCartModal = document.getElementById('closeCartModal');
    closeAdminLoginModal = document.getElementById('closeAdminLoginModal');
    closeAddItemModal = document.getElementById('closeAddItemModal');
    closeOrderSuccessModal = document.getElementById('closeOrderSuccessModal');
    closeOrderHistoryModal = document.getElementById('closeOrderHistoryModal');
    
    // 获取表单元素
    adminLoginForm = document.getElementById('adminLoginForm');
    addItemForm = document.getElementById('addItemForm');
    
    // 获取按钮元素
    clearCartBtn = document.getElementById('clearCartBtn');
    submitOrderBtn = document.getElementById('submitOrderBtn');
    continueShoppingBtn = document.getElementById('continueShoppingBtn');
    viewHistoryBtn = document.getElementById('viewHistoryBtn');
    closeHistoryBtn = document.getElementById('closeHistoryBtn');
    
    // 初始化应用
    await initApp();
    
    // 事件监听器
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', searchMenu);
    
    // 搜索输入框回车事件
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMenu();
        }
    });
    
    // 分类标签点击事件
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签的active类
            categoryTabs.forEach(t => t.classList.remove('active'));
            // 为当前标签添加active类
            tab.classList.add('active');
            // 筛选菜单
            filterMenuByCategory(tab.dataset.category);
        });
    });
    
    // 添加到购物车按钮点击事件（事件委托）
    menuGrid.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn')) {
            const addToCartBtn = e.target.closest('.add-to-cart-btn');
            const itemName = addToCartBtn.dataset.itemName;
            addToCart(itemName);
        }
    });
    
    // 购物车按钮点击事件
    cartBtn.addEventListener('click', () => {
        renderCartItems();
        calculateCartTotal();
        openModal(cartModal);
    });
    
    // 管理员登录按钮点击事件
    adminLoginBtn.addEventListener('click', () => {
        openModal(adminLoginModal);
    });
    
    // 清空购物车按钮点击事件
    clearCartBtn.addEventListener('click', clearCart);
    
    // 提交订单按钮点击事件
    // 为这些模态框按钮添加事件监听器前先检查元素是否存在
    if (submitOrderBtn) {
        submitOrderBtn.addEventListener('click', submitOrder);
    }
    
    // 继续购物按钮点击事件
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            closeModal(orderSuccessModal);
        });
    }
    
    // 查看历史订单按钮点击事件
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
            closeModal(orderSuccessModal);
            viewOrderHistory();
        });
    }
    
    // 关闭历史订单按钮点击事件
    if (closeOrderHistoryModal) {
        closeOrderHistoryModal.addEventListener('click', () => {
            closeModal(orderHistoryModal);
        });
    }
    
    // 模态框关闭按钮点击事件
    closeCartModal.addEventListener('click', () => closeModal(cartModal));
    closeAdminLoginModal.addEventListener('click', () => closeModal(adminLoginModal));
    closeAddItemModal.addEventListener('click', () => closeModal(addItemModal));
    closeOrderSuccessModal.addEventListener('click', () => closeModal(orderSuccessModal));
    closeOrderHistoryModal.addEventListener('click', () => closeModal(orderHistoryModal));
    
    // 表单提交事件
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    if (addItemForm) {
        addItemForm.addEventListener('submit', handleAddItem);
    }
});

// 点击模态框外部关闭模态框
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// 键盘Esc键关闭模态框
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// 管理员登录表单提交事件
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (data.code === 200) {
            // 登录成功
            showNotification('管理员登录成功', 'success');
            closeModal(adminLoginModal);
            // 显示添加菜品按钮
            showAddItemButton();
        } else {
            // 登录失败
            showNotification('密码错误，请重试', 'error');
        }
    } catch (error) {
        console.error('管理员登录失败:', error);
        showNotification('登录失败，请稍后重试', 'error');
    }
    
    // 重置表单
    adminLoginForm.reset();
}

// 显示添加菜品按钮
function showAddItemButton() {
    // 先检查是否已经存在添加菜品按钮
    if (document.querySelector('.add-item-btn')) {
        return;
    }
    
    const addItemButton = document.createElement('button');
    addItemButton.className = 'admin-btn add-item-btn glass-effect';
    addItemButton.textContent = '+ 添加菜品';
    addItemButton.onclick = () => openModal(addItemModal);
    
    const headerRight = document.querySelector('.header-right');
    // 检查headerRight是否存在
    if (headerRight) {
        headerRight.insertBefore(addItemButton, headerRight.firstChild);
    }
}

// 添加菜品表单提交事件
async function handleAddItem(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('itemName').value;
    const itemCategory = document.getElementById('itemCategory').value;
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);
    const itemImage = document.getElementById('itemImage').value;
    
    // 表单验证
    if (!itemName || isNaN(itemPrice) || itemPrice <= 0) {
        showNotification('请填写完整且有效的菜品信息', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: itemName,
                category: itemCategory,
                price: itemPrice,
                image: itemImage
            })
        });
        
        const data = await response.json();
        
        if (data.code === 200) {
            // 添加成功
            showNotification('菜品添加成功', 'success');
            closeModal(addItemModal);
            // 重新加载菜单数据
            await loadMenu();
            renderMenu();
        } else {
            // 添加失败
            showNotification(data.msg || '菜品添加失败', 'error');
        }
    } catch (error) {
        console.error('添加菜品失败:', error);
        showNotification('添加菜品失败，请稍后重试', 'error');
    }
    
    // 重置表单
    addItemForm.reset();
}

// 导出全局函数
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.viewOrderHistory = viewOrderHistory;