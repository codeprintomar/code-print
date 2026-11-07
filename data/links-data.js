/*
  كل روابط صفحة links موجودة هنا.

  لإضافة كارت جديد: انسخ أي عنصر بين { } داخل القسم المناسب،
  ثم عدّل name و description و url. استخدم available: false للرابط غير الجاهز.
  type: "download" يجعل السهم زر تحميل، و type: "external" يفتح الرابط في تبويب جديد.
*/
var linksData = [
  {
    "title": "Websites",
    "icon": "🌐",
    "items": [
      {
        "icon": "🎮",
        "name": "برا السالفة",
        "description": "العب أونلاين — وفي قسم التحميل نسخة أندرويد",
        "url": "https://bara-el-salfa.wasmer.app/",
        "rev": 2
      },
      {
        "icon": "💸",
        "name": "Flosy",
        "description": "تطبيق ذكي لإدارة المصروفات وتتبع دخلك ونفقاتك بسهولة 💰📊",
        "url": "https://mahfsa.wasmer.app/"
      },
      {
        "icon": "🎓",
        "name": "GradeOS",
        "description": "موقع لمتابعة درجاتك وحضورك وجدولك ومذاكرتك في مكان واحد 📚📈",
        "url": "https://gradeos.wasmer.app/"
      },
      {
        "icon": "🌊",
        "name": "Wave",
        "description": "مشغّل موسيقى من المتصفح",
        "url": "projects/wave/index.html",
        "rev": 2
      },
      {
        "icon": "✅",
        "name": "Habits OS",
        "description": "متتبع عادات بإحصائيات وإنجازات",
        "url": "projects/habits-os/index.html"
      },
      {
        "icon": "⏱️",
        "name": "Daily Time Tracker",
        "description": "وزّع ساعات يومك على أنشطتك",
        "url": "projects/time-tracker/index.html"
      },
      {
        "icon": "👕",
        "name": "My Outfit Closet",
        "description": "دولابك الرقمي وتنسيق الأطقم",
        "url": "projects/outfit-closet/index.html"
      },
      {
        "icon": "📝",
        "name": "QFormat",
        "description": "نسّق أسئلتك واطبعها PDF",
        "url": "projects/qformat/index.html"
      },
      {
        "icon": "🎨",
        "name": "منسّق الأكواد والنصوص",
        "description": "تلوين وتنسيق الأكواد وتصديرها PDF",
        "url": "projects/code-formatter/index.html"
      }
    ]
  },
  {
    "title": "Apps & Downloads",
    "icon": "📱",
    "items": [
      {
        "icon": "🎮",
        "name": "برا السالفة — Android",
        "description": "تحميل ملف APK 15 MB",
        "url": "downloads/apk/bara-el-salfa.apk",
        "type": "download"
      },
      {
        "icon": "💸",
        "name": "Flosy",
        "description": "تطبيق ذكي لإدارة المصروفات وتتبع دخلك ونفقاتك بسهولة 💰📊",
        "url": "downloads/apk/Flosy.apk",
        "type": "download"
      },
      {
        "icon": "🎓",
        "name": "GradeOS — Android",
        "description": "تحميل تطبيق GradeOS لأندرويد (ملف APK)",
        "url": "downloads/apk/GradeOS.apk",
        "type": "download"
      },
      {
        "icon": "🍅",
        "name": "Focus Tracker — Windows",
        "description": "برنامج Pomodoro لويندوز (ملف EXE)",
        "url": "downloads/FocusTracker.exe",
        "type": "download"
      },
      {
        "icon": "🎙️",
        "name": "Voice Controller",
        "description": "Coming Soon",
        "available": false
      }
    ]
  }
];
