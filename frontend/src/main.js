import './styles/main.css';
import { getMenu, submitOrder, adminLogin, saveItem } from './api.js';

// === 全局状态 ===
const state = {
  menu: {},
  cart: {},
  activeCategory: 'All',
  isAdmin: false
};

// === 初始化 ===
async function init() {
  console.log('🚀 系统启动...');
  setupEventListeners();
  // 恢复管理员状态
  if(sessionStorage.getItem('isAdmin') === 'true') {
    enableAdminMode();
  }
  await loadMenuData();
}

// === 数据加载 ===
async function loadMenuData() {
  const loading = document.getElementById('loading');
  try {
    state.menu = await getMenu();
    console.log('✅ 菜单数据:', state.menu);
    renderCategories();
    renderMenu();
  } catch (err) {
    console.error('❌ 数据加载失败:', err);
    if(loading) loading.innerText = '无法连接服务器 (请检查后端)';
    // 只有在完全无数据时才提示，避免刷新时的闪烁打扰
    if(Object.keys(state.menu).length === 0) {
        alert("连接后端失败！\n请确认：\n1. 黑窗口是否正在运行？\n2. 是否看到了 'Backend running' 字样？");
    }
  } finally {
    if(loading) loading.style.display = 'none';
  }
}

// === 渲染逻辑 ===
function renderCategories() {
  const categories = new Set(['All']);
  Object.values(state.menu).forEach(item => categories.add(item.category || '其他'));
  
  const bar = document.getElementById('category-bar');
  if(!bar) return;
  bar.innerHTML = '';
  
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-btn ${cat === state.activeCategory ? 'active' : ''}`;
    btn.innerText = cat;
    btn.onclick = () => {
      state.activeCategory = cat;
      renderCategories();
      filterMenu();
    };
    bar.appendChild(btn);
  });
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  if(!grid) return;
  grid.innerHTML = '';
  
  const items = Object.entries(state.menu);
  if (items.length === 0) {
    grid.innerHTML = '<div style="padding:20px; text-align:center; width:100%;">暂无菜品<br>请点击右上角 Admin 添加</div>';
    return;
  }

  items.forEach(([name, info]) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.name = name;
    card.dataset.category = info.category || '其他';
    
    // 管理员编辑按钮
    const editBtn = state.isAdmin 
      ? `<button class="edit-btn" style="position:absolute;top:10px;right:10px;z-index:10;background:white;padding:4px 8px;cursor:pointer;border-radius:4px;border:1px solid #ddd;">✏️ 编辑</button>` 
      : '';

    // 图片处理
    const imgUrl = (info.image && info.image.startsWith('http')) 
      ? info.image 
      : 'https://via.placeholder.com/300x200?text=Delicious';

    card.innerHTML = `
      <div class="card-img" style="background-image: url('${imgUrl}'); position:relative;">${editBtn}</div>
      <div class="card-content">
        <div class="card-tag">${info.category || '未分类'}</div>
        <div class="card-title">${name}</div>
        <div class="card-price">¥${Number(info.price).toFixed(2)}</div>
        <button class="btn add-btn">加入购物车</button>
      </div>
    `;

    // 绑定事件
    const addBtn = card.querySelector('.add-btn');
    if(addBtn) addBtn.onclick = () => addToCart(name);
    
    if(state.isAdmin) {
      const editBtnEl = card.querySelector('.edit-btn');
      if(editBtnEl) editBtnEl.onclick = (e) => {
        e.stopPropagation();
        openModal(name, info);
      };
    }
    
    grid.appendChild(card);
  });
  filterMenu();
}

function filterMenu() {
  const searchInput = document.getElementById('global-search');
  const grid = document.getElementById('menu-grid');
  if (!grid || !searchInput) return;

  const keyword = searchInput.value.toLowerCase().trim();
  Array.from(grid.children).forEach(card => {
    if(!card.dataset.name) return;
    const name = card.dataset.name.toLowerCase();
    const cat = card.dataset.category;
    const matchCat = state.activeCategory === 'All' || cat === state.activeCategory;
    const matchKey = name.includes(keyword);
    card.style.display = (matchCat && matchKey) ? 'flex' : 'none';
  });
}

// === 购物车逻辑 ===
function addToCart(name) {
  state.cart[name] = (state.cart[name] || 0) + 1;
  updateCartUI();
  // 简单的添加反馈动画
  const btn = document.getElementById('cart-toggle-btn');
  if(btn) {
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => btn.style.transform = 'scale(1)', 200);
  }
}

function updateCartUI() {
  const container = document.getElementById('cart-items');
  if(!container) return;
  container.innerHTML = '';
  
  let total = 0, count = 0;
  Object.entries(state.cart).forEach(([name, qty]) => {
    const info = state.menu[name];
    if(info) {
      const itemTotal = info.price * qty;
      total += itemTotal;
      count += qty;
      const div = document.createElement('div');
      div.className = 'cart-item'; // 确保 CSS 有对应样式，或者直接写 style
      div.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #eee;';
      div.innerHTML = `
        <span>${name} <small style="color:#666;">x${qty}</small></span> 
        <b>¥${itemTotal.toFixed(2)}</b>
      `;
      container.appendChild(div);
    }
  });

  safeSetText('drawer-total-price', `¥${total.toFixed(2)}`);
  safeSetText('cart-badge', count);
  
  const checkoutBtn = document.getElementById('checkout-btn');
  if(checkoutBtn) {
      checkoutBtn.disabled = (count === 0);
      checkoutBtn.style.opacity = (count === 0) ? '0.5' : '1';
  }
}

// === 管理员与交互 ===
function enableAdminMode() {
  state.isAdmin = true;
  safeDisplay('admin-toolbar', 'flex');
  safeDisplay('admin-login-btn', 'none');
  sessionStorage.setItem('isAdmin', 'true');
  renderMenu();
}

function disableAdminMode() {
  state.isAdmin = false;
  safeDisplay('admin-toolbar', 'none');
  safeDisplay('admin-login-btn', 'block');
  sessionStorage.removeItem('isAdmin');
  renderMenu();
}

function openModal(name = '', info = {}) {
  safeDisplay('item-modal', 'flex');
  safeSetValue('input-name', name);
  const nameInput = document.getElementById('input-name');
  if(nameInput) nameInput.disabled = !!name; // 编辑模式下禁止改名，防止 ID 错乱
  
  safeSetValue('input-price', info.price || '');
  safeSetValue('input-category', info.category || '');
  safeSetValue('input-image', info.image || '');
  safeSetText('modal-title', name ? '编辑菜品' : '添加新菜品');
}

// === 事件监听 ===
function setupEventListeners() {
  const bind = (id, event, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  };

  bind('admin-login-btn', 'click', async () => {
    const pwd = prompt("请输入管理员密码 (admin123):");
    if(pwd) {
      try { await adminLogin(pwd); enableAdminMode(); } 
      catch(e) { alert("密码错误"); }
    }
  });

  bind('logout-btn', 'click', disableAdminMode);
  
  // 搜索相关
  bind('search-trigger', 'click', () => {
    const el = document.getElementById('search-overlay');
    if(el) el.classList.add('active');
    setTimeout(() => document.getElementById('global-search')?.focus(), 100);
  });
  bind('close-search', 'click', () => {
    const el = document.getElementById('search-overlay');
    if(el) el.classList.remove('active');
  });
  bind('global-search', 'input', filterMenu);

  // 购物车开关逻辑
  const toggleCart = (open) => {
    const drawer = document.getElementById('cart-drawer');
    const bg = document.getElementById('drawer-backdrop');
    if(open) {
        if(drawer) drawer.classList.add('open');
        if(bg) bg.classList.add('open');
    } else {
        if(drawer) drawer.classList.remove('open');
        if(bg) bg.classList.remove('open');
    }
  };
  bind('cart-toggle-btn', 'click', () => toggleCart(true));
  bind('close-drawer', 'click', () => toggleCart(false));
  bind('drawer-backdrop', 'click', () => toggleCart(false));

  // 结算按钮 (修复了之前的 Bug)
  bind('checkout-btn', 'click', async () => {
    if(Object.keys(state.cart).length === 0) return;
    
    const items = Object.entries(state.cart).flatMap(([n, c]) => Array(c).fill(n));
    try {
        await submitOrder(items);
        state.cart = {}; 
        updateCartUI();
        toggleCart(false); // <--- 这里之前写错了，现已修复
        
        const success = document.getElementById('success-modal');
        if(success) success.classList.add('show');
    } catch(e) {
        alert("下单失败: " + e.message);
    }
  });

  bind('success-close-btn', 'click', () => {
    const success = document.getElementById('success-modal');
    if(success) success.classList.remove('show');
  });

  bind('add-item-btn', 'click', () => openModal());
  bind('modal-cancel', 'click', () => safeDisplay('item-modal', 'none'));
  
  // 表单提交
  const form = document.getElementById('item-form');
  if(form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : '保存';
      if(submitBtn) {
          submitBtn.innerText = "保存中...";
          submitBtn.disabled = true;
      }

      try {
        const data = {
          name: document.getElementById('input-name').value,
          price: document.getElementById('input-price').value,
          category: document.getElementById('input-category').value,
          image: document.getElementById('input-image').value
        };

        await saveItem(data);
        alert("🎉 保存成功！");
        safeDisplay('item-modal', 'none');
        await loadMenuData(); // 重新拉取数据刷新界面

      } catch (err) {
        alert("❌ 保存失败：\n" + err.message);
      } finally {
         if(submitBtn) {
             submitBtn.innerText = originalText;
             submitBtn.disabled = false;
         }
      }
    };
  }
}

// 辅助工具
function safeDisplay(id, val) { const el = document.getElementById(id); if(el) el.style.display = val; }
function safeSetText(id, val) { const el = document.getElementById(id); if(el) el.innerText = val; }
function safeSetValue(id, val) { const el = document.getElementById(id); if(el) el.value = val; }

// 启动
init();