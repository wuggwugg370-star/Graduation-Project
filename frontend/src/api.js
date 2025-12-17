const API_BASE = '/api';

/**
 * 统一请求封装
 */
async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const json = await res.json();
    
    if (json.code !== 200) {
      throw new Error(json.msg || 'Unknown Error');
    }
    return json.data;
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
}

export const getMenu = () => request('/menu');

export const submitOrder = (items) => request('/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items })
});

export const updateImage = (name, image) => request('/admin/menu', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, image })
});