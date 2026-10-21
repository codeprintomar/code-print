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
const projectsData = [
  {
    id: "bara-el-salfa",
    name: "برا السالفة",
    tagline: "Game • Web",
    category: "games",
    icon: "🎮",
    status: "live",
    progress: null,
    eta: null,
    shortDesc: "لعبة من تطوير CodePrint، متاحة للعب مباشرة من المتصفح، وكمان في نسخة تنزيل لأجهزة أندرويد.",
    description: [
      "برا السالفة هي أول لعبة كاملة بنشرها من CodePrint، اتبنت بهدف تجربة دورة تطوير لعبة من الصفر لحد النشر: التصميم، اللوجيك، والاختبار على المتصفح والموبايل.",
      "اللعبة شغالة على الويب مباشرة (WebAssembly عبر Wasmer)، وكمان متاحة كملف APK لتحميلها وتشغيلها على أندرويد من غير متصفح."
    ],
    screenshots: [],
    changelog: [
      { version: "1.0", date: "2026-08", notes: "الإصدار الأول — نسخة الويب ونسخة أندرويد." }
    ],
    links: {
      play: "https://bara-el-salfa.wasmer.app/",
      download: "Apk/bara-el-salfa.apk",
      source: null
    }
  },
    {
    id: "flosy",
    name: "Flosy",
    tagline: "App • Web",
    category: "tools",
    icon: "💸",
    status: "live",
    progress: null,
    eta: null,
    shortDesc: "تطبيق ذكي لإدارة المصروفات وتتبع دخلك ونفقاتك بسهولة، متاح من المتصفح وكمان كملف APK لأندرويد.",
    description: [
      "Flosy تطبيق بيساعدك تسجل دخلك ومصروفاتك وتتابعهم في مكان واحد، بشكل بسيط وسريع من غير تعقيد.",
      "شغال على الويب مباشرة، وكمان متاح كملف APK لتحميله وتشغيله على أندرويد."
    ],
    screenshots: [],
    changelog: [
      { version: "1.0", date: "2026-10", notes: "الإصدار الأول — نسخة الويب ونسخة أندرويد." }
    ],
    links: {
      play: "https://mahfsa.wasmer.app/",
      download: "Apk/Flosy.apk",
      source: null
    }
  },
  {
    id: "gradeos",
    name: "GradeOS",
    tagline: "Web • App",
    category: "tools",
    icon: "🎓",
    status: "live",
    progress: null,
    eta: null,
    shortDesc: "موقع عربي لمتابعة الدرجات والحضور والجدول والمذاكرة في مكان واحد، متاح من المتصفح وكمان كتطبيق.",
    description: [
      "GradeOS (متابعة درجاتك) موقع عربي بيجمع متابعة الدرجات والحضور وجدول الحصص ومخطط المذاكرة والشات وقائمة المنصات التعليمية.",
      "اتبنى بـ HTML وCSS وJavaScript مع Chart.js للرسوم البيانية، وFirebase للتسجيل وتخزين البيانات، وتصميمه متظبط للموبايل."
    ],
    screenshots: [],
    changelog: [
      { version: "1.0", date: "2026-10", notes: "الإصدار الأول — نسخة الويب ونسخة أندرويد." }
    ],
    links: {
      play: "ضع_لينك_الموقع_هنا",
      download: "Apk/GradeOS.apk",
      source: null
    }
  },
  
  {
    id: "wave",
    name: "Wave",
    tagline: "Web • App",
    category: "web",
    icon: "🌊",
    status: "soon",
    progress: 65,
    eta: "قريبًا — الخريف 2026",
    shortDesc: "مشروع جديد لسه تحت التطوير، التفاصيل هتتحدّث هنا أول ما يبقى جاهز.",
    description: [
      "Wave لسه في مرحلة مبكرة من التطوير. التفاصيل الكاملة عن الفكرة وإزاي بيتبنى هتتحدث هنا أول ما التصميم والبنية يستقروا."
    ],
    screenshots: [],
    changelog: [],
    links: { play: null, download: null, source: null }
  },
  {
    id: "voice-controller",
    name: "Voice Controller",
    tagline: "Software • AI",
    category: "ai",
    icon: "🎙️",
    status: "soon",
    progress: 25,
    eta: "قريبًا — يتحدد بعد اختبار التعرف على الصوت",
    shortDesc: "أداة للتحكم بالصوت، جزء من التجارب اللي CodePrint بتخوضها في مجال الـ AI.",
    description: [
      "Voice Controller هو مساعد صوتي بيتحكم في الجهاز بالأوامر الصوتية، وبيتطور كتجربة عملية في مجال الـ AI والـ Python.",
      "التركيز دلوقتي على تحسين دقة التعرف على الصوت والاستجابة قبل الإصدار الأول."
    ],
    screenshots: [],
    changelog: [],
    links: { play: null, download: null, source: null }
  }
];
