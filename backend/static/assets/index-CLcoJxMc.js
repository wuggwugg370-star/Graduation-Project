(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();let g=null;function K(){const e=localStorage.getItem("neo_dining_user");e&&(g=JSON.parse(e))}function se(){localStorage.removeItem("neo_dining_user"),g=null}function ae(){return g||K(),!!g}function V(){return g||K(),g}function ce(){K()}let d=[];function de(){const e=localStorage.getItem("neo_dining_cart");e&&(d=JSON.parse(e))}function T(){localStorage.setItem("neo_dining_cart",JSON.stringify(d))}function le(e,t=1){const n=d.find(r=>r.name===e.name);n?n.quantity+=t:d.push({name:e.name,price:e.price,quantity:t,image:e.image,category:e.category}),T()}function Z(e){d=d.filter(t=>t.name!==e),T()}function ue(e,t){const n=d.find(r=>r.name===e);n&&(t<=0?Z(e):(n.quantity=t,T()))}function me(){d=[],T()}function W(){return[...d]}function fe(){return d.reduce((e,t)=>e+t.price*t.quantity,0)}function ge(){return d.reduce((e,t)=>e+t.quantity,0)}function ye(){de()}const pe="/api";async function x(e,t={}){const r=await(await fetch(`${pe}${e}`,t)).json();if(r.code!==200)throw new Error(r.msg||"Error");return r.data||r}const ve=()=>x("/menu"),he=(e,t)=>x("/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:e,user_id:t})}),Ie=(e=null)=>{const t=e?`/orders?user_id=${e}`:"/orders";return x(t)},Ee=e=>x("/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});let l=[];async function ee(){try{console.log("开始获取菜单数据...");const e=await ve();if(console.log("菜单API响应:",JSON.stringify(e)),l=[],e)if(typeof e=="object"&&!Array.isArray(e)){console.log("响应是对象格式，转换为数组...");for(const t in e)Object.prototype.hasOwnProperty.call(e,t)&&l.push({name:t,...e[t]})}else Array.isArray(e)&&(console.log("响应已是数组格式，直接使用..."),l=e);return console.log("菜单数据加载完成，共加载",l.length,"个菜品"),l}catch(e){return console.error("获取菜单失败:",e),[]}}function te(e){return e==="all"?[...l]:l.filter(t=>t.category===e)}function Le(e){if(!e)return[...l];const t=e.toLowerCase();return l.filter(n=>n.name.toLowerCase().includes(t)||n.description.toLowerCase().includes(t))}function we(e){return l.find(t=>t.name===e)}async function Be(){try{const e=V();return{code:200,data:await Ie((e==null?void 0:e.user_id)||null)||[]}}catch(e){return console.error("获取订单历史失败:",e),{code:500,msg:"获取订单历史失败",data:[]}}}async function Ce(e){try{const t=V();return await he(e,(t==null?void 0:t.user_id)||null)}catch(t){throw console.error("提交订单失败:",t),t}}let h,w,F,y,_,N,m,u,B,C,k,v,M,I,b,q,j,P,U,p,R,J,$,O,Q,D,G,z,S=[];async function Me(){try{ce(),ye(),oe(),await ee(),E(),L(),await X()}catch(e){console.error("初始化应用失败:",e),a("应用初始化失败，请刷新页面重试","error")}}function E(e=null){const t=te("all"),r=(e||t).reduce((i,c)=>(i[c.name]=c,i),{});if(Object.keys(r).length===0){h.innerHTML=`
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>没有找到菜品</h3>
                <p>请尝试其他搜索关键词或分类</p>
            </div>
        `;return}const o=Object.entries(r).map(([i,c])=>`
        <div class="menu-item glass-effect">
            <div class="menu-item-image" style="background-image: url(${c.image||"data:image/svg+xml;charset=UTF-8,%3csvg xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22 width%3d%22320%22 height%3d%22250%22 viewBox%3d%220 0 320 250%22%3e%3crect width%3d%22320%22 height%3d%22250%22 fill%3d%22%23f0f0f0%22%2f%3e%3ctext x%3d%22160%22 y%3d%22125%22 font-size%3d%2218%22 text-anchor%3d%22middle%22 fill%3d%22%23999%22 dominant-baseline%3d%22middle%22%3eNo Image%3c%2ftext%3e%3c%2fsvg%3e"});">
            </div>
            <div class="menu-item-content">
                <div class="menu-item-category">${c.category}</div>
                <h3 class="menu-item-title">${i}</h3>
                <div class="menu-item-price">¥${c.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-item-name="${i}">
                    <i class="fas fa-shopping-cart"></i> 添加到购物车
                </button>
            </div>
        </div>
    `).join("");h.innerHTML=o}async function Y(){const e=w.value.toLowerCase(),t=Le(e);E(t)}function be(e){if(e==="all")E();else{const t=te(e);E(t)}}function ne(e){const t=we(e);if(!t){console.error("商品不存在:",e),a("商品不存在","error");return}le(t),L(),a(`${e} 已添加到购物车`,"success")}function $e(e){Z(e),L(),A(),H()}function Oe(e,t){const n=W().find(o=>o.name===e);if(!n)return;const r=n.quantity+t;ue(e,r),L(),A(),H()}function L(){const e=document.querySelector(".cart-btn");if(e){const t=e.querySelector(".cart-count");if(t){const n=ge();t.textContent=n,t.style.display=n>0?"flex":"none"}}}function re(){me(),L(),A(),H(),a("购物车已清空","info")}function A(){const e=document.getElementById("cartItems"),t=W();if(t.length===0){e.innerHTML=`
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>购物车是空的</h3>
                <p>快去添加一些美食吧！</p>
            </div>
        `;return}e.innerHTML=t.map(n=>`
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-title">${n.name}</div>
                <div class="cart-item-price">¥${n.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="ctrl-btn" onclick="updateCartItemQuantity('${n.name}', -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${n.quantity}</span>
                    <button class="ctrl-btn" onclick="updateCartItemQuantity('${n.name}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="ctrl-btn delete-btn" onclick="removeFromCart('${n.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("")}function H(){const e=fe();return document.getElementById("cartTotal").textContent=`¥${e.toFixed(2)}`,e}function oe(){const e=V();e?(m&&(m.textContent=e.username),u&&(u.textContent="退出登录",u.onclick=ke)):(m&&(m.textContent="用户登录",m.onclick=()=>f(I)),u&&(u.textContent="注册",u.onclick=()=>f(b)))}function ke(){se(),a("已退出登录","info"),oe()}async function Se(){const e=W();if(e.length===0){a("购物车是空的，请先添加商品","error");return}if(!ae()){a("请先登录","warning"),s(B),f(I);return}try{const t=await Ce(e);if(t.code===200)Te(t.data),re(),await X();else throw new Error(t.msg||"订单提交失败")}catch(t){console.error("提交订单失败:",t),a("订单提交失败，请稍后重试","error")}}function Te(e){const t=document.getElementById("orderDetails");t.innerHTML=`
        <div class="order-id">订单号: ${e.order_id}</div>
        <p>下单时间: ${e.created_at}</p>
        <p>订单金额: ¥${e.total_price.toFixed(2)}</p>
        <p>订单状态: ${e.status}</p>
    `,v.classList.add("show")}async function X(){try{const e=await Be();if(e.code===200)S=e.data;else throw new Error(e.msg||"加载订单历史失败")}catch(e){console.error("加载订单历史失败:",e),S=[]}}async function ie(){await X();const e=document.getElementById("orderHistoryList");S.length===0?e.innerHTML=`
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>暂无订单历史</h3>
                <p>快去下单享受美食吧！</p>
            </div>
        `:e.innerHTML=S.map(t=>{let n;switch(t.status){case"pending":n="待处理";break;case"processing":n="处理中";break;case"completed":n="已完成";break;case"cancelled":n="已取消";break;default:n="未知状态"}return`
            <div class="order-history-item">
                <div class="order-history-header">
                    <div class="order-history-id">订单号: ${t.order_id}</div>
                    <div class="order-history-status ${t.status}">
                        ${n}
                    </div>
                </div>
                <div class="order-history-details">
                    <p>下单时间: ${t.created_at}</p>
                    <p>订单金额: ¥${t.total_price.toFixed(2)}</p>
                    <p>商品数量: ${t.items.length} 件</p>
                </div>
                <div class="order-items-list">
                    ${t.items.map(r=>`
                        <div class="order-item">
                            <div class="order-item-name">${r.name}</div>
                            <div class="order-item-quantity">×${r.quantity}</div>
                            <div class="order-item-price">¥${r.price.toFixed(2)}</div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `}).join(""),M.classList.add("show")}function a(e,t="info"){const n=document.createElement("div");n.className=`notification notification-${t}`,n.innerHTML=`
        <i class="fas fa-${t==="success"?"check":t==="error"?"exclamation":"info"}"></i>
        <span>${e}</span>
    `,document.body.appendChild(n),setTimeout(()=>{n.classList.add("show")},100),setTimeout(()=>{n.classList.remove("show"),setTimeout(()=>{document.body.removeChild(n)},300)},3e3)}function f(e){e?e.classList.add("show"):console.error("Modal element is null")}function s(e){e.classList.remove("show")}function xe(){document.querySelectorAll(".modal").forEach(e=>{e.classList.remove("show")})}window.addEventListener("DOMContentLoaded",async()=>{h=document.getElementById("menuGrid"),w=document.getElementById("searchInput"),F=document.getElementById("searchBtn"),y=document.querySelectorAll(".tab-btn"),_=document.getElementById("cartBtn"),N=document.getElementById("adminLoginBtn"),B=document.getElementById("cartModal"),C=document.getElementById("adminLoginModal"),k=document.getElementById("addItemModal"),v=document.getElementById("orderSuccessModal"),M=document.getElementById("orderHistoryModal"),I=document.getElementById("userLoginModal"),b=document.getElementById("userRegisterModal"),q=document.getElementById("closeCartModal"),j=document.getElementById("closeAdminLoginModal"),P=document.getElementById("closeAddItemModal"),U=document.getElementById("closeOrderSuccessModal"),p=document.getElementById("closeOrderHistoryModal"),R=document.getElementById("closeUserLoginModal"),J=document.getElementById("closeUserRegisterModal"),$=document.getElementById("adminLoginForm"),O=document.getElementById("addItemForm"),Q=document.getElementById("clearCartBtn"),D=document.getElementById("submitOrderBtn"),G=document.getElementById("continueShoppingBtn"),z=document.getElementById("viewHistoryBtn"),m=document.getElementById("userLoginBtn"),u=document.getElementById("userRegisterBtn"),await Me(),F&&F.addEventListener("click",Y),w&&w.addEventListener("keypress",e=>{e.key==="Enter"&&Y()}),y&&y.length>0&&y.forEach(e=>{e.addEventListener("click",()=>{y.forEach(t=>t.classList.remove("active")),e.classList.add("active"),be(e.dataset.category)})}),h&&h.addEventListener("click",e=>{if(e.target.closest(".add-to-cart-btn")){const n=e.target.closest(".add-to-cart-btn").dataset.itemName;ne(n)}}),_&&_.addEventListener("click",()=>{A(),H(),f(B)}),N&&N.addEventListener("click",()=>{f(C)}),Q&&Q.addEventListener("click",re),D&&D.addEventListener("click",Se),G&&G.addEventListener("click",()=>{s(v)}),z&&z.addEventListener("click",()=>{s(v),ie()}),p&&p.addEventListener("click",()=>{s(M)}),q&&q.addEventListener("click",()=>s(B)),j&&j.addEventListener("click",()=>s(C)),P&&P.addEventListener("click",()=>s(k)),U&&U.addEventListener("click",()=>s(v)),p&&p.addEventListener("click",()=>s(M)),R&&R.addEventListener("click",()=>s(I)),J&&J.addEventListener("click",()=>s(b)),m&&m.addEventListener("click",()=>f(I)),u&&u.addEventListener("click",()=>f(b)),$&&$.addEventListener("submit",Ae),O&&O.addEventListener("submit",Fe)});window.addEventListener("click",e=>{e.target.classList.contains("modal")&&s(e.target)});document.addEventListener("keydown",e=>{e.key==="Escape"&&xe()});async function Ae(e){e.preventDefault();const t=document.getElementById("adminPassword").value;try{await Ee({password:t}),a("管理员登录成功","success"),s(C),He()}catch(n){console.error("管理员登录失败:",n),a(n.message||"登录失败，请稍后重试","error")}$.reset()}function He(){if(document.querySelector(".add-item-btn"))return;const e=document.createElement("button");e.className="admin-btn add-item-btn glass-effect",e.textContent="+ 添加菜品",e.onclick=()=>f(k);const t=document.querySelector(".header-right");t&&t.insertBefore(e,t.firstChild)}async function Fe(e){e.preventDefault();const t=document.getElementById("itemName").value,n=document.getElementById("itemCategory").value,r=parseFloat(document.getElementById("itemPrice").value),o=document.getElementById("itemImage").value;if(!t||isNaN(r)||r<=0){a("请填写完整且有效的菜品信息","error");return}try{const c=await(await fetch("/api/admin/item",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:t,category:n,price:r,image:o})})).json();c.code===200?(a("菜品添加成功","success"),s(k),await ee(),E()):a(c.msg||"菜品添加失败","error")}catch(i){console.error("添加菜品失败:",i),a("添加菜品失败，请稍后重试","error")}O.reset()}window.addToCart=ne;window.removeFromCart=$e;window.updateCartItemQuantity=Oe;window.viewOrderHistory=ie;
