import './styles/main.css';
import { getMenu, submitOrder, updateImage } from './api.js';

const state = {
  menu: {},
  cart: {}, // 格式: { "菜名": 数量 }
  activeCategory: 'All',
  categories: new Set(['All']) // 确保 All 在最前
};

// === 初始化 ===
async function init() {
  const loading = document.getElementById('loading');
  try {
    state.menu = await getMenu();
    
    // 提取分类
    Object.values(state.menu).forEach(item => {
      if (item.category) state.categories.add(item.category);
    });
    
    renderCategories();
    renderMenu();
    updateCartUI(); // 初始化空购物车状态
  } catch (err) {
    console.error(err);
    if(loading) loading.innerText = 'Service Unavailable. Please check backend.';
  } finally {
    if(loading) loading.style.display = 'none';
  }
  
  setupEventListeners();
}

function setupEventListeners() {
  // 1. 全局搜索
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('global-search');
  
  document.getElementById('search-trigger').onclick = () => {
    searchOverlay.classList.add('active');
    setTimeout(() => searchInput.focus(), 100);
  };
  
  document.getElementById('close-search').onclick = () => {
    searchOverlay.classList.remove('active');
    searchInput.value = ''; // 关闭清空
    filterMenu('', state.activeCategory); // 恢复当前分类显示
  };

  searchInput.addEventListener('input', (e) => {
    // 搜索时忽略分类限制，改为在所有菜品中搜
    filterMenu(e.target.value, 'All');
  });

  // 2. 购物车抽屉
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  
  function toggleDrawer(open) {
    if (open) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
    } else {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
    }
  }

  document.getElementById('cart-toggle-btn').onclick = () => toggleDrawer(true);
  document.getElementById('close-drawer').onclick = () => toggleDrawer(false);
  backdrop.onclick = () => toggleDrawer(false);
  
  // 3. 结账与弹窗
  document.getElementById('checkout-btn').onclick = handleCheckout;
  document.getElementById('success-close-btn').onclick = () => {
    document.getElementById('success-modal').classList.remove('show');
    toggleDrawer(false);
  };
}

// === 渲染分类栏 ===
function renderCategories() {
  const bar = document.getElementById('category-bar');
  bar.innerHTML = '';

  state.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-btn ${cat === 'All' ? 'active' : ''}`;
    btn.innerText = cat;
    btn.onclick = () => {
      // 切换分类样式
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      state.activeCategory = cat;
      document.getElementById('global-search').value = ''; // 切换分类时清空搜索
      filterMenu('', cat);
    };
    bar.appendChild(btn);
  });
}

// === 渲染菜单网格 ===
function renderMenu() {
  const grid = document.getElementById('menu-grid');
  grid.innerHTML = '';

  Object.entries(state.menu).forEach(([name, info], idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.name = name;
    card.dataset.category = info.category || '其他';
    card.style.transitionDelay = `${idx * 30}ms`; // 瀑布流动画

    const imgUrl = info.image;
    const price = info.price;

    card.innerHTML = `
      <div class="card-img" style="${imgUrl ? `background-image: url('${imgUrl}')` : ''}">
        <div class="edit-hint" title="Admin: Update Image">Edit Photo</div>
      </div>
      <div class="card-content">
        <div class="card-tag">${info.category}</div>
        <div class="card-title">${name}</div>
        <div class="card-price">¥${price.toFixed(2)}</div>
        <div class="action-row">
          <button class="btn add-btn">Add to Bag</button>
        </div>
      </div>
    `;

    // 绑定事件
    card.querySelector('.add-btn').onclick = () => addToCart(name);
    
    // 管理员换图功能
    card.querySelector('.edit-hint').onclick = (e) => {
      e.stopPropagation();
      handleImageUpdate(name);
    };

    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });
}

// === 筛选逻辑 ===
function filterMenu(keyword, category) {
  const k = keyword.toLowerCase().trim();
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const cat = card.dataset.category;
    
    // 逻辑：如果分类是All，则只看关键词；如果有具体分类，则需同时满足分类和关键词
    const matchCat = category === 'All' || cat === category;
    const matchKey = name.includes(k);

    if (matchCat && matchKey) {
      card.style.display = 'flex';
      // 重新触发动画
      requestAnimationFrame(() => card.classList.add('visible'));
    } else {
      card.style.display = 'none';
      card.classList.remove('visible');
    }
  });
}

// === 购物车逻辑 ===
function addToCart(name) {
  state.cart[name] = (state.cart[name] || 0) + 1;
  updateCartUI();
  
  // 购物车图标跳动反馈
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

  // 遍历购物车
  Object.entries(state.cart).forEach(([name, qty]) => {
    const info = state.menu[name];
    if (!info) return; // 防止旧数据错误
    
    const itemTotal = info.price * qty;
    total += itemTotal;
    count += qty;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${info.image || 'https://via.placeholder.com/100?text=Food'}" />
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

    // 绑定加减按钮
    div.querySelector('.minus').onclick = () => {
      state.cart[name]--;
      if (state.cart[name] <= 0) delete state.cart[name];
      updateCartUI();
    };
    div.querySelector('.plus').onclick = () => {
      state.cart[name]++;
      updateCartUI();
    };

    container.appendChild(div);
  });

  // 更新总状态
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

// === 管理员功能：更新图片 ===
async function handleImageUpdate(name) {
  const url = prompt(`Paste new image URL for "${name}":`);
  if (url && url.startsWith('http')) {
    try {
      await updateImage(name, url);
      // 乐观更新
      state.menu[name].image = url;
      const cardImg = document.querySelector(`.card[data-name="${name}"] .card-img`);
      if (cardImg) cardImg.style.backgroundImage = `url('${url}')`;
    } catch (e) {
      alert('Update failed: ' + e.message);
    }
  }
}

// === 结账 ===
async function handleCheckout() {
  const btn = document.getElementById('checkout-btn');
  btn.innerText = 'Processing...';
  btn.disabled = true;

  const items = [];
  Object.entries(state.cart).forEach(([name, qty]) => {
    for (let i = 0; i < qty; i++) items.push(name);
  });

  try {
    const res = await submitOrder(items);
    // 成功后清空购物车并显示成功弹窗
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