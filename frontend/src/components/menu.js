// 菜单功能组件

import * as api from '../api.js';

// 存储菜单数据
let menuItems = [];

// 获取完整菜单
export async function fetchMenu () {
  try {
    console.log('开始获取菜单数据...');
    const response = await api.getMenu();
    console.log('菜单API响应:', JSON.stringify(response));

    menuItems = [];

    // 检查返回的数据格式
    if (response) {
      // 如果是字典格式（按菜品名称组织），转换为数组
      if (typeof response === 'object' && !Array.isArray(response)) {
        console.log('响应是对象格式，转换为数组...');
        // 从字典中提取所有菜品到数组
        for (const name in response) {
          if (Object.prototype.hasOwnProperty.call(response, name)) {
            // 添加菜品名称到每个菜品对象
            menuItems.push({ name, ...response[name] });
          }
        }
      } else if (Array.isArray(response)) {
        console.log('响应已是数组格式，直接使用...');
        // 如果已经是数组格式，直接使用
        menuItems = response;
      }
    }

    console.log('菜单数据加载完成，共加载', menuItems.length, '个菜品');
    return menuItems;
  } catch (error) {
    console.error('获取菜单失败:', error);
    return [];
  }
}

// 根据分类获取菜品
export function getMenuItemsByCategory (category) {
  if (category === 'all') {
    return [...menuItems];
  }
  return menuItems.filter(item => item.category === category);
}

// 搜索菜品
export function searchMenuItems (keyword) {
  if (!keyword) {
    return [...menuItems];
  }

  const searchTerm = keyword.toLowerCase();
  return menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm)
  );
}

// 获取所有分类
export function getCategories () {
  const categories = new Set();
  menuItems.forEach(item => categories.add(item.category));
  return Array.from(categories);
}

// 获取菜品详情
export function getMenuItemByName (name) {
  return menuItems.find(item => item.name === name);
}

// 保存菜品（管理员功能）
export async function saveMenuItem (item) {
  try {
    const result = await api.saveItem(item);
    // 更新本地菜单数据
    const index = menuItems.findIndex(menuItem => menuItem.name === item.name);
    if (index !== -1) {
      menuItems[index] = item;
    } else {
      menuItems.push(item);
    }
    return result;
  } catch (error) {
    console.error('保存菜品失败:', error);
    throw error;
  }
}

// 导出所有菜单相关函数
export default {
  fetchMenu,
  getMenuItemsByCategory,
  searchMenuItems,
  getCategories,
  getMenuItemByName,
  saveMenuItem
};
