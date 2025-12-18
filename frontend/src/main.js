import './styles/main.css';
import { getMenu, submitOrder, adminLogin, saveItem } from './api.js';

const state = {
  menu: {},
  cart: {}, 
  activeCategory: 'All',
  categories: new Set(['All']),
  isAdmin: false // 关键状态：是否为管理员
};

// === 初始化 ===
async function init() {
  await loadData();
  setupEventListeners();
  checkAdminSession();
}

async function loadData() {
  const loading = document.getElementById('loading');
  try {
    state.menu = await getMenu();
    state.categories = new Set(['All']);
    Object.values(state.menu).forEach(item => {
      if (item.category) state.categories.add(item.category);
    });
    
    renderCategories();
    renderMenu();
    updateCartUI();
  } catch (err) {
    console.error(err);
    if(loading) loading.innerText = 'Service Unavailable.';
  } finally {
    if(loading) loading.style.display = 'none';
  }
}

// === 渲染逻辑 ===
function renderCategories() {
  const bar = document.getElementById('category-bar');
  const datalist = document.getElementById('cat-suggestions');
  
  bar.innerHTML = '';
  datalist.innerHTML = ''; // 填充输入框的自动补全

  state.categories.forEach(cat => {
    // 渲染顶部按钮
    const btn = document.createElement('button');
    btn.className = `cat-btn ${cat === state.activeCategory ? 'active' : ''}`;
    btn.innerText = cat;
    btn.onclick = () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = cat;
      filterMenu('', cat);
    };
    bar.appendChild(btn);

    // 填充 datalist
    if (cat !== 'All') {
      const opt = document.createElement('option');
      opt.value = cat;
      datalist.appendChild(opt);
    }
  });
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  grid.innerHTML = '';

  Object.entries(state.menu).forEach(([name, info], idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.name = name;
    card.dataset.category = info.category || '其他';
    card.style.transitionDelay = `${Math.min(idx * 30, 300)}ms`;

    const imgUrl = info.image || 'https://via.placeholder.com/400x300?text=No+Image';

    card.innerHTML = `
      <div class="card-img" style="background-image: url('${imgUrl}')">
        ${state.isAdmin ? `<button class="edit-btn">✏️ Edit</button>` : ''}
      </div>
      <div class="card-content">
        <div class="card-tag">${info.category}</div>
        <div class="card-title">${name}</div>
        <div class="card-price">¥${info.price.toFixed(2)}</div>
        <div class="action-row">
          <button class="btn add-btn">Add to Bag</button>
        </div>
      </div>
    `;

    // 绑定事件
    card.querySelector('.add-btn').onclick = () => addToCart(name);

    // 管理员编辑事件
    if (state.isAdmin) {
      const editBtn = card.querySelector('.edit-btn');
      editBtn.onclick = (e) => {
        e.stopPropagation();
        openItemModal(name, info);
      };
    }

    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });
}

// === 管理员逻辑 ===
function checkAdminSession() {
  // 简单的 sessionStorage 检查，保持刷新后状态
  if (sessionStorage.getItem('neo_admin') === 'true') {
    enableAdminMode();
  }
}

async function handleAdminLogin() {
  const pwd = prompt("Enter Admin Password (demo: admin123):");
  if (!pwd) return;

  try {
    await adminLogin(pwd);
    sessionStorage.setItem('neo_admin', 'true');
    enableAdminMode();
    alert("Welcome Back, Admin!");
  } catch (e) {
    alert("Access Denied.");
  }
}

function enableAdminMode() {
  state.isAdmin = true;
  document.getElementById('admin-toolbar').style.display = 'flex';
  document.getElementById('admin-login-btn').style.display = 'none';
  renderMenu(); // 重新渲染以显示编辑按钮
}

function handleLogout() {
  state.isAdmin = false;
  sessionStorage.removeItem('neo_admin');
  document.getElementById('admin-toolbar').style.display = 'none';
  document.getElementById('admin-login-btn').style.display = 'block';
  renderMenu();
}

// === 添加/编辑 模态框逻辑 ===
const modal = document.getElementById('item-modal');
const form = document.getElementById('item-form');

function openItemModal(name = null, info = null) {
  modal.classList.add('show');
  if (name && info) {
    // 编辑模式
    document.getElementById('modal-title').innerText = "Edit Item";
    document.getElementById('input-name').value = name;
    document.getElementById('input-name').readOnly = true; // 名字作为ID不可改
    document.getElementById('input-price').value = info.price;
    document.getElementById('input-category').value = info.category;
    document.getElementById('input-image').value = info.image || '';
  } else {
    // 添加模式
    document.getElementById('modal-title').innerText = "Add New Item";
    form.reset();
    document.getElementById('input-name').readOnly = false;
  }
}

function closeItemModal() {
  modal.classList.remove('show');
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById('input-name').value,
    price: parseFloat(document.getElementById('input-price').value),
    category: document.getElementById('input-category').value,
    image: document.getElementById('input-image').value
  };

  try {
    await saveItem(data);
    closeItemModal();
    loadData(); // 重新加载数据
  } catch (err) {
    alert("Failed to save: " + err.message);
  }
};

// === 通用逻辑 (购物车、搜索等) ===
// ... (保留之前的购物车 addToCart, updateCartUI, toggleDrawer 等逻辑)
// 此处为了篇幅省略重复代码，请确保保留之前 main.js 中的以下函数：
// setupEventListeners (需更新 Admin 按钮绑定), filterMenu, addToCart, updateCartUI, handleCheckout

function setupEventListeners() {
  // Admin 绑定
  document.getElementById('admin-login-btn').onclick = handleAdminLogin;
  document.getElementById('logout-btn').onclick = handleLogout;
  document.getElementById('add-item-btn').onclick = () => openItemModal();
  document.getElementById('modal-cancel').onclick = closeItemModal;

  // 搜索
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('global-search');
  document.getElementById('search-trigger').onclick = () => {
    searchOverlay.classList.add('active');
    setTimeout(() => searchInput.focus(), 100);
  };
  document.getElementById('close-search').onclick = () => {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    filterMenu('', state.activeCategory);
  };
  searchInput.addEventListener('input', (e) => filterMenu(e.target.value, 'All'));

  // 购物车
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const toggleDrawer = (open) => {
    if (open) { drawer.classList.add('open'); backdrop.classList.add('open'); }
    else { drawer.classList.remove('open'); backdrop.classList.remove('open'); }
  };
  document.getElementById('cart-toggle-btn').onclick = () => toggleDrawer(true);
  document.getElementById('close-drawer').onclick = () => toggleDrawer(false);
  backdrop.onclick = () => toggleDrawer(false);

  // 结账
  document.getElementById('checkout-btn').onclick = handleCheckout;
  document.getElementById('success-close-btn').onclick = () => {
    document.getElementById('success-modal').classList.remove('show');
    toggleDrawer(false);
  };
}

function filterMenu(keyword, category) {
  const k = keyword.toLowerCase().trim();
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const cat = card.dataset.category;
    const matchCat = category === 'All' || cat === category;
    const matchKey = name.includes(k);
    if (matchCat && matchKey) {
      card.style.display = 'flex';
      requestAnimationFrame(() => card.classList.add('visible'));
    } else {
      card.style.display = 'none';
      card.classList.remove('visible');
    }
  });
}

function addToCart(name) {
  state.cart[name] = (state.cart[name] || 0) + 1;
  updateCartUI();
  const btn = document.getElementById('cart-toggle-btn');
  btn.style.transform = 'scale(1.3)';
  setTimeout(() => btn.style.transform = 'scale(1)', 200);
}

function updateCartUI() {
  const container = document.getElementById('cart-items');
  const badge = document.getElementById('cart-badge');
  const totalDisplay = document.getElementById('drawer-total-price');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  container.innerHTML = '';
  let total = 0;
  let count = 0;

  Object.entries(state.cart).forEach(([name, qty]) => {
    const info = state.menu[name];
    if (!info) return;
    
    total += info.price * qty;
    count += qty;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${info.image || 'https://via.placeholder.com/100'}" />
      <div class="cart-item-info">
        <div class="cart-item-title">${name}</div>
        <div class="cart-item-price">¥${info.price.toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="ctrl-btn minus">-</button>
          <span>${qty}</span>
          <button class="ctrl-btn plus">+</button>
        </div>
      </div>
    `;
    div.querySelector('.minus').onclick = () => {
      state.cart[name]--;
      if (state.cart[name] <= 0) delete state.cart[name];
      updateCartUI();
    };
    div.querySelector('.plus').onclick = () => { state.cart[name]++; updateCartUI(); };
    container.appendChild(div);
  });

  if (count === 0) {
    container.innerHTML = '<div class="empty-cart-msg">Your bag is empty.</div>';
    badge.classList.remove('show');
    checkoutBtn.disabled = true;
  } else {
    badge.innerText = count;
    badge.classList.add('show');
    checkoutBtn.disabled = false;
  }
  totalDisplay.innerText = `¥${total.toFixed(2)}`;
}

async function handleCheckout() {
  const btn = document.getElementById('checkout-btn');
  btn.innerText = 'Processing...';
  btn.disabled = true;
  const items = [];
  Object.entries(state.cart).forEach(([name, qty]) => {
    for (let i = 0; i < qty; i++) items.push(name);
  });

  try {
    await submitOrder(items);
    state.cart = {};
    updateCartUI();
    document.getElementById('success-modal').classList.add('show');
  } catch (e) {
    alert(`Checkout Failed: ${e.message}`);
  } finally {
    btn.innerText = 'Check Out';
    btn.disabled = false;
  }
}

init();