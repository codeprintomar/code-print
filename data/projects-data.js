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
  - price          السعر بالجنيه المصري (رقم). null = مش للبيع لسه (زي المشاريع القادمة)
  - subtitle       سطر قصير بالإنجليزي يظهر في كارد الصفحة الرئيسية
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
    "shortDesc": "لعبة جماعية للأصدقاء، تقدر تلعبها مباشرة من المتصفح أو على أندرويد.",
    "description": [
      "برا السالفة لعبة جماعية بتجمع الأصدقاء في جولات مليانة تخمين وضحك وتفاعل. الفكرة إن كل لاعب يحاول يفهم سياق الجولة ويشارك من غير ما يكشف دوره.",
      "المشروع من أوائل تجارب CodePrint الكاملة، ومرّ بمراحل التصميم والبرمجة والاختبار قبل إتاحته على الويب، مع نسخة أندرويد."
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
      "download": null,
      "source": "https://github.com/codeprintomar/bara-el-salfa"
    },
    "rev": 4,
    "subtitle": "Party Game for Friends",
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
    "shortDesc": "تابع دخلك ومصروفاتك، وافهم فلوسك بتروح فين من خلال تقارير وتحليلات واضحة.",
    "description": [
      "Flosy تطبيق لإدارة الأموال الشخصية، بيساعدك تسجل مصادر الدخل والمصروفات وتراجع حركتك المالية من مكان واحد.",
      "من خلال التقارير والتحليلات تقدر تتابع توزيع مصروفاتك وتلاحظ أنماط الإنفاق، مع نصائح تساعدك تخطط وتدير ميزانيتك بشكل أوضح. متاح للاستخدام من المتصفح، وله نسخة أندرويد."
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
      "download": null,
      "source": "https://github.com/codeprintomar/Flosy"
    },
    "rev": 4,
    "subtitle": "Expense Tracker App",
  },
  {
    "id": "gradeos",
    "name": "GradeOS",
    "tagline": "Web • App",
    "category": "tools",
    "icon": "🎓",
    "status": "soon",
    "progress": null,
    "eta": "قيد التطوير",
    "shortDesc": "منصة للطلاب تجمع متابعة الدرجات والحضور والجدول وتنظيم المذاكرة في مكان واحد.",
    "description": [
      "GradeOS منصة تعليمية عربية لتنظيم الحياة الدراسية؛ تقدر تتابع درجاتك وحضورك، وترجع لجدول الحصص، وتخطط للمذاكرة من واجهة واحدة.",
      "بتضم المنصة أدوات مساعدة للطالب، منها مخطط للمذاكرة وقائمة للمنصات التعليمية ومساحة للتواصل. اتبنت باستخدام HTML وCSS وJavaScript، مع Firebase لإدارة الحسابات والبيانات وChart.js لعرض الإحصائيات."
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
      "download": null,
      "source": "https://github.com/codeprintomar/Gradeos"
    },
    "rev": 5,
    "subtitle": "Students & Grades Manager",
    "isProduct": true,
    "isPaid": true,
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
    "shortDesc": "مشغّل موسيقى على الويب لتشغيل ملفاتك وتنظيم قائمة الاستماع والتحكم فيها.",
    "description": [
      "Wave مشغّل موسيقى يعمل من المتصفح؛ اختار ملفات الصوت من جهازك وأنشئ قائمة تشغيل من غير الحاجة إلى تثبيت برنامج.",
      "نظّم ترتيب المقاطع من خلال قائمة التشغيل، واستخدم التشغيل العشوائي والتكرار والمفضلة، وتحكّم في مستوى الصوت بسهولة."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/wave/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/Wave"
    },
    "rev": 4,
    "subtitle": "Browser Music Player",
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
    "shortDesc": "نظّم عاداتك اليومية وتابع الاستمرارية والإنجازات والإحصائيات في مكان واحد.",
    "description": [
      "Habits OS أداة لمتابعة العادات اليومية ومساعدتك على الالتزام بها. أضف عاداتك وسجّل إنجازك كل يوم، وتابع سلاسل الاستمرارية والإحصائيات.",
      "تتضمن الأداة إنجازات تحفيزية وإعدادات للمظهر، مع إمكانية تصدير بياناتك واستيرادها للاحتفاظ بنسخة احتياطية. تُحفظ البيانات محليًا على جهازك."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/habits-os/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/Habit-os"
    },
    "rev": 4,
    "subtitle": "Habit Tracker",
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
    "shortDesc": "خطّط ليومك بتوزيع الساعات الـ24 على الأنشطة وشوف وقتك متقسم إزاي.",
    "description": [
      "Daily Time Tracker أداة بسيطة لتخطيط اليوم بصريًا، من خلال توزيع ساعات اليوم الأربع والعشرين على الأنشطة المختلفة.",
      "تقدر تعدّل الأنشطة الموجودة أو تضيف أنشطة جديدة، وتبدأ يومًا جديدًا باستخدام Reset. بياناتك بتتحفظ على جهازك."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/time-tracker/index.html",
      "download": null,
      "source": null
    },
    "subtitle": "24-Hour Day Planner",
    "rev": 4
  },
  {
    "id": "outfit-closet",
    "name": "My Outfit Closet",
    "tagline": "Web • Tool",
    "category": "tools",
    "icon": "👕",
    "status": "soon",
    "progress": null,
    "eta": "قيد التطوير",
    "shortDesc": "حوّل دولابك لمساحة رقمية لتنظيم قطع الملابس وتجميع إطلالات مناسبة.",
    "description": [
      "My Outfit Closet يساعدك تسجّل قطع الملابس في دولاب رقمي، وتصنّفها وتتابع حالتها عشان تعرف القطع المتاحة للاستخدام.",
      "كوّن إطلالات بنفسك أو استخدم اقتراحات وتجميعات سريعة، مع إمكانية حفظ إطلالة اليوم. الصور والبيانات بتتحفظ داخل المتصفح، وتقدر تصدّرها أو تستوردها للاحتفاظ بنسخة احتياطية."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/outfit-closet/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/My-Outfit-Closet"
    },
    "rev": 5,
    "subtitle": "Your Style, Organized",
    "isProduct": true,
    "isPaid": true,
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
    "shortDesc": "نسّق الأسئلة والاختيارات والإجابات في أوراق منظمة، وجهّزها للطباعة بصيغة PDF.",
    "description": [
      "QFormat أداة لإنشاء أوراق أسئلة منظمة؛ أضف السؤال والاختيارات والإجابة، ثم رتّب المحتوى في صفحة مناسبة للطباعة.",
      "تقدر تخصّص شكل الورقة من خلال الخطوط والثيمات، وتستورد البيانات وتصدر النتيجة بصيغة PDF."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/qformat/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/Q-Format"
    },
    "rev": 4,
    "subtitle": "Question Sheets to PDF",
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
    "shortDesc": "نسّق الأكواد والنصوص مع معاينة مباشرة، ثم صدّر النتيجة كصورة أو PDF.",
    "description": [
      "منسّق الأكواد والنصوص أداة لتحرير المحتوى وتنسيقه مع معاينة مباشرة أثناء الكتابة، وتلوين الأكواد لتسهيل قراءتها.",
      "اختار من بين ثيمات متعددة، وبعد ما تخلص صدّر النتيجة كصورة PNG أو ملف PDF. الواجهة مصممة باللغة العربية."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": "projects/code-formatter/index.html",
      "download": null,
      "source": "https://github.com/codeprintomar/Code-and-Text-Formatter"
    },
    "rev": 4,
    "subtitle": "Code & Text Formatter",
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
    "shortDesc": "نظّم مهامك اليومية وتابعها من خلال قائمة مهام بواجهة عربية وحفظ سحابي.",
    "description": [
      "قائمة المهام اليومية تطبيق ويب يساعدك تضيف مهامك وترتبها وتتابع إنجازها من واجهة عربية بسيطة.",
      "تُحفظ البيانات على قاعدة بيانات سحابية باستخدام Neon وNetlify Functions، عشان تقدر ترجع لمهامك بدل ما تكون مرتبطة بجلسة متصفح واحدة."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": null,
      "source": "https://github.com/codeprintomar/to-do-list-web"
    },
    "rev": 4,
    "subtitle": "Daily Task Manager",
  },
  {
    "id": "lohaty",
    "name": "لوحتي",
    "tagline": "Web • PWA",
    "category": "tools",
    "icon": "🗂️",
    "status": "soon",
    "progress": null,
    "eta": "قيد التطوير",
    "shortDesc": "مساحة شخصية تجمع المواعيد والمهام والمحاضرات مع مزامنة وتنبيهات بين أجهزتك.",
    "description": [
      "لوحتي تطبيق ويب قابل للتثبيت (PWA) لتنظيم يومك؛ اجمع مواعيدك ومهامك ومحاضراتك في مساحة واحدة تقدر تفتحها من الموبايل أو الكمبيوتر.",
      "تسجيل الدخول متاح بحساب Google أو البريد الإلكتروني، والبيانات بتتزامن بين أجهزتك باستخدام Firebase. كمان يدعم التطبيق إشعارات للتذكير بالمواعيد والمهام والمحاضرات، مع إمكانية تصدير نسخة احتياطية واسترجاعها."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": null,
      "source": "https://github.com/codeprintomar/Orbit"
    },
    "rev": 5,
    "subtitle": "Personal Planner PWA",
    "isProduct": true,
    "isPaid": true,
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
    "shortDesc": "برنامج ويندوز لإدارة المهام باستخدام Python، مع حسابات وتذكيرات وتصدير PDF وExcel.",
    "description": [
      "Advanced To-Do List برنامج مكتبي لإدارة المهام، مبني باستخدام Python وPyQt5. يوفّر حسابات للمستخدمين مع حماية كلمات المرور، وإمكانية تخصيص صورة للملف الشخصي.",
      "يساعدك على تنظيم المهام ومتابعة مواعيدها من خلال إشعارات سطح المكتب، كما يتيح تصدير البيانات إلى ملفات PDF وExcel."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": null,
      "source": "https://github.com/codeprintomar/Advanced-To-Do-List-app"
    },
    "rev": 4,
    "subtitle": "Desktop Task Manager",
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
    "shortDesc": "تابع جلسات تركيزك واستراحاتك باستخدام Pomodoro، وراجع أداءك من خلال الإحصائيات.",
    "description": [
      "Focus Tracker برنامج لويندوز لتنظيم جلسات العمل والتركيز باستخدام أسلوب Pomodoro، مع تسجيل الجلسات والاحتفاظ بها في قاعدة بيانات SQLite.",
      "يوفّر حسابات للمستخدمين، وإحصائيات مرئية، وتنبيهات صوتية وإشعارات، بالإضافة إلى إمكانية بدء الاستراحة تلقائيًا. تتوفر نسخة تنفيذية EXE لتشغيل البرنامج على ويندوز من غير تثبيت Python."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": null,
      "source": "https://github.com/codeprintomar/Focus-Tracker"
    },
    "rev": 4,
    "subtitle": "Pomodoro for Windows",
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
    "shortDesc": "تجربة مساعد صوتي للتحكم في بعض وظائف الكمبيوتر باستخدام الأوامر المنطوقة.",
    "description": [
      "Voice Controller تجربة برمجية تستكشف استخدام التعرف على الكلام لتنفيذ أوامر صوتية والتحكم في الكمبيوتر.",
      "المشروع قيد التطوير، والعمل الحالي يركّز على تحسين دقة فهم الأوامر وسرعة الاستجابة قبل تحديد المزايا النهائية للإصدار الأول."
],
    "screenshots": [],
    "changelog": [],
    "links": {
      "play": null,
      "download": null,
      "source": null
    },
    "subtitle": "Voice Control with AI",
    "price": null,
    "rev": 4
  }
];
