var S = { texts: {}, projects: [], links: [] }, tab = 'texts', D = 0;
var X = { st: { products: [], settings: { methods: [], note: '', whatsapp: '' } }, sec: {} }, XL = 0, ORD = null;
var $ = function (s) { return document.querySelector(s); };
var esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
};
var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

firebase.initializeApp(CMS_CONFIG);
var auth = firebase.auth(), db = firebase.firestore(), ref = db.collection('site').doc('content');

function msg(t, bad) { var m = $('#msg'); m.textContent = t; m.className = bad ? 'err' : 'ok'; }
function dirty(v) { D = v === 0 ? 0 : 1; $('#st').textContent = D ? '● تغييرات غير محفوظة' : ''; }
window.onbeforeunload = function () { return D ? 'فيه تغييرات غير محفوظة' : undefined; };

// ---------- auth ----------
$('#login').onsubmit = function (e) {
  e.preventDefault();
  $('#lerr').textContent = '';
  auth.signInWithEmailAndPassword($('#em').value, $('#pw').value)
    .catch(function (x) { $('#lerr').textContent = 'فشل الدخول: ' + x.code; });
};
auth.onAuthStateChanged(function (u) {
  $('#login').hidden = !!u;
  $('#app').hidden = !u;
  if (u) load();
});

// ---------- load / save ----------
function load() {
  ref.get().then(function (s) {
    var d = s.exists ? JSON.parse(s.data().json) : {};
    S.texts = d.texts || {};
    var m = cmsMerge(d, window.CMS_LOCAL);
    S.projects = clone(m.projects);
    S.links = clone(m.links);
    CMS_TEXTS.forEach(function (t) { if (S.texts[t.key] == null) S.texts[t.key] = t.text; });
    S.projects.forEach(function (p) {
      p.links = p.links || { play: null, download: null, source: null };
      p.screenshots = p.screenshots || [];
      p.changelog = p.changelog || [];
      p.description = p.description || [];
      if (p.progress == null) p.progress = 0;
    });
    render();
    loadStore();
  }).catch(function (e) { msg('تعذر التحميل: ' + e.message, 1); });
}

function loadStore() {
  Promise.all([db.collection('site').doc('store').get(), db.collection('private').doc('secrets').get().catch(function () { return null; })])
    .then(function (r) {
      var d = r[0].exists ? JSON.parse(r[0].data().json) : {};
      X.st = { products: d.products || [], settings: Object.assign({ methods: [], note: '', whatsapp: '' }, d.settings || {}) };
      X.sec = r[1] && r[1].exists ? r[1].data() : {};
      (S.projects || []).forEach(function (p) {
        if (p.status === 'live' && +p.price > 0 && !X.st.products.some(function (x) { return x.id === p.id; }))
          X.st.products.push({ id: p.id, name: p.name, icon: p.icon || '📦', price: +p.price, badge: '', active: true, desc: p.shortDesc || '' });
      });
      XL = 1; render();
    }).catch(function (e) { msg('تعذر تحميل المتجر: ' + e.message, 1); });
}

function save() {
  var ids = {};
  for (var i = 0; i < S.projects.length; i++) {
    var id = S.projects[i].id;
    if (!/^[a-z0-9-]+$/.test(id) || ids[id]) return msg('المعرّف (id) غلط أو مكرر: ' + id, 1);
    ids[id] = 1;
  }
  S.known = cmsKeys(window.CMS_LOCAL);
  var ts = firebase.firestore.FieldValue.serverTimestamp(), jobs = [ref.set({ json: JSON.stringify(S), updated: ts })];
  if (XL) {
    X.st.products.forEach(function (p) { p.price = +p.price || 0; });
    jobs.push(db.collection('site').doc('store').set({ json: JSON.stringify(X.st), updated: ts }));
    jobs.push(db.collection('private').doc('secrets').set(X.sec));
  }
  Promise.all(jobs)
    .then(function () { dirty(0); msg('✓ اتحفظ — الموقع والمتجر هيتحدثوا فورًا'); })
    .catch(function (e) { msg('فشل الحفظ: ' + e.code, 1); });
}

// ---------- helpers ----------
function root(p) { return /^(st|sec)\./.test(p) ? X : S; }
function get(p) { return p.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, root(p)); }
function put(p, v) {
  var a = p.split('.'), l = a.pop(), o = a.reduce(function (o, k) { return o[k]; }, root(p));
  if (v === undefined) delete o[l]; else o[l] = v;
}

function F(label, p, o) {
  o = o || {};
  var v = get(p), a = ' data-p="' + p + '"' + (o.c ? ' data-c="' + o.c + '"' : ''), inner;
  if (o.c === 'lines') v = (v || []).join('\n');
  if (o.c === 'methods') v = (v || []).map(function (x) { return x.name + ' | ' + x.value; }).join('\n');
  if (o.c === 'log') v = (v || []).map(function (x) { return x.version + ' | ' + x.date + ' | ' + x.notes; }).join('\n');
  if (o.t === 'sel') {
    if (v == null) v = '';
    inner = '<select' + a + '>' + o.opts.map(function (x) {
      return '<option value="' + x[0] + '"' + (x[0] === v ? ' selected' : '') + '>' + x[1] + '</option>';
    }).join('') + '</select>';
  } else if (o.t === 'area') inner = '<textarea rows="' + (o.r || 3) + '"' + a + '>' + esc(v) + '</textarea>';
  else if (o.t === 'range') inner = '<input type="range" min="0" max="100"' + a + ' value="' + (v || 0) + '"><output>' + (v || 0) + '%</output>';
  else if (o.t === 'chk') inner = '<input type="checkbox"' + a + (v !== false ? ' checked' : '') + '>';
  else inner = '<input' + a + ' value="' + esc(v) + '">';
  return '<label class="f' + (o.t === 'area' ? ' wide' : '') + '">' + label + inner + '</label>';
}

function projHTML(p, i) {
  var b = 'projects.' + i + '.';
  return '<details class="card"><summary><span class="sum"><span class="tl">' + esc(p.icon) + '</span><b>' + esc(p.name) + '</b></span>' +
    '<span class="pills"><span class="pill free">مجاني</span>' +
    (p.status === 'live' ? '<span class="pill live">LIVE</span>' : '<span class="pill">قريبًا ' + (p.progress || 0) + '%</span>') + '</span></summary>' +
    '<h4 class="sec-h">الأساسيات</h4><div class="grid">' + F('الاسم', b + 'name') + F('الإيموجي', b + 'icon') +
    F('المعرّف id (إنجليزي بدون مسافات)', b + 'id') + F('التاج (Game • Web)', b + 'tagline') +
    F('التصنيف', b + 'category', { t: 'sel', opts: [['games', 'ألعاب'], ['ai', 'AI'], ['tools', 'أدوات'], ['web', 'Web']] }) +
    F('الحالة', b + 'status', { t: 'sel', opts: [['live', 'LIVE شغال'], ['soon', 'قريبًا']] }) +
    F('يظهر في صفحة المنتجات؟', b + 'isProduct', { t: 'chk' }) + F('منتج مدفوع؟', b + 'isPaid', { t: 'chk' }) +
    F('نسبة التقدم', b + 'progress', { t: 'range' }) + F('موعد الإطلاق', b + 'eta', { c: 'null' }) + '</div>' +
    '<h4 class="sec-h">الوصف</h4><div class="grid">' + F('وصف قصير', b + 'shortDesc', { t: 'area', r: 2 }) +
    F('وصف مفصّل (فقرة في كل سطر)', b + 'description', { t: 'area', c: 'lines', r: 4 }) + '</div>' +
    '<h4 class="sec-h">الروابط</h4><div class="grid">' + F('رابط التجربة', b + 'links.play', { c: 'null' }) +
    F('رابط التحميل', b + 'links.download', { c: 'null' }) + F('رابط الكود (GitHub)', b + 'links.source', { c: 'null' }) + '</div>' +
    '<h4 class="sec-h">الصور والتحديثات</h4><div class="grid">' + F('روابط صور (رابط في كل سطر)', b + 'screenshots', { t: 'area', c: 'lines', r: 2 }) +
    F('سجل التحديثات (version | date | notes في كل سطر)', b + 'changelog', { t: 'area', c: 'log', r: 3 }) + '</div>' +
    '<div class="row"><button data-a="up" data-i="' + i + '" aria-label="فوق">↑</button><button data-a="down" data-i="' + i +
    '" aria-label="تحت">↓</button><button class="del" data-a="delp" data-i="' + i + '">حذف المشروع</button></div></details>';
}

function linksHTML() {
  return S.links.map(function (s, i) {
    var b = 'links.' + i + '.';
    return '<details class="card" open><summary><span class="sum"><span class="tl">' + esc(s.icon) + '</span><b>' + esc(s.title) + '</b></span>' +
      '<span class="pills"><span class="pill live">' + s.items.length + ' رابط</span></span></summary><div class="grid">' +
      F('عنوان القسم', b + 'title') + F('أيقونة', b + 'icon') + '</div>' +
      s.items.map(function (it, j) {
        var c = b + 'items.' + j + '.';
        return '<div class="item"><div class="grid">' + F('الاسم', c + 'name') + F('أيقونة', c + 'icon') +
          F('الرابط', c + 'url', { c: 'null' }) +
          F('النوع', c + 'type', { t: 'sel', c: 'null', opts: [['', 'فتح عادي'], ['external', 'تبويب جديد'], ['download', 'تحميل']] }) +
          F('متاح؟', c + 'available', { t: 'chk', c: 'avail' }) + F('الوصف', c + 'description') + '</div>' +
          '<div class="row"><button class="del" data-a="deli" data-i="' + i + '" data-j="' + j + '">حذف الرابط</button></div></div>';
      }).join('') + '<div class="row"><button data-a="addi" data-i="' + i + '">+ رابط</button></div></details>';
  }).join('') + '<button class="add" data-a="adds">+ قسم جديد</button>';
}

function prodHTML(p, i) {
  var b = 'st.products.' + i + '.';
  return '<details class="card"><summary><span class="sum"><span class="tl">' + esc(p.icon) + '</span><b>' + esc(p.name) + '</b></span>' +
    '<span class="pills"><span class="pill ' + (p.active === false ? 'bad' : 'live') + '">' + (p.active === false ? 'مخفي' : 'معروض') + '</span><span class="pill">' + (+p.price || 0) + ' ج</span></span></summary>' +
    '<div class="grid">' + F('الاسم', b + 'name') + F('الإيموجي', b + 'icon') + F('السعر (جنيه)', b + 'price', { c: 'num' }) +
    F('شارة (مثلاً: جديد)', b + 'badge') + F('معروض في المتجر؟', b + 'active', { t: 'chk' }) +
    F('الوصف', b + 'desc', { t: 'area', r: 3 }) +
    F('🔒 رابط التسليم (سري — يتبعت للعميل بعد تأكيد الدفع فقط)', 'sec.' + p.id) + '</div>' +
    '<p class="tag">المعرّف: <code>' + esc(p.id) + '</code></p>' +
    '<div class="row"><button data-a="pup" data-i="' + i + '">↑</button><button data-a="pdown" data-i="' + i + '">↓</button><button class="del" data-a="pdel" data-i="' + i + '">حذف المنتج</button></div></details>';
}
function storeHTML() {
  if (!XL) return '<div class="card"><p class="tag">بيحمّل المتجر...</p></div>';
  var m = 'st.settings.';
  return '<h4 class="sec-h">المنتجات</h4><button class="add" data-a="padd">+ منتج جديد</button>' + X.st.products.map(prodHTML).join('') +
    '<h4 class="sec-h">إعدادات الدفع</h4><div class="card"><div class="grid">' +
    F('طرق الدفع (سطر لكل طريقة: الاسم | الرقم) مثال: InstaPay | name@instapay', m + 'methods', { t: 'area', c: 'methods', r: 3 }) +
    F('ملاحظة للعميل بعد الدفع', m + 'note', { t: 'area', r: 2 }) + F('رقم واتساب للدعم (بصيغة دولية 2010xxxxxxx)', m + 'whatsapp') +
    '</div></div><p class="tag">بعد أي تعديل اضغط 💾 حفظ فوق.</p>';
}
function ordersHTML() {
  var h = '<div class="row"><button data-a="oreload">↻ تحديث</button></div>';
  if (!ORD) return h + '<div class="card"><p class="tag">بيحمّل الطلبات...</p></div>';
  if (!ORD.length) return h + '<div class="card"><p class="tag">مفيش طلبات لسه.</p></div>';
  var L = { pending: ['في انتظار المراجعة', ''], paid: ['اتأكد ✓', 'paid'], rejected: ['مرفوض', 'bad'] };
  return h + ORD.map(function (o) {
    var st = L[o.status] || L.pending, t = o.created && o.created.toDate ? o.created.toDate().toLocaleString('ar-EG') : '';
    var ph = String(o.phone || '').replace(/\D/g, '');
    return '<div class="card"><div class="sum" style="padding:12px 0"><b>' + esc(o.pname) + ' — ' + esc(o.price) + ' ج</b><span class="pills"><span class="pill ' + st[1] + '">' + st[0] + '</span></span></div>' +
      '<p class="tag">👤 ' + esc(o.name) + ' · 📞 <a href="https://wa.me/' + (ph.indexOf('0') === 0 ? '2' + ph : ph) + '" target="_blank" style="color:var(--blue)">' + esc(o.phone) + '</a><br>' +
      '💳 ' + esc(o.method) + ' · رقم العملية/المحوّل منه: <b>' + esc(o.ref) + '</b><br>🕒 ' + t + ' · <code>' + esc(o.id) + '</code></p>' +
      '<div class="row">' + (o.status !== 'paid' ? '<button class="pri" data-a="ook" data-id="' + o.id + '">✓ تأكيد الدفع وتسليم</button>' : '') +
      (o.status === 'pending' ? '<button class="del" data-a="ono" data-id="' + o.id + '">رفض</button>' : '') +
      '<button class="del" data-a="odel" data-id="' + o.id + '">حذف</button></div></div>';
  }).join('');
}
function loadOrders() {
  db.collection('orders').orderBy('created', 'desc').limit(100).get().then(function (q) {
    ORD = q.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; }); render();
  }).catch(function (e) { ORD = []; render(); msg('تعذر تحميل الطلبات (راجع قواعد Firestore): ' + e.code, 1); });
}
function orderAct(a, id) {
  var o = ORD.filter(function (x) { return x.id === id; })[0], r = db.collection('orders').doc(id);
  if (!o) return;
  if (a === 'odel') { if (!confirm('حذف الطلب؟')) return; return r.delete().then(loadOrders); }
  if (a === 'ono') { if (!confirm('رفض الطلب؟')) return; return r.update({ status: 'rejected' }).then(loadOrders); }
  var url = X.sec[o.pid];
  if (!url) return msg('حط "رابط التسليم" للمنتج في تاب المتجر واضغط حفظ الأول.', 1);
  r.update({ status: 'paid', downloadUrl: url, paidAt: firebase.firestore.FieldValue.serverTimestamp() })
    .then(function () { msg('✓ اتأكد الطلب — العميل هيشوف زرار التحميل'); loadOrders(); })
    .catch(function (e) { msg('فشل: ' + e.code, 1); });
}

function render() {
  document.querySelectorAll('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); });
  $('#view').innerHTML = tab === 'texts'
    ? '<div class="card"><div class="grid">' + CMS_TEXTS.map(function (t) { return F(t.label, 'texts.' + t.key, t.text.length > 60 ? { t: 'area', r: 2 } : {}); }).join('') + '</div></div>'
    : tab === 'store' ? storeHTML() : tab === 'orders' ? ordersHTML()
    : tab === 'projects'
      ? '<button class="add" data-a="addp">+ مشروع جديد</button>' + S.projects.map(projHTML).join('')
      : linksHTML();
}

// ---------- events ----------
document.addEventListener('input', function (e) {
  var t = e.target, p = t.dataset.p;
  if (!p) return;
  var v = t.type === 'checkbox' ? t.checked : t.value, c = t.dataset.c;
  if (t.type === 'range') { v = +v; t.nextElementSibling.textContent = v + '%'; }
  if (c === 'lines') v = v.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
  if (c === 'log') v = v.split('\n').filter(Boolean).map(function (l) {
    var a = l.split('|').map(function (x) { return x.trim(); });
    return { version: a[0] || '', date: a[1] || '', notes: a.slice(2).join(' | ') };
  });
  if (c === 'num') v = +v || 0;
  if (c === 'methods') v = v.split('\n').filter(Boolean).map(function (l) { var a = l.split('|'); return { name: a[0].trim(), value: a.slice(1).join('|').trim() }; });
  if (c === 'null' && v === '') v = null;
  if (c === 'avail') v = v ? undefined : false;
  put(p, v);
  dirty();
});

document.addEventListener('click', function (e) {
  var d = e.target.dataset, a = d.a;
  if (!a) return;
  var i = +d.i, j = +d.j, P = S.projects;
  if (a === 'tab') { tab = d.t; if (tab === 'orders' && !ORD) loadOrders(); return render(); }
  if (a === 'oreload') { ORD = null; render(); return loadOrders(); }
  if (a === 'ook' || a === 'ono' || a === 'odel') return orderAct(a, d.id);
  if (a === 'padd') { X.st.products.unshift({ id: 'prod-' + Date.now().toString(36), name: 'منتج جديد', icon: '🎓', price: 100, badge: '', active: true, desc: '' }); render(); return dirty(); }
  if (a === 'pup' || a === 'pdown' || a === 'pdel') {
    var Q = X.st.products;
    if (a === 'pup' && i > 0) Q.splice(i - 1, 0, Q.splice(i, 1)[0]);
    if (a === 'pdown' && i < Q.length - 1) Q.splice(i + 1, 0, Q.splice(i, 1)[0]);
    if (a === 'pdel') { if (!confirm('حذف المنتج؟')) return; delete X.sec[Q[i].id]; Q.splice(i, 1); }
    render(); return dirty();
  }
  if (a === 'imp') { $('#imp').hidden = !$('#imp').hidden; return; }
  if (a === 'run') return runImport();
  if (a === 'save') return save();
  if (a === 'logout') return auth.signOut();
  if (a === 'export') {
    var l = document.createElement('a');
    l.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
    l.download = 'codeprint-backup.json';
    return l.click();
  }
  if (a === 'up' && i > 0) P.splice(i - 1, 0, P.splice(i, 1)[0]);
  if (a === 'down' && i < P.length - 1) P.splice(i + 1, 0, P.splice(i, 1)[0]);
  if (a === 'delp') { if (!confirm('حذف المشروع؟')) return; P.splice(i, 1); }
  if (a === 'addp') P.unshift({
    id: 'project-' + Date.now().toString(36), name: 'مشروع جديد', tagline: '', category: 'tools', icon: '📦',
    status: 'soon', progress: 0, eta: null, shortDesc: '', description: [], screenshots: [], changelog: [],
    links: { play: null, download: null, source: null }
  });
  if (a === 'deli') { if (!confirm('حذف الرابط؟')) return; S.links[i].items.splice(j, 1); }
  if (a === 'addi') S.links[i].items.push({ icon: '🔗', name: 'جديد', description: '', url: '', type: 'external' });
  if (a === 'adds') S.links.push({ title: 'قسم جديد', icon: '🔗', items: [] });
  render();
  dirty();
});

// ---------- import ----------
function norm() {
  S.projects.forEach(function (p) {
    p.links = p.links || { play: null, download: null, source: null };
    p.screenshots = p.screenshots || [];
    p.changelog = p.changelog || [];
    p.description = p.description || [];
    if (p.progress == null) p.progress = 0;
  });
  S.links.forEach(function (s) { s.items = s.items || []; });
  CMS_TEXTS.forEach(function (t) { if (S.texts[t.key] == null) S.texts[t.key] = t.text; });
}
function parseImport(t) {
  var d;
  try { d = JSON.parse(t); } catch (e) {
    var m = t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*(?:var|let|const)\s+\w+\s*=\s*/m, '').replace(/;\s*$/, '');
    d = (new Function('return (' + m + ')'))();
  }
  if (Array.isArray(d)) d = (d[0] && d[0].items) ? { links: d } : { projects: d };
  return d || {};
}
function runImport() {
  var mode = $('#imode').value, d, n = { p: 0, l: 0, t: 0 };
  try { d = parseImport($('#itxt').value); } catch (e) { return msg('الملف مش JSON ولا JS صالح: ' + e.message, 1); }
  var ps = (d.projects || []).filter(function (p) { return p && p.id && p.name; });
  var ls = (d.links || []).filter(function (s) { return s && s.title && Array.isArray(s.items); });
  if (ps.length) {
    if (mode === 'replace') S.projects = ps;
    else ps.forEach(function (p) {
      var k = S.projects.findIndex(function (x) { return x.id === p.id; });
      if (k > -1) S.projects[k] = p; else S.projects.push(p);
    });
    n.p = ps.length;
  }
  if (ls.length) {
    if (mode === 'replace') S.links = ls;
    else ls.forEach(function (s) {
      var k = S.links.findIndex(function (x) { return x.title === s.title; });
      if (k < 0) return S.links.push(s);
      s.items.forEach(function (it) {
        var i = S.links[k].items.findIndex(function (x) { return x.name === it.name; });
        if (i > -1) S.links[k].items[i] = it; else S.links[k].items.push(it);
      });
    });
    n.l = ls.length;
  }
  if (d.texts && typeof d.texts === 'object') {
    if (mode === 'replace') S.texts = d.texts; else Object.assign(S.texts, d.texts);
    n.t = Object.keys(d.texts).length;
  }
  if (!n.p && !n.l && !n.t) return msg('مفيش بيانات معروفة في الملف (مشاريع لازم يكون فيها id وname).', 1);
  norm(); render(); dirty(); $('#imp').hidden = true;
  msg('✓ اتستورد: ' + n.p + ' مشروع، ' + n.l + ' قسم روابط، ' + n.t + ' نص — اضغط حفظ عشان يظهر في الموقع');
}
$('#ifile').onchange = function () {
  var f = this.files[0];
  if (f) f.text().then(function (t) { $('#itxt').value = t; });
};
