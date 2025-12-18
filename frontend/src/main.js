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
  if(sessionStorage.getItem('isAdmin') === 'true') {
    enableAdminMode();
  }
  await loadMenuData();
}

// === 数据加载 ===
async function loadMenuData() {
  const loading = document.getElementById('loading');
  try {
    const data = await getMenu();
    // === 关键修改：检查数据是否为空 ===
    if (!data || Object.keys(data).length === 0) {
        console.warn('⚠️ 后端返回了空菜单数据');
        state.menu = {}; 
    } else {
        state.menu = data;
    }
    console.log('✅ 菜单数据:', state.menu);
    renderCategories();
    renderMenu();
  } catch (err) {
    console.error('❌ 数据加载失败:', err);
    if(loading) loading.innerText = '无法连接服务器 (Connection Error)';
    alert("连接后端失败，请确保黑窗口正在运行！");
  } finally {
    if(loading) loading.style.display = 'none';
  }
}

// === 渲染逻辑 ===
function renderCategories() {
  const categories = new Set(['All']);
  Object.values(state.menu).forEach(item => {
      // 防止 item 为空导致报错
      if(item && item.category) {
          categories.add(item.category);
      } else {
          categories.add('其他');
      }
  });
  
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
  
  // 如果真的没数据，显示友好提示
  if (items.length === 0) {
    grid.innerHTML = `
      <div style="padding:40px; text-align:center; width:100%; color:#666;">
        <h3>暂无菜品数据</h3>
        <p>系统未检测到菜单数据。</p>
        <p>请联系管理员添加，或检查后端 menu_data.json 文件。</p>
      </div>`;
    return;
  }

  items.forEach(([name, info]) => {
    // 防御性编程：确保 info 对象存在
    if (!info) return;

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.name = name;
    card.dataset.category = info.category || '其他';
    
    const editBtn = state.isAdmin 
      ? `<button class="edit-btn" style="position:absolute;top:10px;right:10px;z-index:10;background:white;padding:4px 8px;cursor:pointer;border-radius:4px;border:1px solid #ddd;">✏️ 编辑</button>` 
      : '';

    const imgUrl = (info.image && info.image.startsWith('http')) 
      ? info.image 
      : 'https://via.placeholder.com/300x200?text=Food';

    // 使用 textContent 避免 XSS 的简单处理（或者保持 innerHTML 但小心使用）
    card.innerHTML = `
      <div class="card-img" style="background-image: url('${imgUrl}'); position:relative;">${editBtn}</div>
      <div class="card-content">
        <div class="card-tag">${info.category || '未分类'}</div>
        <div class="card-title">${name}</div>
        <div class="card-price">¥${Number(info.price || 0).toFixed(2)}</div>
        <button class="btn add-btn">加入购物车</button>
      </div>
    `;

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

// === 购物车逻辑 (保持不变) ===
function addToCart(name) {
  state.cart[name] = (state.cart[name] || 0) + 1;
  updateCartUI();
  // 简单反馈
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
  if(checkoutBtn) checkoutBtn.disabled = (count === 0);
}

// === 管理员与交互 (保持不变) ===
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
  if(nameInput) nameInput.disabled = !!name; 
  
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
  
  bind('search-trigger', 'click', () => {
    const el = document.getElementById('search-overlay');
    if(el) el.classList.add('active');
  });
  bind('close-search', 'click', () => {
    const el = document.getElementById('search-overlay');
    if(el) el.classList.remove('active');
  });
  bind('global-search', 'input', filterMenu);

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

  bind('checkout-btn', 'click', async () => {
    if(Object.keys(state.cart).length === 0) return;
    const items = Object.entries(state.cart).flatMap(([n, c]) => Array(c).fill(n));
    try {
        await submitOrder(items);
        state.cart = {}; updateCartUI();
        toggleCart(false);
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
  
  const form = document.getElementById('item-form');
  if(form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if(submitBtn) submitBtn.innerText = "保存中...";

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
        await loadMenuData();
      } catch (err) {
        alert("❌ 保存失败：\n" + err.message);
      } finally {
         if(submitBtn) submitBtn.innerText = "保存";
      }
    };
  }
}

function safeDisplay(id, val) { const el = document.getElementById(id); if(el) el.style.display = val; }
function safeSetText(id, val) { const el = document.getElementById(id); if(el) el.innerText = val; }
function safeSetValue(id, val) { const el = document.getElementById(id); if(el) el.value = val; }

init();