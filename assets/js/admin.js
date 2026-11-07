var S = { texts: {}, projects: [], links: [] }, tab = 'texts', D = 0;
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
  }).catch(function (e) { msg('تعذر التحميل: ' + e.message, 1); });
}

function save() {
  var ids = {};
  for (var i = 0; i < S.projects.length; i++) {
    var id = S.projects[i].id;
    if (!/^[a-z0-9-]+$/.test(id) || ids[id]) return msg('المعرّف (id) غلط أو مكرر: ' + id, 1);
    ids[id] = 1;
  }
  S.known = cmsKeys(window.CMS_LOCAL);
  ref.set({ json: JSON.stringify(S), updated: firebase.firestore.FieldValue.serverTimestamp() })
    .then(function () { dirty(0); msg('✓ اتحفظ — الموقع هيتحدث فورًا'); })
    .catch(function (e) { msg('فشل الحفظ: ' + e.code, 1); });
}

// ---------- helpers ----------
function get(p) { return p.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, S); }
function put(p, v) {
  var a = p.split('.'), l = a.pop(), o = a.reduce(function (o, k) { return o[k]; }, S);
  if (v === undefined) delete o[l]; else o[l] = v;
}

function F(label, p, o) {
  o = o || {};
  var v = get(p), a = ' data-p="' + p + '"' + (o.c ? ' data-c="' + o.c + '"' : ''), inner;
  if (o.c === 'lines') v = (v || []).join('\n');
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
  return '<label class="f">' + label + inner + '</label>';
}

function projHTML(p, i) {
  var b = 'projects.' + i + '.';
  return '<details class="card"><summary><span>' + esc(p.icon) + ' ' + esc(p.name) + '</span><span class="tag">' +
    (p.status === 'live' ? 'LIVE' : 'قريبًا ' + (p.progress || 0) + '%') + '</span></summary>' +
    '<div class="grid">' + F('الاسم', b + 'name') + F('الإيموجي', b + 'icon') +
    F('المعرّف id (إنجليزي بدون مسافات)', b + 'id') + F('التاج (Game • Web)', b + 'tagline') +
    F('التصنيف', b + 'category', { t: 'sel', opts: [['games', 'ألعاب'], ['ai', 'AI'], ['tools', 'أدوات'], ['web', 'Web']] }) +
    F('الحالة', b + 'status', { t: 'sel', opts: [['live', 'LIVE شغال'], ['soon', 'قريبًا']] }) +
    F('نسبة التقدم', b + 'progress', { t: 'range' }) + F('موعد الإطلاق', b + 'eta', { c: 'null' }) + '</div>' +
    F('وصف قصير', b + 'shortDesc', { t: 'area', r: 2 }) +
    F('وصف مفصّل (فقرة في كل سطر)', b + 'description', { t: 'area', c: 'lines', r: 4 }) +
    '<div class="grid">' + F('رابط التجربة', b + 'links.play', { c: 'null' }) +
    F('رابط التحميل', b + 'links.download', { c: 'null' }) + F('رابط الكود', b + 'links.source', { c: 'null' }) + '</div>' +
    F('روابط صور (رابط في كل سطر)', b + 'screenshots', { t: 'area', c: 'lines', r: 2 }) +
    F('سجل التحديثات (version | date | notes في كل سطر)', b + 'changelog', { t: 'area', c: 'log', r: 3 }) +
    '<div class="row"><button data-a="up" data-i="' + i + '">↑</button><button data-a="down" data-i="' + i +
    '">↓</button><button class="del" data-a="delp" data-i="' + i + '">حذف المشروع</button></div></details>';
}

function linksHTML() {
  return S.links.map(function (s, i) {
    var b = 'links.' + i + '.';
    return '<details class="card" open><summary>' + esc(s.icon) + ' ' + esc(s.title) + '</summary><div class="grid">' +
      F('عنوان القسم', b + 'title') + F('أيقونة', b + 'icon') + '</div>' +
      s.items.map(function (it, j) {
        var c = b + 'items.' + j + '.';
        return '<div class="item"><div class="grid">' + F('الاسم', c + 'name') + F('أيقونة', c + 'icon') +
          F('الرابط', c + 'url', { c: 'null' }) +
          F('النوع', c + 'type', { t: 'sel', c: 'null', opts: [['', 'فتح عادي'], ['external', 'تبويب جديد'], ['download', 'تحميل']] }) +
          F('متاح؟', c + 'available', { t: 'chk', c: 'avail' }) + '</div>' + F('الوصف', c + 'description') +
          '<button class="del" data-a="deli" data-i="' + i + '" data-j="' + j + '">حذف الرابط</button></div>';
      }).join('') + '<div class="row"><button data-a="addi" data-i="' + i + '">+ رابط</button></div></details>';
  }).join('') + '<button data-a="adds">+ قسم جديد</button>';
}

function render() {
  document.querySelectorAll('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); });
  $('#view').innerHTML = tab === 'texts'
    ? CMS_TEXTS.map(function (t) { return F(t.label, 'texts.' + t.key, t.text.length > 60 ? { t: 'area', r: 2 } : {}); }).join('')
    : tab === 'projects'
      ? '<button data-a="addp">+ مشروع جديد</button>' + S.projects.map(projHTML).join('')
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
  if (c === 'null' && v === '') v = null;
  if (c === 'avail') v = v ? undefined : false;
  put(p, v);
  dirty();
});

document.addEventListener('click', function (e) {
  var d = e.target.dataset, a = d.a;
  if (!a) return;
  var i = +d.i, j = +d.j, P = S.projects;
  if (a === 'tab') { tab = d.t; return render(); }
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
