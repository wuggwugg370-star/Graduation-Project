// 用户认证相关功能组件

// 存储当前登录用户信息
let currentUser = null;

// 从localStorage加载用户信息
function loadUserFromStorage() {
  const userData = localStorage.getItem('neo_dining_user');
  if (userData) {
    currentUser = JSON.parse(userData);
  }
}

// 保存用户信息到localStorage
function saveUserToStorage(userData) {
  localStorage.setItem('neo_dining_user', JSON.stringify(userData));
  currentUser = userData;
}

// 清除用户信息
function clearUserFromStorage() {
  localStorage.removeItem('neo_dining_user');
  currentUser = null;
}

// 检查用户是否已登录
export function isLoggedIn() {
  if (!currentUser) {
    loadUserFromStorage();
  }
  return !!currentUser;
}

// 获取当前登录用户信息
export function getCurrentUser() {
  if (!currentUser) {
    loadUserFromStorage();
  }
  return currentUser;
}

// 初始化用户认证功能
export function initAuth() {
  loadUserFromStorage();
}

// 导出所有认证相关函数
export default {
  isLoggedIn,
  getCurrentUser,
  saveUserToStorage,
  clearUserFromStorage,
  initAuth
};
