# ربط «لوحتي» بـ Firebase وتشغيل الإشعارات

## 1) إنشاء المشروع
1. ادخل https://console.firebase.google.com ← **Add project**.
2. **Build ← Authentication ← Sign-in method** ← فعّل **Google** وكمان **Email/Password**.
   (سيب خيار «Link accounts that use the same email» مفعّل في Settings ← User account linking عشان نفس الإيميل يبقى حساب واحد.)
3. **Build ← Firestore Database** ← Create database (production mode).
4. **Project settings ← Your apps ← Web (</>)** ← سجّل تطبيق وانسخ الـ config.
5. **Project settings ← Cloud Messaging ← Web Push certificates** ← **Generate key pair** وانسخ الـ public key.
6. غيّر خطة المشروع لـ **Blaze** (لازم عشان الـ Cloud Function اللي بتبعت الإشعارات؛ استهلاكك الشخصي داخل الحصة المجانية).

## 2) الإعدادات
افتح `public/firebase-config.js` والصق الـ config والـ VAPID key مكان كلمات PASTE.

## 3) النشر
```
npm i -g firebase-tools
firebase login
firebase use --add            # اختار مشروعك
cd functions && npm install && cd ..
firebase deploy
```
هيدّيك رابط `https://PROJECT.web.app`. (لازم HTTPS — الإشعارات مبتشتغلش من ملف محلي.)

## 4) الاستخدام
- افتح الرابط ← ⚙️ ← ادخل بـ **جوجل** أو بـ **إيميل وباسورد** (إنشاء حساب)، وبعدين **تفعيل الإشعارات**.
- من ⚙️ بعد الدخول تقدر **تربط الطريقتين**: لو دخلت بجوجل ضيف باسورد، ولو دخلت بإيميل اربط جوجل — وفي الحالتين نفس البيانات.
- افعل نفس الشيء على كل جهاز (موبايل/لاب) — البيانات بتتزامن لحظيًا.
- **آيفون:** افتح الرابط في Safari ← مشاركة ← **Add to Home Screen** ← افتح التطبيق من الأيقونة ثم فعّل الإشعارات (iOS 16.4+).
- الإشعارات بتتبعت من السيرفر (دقة ±دقيقة) حتى والتطبيق مقفول: تذكير المواعيد، تسليم المهام (8 ص يوم التسليم و6 م اليوم اللي قبله)، ونزول المحاضرات (9 ص).

## ملاحظات
- لو الإشعارات مش بتوصل: Firebase Console ← Functions ← Logs وشوف `sendReminders`.
- النسخة الاحتياطية: ⚙️ ← تصدير / استرجاع.


## شاشة تسجيل الدخول
- `public/auth-gate.js` بتعرض شاشة دخول (جوجل / إيميل وباسورد / نسيت الباسورد) قبل الموقع.
- لو عاوز زر «كمّل بدون حساب» يفضل ظاهر دايمًا: غيّر `GATE_REQUIRED` لـ `false` في أول الملف.
- لازم دومين موقعك يكون في Firebase Console ← Authentication ← Settings ← **Authorized domains** (الـ `web.app` و`localhost` بيتضافوا تلقائي).
- ملف `firebase-config.js` لازم يكون بالشكل: `self.FIREBASE_CONFIG = {...}` (مش `import`).
