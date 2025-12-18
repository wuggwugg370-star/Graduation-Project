const API_BASE = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const json = await res.json();
    if (json.code !== 200) {
      throw new Error(json.msg || 'Error');
    }
    return json.data || json; // 有些接口返回data，有些只返回msg
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    throw error;
  }
}

export const getMenu = () => request('/menu');

export const submitOrder = (items) => request('/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items })
});

// 管理员接口
export const adminLogin = (password) => request('/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password })
});

export const saveItem = (itemData) => request('/admin/item', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(itemData)
});