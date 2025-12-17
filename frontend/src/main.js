import './styles/main.css';
import { getMenu, submitOrder, updateImage } from './api.js';

const state = {
  menu: {},
  cart: {}
};

// === 初始化 ===
async function init() {
  const loading = document.getElementById('loading');
  try {
    state.menu = await getMenu();
    renderMenu(state.menu);
  } catch (err) {
    loading.innerText = '加载失败，请刷新重试';
    console.error(err);
  } finally {
    loading.style.display = 'none';
  }
  
  // 绑定搜索事件
  document.getElementById('search-input').addEventListener('input', (e) => {
    filterMenu(e.target.value);
  });

  // 绑定支付事件
  document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
}

// === 渲染逻辑 ===
function renderMenu(data) {
  const grid = document.getElementById('menu-grid');
  grid.innerHTML = '';

  Object.entries(data).forEach(([name, info], idx) => {
    const price = info.price || info;
    const imgUrl = info.image;
    const count = state.cart[name] || 0;

    const card = document.createElement('div');
    card.className = 'card';
    card.style.transitionDelay = `${idx * 50}ms`; // 瀑布流动画

    // 图片点击换图
    const imgStyle = imgUrl ? `background-image: url('${imgUrl}')` : '';
    
    card.innerHTML = `
      <div class="card-img" style="${imgStyle}" data-name="${name}"></div>
      <div class="card-content">
        <div class="card-title">${name}</div>
        <div class="card-price">¥${price.toFixed(2)}</div>
        <div class="action-row">
          ${count === 0 
            ? `<button class="btn add-btn" data-name="${name}">Add</button>`
            : `<span style="font-weight:600">x ${count}</span>`
          }
        </div>
      </div>
    `;

    // 绑定卡片内部事件
    const imgDiv = card.querySelector('.card-img');
    imgDiv.onclick = () => handleImageUpdate(name);

    const btn = card.querySelector('.add-btn');
    if(btn) {
      btn.onclick = (e) => {
        e.stopPropagation();
        updateCart(name, 1);
      };
    }
    
    // 如果已经在购物车，点击卡片也可以加
    if (count > 0) {
      card.onclick = () => updateCart(name, 1);
    }

    grid.appendChild(card);
    
    // 触发动画
    requestAnimationFrame(() => card.classList.add('visible'));
  });

  updateCartBar();
}

function updateCart(name, delta) {
  const current = state.cart[name] || 0;
  const next = current + delta;
  if (next <= 0) delete state.cart[name];
  else state.cart[name] = next;
  
  // 简单重绘 (生产环境建议使用 Virtual DOM 库)
  renderMenu(state.menu);
}

function updateCartBar() {
  const bar = document.getElementById('cart-bar');
  const totalEl = document.getElementById('total-display');
  
  let total = 0;
  let count = 0;
  Object.keys(state.cart).forEach(name => {
    const info = state.menu[name];
    const price = info.price || info;
    total += price * state.cart[name];
    count += state.cart[name];
  });

  totalEl.innerText = `¥${total.toFixed(2)}`;
  
  if (count > 0) bar.classList.add('show');
  else bar.classList.remove('show');
}

function filterMenu(query) {
  const filtered = {};
  const q = query.toLowerCase();
  Object.keys(state.menu).forEach(key => {
    if (key.toLowerCase().includes(q)) {
      filtered[key] = state.menu[key];
    }
  });
  renderMenu(filtered);
}

async function handleCheckout() {
  const items = [];
  Object.entries(state.cart).forEach(([name, count]) => {
    for(let i=0; i<count; i++) items.push(name);
  });

  try {
    const res = await submitOrder(items);
    alert(res.msg || 'Order Placed!');
    state.cart = {};
    renderMenu(state.menu);
  } catch (e) {
    alert(e.message);
  }
}

async function handleImageUpdate(name) {
  const url = prompt(`请输入 [${name}] 的新图片链接:`);
  if (url) {
    await updateImage(name, url);
    location.reload(); // 简单处理刷新
  }
}

init();