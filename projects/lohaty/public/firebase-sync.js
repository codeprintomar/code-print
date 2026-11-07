import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,GoogleAuthProvider,EmailAuthProvider,signInWithPopup,signInWithRedirect,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,linkWithPopup,linkWithCredential,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,doc,setDoc,deleteDoc,onSnapshot,collection,getDocs,writeBatch,Timestamp,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {getMessaging,getToken,deleteToken,onMessage,isSupported} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";
const H=window.Hub,cfg=self.FIREBASE_CONFIG;
H.cfg=!!(cfg&&cfg.apiKey&&!/^PASTE/.test(cfg.apiKey));H.cfgChecked=true;
const set=(s,u)=>{H.sync=s;if(u!==undefined)H.user=u;H.onStatus()};
if(H.cfg)init();else H.onStatus();
function init(){
  const app=initializeApp(cfg),auth=getAuth(app),db=initializeFirestore(app,{experimentalAutoDetectLongPolling:true,localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
  const dev=localStorage.getItem("hub_dev")||(()=>{const d=Math.random().toString(36).slice(2);localStorage.setItem("hub_dev",d);return d})();
  let uid=null,unsub=null,ready=false,t1,t2,known=null,tokenId=null,msg=null;
  const dref=()=>doc(db,"users",uid,"data","main");
  const ERR={"auth/invalid-credential":"الإيميل أو الباسورد غلط","auth/wrong-password":"الإيميل أو الباسورد غلط","auth/user-not-found":"الإيميل أو الباسورد غلط","auth/invalid-email":"الإيميل مش صحيح","auth/email-already-in-use":"الإيميل ده متسجل قبل كده — جرّب «دخول»، أو ادخل بجوجل وبعدين اربط باسورد من الإعدادات","auth/weak-password":"الباسورد ضعيف — 6 حروف على الأقل","auth/too-many-requests":"محاولات كتير، استنى شوية وجرّب تاني","auth/network-request-failed":"مفيش اتصال بالإنترنت","auth/credential-already-in-use":"الحساب ده مربوط بمستخدم تاني","auth/provider-already-linked":"الطريقة دي مربوطة بالفعل","auth/requires-recent-login":"سجّل خروج وادخل تاني وجرّب","auth/account-exists-with-different-credential":"الإيميل ده متسجل بطريقة تانية — ادخل بيها وبعدين اربط جوجل من الإعدادات","auth/operation-not-allowed":"الطريقة دي مش مفعّلة في Firebase Console (Authentication ← Sign-in method)"};
  const run=async f=>{try{await f();return true}catch(e){if(!["auth/popup-closed-by-user","auth/cancelled-popup-request"].includes(e.code)){console.error(e);H.toast(ERR[e.code]||"حصلت مشكلة، جرّب تاني")}return false}};
  const info=u=>({name:u.displayName,email:u.email,providers:u.providerData.map(p=>p.providerId)}),refresh=()=>{const u=auth.currentUser;if(u)set(H.sync,info(u))};
  H.signIn=()=>run(async()=>{const p=new GoogleAuthProvider();try{await signInWithPopup(auth,p)}catch(e){if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment"].includes(e.code))await signInWithRedirect(auth,p);else throw e}});
  H.emailIn=(e,p)=>run(()=>signInWithEmailAndPassword(auth,e.trim(),p));
  H.emailUp=(e,p)=>run(()=>createUserWithEmailAndPassword(auth,e.trim(),p));
  H.reset=async e=>{if(await run(()=>sendPasswordResetEmail(auth,e.trim())))H.toast("📧 بعتنالك لينك تغيير الباسورد على الإيميل")};
  H.linkGoogle=async()=>{if(await run(()=>linkWithPopup(auth.currentUser,new GoogleAuthProvider()))){refresh();H.toast("✅ اتربط حساب جوجل")}};
  H.linkPass=async p=>{const u=auth.currentUser;if(await run(()=>linkWithCredential(u,EmailAuthProvider.credential(u.email,p)))){refresh();H.toast("✅ اتضاف الباسورد — تقدر تدخل بيه")}};
  H.signOut=()=>signOut(auth);
  const push=()=>{clearTimeout(t1);t1=setTimeout(async()=>{if(!uid)return;set("syncing");try{const S=H.get();await setDoc(dref(),{json:JSON.stringify(S),ua:S.meta.ua,dev});set("ok")}catch(e){console.error(e);set("err")}},800)};
  H.onSave=()=>{if(uid&&ready)push();remSync()};
  function initial(r){
    const L=H.get(),has=L.ev.length||L.tasks.length||L.gym.logs.length||Object.keys(L.att).length;ready=true;
    if(!r){push();return set("ok")}
    const R=JSON.parse(r.json),linked=localStorage.getItem("hub_uid")===uid;
    if(!has||(linked&&r.ua>L.meta.ua)){H.apply(R)}
    else if(!linked&&r.ua!==L.meta.ua){
      if(confirm("لقيت بيانات متخزنة في حسابك وكمان بيانات على الجهاز ده.\n\nموافق = استخدم بيانات الحساب (هتتحفظ نسخة من بيانات الجهاز)\nإلغاء = ارفع بيانات الجهاز مكانها")){try{localStorage.setItem("hub_bak",JSON.stringify(L))}catch(e){}H.apply(R)}else push()}
    else if(L.meta.ua>r.ua)push();
    localStorage.setItem("hub_uid",uid);set("ok");remSync()}
  function listen(){ready=false;let first=true;
    const wd=setTimeout(()=>{if(first){console.warn("Firestore: no response after 12s — check that the database exists, rules are deployed, and the network allows firestore.googleapis.com");set("err")}},12000);
    unsub=onSnapshot(dref(),s=>{if(s.metadata.hasPendingWrites)return;const r=s.exists()?s.data():null;
      if(first){first=false;clearTimeout(wd);initial(r);return}
      if(r&&r.dev!==dev&&r.ua>H.get().meta.ua){H.apply(JSON.parse(r.json));set("ok")}},()=>set("err"))}
  onAuthStateChanged(auth,u=>{H.ready=true;uid=u?u.uid:null;if(unsub){unsub();unsub=null}ready=false;known=null;
    if(!u){H.push=false;return set("off",null)}
    set("syncing",info(u));listen();if(localStorage.getItem("hub_push")==="1"&&window.Notification&&Notification.permission==="granted")startPush(true)});
  // ----- الإشعارات -----
  const sha=async s=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,"0")).join("");
  async function startPush(quiet){
    try{if(!(await isSupported()))return quiet||H.toast("المتصفح ده مش بيدعم الإشعارات (على الآيفون: ضيف الموقع للشاشة الرئيسية الأول)");
      if(Notification.permission!=="granted"&&(await Notification.requestPermission())!=="granted")return H.toast("الإشعارات مقفولة من إعدادات المتصفح");
      const reg=await navigator.serviceWorker.register("firebase-messaging-sw.js");await navigator.serviceWorker.ready;
      msg=getMessaging(app);const token=await getToken(msg,{vapidKey:self.VAPID_KEY,serviceWorkerRegistration:reg});if(!token)throw new Error("no token");
      tokenId=await sha(token);await setDoc(doc(db,"users",uid,"tokens",tokenId),{token,ua:navigator.userAgent.slice(0,120),at:serverTimestamp()});
      if(!startPush.m){startPush.m=1;onMessage(msg,m=>{const d=m.data||{};H.toast(d.title||"تنبيه");H.notify(d.title||"لوحتي",d.body||"",d.tag)})}
      localStorage.setItem("hub_push","1");H.push=true;H.onStatus();known=null;remSync(0);quiet||H.toast("🔔 الإشعارات شغالة")}
    catch(e){console.error(e);quiet||H.toast("تعذّر تفعيل الإشعارات — اتأكد من VAPID key")}}
  H.enablePush=()=>uid?startPush(false):H.toast("سجّل دخول بجوجل الأول (⚙️ الإعدادات)");
  H.disablePush=async()=>{try{if(msg)await deleteToken(msg);if(tokenId)await deleteDoc(doc(db,"users",uid,"tokens",tokenId))}catch(e){}localStorage.removeItem("hub_push");H.push=false;H.onStatus();H.toast("اتقفلت الإشعارات")};
  // ----- مزامنة التذكيرات (الـ Cloud Function بتبعتها في وقتها) -----
  const remSync=(d=2500)=>{clearTimeout(t2);t2=setTimeout(syncRem,d)};
  async function syncRem(){if(!uid||!H.push)return;
    try{const col=collection(db,"users",uid,"reminders");
      if(!known){known=new Map();(await getDocs(col)).forEach(d=>{const x=d.data();known.set(d.id,x.at.toMillis()+"|"+x.title+"|"+x.body)})}
      const want=new Map(H.reminders().map(r=>[r.id,r])),b=writeBatch(db);let n=0;
      known.forEach((v,id)=>{if(!want.has(id)){b.delete(doc(col,id));known.delete(id);n++}});
      want.forEach((r,id)=>{const v=r.at+"|"+r.title+"|"+r.body;if(known.get(id)!==v){b.set(doc(col,id),{at:Timestamp.fromMillis(r.at),title:r.title,body:r.body,url:"./#today"});known.set(id,v);n++}});
      if(n)await b.commit()}catch(e){console.warn("reminders",e);known=null}}
}
