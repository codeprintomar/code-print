# تشغيل لوحة التحكم (admin.html)

1. **Firebase Console** → اختار مشروعك (أو اعمل واحد) → Project settings → Add app (Web) → انسخ الـ config في `firebase-config.js`.
2. **Authentication** → Sign-in method → فعّل Email/Password → Users → Add user (إيميلك وباسورد قوي) → انسخ الـ **User UID**.
3. **Firestore Database** → Create (لو مش موجودة) → Rules → ضيف بلوك `firestore.rules.txt` وحط الـ UID مكان `YOUR_ADMIN_UID` → Publish.
   (لو نفس مشروع GradeOS: ضيف البلوك بس، متمسحش قواعدك الحالية.)
4. ارفع كل الملفات (الجدد: `admin.html`, `admin.js`, `cms.js`, `firebase-config.js`).
5. افتح `/admin.html` وسجّل دخول → عدّل → **حفظ**. الموقع بيتحدث على طول.

ملاحظات:
- أول حفظ بينسخ المحتوى الحالي (مشاريع وروابط ونصوص) لـ Firestore، وبعدها اللوحة هي المصدر.
- لو غيرت `id` مشروع، الروابط القديمة بتاعته (project.html?id=...) بتتغير.
- الصور: حط رابط الصورة (مفيش رفع ملفات من اللوحة).

## الاستيراد
- في اللوحة: زر **⬆ استيراد** ← اختار ملف أو الصق JSON أو محتوى `projects-data.js` / `links-data.js`.
- **دمج** بيحدّث الموجود (بنفس id أو الاسم) ويضيف الجديد. بعدها اضغط **حفظ**.
- لو كنت حفظت قبل كده في Firestore: استورد `import-new-projects.json` عشان المشاريع الجديدة تظهر (ملفات الـ data بتتقرأ بس لو مفيش حفظ).
- نسخة الـ EXE: ارفعها في `Downloads/FocusTracker.exe`.

## تحديثات ملفات الموقع
- أي مشروع أو رابط جديد تضيفه في `projects-data.js` / `links-data.js` بيظهر تلقائيًا حتى لو حفظت قبل كده من اللوحة (من غير import).
- اللي بتمسحه من اللوحة مبيرجعش. ولو عاوز ملفات الموقع تحدّث عنصر موجود، زوّد فيه `rev` برقم أعلى.


## الصفحات الجديدة
- `products.html` و`product.html`: المنتجات المدفوعة وتفاصيل كل منتج. يتم تحديد المنتج من خلال `isProduct: true` في `data/projects-data.js`.
- `services.html`: مجالات العمل والتجارب، بصياغة لا توحي بأنها خدمات تجارية مؤكدة.
- `updates.html`: يعرض سجل الإصدارات من `changelog` لكل مشروع/منتج. أضف التحديثات من تبويب المشاريع في لوحة التحكم بصيغة `version | date | notes`، ثم احفظ.
- `about.html` و`contact.html`: صفحتان مستقلتان بدل الاكتفاء بالأقسام داخل الرئيسية.

المنتجات المدفوعة الحالية محددة بـ `isProduct: true` و`isPaid: true`، ولا توجد أسعار ثابتة مضافة لأن الأسعار لم يتم تأكيدها.
