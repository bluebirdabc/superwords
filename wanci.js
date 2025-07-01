/* =======================================================================
   main.js — 万词首页脚本（跨域登录修正版）
   · “背单词” ⇒ 登录后新开 superwords
   · 四个课程 Tab + 阅读任务示例
   ======================================================================= */
document.addEventListener('DOMContentLoaded', () => {

/* ---------- 0. API BASE（固定跨域） ---------- */
const API_BASE = 'https://readapi.bluebirdabc.com';  // 原先会因空字符串而 404，这里强制指向跨域 API

/* ---------- 1. 常量 ---------- */
const LOGIN_PID  = 'etizwdpzc1ttfeqx';
const COURSE_PID = 'aif8j9q38t4q78y4';
const SUPERWORDS = 'https://www.bluebirdabc.com/superwords/#/';

/* ---------- 2. 示例数据 ---------- */
const tabCourses = [
  [
    { id:383, title:'Special', cover:'images/covers/383.jpg' },
    { id:384, title:'when',    cover:'images/covers/when.jpg' },
    { id:385, title:'Time',    cover:'images/covers/time.jpg' },
    { id:386, title:'Since',   cover:'images/covers/since.jpg' },
    { id:387, title:'Catch',   cover:'images/covers/catch.jpg' }
  ],
  [], [], []                 // 正在学习 / 已学 / 全部
];
tabCourses[3] = [...tabCourses[0]];

const tasks = [
  {
    title:'special, a bit, helpful, twenty, from, tiger',
    link:`https://read2.bluebirdabc.com/article?id=47152&pid=${COURSE_PID}`
  }
];

/* ---------- 3. 工具函数 ---------- */
const qs  = (sel, root=document)=>root.querySelector(sel);
const qsa = (sel, root=document)=>[...root.querySelectorAll(sel)];
const post=(endpoint,data)=>
  fetch(API_BASE+endpoint,{
    method:'POST',
    mode:'cors',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  }).then(r=>r.json());

/* ======================================================================
   4. 先抓取所有 DOM 句柄，再写业务逻辑
   ====================================================================== */
const navToggle  = qs('#navToggle');
const navLinks   = qs('.nav-links');
const navMemory  = qs('#navMemory');
const navActions = qs('#navActions');

const authPopup  = qs('#authPopup');
const authClose  = qs('#authClose');
const tabLogin   = qs('#tabLogin');
const tabReg     = qs('#tabRegister');
const loginForm  = qs('#loginForm');
const regForm    = qs('#registerForm');

const courseList = qs('#courseList');
const tabsBtn    = qsa('.tab');
const moreBtn    = qs('#moreBtn');
const moreLinks  = ['new.html','learning.html','studied.html','all.html'];

const taskList   = qs('#taskList');

/* ======================================================================
   5. 登录状态 & 顶栏
   ====================================================================== */
let session = null;       // { userId, token }
let pendingURL = null;    // 登录后需自动跳转

loadSession();
renderNav();

function loadSession(){
  const id = localStorage.WORDS_ID, tk = localStorage.WORDS_TK;
  if(id && tk) session = { userId:id, token:tk };
}
function saveSession(s){
  if(s){
    session = s;
    localStorage.WORDS_ID = s.userId;
    localStorage.WORDS_TK = s.token;
  }else{
    session = null;
    localStorage.removeItem('WORDS_ID');
    localStorage.removeItem('WORDS_TK');
  }
  renderNav();                      // 登录状态切换 → 重新渲染导航
}
function renderNav(){
  const cart = `<a href="#" class="cart-link"><img class="cart-icon" src="images/cart.png"></a>`;
  if(session){
    navActions.innerHTML =
      cart+
      `<span class="user-greeting">Hi, <b>${session.userId}</b></span>
       <button id="logoutBtn" class="btn btn-outline">退出</button>`;
    qs('#logoutBtn').onclick = () => saveSession(null);
  }else{
    navActions.innerHTML =
      cart+
      `<button id="showReg"   class="btn btn-primary">注册</button>
       <button id="showLogin" class="btn btn-outline">登录</button>`;
    qs('#showReg').onclick   = () => showAuth('register');
    qs('#showLogin').onclick = () => showAuth('login');
  }
}

/* ---------- 顶栏交互 ---------- */
navToggle?.addEventListener('click', ()=>navLinks.classList.toggle('show'));

/* ======================================================================
   6. 登录 / 注册弹窗
   ====================================================================== */
authClose.onclick   = () => authPopup.classList.remove('active');
tabLogin.onclick    = () => switchAuth(true);
tabReg  .onclick    = () => switchAuth(false);

function showAuth(type){ switchAuth(type==='login'); authPopup.classList.add('active'); }
function switchAuth(isLogin){
  tabLogin.classList.toggle('active',  isLogin);
  tabReg  .classList.toggle('active', !isLogin);
  loginForm.classList.toggle('hidden', !isLogin);
  regForm  .classList.toggle('hidden',  isLogin);
}

/* ----- 登录表单 ----- */
loginForm.onsubmit = async e=>{
  e.preventDefault();
  const form = Object.fromEntries(new FormData(loginForm).entries());
  const res  = await post('/user/login', form);          // 改为跨域访问
  if(res.code===0){
    saveSession(res.data);
    authPopup.classList.remove('active');
    if(pendingURL){ window.open(addAuth(pendingURL),'_blank'); pendingURL = null; }
  }else alert(res.msg || '登录失败');
};
/* ----- 注册表单 ----- */
regForm.onsubmit = async e=>{
  e.preventDefault();
  const form = Object.fromEntries(new FormData(regForm).entries());
  const res  = await post('/user/register', { pid:LOGIN_PID, ...form });  // 跨域 + 携带 pid
  if(res.code===0){
    saveSession(res.data);
    authPopup.classList.remove('active');
  }else alert(res.msg || '注册失败');
};

/* ======================================================================
   7. 背单词 — 登录后新开 superwords
   ====================================================================== */
navMemory.onclick = e=>{
  e.preventDefault();
  if(!session){
    pendingURL = SUPERWORDS;
    showAuth('login');
    return;
  }
  window.open(addAuth(SUPERWORDS), '_blank');
};

/* ======================================================================
   8. 课程渲染
   ====================================================================== */
tabsBtn.forEach(btn=>btn.addEventListener('click',()=>renderTab(+btn.dataset.idx)));
renderTab(0);

function renderTab(idx){
  tabsBtn.forEach((b,i)=>b.classList.toggle('active', i===idx));

  courseList.innerHTML = tabCourses[idx].length
    ? tabCourses[idx].map(c=>{
        const base = `https://readapi.bluebirdabc.com/lessonplayer/index.html?pid=${COURSE_PID}&lessonId=${c.id}`;
        return `<a class="course-card" data-link="${base}">
                  <div class="course-img-wrap"><img src="${c.cover}" alt=""></div>
                  <div class="course-info">${c.title}</div>
                </a>`;
      }).join('')
    : `<p style="padding:40px 0;">暂无课程</p>`;

  qsa('.course-card', courseList).forEach(a=>{
    a.onclick = e=>{
      e.preventDefault();
      const link = a.dataset.link;
      if(!session){ pendingURL = link; showAuth('login'); }
      else window.open(addAuth(link), '_blank');
    };
  });

  moreBtn.onclick = () => location.href = moreLinks[idx];
}

/* ======================================================================
   9. 阅读任务
   ====================================================================== */
taskList.innerHTML = tasks.length
  ? tasks.map(t=>`<a class="task-card" target="_blank" href="${addAuth(t.link)}">${t.title}</a>`).join('')
  : `<p style="padding:12px 0 24px;">暂无阅读任务</p>`;

/* ---------- URL 带 token / user_id ---------- */
function addAuth(url){
  if(!session) return url;
  const extra = `?user_id=${encodeURIComponent(session.userId)}&token=${encodeURIComponent(session.token)}`;
  url
  return url + extra;
}

});
