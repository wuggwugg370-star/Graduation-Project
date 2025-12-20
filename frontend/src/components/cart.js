// 购物车功能组件

// 存储购物车数据
let cartItems = [];

// 从localStorage加载购物车数据
function loadCartFromStorage() {
  const cartData = localStorage.getItem('neo_dining_cart');
  if (cartData) {
    cartItems = JSON.parse(cartData);
  }
}

// 保存购物车数据到localStorage
function saveCartToStorage() {
  localStorage.setItem('neo_dining_cart', JSON.stringify(cartItems));
}

// 添加商品到购物车
export function addToCart(item, quantity = 1) {
  const existingItem = cartItems.find(cartItem => cartItem.name === item.name);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartItems.push({
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.image,
      category: item.category
    });
  }
  
  saveCartToStorage();
}

// 从购物车移除商品
export function removeFromCart(itemName) {
  cartItems = cartItems.filter(item => item.name !== itemName);
  saveCartToStorage();
}

// 更新商品数量
export function updateCartItemQuantity(itemName, quantity) {
  const item = cartItems.find(cartItem => cartItem.name === itemName);
  if (item) {
    if (quantity <= 0) {
      removeFromCart(itemName);
    } else {
      item.quantity = quantity;
      saveCartToStorage();
    }
  }
}

// 清空购物车
export function clearCart() {
  cartItems = [];
  saveCartToStorage();
}

// 获取购物车商品列表
export function getCartItems() {
  return [...cartItems];
}

// 获取购物车总金额
export function getCartTotal() {
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// 获取购物车商品数量
export function getCartItemCount() {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
}

// 初始化购物车功能
export function initCart() {
  loadCartFromStorage();
}

// 导出所有购物车相关函数
export default {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  getCartItems,
  getCartTotal,
  getCartItemCount,
  initCart
};
