/* CodePrint — EN/AR switcher. Matches English text nodes against a dictionary, so markup stays plain. */
(function () {
  var D = {
    'Home': 'الرئيسية', 'Projects': 'المشاريع', 'Store': 'المتجر', 'Links': 'الروابط', 'About': 'عنّا', 'Contact': 'تواصل',
    'Welcome to CodePrint': 'أهلًا بك في CodePrint',
    'A platform where we turn ideas into real projects, share useful tools, and explore the world of programming.': 'منصة بنحوّل فيها الأفكار لمشاريع حقيقية، وبنشارك أدوات مفيدة، وبنستكشف عالم البرمجة.',
    'Explore Projects': 'استكشف المشاريع', 'Visit GitHub': 'زيارة GitHub',
    'Build': 'ابنِ', 'Learn': 'تعلّم', 'Grow': 'انمُ',
    'Programming': 'البرمجة', 'Learn and practice programming concepts': 'تعلّم وطبّق مفاهيم البرمجة',
    'Useful Projects': 'مشاريع مفيدة', 'Explore real-world projects': 'استكشف مشاريع حقيقية',
    'Smart Ideas': 'أفكار ذكية', 'Discover new ideas and tools': 'اكتشف أفكارًا وأدوات جديدة',
    'Continuous Growth': 'نمو مستمر', 'Grow with CodePrint': 'انمُ مع CodePrint',
    'Our': '', 'View All Projects': 'كل المشاريع',
    'Real Projects': 'مشاريع حقيقية', 'We focus on building things that actually work.': 'بنركز على بناء حاجات بتشتغل فعلًا.',
    'Useful Tools': 'أدوات مفيدة', 'Every project aims to solve a real problem.': 'كل مشروع هدفه حل مشكلة حقيقية.',
    'Open Learning': 'تعلّم مفتوح', 'We share what we learn along the way.': 'بنشارك اللي بنتعلمه في الطريق.',
    'Get in': '', 'Touch': 'تواصل معنا',
    'Message us directly': 'راسلنا مباشرة', 'Our source code': 'الأكواد المصدرية', 'Follow daily updates': 'تابع التحديثات',
    'Watch our work': 'شاهد أعمالنا', 'Short videos': 'فيديوهات قصيرة', 'All our links': 'كل روابطنا',
    'Send us a message': 'ابعتلنا رسالة', "We'll get back to you as soon as possible.": 'هنرد عليك في أقرب وقت.',
    'Name': 'الاسم', 'Email': 'الإيميل', 'Message': 'الرسالة', 'Send': 'إرسال',
    'Everything we build — what is live and what is coming next.': 'كل اللي بنبنيه — اللي شغال واللي جاي.',
    'Search projects...': 'ابحث في المشاريع...', 'Explore': 'استكشف',
    'All our sites, apps and downloads in one place. Social accounts are in the': 'كل مواقعنا وتطبيقاتنا وتحميلاتنا في مكان واحد. حسابات التواصل في',
    'contact section': 'قسم التواصل',
    /* dynamic (projects.js) */
    'All': 'الكل', 'Games': 'ألعاب', 'AI': 'AI', 'Tools': 'أدوات', 'Web': 'Web',
    'Free': 'مجاني', 'Soon': 'قريبًا', 'Try it': 'جرّب', 'Download': 'تحميل', 'GitHub': 'GitHub',
    'No matching projects.': 'مفيش مشاريع مطابقة.', 'About the project': 'عن المشروع', 'Changelog': 'سجل التحديثات',
    'No updates recorded yet.': 'لسه مفيش تحديثات مسجّلة.', 'Source code on GitHub': 'الكود على GitHub', 'Screenshots': 'صور من المشروع',
    'Previous': 'السابق', 'Next': 'التالي', 'Project not found.': 'المشروع غير موجود.'
  };
  var TAG = { 'Code': 'برمج', 'Create': 'ابدع', 'Innovate': 'ابتكر' };
  var SKIP = 'script,style,textarea,[data-cms],.logo,.hero h1,.wordmark';
  var orig = new WeakMap(), lang = 'en';
  try { lang = localStorage.getItem('codeprint-lang') === 'ar' ? 'ar' : 'en'; } catch (e) {}

  window.CP = window.CP || {};
  CP.lang = function () { return lang; };
  CP.t = function (s) { return lang === 'ar' && D[s] != null ? D[s] : s; };

  function tr(node, ar) {
    var p = node.parentElement;
    if (!p || p.closest(SKIP)) return;
    var o = orig.has(node) ? orig.get(node) : node.nodeValue;
    var key = o.trim().replace(/\s+/g, ' ');
    var map = p.closest('.tagline') ? TAG : D;
    if (!key || map[key] == null) return;
    if (!orig.has(node)) orig.set(node, o);
    node.nodeValue = ar ? o.replace(o.trim(), map[key]) : o;
  }
  function walk(ar) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (x) { tr(x, ar); });
    document.querySelectorAll('[placeholder]').forEach(function (e) {
      if (!e.dataset.ph) e.dataset.ph = e.getAttribute('placeholder');
      e.setAttribute('placeholder', ar && D[e.dataset.ph] ? D[e.dataset.ph] : e.dataset.ph);
    });
  }
  function apply(fire) {
    var ar = lang === 'ar', h = document.documentElement;
    h.lang = lang; h.dir = ar ? 'rtl' : 'ltr';
    walk(ar);
    var b = document.querySelector('.lang-toggle');
    if (b) { b.textContent = ar ? 'EN' : 'AR'; b.setAttribute('aria-label', ar ? 'Switch to English' : 'التبديل للعربية'); }
    if (fire) document.dispatchEvent(new CustomEvent('cp:lang'));
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.lang-toggle')) return;
    lang = lang === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem('codeprint-lang', lang); } catch (x) {}
    apply(true);
  });
  apply(false);
})();
