// 订单管理功能组件

import * as api from '../api.js';
import * as auth from './auth.js';

// 获取订单历史
export async function getOrderHistory () {
  try {
    const user = auth.getCurrentUser();
    const orders = await api.getOrders(user?.user_id || null);
    return { code: 200, data: orders || [] };
  } catch (error) {
    console.error('获取订单历史失败:', error);
    return { code: 500, msg: '获取订单历史失败', data: [] };
  }
}

// 获取订单详情
export async function getOrderDetails (orderId) {
  try {
    const order = await api.getOrder(orderId);
    return order;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return null;
  }
}

// 提交订单
export async function submitNewOrder (items) {
  try {
    const user = auth.getCurrentUser();
    return await api.submitOrder(items, user?.user_id || null);
  } catch (error) {
    console.error('提交订单失败:', error);
    throw error;
  }
}

// 更新订单状态（管理员功能）
export async function updateOrderStatus (orderId, status) {
  try {
    return await api.updateOrderStatus(orderId, status);
  } catch (error) {
    console.error('更新订单状态失败:', error);
    throw error;
  }
}

// 格式化订单状态显示
export function formatOrderStatus (status) {
  const statusMap = {
    pending: { text: '待处理', class: 'status-pending' },
    processing: { text: '处理中', class: 'status-processing' },
    completed: { text: '已完成', class: 'status-completed' },
    cancelled: { text: '已取消', class: 'status-cancelled' }
  };
  return statusMap[status] || { text: '未知状态', class: 'status-unknown' };
}

// 格式化订单时间
export function formatOrderTime (dateString) {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 导出所有订单相关函数
export default {
  getOrderHistory,
  getOrderDetails,
  submitNewOrder,
  updateOrderStatus,
  formatOrderStatus,
  formatOrderTime
};
