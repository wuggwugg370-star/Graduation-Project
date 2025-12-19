(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const c of n)if(c.type==="childList")for(const l of c.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function o(n){const c={};return n.integrity&&(c.integrity=n.integrity),n.referrerPolicy&&(c.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?c.credentials="include":n.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function r(n){if(n.ep)return;n.ep=!0;const c=o(n);fetch(n.href,c)}})();const y="/api";let d={},a=[],I=[],u,S,j,b,x,q,O,p,L,m,v,F,N,P,_,f,h,E,J,$,T,H;async function z(){console.log("开始初始化应用...");try{console.log("调用loadMenu()"),await D(),console.log("loadMenu()调用完成"),console.log("调用renderMenu()"),g(),console.log("renderMenu()调用完成"),console.log("调用loadCart()"),X(),console.log("loadCart()调用完成"),console.log("调用updateCartCount()"),w(),console.log("updateCartCount()调用完成"),console.log("调用loadOrderHistory()"),await A(),console.log("loadOrderHistory()调用完成"),console.log("应用初始化完成")}catch(e){console.error("初始化应用失败:",e),i("应用初始化失败，请刷新页面重试","error")}}async function D(){console.log("开始加载菜单数据...");try{const e=await fetch(`${y}/menu`);console.log("菜单API响应:",e);const t=await e.json();if(console.log("菜单API数据:",t),t.code===200)d=t.data,console.log("最终菜单数据:",d);else throw new Error("加载菜单数据失败")}catch(e){console.error("加载菜单失败:",e),console.log("使用默认菜单数据"),d={冬阴功汤:{category:"东南亚风味",price:45,image:""},冰美式:{category:"饮品甜点",price:15,image:""},凯撒沙拉:{category:"西式料理",price:32,image:""},奶油蘑菇汤:{category:"西式料理",price:28,image:""},宫保鸡丁:{category:"中式经典",price:28,image:""},手作酸奶:{category:"饮品甜点",price:18,image:""},提拉米苏:{category:"饮品甜点",price:25,image:""},泰式咖喱鸡:{category:"东南亚风味",price:168,image:""},海南鸡饭:{category:"东南亚风味",price:35,image:""},澳洲M5牛排:{category:"西式料理",price:128,image:""},米饭:{category:"中式经典",price:3,image:""},越式春卷:{category:"东南亚风味",price:26,image:""},鱼香肉丝:{category:"中式经典",price:24,image:""},麻婆豆腐:{category:"中式经典",price:22,image:""},黑椒意大利面:{category:"西式料理",price:58,image:""}},console.log("默认菜单数据:",d)}}function g(e=null){console.log("开始渲染菜单..."),console.log("菜单网格元素:",u);const t=e||d;if(console.log("要渲染的菜单数据:",t),Object.keys(t).length===0){console.log("菜单数据为空，显示空状态"),u.innerHTML=`
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>没有找到菜品</h3>
                <p>请尝试其他搜索关键词或分类</p>
            </div>
        `;return}console.log("开始生成菜单HTML...");const o=Object.entries(t).map(([r,n])=>`
        <div class="menu-item glass-effect">
            <div class="menu-item-image" style="background-image: url(${n.image||"https://via.placeholder.com/320x250?text=No+Image"});">
            </div>
            <div class="menu-item-content">
                <div class="menu-item-category">${n.category}</div>
                <h3 class="menu-item-title">${r}</h3>
                <div class="menu-item-price">¥${n.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-item-name="${r}">
                    <i class="fas fa-shopping-cart"></i> 添加到购物车
                </button>
            </div>
        </div>
    `).join("");console.log("生成的菜单HTML:",o),u.innerHTML=o,console.log("菜单渲染完成")}async function Q(){const e=S.value.toLowerCase(),t={};Object.entries(d).forEach(([o,r])=>{(o.toLowerCase().includes(e)||r.category.toLowerCase().includes(e))&&(t[o]=r)}),g(t)}function V(e){if(e==="all")g();else{const t={};Object.entries(d).forEach(([o,r])=>{r.category===e&&(t[o]=r)}),g(t)}}function G(e){const t=d[e];if(!t){console.error("商品不存在:",e),i("商品不存在","error");return}const o=a.findIndex(r=>r.name===e);o>=0?a[o].quantity+=1:a.push({name:e,category:t.category,price:t.price,quantity:1,image:t.image}),M(),w(),i(`${e} 已添加到购物车`,"success")}function R(e){a=a.filter(t=>t.name!==e),M(),w(),B(),C()}function W(e,t){const o=a.find(r=>r.name===e);o&&(o.quantity+=t,o.quantity<=0?R(e):(M(),B(),C()))}function w(){const e=document.querySelector(".cart-btn");if(e){const t=e.querySelector(".cart-count");if(t){const o=a.reduce((r,n)=>r+n.quantity,0);t.textContent=o,t.style.display=o>0?"flex":"none"}}}function K(){a=[],M(),w(),B(),C(),i("购物车已清空","info")}function B(){const e=document.getElementById("cartItems");if(a.length===0){e.innerHTML=`
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>购物车是空的</h3>
                <p>快去添加一些美食吧！</p>
            </div>
        `;return}e.innerHTML=a.map(t=>`
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-title">${t.name}</div>
                <div class="cart-item-price">¥${t.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="ctrl-btn" onclick="updateCartItemQuantity('${t.name}', -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${t.quantity}</span>
                    <button class="ctrl-btn" onclick="updateCartItemQuantity('${t.name}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="ctrl-btn delete-btn" onclick="removeFromCart('${t.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("")}function C(){const e=a.reduce((t,o)=>t+o.price*o.quantity,0);return document.getElementById("cartTotal").textContent=`¥${e.toFixed(2)}`,e}function M(){localStorage.setItem("cart",JSON.stringify(a))}function X(){const e=localStorage.getItem("cart");e&&(a=JSON.parse(e))}async function Y(){if(a.length===0){i("购物车是空的，请先添加商品","error");return}try{const t=await(await fetch(`${y}/order`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:a})})).json();if(t.code===200)Z(t),K(),await A();else throw new Error(t.msg||"订单提交失败")}catch(e){console.error("提交订单失败:",e),i("订单提交失败，请稍后重试","error")}}function Z(e){const t=document.getElementById("orderDetails");t.innerHTML=`
        <div class="order-id">订单号: ${e.order_id}</div>
        <p>下单时间: ${e.created_at}</p>
        <p>订单金额: ¥${e.total_price.toFixed(2)}</p>
        <p>订单状态: ${e.status}</p>
    `,m.classList.add("show")}async function A(){try{const t=await(await fetch(`${y}/orders`)).json();if(t.code===200)I=t.data;else throw new Error("加载订单历史失败")}catch(e){console.error("加载订单历史失败:",e),I=[]}}async function U(){await A();const e=document.getElementById("orderHistoryList");I.length===0?e.innerHTML=`
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>暂无订单历史</h3>
                <p>快去下单享受美食吧！</p>
            </div>
        `:e.innerHTML=I.map(t=>`
            <div class="order-history-item">
                <div class="order-history-header">
                    <div class="order-history-id">订单号: ${t.order_id}</div>
                    <div class="order-history-status ${t.status}">
                        ${t.status==="pending"?"处理中":"已完成"}
                    </div>
                </div>
                <div class="order-history-details">
                    <p>下单时间: ${t.created_at}</p>
                    <p>订单金额: ¥${t.total_price.toFixed(2)}</p>
                    <p>商品数量: ${t.items.length} 件</p>
                </div>
            </div>
        `).join(""),v.classList.add("show")}function i(e,t="info"){const o=document.createElement("div");o.className=`notification notification-${t}`,o.innerHTML=`
        <i class="fas fa-${t==="success"?"check":t==="error"?"exclamation":"info"}"></i>
        <span>${e}</span>
    `,document.body.appendChild(o),setTimeout(()=>{o.classList.add("show")},100),setTimeout(()=>{o.classList.remove("show"),setTimeout(()=>{document.body.removeChild(o)},300)},3e3)}function k(e){e.classList.add("show")}function s(e){e.classList.remove("show")}function ee(){document.querySelectorAll(".modal").forEach(e=>{e.classList.remove("show")})}window.addEventListener("DOMContentLoaded",async()=>{u=document.getElementById("menuGrid"),S=document.getElementById("searchInput"),j=document.getElementById("searchBtn"),b=document.querySelectorAll(".tab-btn"),x=document.getElementById("cartBtn"),document.getElementById("cartCount"),q=document.getElementById("adminLoginBtn"),O=document.getElementById("cartModal"),p=document.getElementById("adminLoginModal"),L=document.getElementById("addItemModal"),m=document.getElementById("orderSuccessModal"),v=document.getElementById("orderHistoryModal"),F=document.getElementById("closeCartModal"),N=document.getElementById("closeAdminLoginModal"),P=document.getElementById("closeAddItemModal"),_=document.getElementById("closeOrderSuccessModal"),f=document.getElementById("closeOrderHistoryModal"),h=document.getElementById("adminLoginForm"),E=document.getElementById("addItemForm"),J=document.getElementById("clearCartBtn"),$=document.getElementById("submitOrderBtn"),T=document.getElementById("continueShoppingBtn"),H=document.getElementById("viewHistoryBtn"),document.getElementById("closeHistoryBtn"),await z(),j.addEventListener("click",Q),S.addEventListener("keypress",e=>{e.key==="Enter"&&Q()}),b.forEach(e=>{e.addEventListener("click",()=>{b.forEach(t=>t.classList.remove("active")),e.classList.add("active"),V(e.dataset.category)})}),u.addEventListener("click",e=>{if(e.target.closest(".add-to-cart-btn")){const o=e.target.closest(".add-to-cart-btn").dataset.itemName;G(o)}}),x.addEventListener("click",()=>{B(),C(),k(O)}),q.addEventListener("click",()=>{k(p)}),J.addEventListener("click",K),$&&$.addEventListener("click",Y),T&&T.addEventListener("click",()=>{s(m)}),H&&H.addEventListener("click",()=>{s(m),U()}),f&&f.addEventListener("click",()=>{s(v)}),F.addEventListener("click",()=>s(O)),N.addEventListener("click",()=>s(p)),P.addEventListener("click",()=>s(L)),_.addEventListener("click",()=>s(m)),f.addEventListener("click",()=>s(v)),h&&h.addEventListener("submit",te),E&&E.addEventListener("submit",ne)});window.addEventListener("click",e=>{e.target.classList.contains("modal")&&s(e.target)});document.addEventListener("keydown",e=>{e.key==="Escape"&&ee()});async function te(e){e.preventDefault();const t=document.getElementById("adminPassword").value;try{(await(await fetch(`${y}/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:t})})).json()).code===200?(i("管理员登录成功","success"),s(p),oe()):i("密码错误，请重试","error")}catch(o){console.error("管理员登录失败:",o),i("登录失败，请稍后重试","error")}h.reset()}function oe(){if(document.querySelector(".add-item-btn"))return;const e=document.createElement("button");e.className="admin-btn add-item-btn glass-effect",e.textContent="+ 添加菜品",e.onclick=()=>k(L);const t=document.querySelector(".header-right");t&&t.insertBefore(e,t.firstChild)}async function ne(e){e.preventDefault();const t=document.getElementById("itemName").value,o=document.getElementById("itemCategory").value,r=parseFloat(document.getElementById("itemPrice").value),n=document.getElementById("itemImage").value;if(!t||isNaN(r)||r<=0){i("请填写完整且有效的菜品信息","error");return}try{const l=await(await fetch(`${y}/admin/item`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:t,category:o,price:r,image:n})})).json();l.code===200?(i("菜品添加成功","success"),s(L),await D(),g()):i(l.msg||"菜品添加失败","error")}catch(c){console.error("添加菜品失败:",c),i("添加菜品失败，请稍后重试","error")}E.reset()}window.addToCart=G;window.removeFromCart=R;window.updateCartItemQuantity=W;window.viewOrderHistory=U;
