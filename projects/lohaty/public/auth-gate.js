/* شاشة تسجيل الدخول — بتظهر قبل الموقع لو Firebase متضبط ومفيش مستخدم داخل.
   بتستخدم دوال Hub.signIn / emailIn / emailUp / reset اللي في firebase-sync.js */
(()=>{
const H=window.Hub;if(!H)return;
const GATE_REQUIRED=true; // خليها false لو عاوز زر «كمّل بدون حساب» يفضل ظاهر دايمًا
const st=document.createElement("style");
st.textContent=`#gate{position:fixed;inset:0;z-index:25;background:var(--bg);display:none;align-items:center;justify-content:center;padding:20px;overflow:auto}
#gate.on{display:flex}
#gate .box{width:100%;max-width:380px;text-align:center}
#gate h2{margin:6px 0 2px;font-size:22px;background:linear-gradient(90deg,var(--pri),#e052a0);-webkit-background-clip:text;background-clip:text;color:transparent}
#gate p.sub{margin:0 0 18px;color:var(--mut);font-size:14px}
#gate .logo{font-size:44px}
#gate .tabs{display:flex;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:3px;gap:3px;margin:0 0 14px}
#gate .tabs button{flex:1;border:0;background:none;border-radius:9px;padding:8px 4px;color:var(--mut)}
#gate .tabs button.on{background:var(--pri);color:#fff;font-weight:700}
#gate input{width:100%;margin:0 0 10px;padding:11px 12px;direction:ltr;text-align:left}
#gate .pw{position:relative}#gate .pw button{position:absolute;inset-inline-end:6px;top:5px;border:0;background:none;padding:6px}
#gate button.main{width:100%;padding:11px;font-weight:700}
#gate .g{width:100%;display:flex;gap:8px;align-items:center;justify-content:center;padding:11px;margin-top:10px}
#gate .or{color:var(--mut);font-size:13px;margin:14px 0 0}
#gate .lnk{border:0;background:none;color:var(--pri);padding:8px;font-size:13px}
#gate .spin{width:34px;height:34px;border:4px solid var(--line);border-top-color:var(--pri);border-radius:50%;margin:20px auto;animation:gs 1s linear infinite}
@keyframes gs{to{transform:rotate(360deg)}}`;
document.head.appendChild(st);
const g=document.createElement("div");g.id="gate";document.body.appendChild(g);
let mode="in",busy=false,timer=null,skipped=false;
const GOOGLE='<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.7 2.3-7.7 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
const loading=()=>{g.innerHTML='<div class="box"><div class="logo">✨</div><h2>لوحتي</h2><div class="spin"></div><p class="sub">بنجهّز حسابك…</p><div id="gskip"></div></div>'};
function form(){
 g.innerHTML=`<div class="box"><div class="logo">✨</div><h2>لوحتي</h2><p class="sub">سجّل دخول عشان بياناتك تتزامن بين كل أجهزتك</p>
 <div class="tabs"><button data-m="in" class="${mode==="in"?"on":""}">دخول</button><button data-m="up" class="${mode==="up"?"on":""}">حساب جديد</button></div>
 <input id="g_e" type="email" autocomplete="email" placeholder="الإيميل">
 <div class="pw"><input id="g_p" type="password" autocomplete="${mode==="in"?"current-password":"new-password"}" placeholder="${mode==="in"?"الباسورد":"باسورد (6 حروف على الأقل)"}"><button type="button" id="g_eye" aria-label="إظهار الباسورد">👁</button></div>
 <button class="p main" id="g_go">${mode==="in"?"دخول":"إنشاء الحساب"}</button>
 ${mode==="in"?'<button class="lnk" id="g_rs">نسيت الباسورد؟</button>':""}
 <div class="or">— أو —</div>
 <button class="g" id="g_g">${GOOGLE} المتابعة بحساب جوجل</button>
 <div id="gskip"></div></div>`;
 skipBtn();
}
function skipBtn(){const h=document.getElementById("gskip");if(h&&(!GATE_REQUIRED||skipNeeded))h.innerHTML='<button class="lnk" id="g_sk">كمّل بدون حساب (على الجهاز ده بس)</button>'}
let skipNeeded=false;
const busyRun=async(btn,f)=>{if(busy)return;busy=true;btn.disabled=true;try{await f()}finally{busy=false;btn.disabled=false}};
g.addEventListener("click",e=>{
 const t=e.target.closest("button");if(!t)return;
 if(t.dataset.m){mode=t.dataset.m;form();return}
 if(t.id==="g_eye"){const p=document.getElementById("g_p");p.type=p.type==="password"?"text":"password";return}
 if(t.id==="g_sk"){skipped=true;g.classList.remove("on");return}
 const em=()=>{const e=document.getElementById("g_e").value.trim();if(!/\S+@\S+\.\S+/.test(e)){H.toast("اكتب إيميل صحيح");return null}return e};
 if(t.id==="g_go"){const e=em();if(!e)return;const p=document.getElementById("g_p").value;if(p.length<6)return H.toast("الباسورد 6 حروف على الأقل");
  busyRun(t,()=>mode==="in"?H.emailIn(e,p):H.emailUp(e,p))}
 else if(t.id==="g_rs"){const e=em();if(e)H.reset(e)}
 else if(t.id==="g_g")busyRun(t,()=>H.signIn())});
g.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.tagName==="INPUT"){const b=document.getElementById("g_go");b&&b.click()}});
function update(){
 console.info("[gate]",{cfg:H.cfg,checked:H.cfgChecked,ready:H.ready,user:!!H.user,skipped});
 if(skipped||!H.cfg&&H.cfgChecked){g.classList.remove("on");return}
 if(H.user){g.classList.remove("on");mode="in";return}
 if(!H.ready){g.classList.add("on");if(!g.firstChild)loading();return}
 g.classList.add("on");if(!document.getElementById("g_go"))form();
}
const prev=H.onStatus;
H.onStatus=function(){prev&&prev.apply(this,arguments);update()};
loading();g.classList.add("on");
// لو الاتصال ضعيف أو Firebase ما اتحمّلش، نسيب طريق للدخول بدون حساب
timer=setTimeout(()=>{if(!H.ready){skipNeeded=true;skipBtn()}},7000);
})();
