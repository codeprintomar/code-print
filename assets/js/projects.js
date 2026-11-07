/* CodePrint v4 — project cards (home + projects page) and detail page */
(function () {
  var LABELS = { all: 'All', games: 'Games', ai: 'AI', tools: 'Tools', web: 'Web' };
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function auto(e) { e.setAttribute('dir', 'auto'); return e; }
  function hue(id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360; return h; }
  function isExternal(u) { return /^(https?:)?\/\//.test(u || ''); }
  function isLocalPage(u) { return u && !isExternal(u) && /\.html?$/.test(u); }
  function live(p) { return p.status === 'live'; }
  function url(p) { return 'project.html?id=' + encodeURIComponent(p.id); }
  function tile(p) { var t = el('div', 'tile', p.icon || '📦'); t.style.setProperty('--h', hue(p.id)); return t; }
  function tag(p) { return el('span', 'tag' + (live(p) ? '' : ' soon'), live(p) ? 'Live' : 'Soon'); }

  function link(label, href, cls) {
    var a = el('a', cls, label); a.href = href;
    if (isExternal(href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  }
  function actions(p, cls) {
    var w = el('div', 'acts'), L = p.links || {};
    if (L.play) w.appendChild(link('Try it', L.play, 'btn btn-primary btn-sm'));
    if (L.download) { var d = link('Download', L.download, 'btn btn-sm'); d.setAttribute('download', ''); w.appendChild(d); }
    if (L.source) w.appendChild(link('GitHub', L.source, 'btn btn-sm'));
    return w;
  }
  function progress(p) {
    var w = el('div', 'soon-progress'), t = el('div', 'bar-track'), f = el('div', 'bar-fill');
    f.style.width = (p.progress != null ? p.progress : 0) + '%'; t.appendChild(f);
    var m = el('div', 'bar-meta'); m.append(auto(el('span', null, p.eta || '')), el('span', null, p.progress != null ? p.progress + '%' : ''));
    w.append(t, m); return w;
  }
  function card(p) {
    var c = el('article', 'pj reveal'), top = el('div', 'pj-top'), info = el('div');
    info.append(auto(el('h3', null, p.name)), auto(el('div', 'sub', p.tagline || '')));
    top.append(tile(p), info);
    c.append(top, auto(el('p', 'desc', p.shortDesc || '')));
    if (!live(p) && (p.progress != null || p.eta)) c.appendChild(progress(p));
    c.appendChild(actions(p));
    var hit = el('a', 'hit'); hit.href = url(p); hit.setAttribute('aria-label', p.name); hit.tabIndex = -1;
    c.append(tag(p), hit); return c;
  }

  function grid(box) {
    var data = window.projectsData, limit = +box.dataset.limit || Infinity, cur = 'all', q = '';
    function render() {
      box.innerHTML = ''; var n = 0;
      data.forEach(function (p) {
        var hay = ((p.name || '') + ' ' + (p.tagline || '') + ' ' + (p.shortDesc || '')).toLowerCase();
        if ((cur === 'all' || p.category === cur) && (!q || hay.indexOf(q) > -1) && n < limit) { box.appendChild(card(p)); n++; }
      });
      if (!n) box.appendChild(el('div', 'project-empty-note', 'No matching projects.'));
      CP.observeReveals(box);
    }
    var tabs = document.getElementById('filter-tabs');
    if (tabs) {
      ['all'].concat(data.map(function (p) { return p.category; }).filter(function (c, i, a) { return a.indexOf(c) === i; }))
        .forEach(function (cat, i) {
          var b = el('button', 'filter-tab' + (i ? '' : ' active'), LABELS[cat] || cat);
          b.type = 'button'; b.setAttribute('aria-pressed', i ? 'false' : 'true');
          b.addEventListener('click', function () {
            tabs.querySelectorAll('.filter-tab').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
            b.classList.add('active'); b.setAttribute('aria-pressed', 'true'); cur = cat; render();
          });
          tabs.appendChild(b);
        });
    }
    var s = document.getElementById('proj-search');
    if (s) s.addEventListener('input', function () { q = s.value.trim().toLowerCase(); render(); });
    render();
  }

  function panel(title) { var s = el('section', 'panel'); s.appendChild(el('h2', null, title)); return s; }
  function detail(box, p) {
    document.title = p.name + ' — CodePrint';
    var L = p.links || {}, wrap = el('div', 'wrap');
    var cr = el('nav', 'crumbs'); cr.innerHTML = '<a href="index.html">Home</a> / <a href="projects.html">Projects</a> / ';
    cr.appendChild(auto(el('span', null, p.name)));

    var hero = el('header', 'pd-hero'), left = el('div');
    var h1 = auto(el('h1', null, p.name));
    left.append(tile(p), h1, tag(p), auto(el('p', 'lead', p.shortDesc || '')));
    left.lastChild.style.marginTop = '12px';
    var cta = el('div', 'hero-cta');
    if (L.play) cta.appendChild(link('Try it', L.play, 'btn btn-primary'));
    if (L.download) { var d = link('Download', L.download, 'btn'); d.setAttribute('download', ''); cta.appendChild(d); }
    if (L.source) cta.appendChild(link('GitHub', L.source, 'btn'));
    left.appendChild(cta);
    if (!live(p) && (p.progress != null || p.eta)) { var pr = progress(p); pr.style.marginTop = '22px'; left.appendChild(pr); }

    var frame = el('div', 'frame'), bar = el('div', 'fbar'), stage = el('div', 'stage');
    bar.append(el('i'), el('i'), el('i'));
    if (isLocalPage(L.play)) {
      var f = el('iframe'); f.src = L.play; f.loading = 'lazy'; f.title = p.name + ' preview';
      f.setAttribute('sandbox', 'allow-scripts allow-same-origin'); stage.appendChild(f);
    } else stage.appendChild(el('span', 'big', p.icon || '📦'));
    frame.append(bar, stage); hero.append(left, frame);

    var cols = el('div', 'pd-cols');
    var about = panel('About the project');
    (p.description && p.description.length ? p.description : [p.shortDesc || '']).forEach(function (t) { about.appendChild(auto(el('p', null, t))); });
    if (L.source) {
      var r = el('a', 'repo'); r.href = L.source; r.target = '_blank'; r.rel = 'noopener noreferrer';
      r.append(el('strong', null, 'Source code on GitHub'), el('span', null, L.source.replace('https://', ''))); about.appendChild(r);
    }
    var cl = panel('Changelog');
    if (p.changelog && p.changelog.length) {
      p.changelog.forEach(function (e) {
        var it = el('div', 'changelog-entry'), rw = el('div', 'row');
        rw.append(el('span', 'version', 'v' + e.version), el('span', 'date', e.date || ''));
        it.append(rw, auto(el('div', 'notes', e.notes || ''))); cl.appendChild(it);
      });
    } else cl.appendChild(el('p', null, 'No updates recorded yet.'));
    cols.append(about, cl);
    wrap.append(cr, hero, cols);

    if (p.screenshots && p.screenshots.length) {
      var g = panel('Screenshots'), gal = el('div', 'project-gallery'); g.style.marginTop = '24px';
      p.screenshots.forEach(function (s) { var i = el('img'); i.src = s; i.alt = p.name; i.loading = 'lazy'; gal.appendChild(i); });
      g.appendChild(gal); wrap.appendChild(g);
    }
    var all = window.projectsData, i = all.indexOf(p), pager = el('nav', 'pd-pager');
    [[all[i - 1], 'Previous'], [all[i + 1], 'Next']].forEach(function (x) {
      if (!x[0]) return; var a = el('a'); a.href = url(x[0]); a.append(el('small', null, x[1]), auto(el('strong', null, x[0].name))); pager.appendChild(a);
    });
    wrap.appendChild(pager); box.appendChild(wrap);
  }

  document.addEventListener('DOMContentLoaded', async function () {
    if (window.cmsReady) await window.cmsReady;
    if (!Array.isArray(window.projectsData)) return;
    var $ = function (id) { return document.getElementById(id); };
    if ($('projects-container')) grid($('projects-container'));
    if ($('home-projects')) grid($('home-projects'));
    if ($('project-detail')) {
      var id = new URLSearchParams(location.search).get('id');
      var p = window.projectsData.filter(function (x) { return x.id === id; })[0];
      if (p) detail($('project-detail'), p); else $('project-detail').appendChild(el('div', 'project-empty-note', 'Project not found.'));
    }
  });
})();
