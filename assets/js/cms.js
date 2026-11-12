/* يقرأ المحتوى اللي بتعدله من admin.html (Firestore) ويطبقه على الموقع.
   لو Firebase مش متظبط أو فشل، الموقع بيشتغل بالملفات المحلية زي ما هي. */
window.CMS_TEXTS = [{"key": "heroLead", "label": "الوصف تحت العنوان الرئيسي", "text": "بنبني برامج وأدوات مفيدة، ونجرب أفكار جديدة في البرمجة والـ AI والـ Data."}, {"key": "aboutTitle", "label": "عنوان قسم \"إيه هي\"", "text": "إيه هي CodePrint؟"}, {"key": "aboutAr", "label": "نص من نحن (عربي)", "text": "CodePrint هي مساحة بنبني فيها برامج وأدوات وتجارب برمجية مفيدة، وبنشارك الرحلة من الفكرة لحد المشروع النهائي."}, {"key": "aboutEn", "label": "نص من نحن (English)", "text": "CodePrint is a personal software project focused on building useful applications, tools, and experiments while exploring programming, AI, and data."}, {"key": "projectsTitle", "label": "عنوان قسم المشاريع", "text": "آخر المشاريع"}, {"key": "projectsSub", "label": "وصف قسم المشاريع", "text": "مشاريع حقيقية بنشتغل عليها وبنطورها باستمرار."}, {"key": "buildTitle", "label": "عنوان مجالات الشغل", "text": "مجالات الشغل"}, {"key": "f1t", "label": "مجال 1 — العنوان", "text": "Software"}, {"key": "f1d", "label": "مجال 1 — الوصف", "text": "برامج وأدوات لحل مشاكل حقيقية."}, {"key": "f2t", "label": "مجال 2 — العنوان", "text": "Web"}, {"key": "f2d", "label": "مجال 2 — الوصف", "text": "مواقع وتطبيقات Web."}, {"key": "f3t", "label": "مجال 3 — العنوان", "text": "AI"}, {"key": "f3d", "label": "مجال 3 — الوصف", "text": "تجارب ومشاريع في الذكاء الاصطناعي."}, {"key": "f4t", "label": "مجال 4 — العنوان", "text": "Data"}, {"key": "f4d", "label": "مجال 4 — الوصف", "text": "تحليل البيانات والمشاريع المتعلقة بها."}, {"key": "whyTitle", "label": "عنوان \"ليه CodePrint\"", "text": "ليه CodePrint؟"}, {"key": "w1t", "label": "سبب 1 — العنوان", "text": "Real Projects"}, {"key": "w1d", "label": "سبب 1 — الوصف", "text": "بنركز على بناء مشاريع فعلية."}, {"key": "w2t", "label": "سبب 2 — العنوان", "text": "Useful Tools"}, {"key": "w2d", "label": "سبب 2 — الوصف", "text": "الهدف إن المشاريع تكون مفيدة فعلًا."}, {"key": "w3t", "label": "سبب 3 — العنوان", "text": "Open Learning"}, {"key": "w3d", "label": "سبب 3 — الوصف", "text": "بنشارك اللي بنتعلمه والتجارب اللي بنمر بيها."}, {"key": "contactTitle", "label": "عنوان قسم التواصل", "text": "تواصل معانا"}, {"key": "contactSub", "label": "وصف قسم التواصل", "text": "كل قنوات التواصل مع CodePrint في مكان واحد."}, {"key": "formTitle", "label": "عنوان فورم الرسالة", "text": "ابعتلنا رسالة"}, {"key": "formLead", "label": "وصف فورم الرسالة", "text": "هنرد عليك في أقرب وقت."}];
window.siteTexts = {};
(function () {
  var C = window.CMS_CONFIG || {}, KEY = 'codeprint-cms';
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  window.CMS_LOCAL = clone({ projects: window.projectsData || [], links: window.linksData || [] });

  // مفاتيح كل عناصر ملفات الموقع (مشروع = id، رابط = القسم|الاسم)
  window.cmsKeys = function (local) {
    var k = [];
    (local.projects || []).forEach(function (p) { k.push(p.id); });
    (local.links || []).forEach(function (s) { s.items.forEach(function (i) { k.push(s.title + '|' + i.name); }); });
    return k;
  };

  // يدمج المحفوظ في الداشبورد مع ملفات الموقع:
  // - أي عنصر جديد في الملفات (ومش اتحفظ قبل كده) بيتضاف تلقائيًا
  // - عنصر بنفس المعرّف بنسخة rev أعلى في الملفات بيحل محل المحفوظ
  // - اللي مسحته من الداشبورد (موجود في known) مبيرجعش
  window.cmsMerge = function (remote, local) {
    var known = remote.known || [], r = clone(remote);
    var P = Array.isArray(r.projects) ? r.projects : [], L = Array.isArray(r.links) ? r.links : [];
    (local.projects || []).forEach(function (p) {
      var k = P.findIndex(function (x) { return x.id === p.id; });
      if (k < 0) { if (known.indexOf(p.id) < 0) P.push(clone(p)); }
      else if ((p.rev || 0) > (P[k].rev || 0)) P[k] = clone(p);
    });
    (local.links || []).forEach(function (s) {
      var k = L.findIndex(function (x) { return x.title === s.title; });
      if (k < 0) {
        var fresh = s.items.filter(function (i) { return known.indexOf(s.title + '|' + i.name) < 0; });
        if (fresh.length || !known.length) L.push({ title: s.title, icon: s.icon, items: clone(fresh) });
        return;
      }
      s.items.forEach(function (i) {
        var j = L[k].items.findIndex(function (x) { return x.name === i.name; });
        if (j < 0) { if (known.indexOf(s.title + '|' + i.name) < 0) L[k].items.push(clone(i)); }
        else if ((i.rev || 0) > (L[k].items[j].rev || 0)) L[k].items[j] = clone(i);
      });
    });
    return { projects: P, links: L };
  };

  function apply(d) {
    if (!d) return;
    var m = window.cmsMerge(d, window.CMS_LOCAL);
    if (window.CMS_LOCAL.projects.length || Array.isArray(d.projects)) window.projectsData = m.projects;
    if (window.CMS_LOCAL.links.length || Array.isArray(d.links)) window.linksData = m.links;
    if (d.texts) window.siteTexts = d.texts;
  }
  window.cmsReady = (async function () {
    if (!C.projectId || C.projectId.indexOf('YOUR') === 0) return;
    try { apply(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (e) {}
    try {
      var ctrl = new AbortController(), t = setTimeout(function () { ctrl.abort(); }, 2000);
      var r = await fetch('https://firestore.googleapis.com/v1/projects/' + C.projectId +
        '/databases/(default)/documents/site/content?key=' + C.apiKey, { signal: ctrl.signal });
      clearTimeout(t);
      if (r.ok) {
        var d = JSON.parse((await r.json()).fields.json.stringValue);
        apply(d);
        localStorage.setItem(KEY, JSON.stringify(d));
      }
    } catch (e) {}
  })();
})();
