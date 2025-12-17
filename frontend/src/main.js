import './styles/main.css';
import { getMenu, submitOrder, updateImage } from './api.js';

const state = {
  menu: {},
  cart: {}
};

// === 自定义 Toast 提示 (替代 alert) ===
function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: rgba(255,255,255,0.9); backdrop-filter: blur(10px);
    padding: 12px 24px; border-radius: 99px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1); font-weight: 500;
    z-index: 9999; animation: slideDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  `;
  toast.innerText = msg;
  document.body.appendChild(toast);
  
  // 3秒后消失
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// 注入 Toast 动画样式
const style = document.createElement('style');
style.innerHTML = `@keyframes slideDown { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`;
document.head.appendChild(style);

// === 初始化 ===
async function init() {
  const loading = document.getElementById('loading');
  try {
    state.menu = await getMenu();
    renderMenu(state.menu); // 初次渲染
  } catch (err) {
    loading.innerText = '加载失败，请刷新重试';
    console.error(err);
  } finally {
    if(loading) loading.style.display = 'none';
  }
  
  document.getElementById('search-input').addEventListener('input', (e) => filterMenu(e.target.value));
  document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
}

// === 渲染逻辑 (优化版：只渲染一次 DOM) ===
function renderMenu(data) {
  const grid = document.getElementById('menu-grid');
  grid.innerHTML = '';

  Object.entries(data).forEach(([name, info], idx) => {
    const price = info.price || info;
    const imgUrl = info.image;
    
    const card = document.createElement('div');
    card.className = 'card';
    card.style.transitionDelay = `${idx * 30}ms`; // 更加紧凑的动画
    card.dataset.name = name; // 用于查找

    const imgStyle = imgUrl ? `background-image: url('${imgUrl}')` : '';
    
    card.innerHTML = `
      <div class="card-img" style="${imgStyle}"></div>
      <div class="card-content">
        <div class="card-title">${name}</div>
        <div class="card-price">¥${price.toFixed(2)}</div>
        <div class="action-row">
          <button class="btn add-btn">Add</button>
          <div class="counter-control" style="display:none; align-items:center; gap:10px;">
            <button class="counter-btn minus">−</button>
            <span class="count-num" style="font-weight:600; width:20px; text-align:center;">0</span>
            <button class="counter-btn plus">＋</button>
          </div>
        </div>
      </div>
    `;

    // 绑定事件
    const addBtn = card.querySelector('.add-btn');
    const controlDiv = card.querySelector('.counter-control');
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');
    const imgDiv = card.querySelector('.card-img');

    // 图片长按或点击更换 (模拟管理员操作)
    imgDiv.onclick = (e) => {
      if(e.detail === 3) handleImageUpdate(name); // 三击更换，防止误触
    };

    addBtn.onclick = () => {
      updateCart(name, 1);
    };

    plusBtn.onclick = () => updateCart(name, 1);
    minusBtn.onclick = () => updateCart(name, -1);

    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });
  
  // 恢复之前的购物车状态
  refreshUI();
}

// === 核心逻辑优化：分离数据更新与界面更新 ===
function updateCart(name, delta) {
  const current = state.cart[name] || 0;
  const next = current + delta;
  
  if (next <= 0) delete state.cart[name];
  else state.cart[name] = next;

  refreshUI(); // 局部刷新
}

// 局部刷新 DOM，不破坏布局
function refreshUI() {
  const grid = document.getElementById('menu-grid');
  let total = 0;
  let count = 0;

  // 1. 更新每个卡片的状态
  Object.keys(state.menu).forEach(name => {
    const card = grid.querySelector(`.card[data-name="${name}"]`);
    if (!card) return;

    const cartCount = state.cart[name] || 0;
    const addBtn = card.querySelector('.add-btn');
    const controlDiv = card.querySelector('.counter-control');
    const countNum = card.querySelector('.count-num');

    if (cartCount > 0) {
      addBtn.style.display = 'none';
      controlDiv.style.display = 'flex';
      countNum.innerText = cartCount;
    } else {
      addBtn.style.display = 'block';
      controlDiv.style.display = 'none';
    }

    // 计算总价
    const price = state.menu[name].price || state.menu[name];
    total += price * cartCount;
    count += cartCount;
  });

  // 2. 更新底部栏
  const bar = document.getElementById('cart-bar');
  document.getElementById('total-display').innerText = `¥${total.toFixed(2)}`;
  
  if (count > 0) bar.classList.add('show');
  else bar.classList.remove('show');
}

function filterMenu(query) {
  const cards = document.querySelectorAll('.card');
  const q = query.toLowerCase();
  
  cards.forEach(card => {
    const name = card.dataset.name.toLowerCase();
    if (name.includes(q)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

async function handleCheckout() {
  const items = [];
  Object.entries(state.cart).forEach(([name, count]) => {
    for(let i=0; i<count; i++) items.push(name);
  });

  if (items.length === 0) return;

  const btn = document.getElementById('checkout-btn');
  btn.innerText = 'Processing...';
  btn.disabled = true;

  try {
    const res = await submitOrder(items);
    showToast(`🎉 ${res.msg}`);
    state.cart = {};
    refreshUI();
  } catch (e) {
    showToast(`❌ ${e.message}`);
  } finally {
    btn.innerText = 'Pay';
    btn.disabled = false;
  }
}

async function handleImageUpdate(name) {
  const url = prompt(`[管理员] 请输入 ${name} 的新图片URL:`);
  if (url) {
    await updateImage(name, url);
    showToast('图片更新成功，即将刷新...');
    setTimeout(() => location.reload(), 1500);
  }
}

init();