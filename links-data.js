/*
  كل روابط صفحة links موجودة هنا.

  لإضافة كارت جديد: انسخ أي عنصر بين { } داخل القسم المناسب،
  ثم عدّل name و description و url. استخدم available: false للرابط غير الجاهز.
  type: "download" يجعل السهم زر تحميل، و type: "external" يفتح الرابط في تبويب جديد.
*/
const linksData = [
  {
    title: "Websites",
    icon: "🌐",
    items: [
      {
        icon: "🎮",
        name: "برا السالفة",
        description: "play now  Go down to download as apk",
        url: "https://bara-el-salfa.wasmer.app/"
      },
     
      {
        icon: "💸",
        name: "Flosy",
        description: "تطبيق ذكي لإدارة المصروفات وتتبع دخلك ونفقاتك بسهولة 💰📊",
        url: "https://mahfsa.wasmer.app/"
      },

      
      {
        icon: "🌊",
        name: "Wave",
        description: "Coming Soon",
        available: false
      }

    ]
  },
  {
    title: "Apps & Downloads",
    icon: "📱",
    items: [
      {
  icon: "🎮",
  name: "برا السالفة — Android",
  description: "تحميل ملف APK 15 MB",
  url: "Apk/bara-el-salfa.apk",
  type: "download"
},

      {
  icon: "💸",
  name: "Flosy",
  description: "تطبيق ذكي لإدارة المصروفات وتتبع دخلك ونفقاتك بسهولة 💰📊",
  url: "Apk/Flosy.apk",
  type: "download"
},
      {
        icon: "🎙️",
        name: "Voice Controller",
        description: "Coming Soon",
        available: false
      }
    ]
  }
];
