// [修复 4] 删除/注释 CSS 导入，防止脚本执行中断
// import './styles/glassmorphism.css';

// 导入模块化组件
import * as auth from './components/auth.js';
import * as cartModule from './components/cart.js';
import * as menuModule from './components/menu.js';
import * as orderModule from './components/order.js';
import * as api from './api.js';

// 全局DOM元素引用
let menuGrid;
let searchInput;
let searchBtn;
let categoryTabs;
let cartBtn;
// let cartCount; // 移除未使用的变量
let adminLoginBtn;
let userLoginBtn;
let userRegisterBtn;

// 模态框元素
let cartModal;
let adminLoginModal;
let addItemModal;
let orderSuccessModal;
let orderHistoryModal;
let userLoginModal;
let userRegisterModal;

// 模态框关闭按钮
let closeCartModal;
let closeAdminLoginModal;
let closeAddItemModal;
let closeOrderSuccessModal;
let closeOrderHistoryModal;
let closeUserLoginModal;
let closeUserRegisterModal;
// let closeHistoryBtn; // 移除未使用的变量

// 表单元素
let adminLoginForm;
let addItemForm;
let userLoginForm;
let userRegisterForm;

// 按钮元素
let clearCartBtn;
let submitOrderBtn;
let continueShoppingBtn;
let viewHistoryBtn;
// let closeHistoryBtn; // 移除未使用的变量
let switchToRegisterBtn;
let switchToLoginBtn;

// 购物车通过cartModule管理

// 订单数据
let orders = [];

// 初始化应用
async function initApp () {
  try {
    // 初始化认证组件
    auth.initAuth();

    // 初始化购物车组件
    cartModule.initCart();

    // 检查用户登录状态
    updateUserInterface();

    // 加载菜单数据
    await menuModule.fetchMenu();
    // 渲染菜单
    renderMenu();
    // 更新购物车数量
    updateCartCount();
    // 加载订单历史
    await loadOrderHistory();
  } catch (error) {
    console.error('初始化应用失败:', error);
    showNotification('应用初始化失败，请刷新页面重试', 'error');
  }
}

// 渲染菜单
function renderMenu (filteredMenu = null) {
  // 将数组转换为对象格式以保持现有代码兼容
  const allItems = menuModule.getMenuItemsByCategory('all');
  const menuArray = filteredMenu || allItems;

  const displayMenu = menuArray.reduce((obj, item) => {
    obj[item.name] = item;
    return obj;
  }, {});

  if (Object.keys(displayMenu).length === 0) {
    menuGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>没有找到菜品</h3>
                <p>请尝试其他搜索关键词或分类</p>
            </div>
        `;
    return;
  }

  const menuHTML = Object.entries(displayMenu).map(([name, item]) => `
        <div class="menu-item glass-effect">
            <div class="menu-item-image" style="background-image: url(${item.image || 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22 width%3d%22320%22 height%3d%22250%22 viewBox%3d%220 0 320 250%22%3e%3crect width%3d%22320%22 height%3d%22250%22 fill%3d%22%23f0f0f0%22%2f%3e%3ctext x%3d%22160%22 y%3d%22125%22 font-size%3d%2218%22 text-anchor%3d%22middle%22 fill%3d%22%23999%22 dominant-baseline%3d%22middle%22%3eNo Image%3c%2ftext%3e%3c%2fsvg%3e'});">
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

  menuGrid.innerHTML = menuHTML;
}

// 搜索功能
async function searchMenu () {
  const keyword = searchInput.value.toLowerCase();
  const searchResults = menuModule.searchMenuItems(keyword);
  renderMenu(searchResults);
}

// 分类筛选
function filterMenuByCategory (category) {
  if (category === 'all') {
    renderMenu();
  } else {
    const filteredMenu = menuModule.getMenuItemsByCategory(category);
    renderMenu(filteredMenu);
  }
}

// 添加到购物车
function addToCart (itemName) {
  const item = menuModule.getMenuItemByName(itemName);
  if (!item) {
    console.error('商品不存在:', itemName);
    showNotification('商品不存在', 'error');
    return;
  }

  // 使用购物车组件添加商品
  cartModule.addToCart(item);

  // 更新购物车数量显示
  updateCartCount();
  // 显示添加成功通知
  showNotification(`${itemName} 已添加到购物车`, 'success');
}

// 从购物车移除
function removeFromCart (itemName) {
  cartModule.removeFromCart(itemName);
  updateCartCount();
  renderCartItems();
  calculateCartTotal();
}

// 更新购物车商品数量
function updateCartItemQuantity (itemName, change) {
  const item = cartModule.getCartItems().find(item => item.name === itemName);
  if (!item) return;

  const newQuantity = item.quantity + change;
  cartModule.updateCartItemQuantity(itemName, newQuantity);

  updateCartCount();
  renderCartItems();
  calculateCartTotal();
}

// 更新购物车数量显示
function updateCartCount () {
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    const cartCount = cartBtn.querySelector('.cart-count');
    if (cartCount) {
      const totalItems = cartModule.getCartItemCount();
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }
}

// 清空购物车
function clearCart () {
  cartModule.clearCart();
  updateCartCount();
  renderCartItems();
  calculateCartTotal();
  showNotification('购物车已清空', 'info');
}

// 渲染购物车商品
function renderCartItems () {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartItems = cartModule.getCartItems();

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>购物车是空的</h3>
                <p>快去添加一些美食吧！</p>
            </div>
        `;
    return;
  }

  cartItemsContainer.innerHTML = cartItems.map(item => `
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
function calculateCartTotal () {
  const total = cartModule.getCartTotal();
  document.getElementById('cartTotal').textContent = `¥${total.toFixed(2)}`;
  return total;
}

// 保存购物车到本地存储
// function saveCart () {
//   localStorage.setItem('cart', JSON.stringify(cart));
// }

// 从本地存储加载购物车
// function loadCart () {
//   const savedCart = localStorage.getItem('cart');
//   if (savedCart) {
//     cart = JSON.parse(savedCart);
//   }
// }

// 用户登录处理
async function handleUserLogin (e) {
  e.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.code === 200) {
      // 保存用户信息到localStorage
      auth.saveUserToStorage(result.data);

      showNotification('登录成功', 'success');
      closeModal(userLoginModal);
      if (userLoginForm) {
        userLoginForm.reset();
      }

      // 更新用户界面
      updateUserInterface();
    } else {
      showNotification(result.msg, 'error');
    }
  } catch (error) {
    console.error('登录失败:', error);
    showNotification('网络错误，请稍后重试', 'error');
  }
}

// 用户注册处理
async function handleUserRegister (e) {
  e.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const phone = document.getElementById('registerPhone').value;

  try {
    const response = await fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, phone })
    });

    const result = await response.json();
    if (result.code === 200) {
      showNotification('注册成功，请登录', 'success');
      closeModal(userRegisterModal);
      userRegisterForm.reset();
      openModal(userLoginModal);
    } else {
      showNotification(result.msg, 'error');
    }
  } catch (error) {
    console.error('注册失败:', error);
    showNotification('网络错误，请稍后重试', 'error');
  }
}

// 更新用户界面
function updateUserInterface () {
  const currentUser = auth.getCurrentUser();
  if (currentUser) {
    // 用户已登录，显示用户名
    if (userLoginBtn) {
      userLoginBtn.textContent = currentUser.username;
    }
    if (userRegisterBtn) {
      userRegisterBtn.textContent = '退出登录';
      userRegisterBtn.onclick = logoutUser;
    }
  } else {
    // 用户未登录，显示登录/注册按钮
    if (userLoginBtn) {
      userLoginBtn.textContent = '用户登录';
      userLoginBtn.onclick = () => openModal(userLoginModal);
    }
    if (userRegisterBtn) {
      userRegisterBtn.textContent = '注册';
      userRegisterBtn.onclick = () => openModal(userRegisterModal);
    }
  }
}

// 用户退出登录
function logoutUser () {
  auth.clearUserFromStorage();
  showNotification('已退出登录', 'info');
  updateUserInterface();
}

// 提交订单
async function submitOrder () {
  const cartItems = cartModule.getCartItems();
  if (cartItems.length === 0) {
    showNotification('购物车是空的，请先添加商品', 'error');
    return;
  }

  // 检查用户是否登录
  if (!auth.isLoggedIn()) {
    showNotification('请先登录', 'warning');
    closeModal(cartModal);
    openModal(userLoginModal);
    return;
  }

  try {
    const orderResult = await orderModule.submitNewOrder(cartItems);

    if (orderResult.code === 200) {
      // 订单提交成功
      showOrderSuccess(orderResult.data);
      // 清空购物车
      clearCart();
      // 加载订单历史
      await loadOrderHistory();
    } else {
      throw new Error(orderResult.msg || '订单提交失败');
    }
  } catch (error) {
    console.error('提交订单失败:', error);
    showNotification('订单提交失败，请稍后重试', 'error');
  }
}

// 显示订单成功信息
function showOrderSuccess (orderData) {
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
async function loadOrderHistory () {
  try {
    const result = await orderModule.getOrderHistory();

    if (result.code === 200) {
      orders = result.data;
    } else {
      throw new Error(result.msg || '加载订单历史失败');
    }
  } catch (error) {
    console.error('加载订单历史失败:', error);
    orders = [];
  }
}

// 显示订单历史
async function viewOrderHistory () {
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
    orderHistoryList.innerHTML = orders.map(order => {
      // 获取订单状态的中文显示
      let statusText;
      switch (order.status) {
        case 'pending':
          statusText = '待处理';
          break;
        case 'processing':
          statusText = '处理中';
          break;
        case 'completed':
          statusText = '已完成';
          break;
        case 'cancelled':
          statusText = '已取消';
          break;
        default:
          statusText = '未知状态';
      }

      return `
            <div class="order-history-item">
                <div class="order-history-header">
                    <div class="order-history-id">订单号: ${order.order_id}</div>
                    <div class="order-history-status ${order.status}">
                        ${statusText}
                    </div>
                </div>
                <div class="order-history-details">
                    <p>下单时间: ${order.created_at}</p>
                    <p>订单金额: ¥${order.total_price.toFixed(2)}</p>
                    <p>商品数量: ${order.items.length} 件</p>
                </div>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="order-item-name">${item.name}</div>
                            <div class="order-item-quantity">×${item.quantity}</div>
                            <div class="order-item-price">¥${item.price.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
  }

  // 显示订单历史模态框
  orderHistoryModal.classList.add('show');
}

// 显示通知
function showNotification (message, type = 'info') {
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
function openModal (modal) {
  if (modal) {
    modal.classList.add('show');
  } else {
    console.error('Modal element is null');
  }
}

function closeModal (modal) {
  modal.classList.remove('show');
}

// 关闭所有模态框
function closeAllModals () {
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
  // cartCount = document.getElementById('cartCount'); // 移除未使用的变量引用
  adminLoginBtn = document.getElementById('adminLoginBtn');

  // 获取模态框元素
  cartModal = document.getElementById('cartModal');
  adminLoginModal = document.getElementById('adminLoginModal');
  addItemModal = document.getElementById('addItemModal');
  orderSuccessModal = document.getElementById('orderSuccessModal');
  orderHistoryModal = document.getElementById('orderHistoryModal');
  userLoginModal = document.getElementById('userLoginModal');
  userRegisterModal = document.getElementById('userRegisterModal');

  // 获取模态框关闭按钮
  closeCartModal = document.getElementById('closeCartModal');
  closeAdminLoginModal = document.getElementById('closeAdminLoginModal');
  closeAddItemModal = document.getElementById('closeAddItemModal');
  closeOrderSuccessModal = document.getElementById('closeOrderSuccessModal');
  closeOrderHistoryModal = document.getElementById('closeOrderHistoryModal');
  closeUserLoginModal = document.getElementById('closeUserLoginModal');
  closeUserRegisterModal = document.getElementById('closeUserRegisterModal');

  // 获取表单元素
  adminLoginForm = document.getElementById('adminLoginForm');
  addItemForm = document.getElementById('addItemForm');

  // 获取按钮元素
  clearCartBtn = document.getElementById('clearCartBtn');
  submitOrderBtn = document.getElementById('submitOrderBtn');
  continueShoppingBtn = document.getElementById('continueShoppingBtn');
  viewHistoryBtn = document.getElementById('viewHistoryBtn');
  // closeHistoryBtn = document.getElementById('closeHistoryBtn'); // 移除未使用的变量引用
  userLoginBtn = document.getElementById('userLoginBtn');
  userRegisterBtn = document.getElementById('userRegisterBtn');

  // 初始化应用
  await initApp();

  // 事件监听器

  // 搜索按钮点击事件
  if (searchBtn) searchBtn.addEventListener('click', searchMenu);

  // 搜索输入框回车事件
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchMenu();
      }
    });
  }

  // 分类标签点击事件
  if (categoryTabs && categoryTabs.length > 0) {
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
  }

  // 添加到购物车按钮点击事件（事件委托）
  if (menuGrid) {
    menuGrid.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        const itemName = addToCartBtn.dataset.itemName;
        addToCart(itemName);
      }
    });
  }

  // 购物车按钮点击事件
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      renderCartItems();
      calculateCartTotal();
      openModal(cartModal);
    });
  }

  // 管理员登录按钮点击事件
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
      openModal(adminLoginModal);
    });
  }

  // 清空购物车按钮点击事件
  if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);

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
  if (closeCartModal) closeCartModal.addEventListener('click', () => closeModal(cartModal));
  if (closeAdminLoginModal) closeAdminLoginModal.addEventListener('click', () => closeModal(adminLoginModal));
  if (closeAddItemModal) closeAddItemModal.addEventListener('click', () => closeModal(addItemModal));
  if (closeOrderSuccessModal) closeOrderSuccessModal.addEventListener('click', () => closeModal(orderSuccessModal));
  if (closeOrderHistoryModal) closeOrderHistoryModal.addEventListener('click', () => closeModal(orderHistoryModal));
  if (closeUserLoginModal) closeUserLoginModal.addEventListener('click', () => closeModal(userLoginModal));
  if (closeUserRegisterModal) closeUserRegisterModal.addEventListener('click', () => closeModal(userRegisterModal));

  // 用户相关模态框事件
  if (userLoginBtn) {
    userLoginBtn.addEventListener('click', () => openModal(userLoginModal));
  }
  if (userRegisterBtn) {
    userRegisterBtn.addEventListener('click', () => openModal(userRegisterModal));
  }

  // 切换登录/注册模态框
  if (switchToRegisterBtn) {
    switchToRegisterBtn.addEventListener('click', () => {
      closeModal(userLoginModal);
      openModal(userRegisterModal);
    });
  }
  if (switchToLoginBtn) {
    switchToLoginBtn.addEventListener('click', () => {
      closeModal(userRegisterModal);
      openModal(userLoginModal);
    });
  }

  // 表单提交事件
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }
  if (addItemForm) {
    addItemForm.addEventListener('submit', handleAddItem);
  }
  if (userLoginForm) {
    userLoginForm.addEventListener('submit', handleUserLogin);
  }
  if (userRegisterForm) {
    userRegisterForm.addEventListener('submit', handleUserRegister);
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
async function handleAdminLogin (e) {
  e.preventDefault();

  const password = document.getElementById('adminPassword').value;

  try {
    // 使用api.js中的adminLogin函数，确保一致的错误处理
    await api.adminLogin({ password });

    // 登录成功
    showNotification('管理员登录成功', 'success');
    closeModal(adminLoginModal);
    // 显示添加菜品按钮
    showAddItemButton();
  } catch (error) {
    console.error('管理员登录失败:', error);
    showNotification(error.message || '登录失败，请稍后重试', 'error');
  }

  // 重置表单
  adminLoginForm.reset();
}

// 显示添加菜品按钮
function showAddItemButton () {
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
async function handleAddItem (e) {
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
    const response = await fetch('/api/admin/item', {
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
      await menuModule.fetchMenu();
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
