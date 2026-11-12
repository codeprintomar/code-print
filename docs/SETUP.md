# تشغيل وتجهيز موقع CodePrint

المشروع يحتوي على الموقع العام، لوحة تحكم، صفحة Updates، نظام طلبات المنتجات، رسائل التواصل، وتجهيز إشعارات Telegram. لا يستخدم Firebase Storage.

## 1) تجربة الموقع على الكمبيوتر

1. فك ضغط الملف.
2. افتح مجلد `codeprint-complete`.
3. شغّل `start-preview.bat`.
4. هيفتح الموقع على `http://localhost:8000`.
5. افتح `http://localhost:8000/admin.html` ثم اضغط **Open local preview** لتجربة لوحة التحكم.

ويمكن تشغيله يدوياً من داخل المجلد:

```bash
python -m http.server 8000
```

وضع المعاينة يحفظ التعديلات في نفس المتصفح فقط؛ لا يستخدمه كلوحة إدارة منشورة للزوار.

## 2) ربط Firebase (بدون Storage)

1. افتح مشروع Firebase الحالي أو أنشئ مشروعاً جديداً وأضف Web App.
2. من Authentication فعّل Email/Password.
3. أنشئ حساب المدير من Authentication → Users وانسخ UID الخاص به.
4. ضع إعدادات Web App في `assets/firebase-config.js`.
5. أضف UID داخل مصفوفة `adminUids` في نفس الملف.
6. افتح `firestore.rules` واستبدل `ADD_YOUR_ADMIN_UID` بنفس UID.
7. انسخ القواعد إلى Firestore → Rules ثم اضغط Publish.
8. أنشئ Firestore Database.
9. افتح `/admin.html` وسجّل دخول بحساب المدير.

إعدادات Firebase الخاصة بالـ Web App تظهر في الواجهة الأمامية بطبيعتها. لا تضع Service Account أو مفاتيح خاصة أو Telegram Bot Token في ملفات الموقع.

## 3) بيانات Firestore

- `site/content`: محتوى الموقع والمنتجات والمشروعات والخدمات والإصدارات.
- `orders`: طلبات المنتجات.
- `messages`: رسائل صفحة Contact.

الزوار يمكنهم إرسال طلب أو رسالة فقط. قراءة الطلبات والرسائل وتعديلها محصوران بحساب المدير حسب قواعد Firestore.

## 4) ربط Telegram

1. افتح Google Apps Script وأنشئ مشروعاً.
2. انسخ محتوى `telegram-bot/CodePrintTelegram.gs` إلى ملف السكربت.
3. من Project Settings → Script Properties أضف:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. Deploy → New deployment → Web app.
5. اختر Execute as: Me، واجعل الوصول Anyone حتى يستطيع الموقع إرسال إشعار.
6. انسخ رابط Web App وضعه في `telegramWebhook` داخل `assets/firebase-config.js`.
7. جرّب إرسال طلب منتج ورسالة تواصل، وتأكد من وصولهما إلى Firestore وTelegram.

الطلب أو الرسالة يُحفظان في Firestore أولاً؛ Telegram قناة إشعار إضافية. لو Telegram غير متاح، البيانات تظل محفوظة في لوحة التحكم.

## 5) النشر

ارفع محتويات المجلد إلى استضافة Static Hosting مثل Wasmer أو Firebase Hosting. `index.html` هو مدخل الموقع و`admin.html` مدخل لوحة التحكم.

## 6) ملاحظات مهمة قبل الإطلاق

- المتجر حالياً يستقبل **طلبات اهتمام بالمنتج** وليس مدفوعات إلكترونية. لا توجد معالجة لبيانات بطاقات أو دفع. قبل تحصيل أموال، اربط بوابة دفع موثوقة مع Webhook للتحقق من الدفع.
- لازم إعداد Firebase وUID والقواعد ورابط Telegram قبل استخدام لوحة الإدارة مع زوار حقيقيين.
- لا توجد خدمة رفع صور. استخدم صوراً ثابتة داخل `assets` أو روابط صور عامة موثوقة.
