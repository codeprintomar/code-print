const {onSchedule}=require("firebase-functions/v2/scheduler");
const admin=require("firebase-admin");
admin.initializeApp();
const db=admin.firestore();
const BAD=["messaging/registration-token-not-registered","messaging/invalid-registration-token","messaging/invalid-argument"];
// بتشتغل كل دقيقة: تبعت أي تذكير وقته جه، وبعدين تمسحه
exports.sendReminders=onSchedule({schedule:"every 1 minutes",region:"europe-west1",timeoutSeconds:120,maxInstances:1},async()=>{
  const now=admin.firestore.Timestamp.now(),snap=await db.collectionGroup("reminders").where("at","<=",now).limit(300).get();
  if(snap.empty)return;
  const tokens={},stale=Date.now()-30*60*1000;
  for(const d of snap.docs){
    const r=d.data(),userRef=d.ref.parent.parent;
    if(r.at.toMillis()>=stale&&userRef){
      if(!tokens[userRef.id])tokens[userRef.id]=(await userRef.collection("tokens").get()).docs;
      const docs=tokens[userRef.id];
      if(docs.length){
        const res=await admin.messaging().sendEachForMulticast({tokens:docs.map(t=>t.data().token),
          data:{title:String(r.title||""),body:String(r.body||""),tag:d.id,url:String(r.url||"./")},webpush:{headers:{Urgency:"high",TTL:"3600"}}});
        await Promise.all(res.responses.map((x,i)=>!x.success&&BAD.includes(x.error&&x.error.code)?docs[i].ref.delete():null));
      }
    }
    await d.ref.delete(); // الاتأخر أكتر من 30 دقيقة بيتمسح من غير إرسال
  }
});
