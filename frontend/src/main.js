import './styles/main.css';
import { getMenu, submitOrder, adminLogin, saveItem } from './api.js';

const state = {
  menu: {},
  cart: {},
  activeCategory: 'All',
  isAdmin: false
};

async function init() {
  // === 调试探针：检查JS是否运行 ===
  console.log('🚀 系统启动中...'); 
  
  await loadData();
  setupEventListeners();
  // 恢复登录状态
  if(sessionStorage.getItem('isAdmin') === 'true') enableAdmin();
}

async function loadData() {
  const loading = document.getElementById('loading');
  try {
    console.log('📡 正在请求菜单数据...');
    state.menu = await getMenu();
    console.log('✅ 菜单数据获取成功:', state.menu);
    
    renderCategories();
    renderMenu();
  } catch (err) {
    console.error('❌ 数据加载失败:', err);
    if(loading) loading.innerText = '无法连接服务器 (Service Unavailable)';
  } finally {
    if(loading) loading.style.display = 'none';
  }
}

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
    grid.innerHTML = '<div style="padding:20px;">暂无菜品数据</div>';
    return;
  }

  items.forEach(([name, info]) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.category = info.category || '其他';
    card.dataset.name = name;
    
    const editBtn = state.isAdmin 
      ? `<button class="edit-btn" style="position:absolute;top:10px;right:10px;z-index:10;background:white;border:none;border-radius:10px;padding:5px;cursor:pointer;">✏️ Edit</button>` 
      : '';

    // 使用默认图片防止空图
    const imgUrl = info.image || 'https://via.placeholder.com/300x200?text=No+Image';

    card.innerHTML = `
      <div class="card-img" style="background-image: url('${imgUrl}'); position:relative;">${editBtn}</div>
      <div class="card-content">
        <div class="card-tag">${info.category}</div>
        <div class="card-title">${name}</div>
        <div class="card-price">¥${Number(info.price).toFixed(2)}</div>
        <button class="btn add-btn">Add</button>
      </div>
    `;

    card.querySelector('.add-btn').onclick = () => addToCart(name);
    
    if(state.isAdmin) {
      card.querySelector('.edit-btn').onclick = (e) => {
        e.stopPropagation();
        openModal(name, info);
      };
    }
    
    grid.appendChild(card);
  });
  filterMenu();
}

function filterMenu() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  const searchInput = document.getElementById('global-search');
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  
  Array.from(grid.children).forEach(card => {
    // 跳过非卡片元素（如“暂无数据”提示）
    if (!card.dataset.name) return;
    
    const name = card.dataset.name.toLowerCase();
    const cat = card.dataset.category;
    const matchCat = state.activeCategory === 'All' || cat === state.activeCategory;
    const matchSearch = name.includes(search);
    
    card.style.display = (matchCat && matchSearch) ? 'flex' : 'none';
  });
}

// --- 管理员功能 ---
function enableAdmin() {
  state.isAdmin = true;
  const toolbar = document.getElementById('admin-toolbar');
  const loginBtn = document.getElementById('admin-login-btn');
  if(toolbar) toolbar.style.display = 'flex';
  if(loginBtn) loginBtn.style.display = 'none';
  sessionStorage.setItem('isAdmin', 'true');
  renderMenu();
}

function disableAdmin() {
  state.isAdmin = false;
  const toolbar = document.getElementById('admin-toolbar');
  const loginBtn = document.getElementById('admin-login-btn');
  if(toolbar) toolbar.style.display = 'none';
  if(loginBtn) loginBtn.style.display = 'block';
  sessionStorage.removeItem('isAdmin');
  renderMenu();
}

// 模态框逻辑
const modal = document.getElementById('item-modal');
function openModal(name = '', info = {}) {
  if(!modal) return;
  modal.style.display = 'flex';
  document.getElementById('input-name').value = name;
  document.getElementById('input-name').disabled = !!name;
  document.getElementById('input-price').value = info.price || '';
  document.getElementById('input-category').value = info.category || '';
  document.getElementById('input-image').value = info.image || '';
  const title = document.getElementById('modal-title');
  if(title) title.innerText = name ? 'Edit Item' : 'Add New Item';
}

// --- 事件监听 ---
function setupEventListeners() {
  const searchTrigger = document.getElementById('search-trigger');
  const searchOverlay = document.getElementById('search-overlay');
  const closeSearch = document.getElementById('close-search');
  const globalSearch = document.getElementById('global-search');
  
  if(searchTrigger) searchTrigger.onclick = () => searchOverlay.classList.add('active');
  if(closeSearch) closeSearch.onclick = () => searchOverlay.classList.remove('active');
  if(globalSearch) globalSearch.oninput = filterMenu;

  // 购物车
  const toggleCart = (open) => {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if(open) {
      if(drawer) drawer.classList.add('open');
      if(backdrop) backdrop.classList.add('open');
    } else {
      if(drawer) drawer.classList.remove('open');
      if(backdrop) backdrop.classList.remove('open');
    }
  };
  
  const cartBtn = document.getElementById('cart-toggle-btn');
  const closeCart = document.getElementById('close-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  
  if(cartBtn) cartBtn.onclick = () => toggleCart(true);
  if(closeCart) closeCart.onclick = () => toggleCart(false);
  if(backdrop) backdrop.onclick = () => toggleCart(false);
  
  // 结账
  const checkoutBtn = document.getElementById('checkout-btn');
  const successModal = document.getElementById('success-modal');
  const successClose = document.getElementById('success-close-btn');
  
  if(checkoutBtn) checkoutBtn.onclick = async () => {
    const items = Object.entries(state.cart).flatMap(([n, c]) => Array(c).fill(n));
    await submitOrder(items);
    state.cart = {}; updateCartUI();
    toggleCart(false);
    if(successModal) successModal.classList.add('show');
  };
  if(successClose) successClose.onclick = () => successModal.classList.remove('show');

  // 管理员
  const adminLoginBtn = document.getElementById('admin-login-btn');
  if(adminLoginBtn) adminLoginBtn.onclick = async () => {
    const pwd = prompt("Enter Password:");
    if(pwd) {
        try { await adminLogin(pwd); enableAdmin(); } catch(e) { alert("Wrong Password"); }
    }
  };
  
  const logoutBtn = document.getElementById('logout-btn');
  if(logoutBtn) logoutBtn.onclick = disableAdmin;
  
  const addItemBtn = document.getElementById('add-item-btn');
  if(addItemBtn) addItemBtn.onclick = () => openModal();
  
  const modalCancel = document.getElementById('modal-cancel');
  if(modalCancel) modalCancel.onclick = () => modal.style.display = 'none';
  
  const itemForm = document.getElementById('item-form');
  if(itemForm) itemForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('input-name').value,
      price: document.getElementById('input-price').value,
      category: document.getElementById('input-category').value,
      image: document.getElementById('input-image').value
    };
    await saveItem(data);
    modal.style.display = 'none';
    loadData();
  };
}

function addToCart(name) {
  state.cart[name] = (state.cart[name] || 0) + 1;
  updateCartUI();
}

function updateCartUI() {
  const container = document.getElementById('cart-items');
  if(!container) return;
  container.innerHTML = '';
  let total = 0, count = 0;
  Object.entries(state.cart).forEach(([name, qty]) => {
    const info = state.menu[name];
    if(info) {
        total += info.price * qty;
        count += qty;
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.marginBottom = '8px';
        div.innerHTML = `<span>${name} x${qty}</span> <span>¥${(info.price * qty).toFixed(2)}</span>`;
        container.appendChild(div);
    }
  });
  
  const totalEl = document.getElementById('drawer-total-price');
  const badgeEl = document.getElementById('cart-badge');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  if(totalEl) totalEl.innerText = '¥' + total.toFixed(2);
  if(badgeEl) badgeEl.innerText = count;
  if(checkoutBtn) checkoutBtn.disabled = count === 0;
}

init();