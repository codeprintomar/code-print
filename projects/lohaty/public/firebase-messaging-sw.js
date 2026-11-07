importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js","https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js","firebase-config.js");
if(self.FIREBASE_CONFIG&&!/^PASTE/.test(self.FIREBASE_CONFIG.apiKey)){
  firebase.initializeApp(self.FIREBASE_CONFIG);
  firebase.messaging().onBackgroundMessage(p=>{
    const d=p.data||{};
    return self.registration.showNotification(d.title||"لوحتي",{body:d.body||"",tag:d.tag||undefined,icon:"icon-192.png",badge:"icon-192.png",dir:"rtl",lang:"ar",data:{url:d.url||"./"}});
  });
}
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||"./",self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{for(const c of l){if(c.url.startsWith(self.registration.scope)&&"focus"in c)return c.focus()}return clients.openWindow(url)}));
});
