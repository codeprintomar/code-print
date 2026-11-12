/* متجر CodePrint — المنتجات من Firestore (site/store)، والطلبات في orders/{id}. التسليم بعد تأكيدك من الداشبورد. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ST = { products: [], settings: { methods: [] } }, cur = null, KEY = 'cp-orders';
  firebase.initializeApp(CMS_CONFIG);
  var db = firebase.firestore();

  function mine() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function remember(id) { var a = mine(); a.unshift(id); try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, 20))); } catch (e) {} }
  function newId() { var b = new Uint8Array(15), s = ''; crypto.getRandomValues(b); b.forEach(function (x) { s += (x % 36).toString(36); }); return s + Date.now().toString(36); }
  function hue(id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360; return h; }

  /* المنتجات = اللي في Firestore + أي مشروع ليه سعر في data/projects-data.js (لو مش مضاف في الداشبورد) */
  function catalog() {
    var have = {}, out = [];
    ST.products.forEach(function (p) { have[p.id] = 1; out.push(p); });
    (window.projectsData || []).forEach(function (p) {
      if (have[p.id] || p.status !== 'live' || !(+p.price > 0)) return;
      out.push({ id: p.id, name: p.name, icon: p.icon, price: +p.price, desc: p.shortDesc, active: true });
    });
    return out;
  }

  function shop() {
    $('#order-view').hidden = true; $('#shop').hidden = false;
    var list = catalog().filter(function (p) { return p.active !== false; });
    $('#shop').innerHTML = list.length ? list.map(function (p) {
      return '<article class="shop-card">' + (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') +
        '<div class="tile">' + esc(p.icon || '📦') + '</div><h3 dir="auto">' + esc(p.name) + '</h3><p class="desc" dir="auto">' + esc(p.desc) + '</p>' +
        '<div class="price">' + (+p.price || 0) + ' <small>جنيه</small></div>' +
        '<button class="btn btn-primary btn-sm" data-buy="' + esc(p.id) + '" style="justify-content:center">اشتري الآن</button></article>';
    }).join('') : '<div class="project-empty-note">مفيش منتجات معروضة دلوقتي.</div>';
  }

  function openCo(id) {
    cur = catalog().filter(function (p) { return p.id === id; })[0]; if (!cur) return;
    var ms = (ST.settings.methods || []).filter(function (m) { return m.name; });
    $('#co-t').textContent = cur.name; $('#co-p').textContent = (+cur.price || 0) + ' جنيه';
    $('#c-method').innerHTML = ms.map(function (m, i) { return '<option value="' + i + '">' + esc(m.name) + '</option>'; }).join('');
    function how() {
      var m = ms[+$('#c-method').value];
      $('#c-how').innerHTML = m ? 'حوّل <b>' + (+cur.price || 0) + ' جنيه</b> على ' + esc(m.name) + ': <b>' + esc(m.value) + '</b><br>وبعدها اكتب رقم العملية تحت.' : 'طرق الدفع لسه متظبطة.';
    }
    $('#c-method').onchange = how; how(); $('#c-err').textContent = ''; $('#co').showModal();
  }

  $('#coform').addEventListener('submit', function (e) {
    e.preventDefault();
    var ms = (ST.settings.methods || []).filter(function (m) { return m.name; }), m = ms[+$('#c-method').value];
    var name = $('#c-name').value.trim(), phone = $('#c-phone').value.trim(), ref = $('#c-ref').value.trim();
    if (!m) return ($('#c-err').textContent = 'مفيش طريقة دفع متاحة.');
    if (!/^[0-9+ ]{10,16}$/.test(phone)) return ($('#c-err').textContent = 'رقم الموبايل غير صحيح.');
    var id = newId(), btn = $('#c-go'); btn.disabled = true;
    db.collection('orders').doc(id).set({
      pid: cur.id, pname: cur.name, price: +cur.price || 0, name: name, phone: phone, method: m.name, ref: ref,
      status: 'pending', created: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () { remember(id); $('#co').close(); location.href = 'store.html?order=' + id; })
      .catch(function () { btn.disabled = false; $('#c-err').textContent = 'حصلت مشكلة في إرسال الطلب، جرّب تاني.'; });
  });
  $('#c-x').onclick = function () { $('#co').close(); };
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-buy]'); if (b) openCo(b.dataset.buy); });

  function order(id) {
    $('#shop').hidden = true; var v = $('#order-view'); v.hidden = false;
    v.innerHTML = '<div class="ord"><p>جاري التحميل...</p></div>';
    db.collection('orders').doc(id).get().then(function (s) {
      if (!s.exists) { v.innerHTML = '<div class="ord"><div class="big">🤔</div><h2>الطلب مش موجود</h2><a class="btn btn-sm" href="store.html">رجوع للمتجر</a></div>'; return; }
      var o = s.data(), wa = String(ST.settings.whatsapp || '').replace(/\D/g, ''), h;
      var help = wa ? '<a class="btn btn-sm" target="_blank" rel="noopener" href="https://wa.me/' + wa + '">تواصل واتساب</a>' : '';
      if (o.status === 'paid') h = '<div class="big">✅</div><h2>تم تأكيد الدفع</h2><p>' + esc(o.pname) + '</p>' +
        '<a class="btn btn-primary" target="_blank" rel="noopener" href="' + esc(o.downloadUrl || '#') + '">⬇ تحميل / فتح المنتج</a>' + (ST.settings.note ? '<p>' + esc(ST.settings.note) + '</p>' : '');
      else if (o.status === 'rejected') h = '<div class="big">❌</div><h2>الطلب اترفض</h2><p>لو حوّلت فلوس كلّمنا ونحلها.</p>' + help;
      else h = '<div class="big">⏳</div><h2>طلبك وصلنا</h2><p>' + esc(o.pname) + ' — ' + esc(o.price) + ' جنيه</p><p>بنراجع الدفع، وهيظهر هنا زرار التحميل أول ما نأكده. افتح الصفحة دي تاني أو دوس تحديث.</p>' +
        '<button class="btn btn-primary btn-sm" onclick="location.reload()">↻ تحديث</button> ' + help;
      v.innerHTML = '<div class="ord">' + h + '<p style="margin-top:18px"><a href="store.html" style="color:var(--blue)">← رجوع للمتجر</a></p></div>';
    }).catch(function () { v.innerHTML = '<div class="ord"><h2>تعذر تحميل الطلب</h2></div>'; });
  }

  db.collection('site').doc('store').get().then(function (s) { if (s.exists) ST = JSON.parse(s.data().json); }).catch(function () {}).then(function () {
    var q = new URLSearchParams(location.search).get('order');
    var m = mine(); if (m.length) { $('#orders-link').hidden = false; $('#my-orders').href = 'store.html?order=' + m[0]; $('#my-orders').textContent = '📦 آخر طلب ليا'; }
    if (q) order(q); else { shop(); var b = new URLSearchParams(location.search).get('buy'); if (b) openCo(b); }
  });
})();
