/*
  كل مشاريع CodePrint موجودة هنا فقط — عدّل هنا وهيتحدث تلقائيًا
  في صفحة المشاريع (projects.html) وفي صفحة تفاصيل كل مشروع (project.html?id=...).

  عشان تضيف مشروع جديد: انسخ أي عنصر كامل من { إلى }، وعدّل القيم.

  الحقول:
  - id            معرف فريد بدون مسافات (يُستخدم في الرابط project.html?id=هنا)
  - name          اسم المشروع
  - tagline       سطر قصير تحت الاسم، زي "Game • Web"
  - category      واحدة من: "games" | "ai" | "tools" | "web"  (تُستخدم في فلتر صفحة المشاريع)
  - icon          إيموجي يظهر في الكارد وأعلى صفحة التفاصيل
  - status        "live" لو المشروع شغال، أو "soon" لو لسه تحت التطوير
  - progress      رقم من 0 لـ100، يظهر كشريط تقدم فقط لو status = "soon" (سيبه null لو مش عايز شريط)
  - eta           نص بسيط زي "قريبًا — أغسطس 2026"، يظهر فقط لو status = "soon" (سيبه null لو مش لازم)
  - shortDesc     وصف سطر أو اتنين، يظهر في الكارد بصفحة المشاريع
  - description   مصفوفة فقرات — "إزاي المشروع اتبنى"، تظهر في صفحة التفاصيل بس
  - screenshots   مصفوفة روابط صور (اختياري، سيبها [] لو مفيش لسه)
  - changelog     مصفوفة تحديثات { version, date, notes } — الأحدث الأول
  - links         { play, download, source } — أي واحد فاضي (null) مش هيظهر زراره
*/
var projectsData = [
  {
    "id": "bara-el-salfa",
    "name": "برا السالفة",
    "tagline": "Game • Web",
    "category": "games",
    "icon": "🎮",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "لعبة من تطوير CodePrint، متاحة للعب مباشرة من المتصفح، وكمان في نسخة تنزيل لأجهزة أندرويد.",
    "description": [
      "برا السالفة هي أول لعبة كاملة بنشرها من CodePrint، اتبنت بهدف تجربة دورة تطوير لعبة من الصفر لحد النشر: التصميم، اللوجيك، والاختبار على المتصفح والموبايل.",
      "اللعبة شغالة على الويب مباشرة (WebAssembly عبر Wasmer)، وكمان متاحة كملف APK لتحميلها وتشغيلها على أندرويد من غير متصفح."
    ],
    "screenshots": [],
    "changelog": [
      {
        "version": "1.0",
        "date": "2026-08",
        "notes": "الإصدار الأول — نسخة الويب ونسخة أندرويد."
      }
    ],
    "links": {
      "play": "https://bara-el-salfa.wasmer.app/",
      "download": "downloads/apk/bara-el-salfa.apk",
      "source": "https://github.com/codeprintomar/bara-el-salfa"
    },
    "rev": 2
  },
  {
    "id": "flosy",
    "name": "Flosy",
    "tagline": "App • Web",
    "category": "tools",
    "icon": "💸",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "تطبيق ذكي لإدارة المصروفات وتتبع دخلك ونفقاتك بسهولة، متاح من المتصفح وكمان كملف APK لأندرويد.",
    "description": [
      "Flosy تطبيق بيساعدك تسجل دخلك ومصروفاتك وتتابعهم في مكان واحد، بشكل بسيط وسريع من غير تعقيد.",
      "شغال على الويب مباشرة، وكمان متاح كملف APK لتحميله وتشغيله على أندرويد."
    ],
    "screenshots": [],
    "changelog": [
      {
        "version": "1.0",
        "date": "2026-10",
        "notes": "الإصدار الأول — نسخة الويب ونسخة أندرويد."
      }
    ],
    "links": {
      "play": "https://mahfsa.wasmer.app/",
      "download": "downloads/apk/Flosy.apk",
      "source": "https://github.com/codeprintomar/Flosy"
    },
    "rev": 2
  },
  {
    "id": "gradeos",
    "name": "GradeOS",
    "tagline": "Web • App",
    "category": "tools",
    "icon": "🎓",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "موقع عربي لمتابعة الدرجات والحضور والجدول والمذاكرة في مكان واحد، متاح من المتصفح وكمان كتطبيق.",
    "description": [
      "GradeOS (متابعة درجاتك) موقع عربي بيجمع متابعة الدرجات والحضور وجدول الحصص ومخطط المذاكرة والشات وقائمة المنصات التعليمية.",
      "اتبنى بـ HTML وCSS وJavaScript مع Chart.js للرسوم البيانية، وFirebase للتسجيل وتخزين البيانات، وتصميمه متظبط للموبايل."
    ],
    "screenshots": [],
    "changelog": [
      {
        "version": "1.0",
        "date": "2026-10",
        "notes": "الإصدار الأول — نسخة الويب ونسخة أندرويد."
      }
    ],
    "links": {
      "play": "https://gradeos.wasmer.app/",
      "download": "downloads/apk/GradeOS.apk",
      "source": "https://github.com/codeprintomar/Gradeos"
    },
    "rev": 3
  },
  {
    "id": "wave",
    "name": "Wave",
    "tagline": "Web • Music",
    "category": "web",
    "icon": "🌊",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "مشغّل موسيقى بيشتغل من المتصفح، بتضيف ملفاتك وبتتحكم في الطابور والتكرار والمفضلة.",
    "description": [
      "Wave مشغّل موسيقى بيشتغل مباشرة من المتصفح من غير تثبيت: بتختار ملفاتك وبيرتبهم في طابور تشغيل (queue).",
      "فيه تشغيل عشوائي (shuffle) وتكرار (repeat) ومفضلة والتحكم في الصوت."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/wave/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/Wave"
    },
    "rev": 3
  },
  {
    "id": "habits-os",
    "name": "Habits OS",
    "tagline": "Web • Tool",
    "category": "tools",
    "icon": "✅",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "متتبع عادات يومي بإحصائيات وإنجازات وسلاسل التزام (streaks)، وبتقدر تصدّر بياناتك وتستوردها.",
    "description": [
      "Habits OS بيساعدك تبني عاداتك وتتابعها يوميًا: سلاسل التزام، صفحة إحصائيات، وإنجازات بتحفزك تكمل.",
      "البيانات بتتحفظ على جهازك، وفيه تصدير واستيراد للنسخ الاحتياطية وإعدادات للمظهر."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/habits-os/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/Habit-os"
    },
    "rev": 2
  },
  {
    "id": "time-tracker",
    "name": "Daily Time Tracker",
    "tagline": "Web • Tool",
    "category": "tools",
    "icon": "⏱️",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "أداة بتوزّع بيها ساعات يومك الـ24 على الأنشطة، وتعدّل الأنشطة وتضيف جديدة.",
    "description": [
      "Daily Time Tracker بيخليك تشوف يومك متوزّع على أنشطتك (Time Allocation) وتعدّل الأنشطة وتضيف أنشطة جديدة.",
      "فيه زر Reset لبداية يوم جديد، والبيانات بتتحفظ على جهازك."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/time-tracker/index.html",
      "download": null,
      "source": null
    }
  },
  {
    "id": "outfit-closet",
    "name": "My Outfit Closet",
    "tagline": "Web • Tool",
    "category": "tools",
    "icon": "👕",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "دولابك الرقمي: سجّل قطع هدومك وجمّع منها أطقم، واقتراح أطقم حسب الموسم والحالة.",
    "description": [
      "My Outfit Closet بيخليك تنظّم قطع هدومك بالتصنيف والموسم وحالة القطعة (متاحة، في الغسيل، تالفة).",
      "بتولّد أطقم بسرعة (Quick Outfit) أو بالاقتراح (Suggest Outfit) أو 5 أطقم مرة واحدة، وتصوّر طقم النهارده.",
      "الصور والبيانات بتتخزن على جهازك في المتصفح (IndexedDB)، وفيه تصدير واستيراد."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/outfit-closet/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/My-Outfit-Closet"
    },
    "rev": 2
  },
  {
    "id": "qformat",
    "name": "QFormat",
    "tagline": "Web • Tool",
    "category": "tools",
    "icon": "📝",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "بتنسّق أسئلتك وإجاباتها وتطلّعها PDF جاهز للطباعة بتصميم A4.",
    "description": [
      "QFormat أداة لتنسيق الأسئلة (اختيارات وإجابات) وطباعتها كـ PDF مرتب، بخطوط وثيمات تختار منها.",
      "بتتبني بـ HTML وJavaScript مع html2canvas وjsPDF، وفيها استيراد للبيانات."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/qformat/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/Q-Format"
    },
    "rev": 2
  },
  {
    "id": "code-formatter",
    "name": "منسّق الأكواد والنصوص",
    "tagline": "Web • Tool",
    "category": "tools",
    "icon": "🎨",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "أداة عربي لتنسيق وتلوين النصوص والأكواد بمعاينة مباشرة، وتصديرها PDF أو صورة.",
    "description": [
      "أداة بتحرر فيها النص أو الكود وتشوف المعاينة المباشرة بتلوين الأكواد (highlight.js) وثيمات متعددة.",
      "تقدر تصدّر النتيجة PDF أو صورة PNG، والواجهة عربي بالكامل."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/code-formatter/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/Code-and-Text-Formatter"
    },
    "rev": 2
  },
  {
    "id": "todo-web",
    "name": "قائمة المهام اليومية",
    "tagline": "Web • Tool",
    "category": "tools",
    "icon": "📋",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "موقع لإدارة المهام اليومية بقاعدة بيانات سحابية.",
    "description": [
      "قائمة مهام يومية بواجهة عربي، بتحفظ مهامك على قاعدة بيانات سحابية (Neon) عن طريق Netlify Functions."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": null,
      "source": "https://github.com/codeprintomar/to-do-list-web"
    },
    "rev": 2
  },
  {
    "id": "lohaty",
    "name": "لوحتي",
    "tagline": "Web • PWA",
    "category": "tools",
    "icon": "🗂️",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "لوحة شخصية للمواعيد والمهام والمحاضرات بتزامن بين أجهزتك وإشعارات تفتكرك.",
    "description": [
      "لوحتي تطبيق ويب (PWA) بيجمع مواعيدك ومهامك ومحاضراتك في مكان واحد، وبيتثبت على الموبايل.",
      "الدخول بجوجل أو إيميل وباسورد، والبيانات بتتزامن لحظيًا بين كل أجهزتك عبر Firebase.",
      "فيه إشعارات من السيرفر: تذكير المواعيد، وتسليم المهام، ونزول المحاضرات، وكمان نسخة احتياطية (تصدير واسترجاع)."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": null,
      "source": "https://github.com/codeprintomar/Orbit"
    },
    "rev": 2
  },
  {
    "id": "todo-desktop",
    "name": "Advanced To-Do List",
    "tagline": "Desktop • Python",
    "category": "tools",
    "icon": "🖥️",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "برنامج مهام للكمبيوتر بـ Python وPyQt5: تسجيل دخول، تذكيرات، وتصدير PDF وExcel.",
    "description": [
      "Advanced To-Do List برنامج مكتبي مكتوب بـ Python وPyQt5، فيه حسابات مستخدمين بتشفير كلمات السر (bcrypt) وصورة بروفايل.",
      "بيدعم تذكيرات بإشعارات سطح المكتب، وتصدير المهام لملفات PDF وExcel."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": null,
      "source": "https://github.com/codeprintomar/Advanced-To-Do-List-app"
    },
    "rev": 2
  },
  {
    "id": "focus-tracker",
    "name": "Focus Tracker",
    "tagline": "Desktop • Python",
    "category": "tools",
    "icon": "🍅",
    "status": "live",
    "progress": null,
    "eta": null,
    "shortDesc": "برنامج Pomodoro احترافي لويندوز: تسجيل دخول، جلسات تركيز، وإحصائيات برسوم بيانية.",
    "description": [
      "Focus Tracker برنامج Pomodoro مكتوب بـ Python وCustomTkinter، بيسجل جلسات التركيز في قاعدة بيانات SQLite.",
      "فيه تسجيل دخول، وإحصائيات برسوم بيانية (Matplotlib)، وإشعارات وأصوات، وخيار بدء الاستراحة تلقائيًا.",
      "نسخة EXE كاملة جاهزة للتحميل وتشتغل على ويندوز من غير تثبيت Python."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": "downloads/FocusTracker.exe",
      "source": "https://github.com/codeprintomar/Focus-Tracker"
    },
    "rev": 2
  },
  {
    "id": "voice-controller",
    "name": "Voice Controller",
    "tagline": "Software • AI",
    "category": "ai",
    "icon": "🎙️",
    "status": "soon",
    "progress": 25,
    "eta": "قريبًا — يتحدد بعد اختبار التعرف على الصوت",
    "shortDesc": "أداة للتحكم بالصوت، جزء من التجارب اللي CodePrint بتخوضها في مجال الـ AI.",
    "description": [
      "Voice Controller هو مساعد صوتي بيتحكم في الجهاز بالأوامر الصوتية، وبيتطور كتجربة عملية في مجال الـ AI والـ Python.",
      "التركيز دلوقتي على تحسين دقة التعرف على الصوت والاستجابة قبل الإصدار الأول."
    ],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": null,
      "source": null
    }
  }
];
