import {seed} from './data.js';
import {firebaseConfig, firebaseReady, telegramWebhook, adminUids} from './firebase-config.js';
let db=null, auth=null, sdk=null, app=null;
if(firebaseReady){
  const [appSdk,authSdk,dbSdk]=await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
  ]);
  sdk={...appSdk,...authSdk,...dbSdk}; app=appSdk.initializeApp(firebaseConfig); auth=authSdk.getAuth(app); db=dbSdk.getFirestore(app);
}
const clone=x=>JSON.parse(JSON.stringify(x));
export const isCloud=()=>!!db;
export const isAdminUser=u=>!!u && (adminUids.includes(u.uid));
export async function getContent(){
  if(!db){const raw=localStorage.getItem('cp-content');return raw?JSON.parse(raw):clone(seed)}
  const snap=await sdk.getDoc(sdk.doc(db,'site','content'));
  return snap.exists()?{...clone(seed),...snap.data()}:clone(seed);
}
export async function saveContent(data){
  if(!db){localStorage.setItem('cp-content',JSON.stringify(data));return}
  await sdk.setDoc(sdk.doc(db,'site','content'),data,{merge:false});
}
export async function createOrder(order){
  const record={...order,id:'CP-'+Date.now().toString().slice(-8),createdAt:new Date().toISOString(),status:'New'};
  if(db) await sdk.addDoc(sdk.collection(db,'orders'),record); else {const a=JSON.parse(localStorage.getItem('cp-orders')||'[]');a.unshift(record);localStorage.setItem('cp-orders',JSON.stringify(a))}
  if(telegramWebhook){try{fetch(telegramWebhook,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({type:'order',...record})})}catch(e){console.warn('Telegram notification could not be sent',e)}}
  return record;
}
export async function createMessage(message){
  const record={...message,id:'MSG-'+Date.now(),createdAt:new Date().toISOString(),status:'New'};
  if(db) await sdk.addDoc(sdk.collection(db,'messages'),record); else {const a=JSON.parse(localStorage.getItem('cp-messages')||'[]');a.unshift(record);localStorage.setItem('cp-messages',JSON.stringify(a))}
  if(telegramWebhook){try{fetch(telegramWebhook,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({type:'message',...record})})}catch(e){}}
  return record;
}
export async function getOrders(){if(!db)return JSON.parse(localStorage.getItem('cp-orders')||'[]');const s=await sdk.getDocs(sdk.query(sdk.collection(db,'orders'),sdk.orderBy('createdAt','desc')));return s.docs.map(d=>({...d.data(),docId:d.id}))}
export async function getMessages(){if(!db)return JSON.parse(localStorage.getItem('cp-messages')||'[]');const s=await sdk.getDocs(sdk.query(sdk.collection(db,'messages'),sdk.orderBy('createdAt','desc')));return s.docs.map(d=>({...d.data(),docId:d.id}))}
export async function updateOrder(id,status){if(!db){const a=await getOrders();const n=a.map(x=>x.id===id?{...x,status}:x);localStorage.setItem('cp-orders',JSON.stringify(n));return}await sdk.updateDoc(sdk.doc(db,'orders',id),{status})}
export async function login(email,password){if(!auth)throw new Error('Firebase is not configured yet. Use preview mode or finish Firebase setup.');return (await sdk.signInWithEmailAndPassword(auth,email,password)).user}
export async function logout(){if(auth)await sdk.signOut(auth)}
export function watchAuth(cb){if(auth)return sdk.onAuthStateChanged(auth,cb);cb(null);return ()=>{}}
export const cloudConfigured=()=>!!db;
