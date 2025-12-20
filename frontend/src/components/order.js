// 订单管理功能组件

import * as api from '../api.js';
import * as auth from './auth.js';

// 获取订单历史
export async function getOrderHistory() {
  try {
    const user = auth.getCurrentUser();
    const orders = await api.getOrders(user?.user_id || null);
    return orders.data || [];
  } catch (error) {
    console.error('获取订单历史失败:', error);
    return [];
  }
}

// 获取订单详情
export async function getOrderDetails(orderId) {
  try {
    const order = await api.getOrder(orderId);
    return order.data;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return null;
  }
}

// 提交订单
export async function submitNewOrder(items) {
  try {
    const user = auth.getCurrentUser();
    const result = await api.submitOrder(items, user?.user_id || null);
    return result;
  } catch (error) {
    console.error('提交订单失败:', error);
    throw error;
  }
}

// 更新订单状态（管理员功能）
export async function updateOrderStatus(orderId, status) {
  try {
    const result = await api.updateOrderStatus(orderId, status);
    return result;
  } catch (error) {
    console.error('更新订单状态失败:', error);
    throw error;
  }
}

// 格式化订单状态显示
export function formatOrderStatus(status) {
  switch (status) {
    case 'pending':
      return { text: '待处理', class: 'status-pending' };
    case 'processing':
      return { text: '处理中', class: 'status-processing' };
    case 'completed':
      return { text: '已完成', class: 'status-completed' };
    case 'cancelled':
      return { text: '已取消', class: 'status-cancelled' };
    default:
      return { text: '未知状态', class: 'status-unknown' };
  }
}

// 格式化订单时间
export function formatOrderTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
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
