const API_BASE = '/api';

async function request (endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.msg || 'Error');
  return json.data || json;
}

// 核心功能接口
export const getMenu = () => request('/menu');
export const submitOrder = (items, userId) => request('/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items, user_id: userId })
});

export const getOrder = (orderId) => request(`/order/${orderId}`);
export const getOrders = (userId = null) => {
  const endpoint = userId ? `/orders?user_id=${userId}` : '/orders';
  return request(endpoint);
};

// 用户接口
export const registerUser = (userData) => request('/user/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});

export const loginUser = (userData) => request('/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});

// 订单状态管理接口
export const updateOrderStatus = (orderId, status) => request(`/order/${orderId}/status`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status })
});

// 管理员接口 (关键！之前可能缺了这部分)
export const adminLogin = (adminData) => request('/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(adminData)
});

export const saveItem = (itemData) => request('/admin/item', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(itemData)
});
