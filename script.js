document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.notch-toggle');
  var drawer = document.querySelector('.notch-drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = drawer.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!drawer.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Theme toggle (dark/light), persisted in localStorage
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        try { localStorage.setItem('codeprint-theme', 'dark'); } catch (e) {}
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        try { localStorage.setItem('codeprint-theme', 'light'); } catch (e) {}
      }
    });
  }

  // Scroll reveal for .reveal elements
  var observeReveals = function (root) {
    var els = root.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el) { obs.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('revealed'); });
    }
  };
  observeReveals(document);

  // Liquid glass buttons: inject shine overlay + click ripple
  document.querySelectorAll('.btn-liquid').forEach(function (btn) {
    if (!btn.querySelector('.shine')) {
      var shine = document.createElement('span');
      shine.className = 'shine';
      btn.appendChild(shine);
    }
    btn.addEventListener('pointerdown', function (e) {
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.4;
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  });

  var linksContainer = document.getElementById('links-container');
  if (linksContainer && typeof linksData !== 'undefined' && Array.isArray(linksData)) {
    linksData.forEach(function (section) {
      var sectionElement = document.createElement('div');
      sectionElement.className = 'link-section';
      sectionElement.dataset.title = section.title;

      var title = document.createElement('h2');
      title.className = 'link-section-title';
      title.innerHTML = '<span class="emoji"></span>';
      title.querySelector('.emoji').textContent = section.icon || '🔗';
      title.appendChild(document.createTextNode(' ' + section.title));
      sectionElement.appendChild(title);

      section.items.forEach(function (item) {
        var isAvailable = item.available !== false && item.url;
        var card = document.createElement(isAvailable ? 'a' : 'div');
        card.className = 'link-row' + (isAvailable ? '' : ' soon');

        if (isAvailable) {
          card.href = item.url;
          if (item.type === 'download') card.setAttribute('download', '');
          if (item.type === 'external') {
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
          }
        }

        var info = document.createElement('div');
        info.className = 'info';
        var icon = document.createElement('span');
        icon.className = 'emoji';
        icon.textContent = item.icon || '🔗';
        var text = document.createElement('div');
        var name = document.createElement('div');
        name.className = 'name';
        name.textContent = item.name;
        text.appendChild(name);
        if (item.description) {
          var description = document.createElement('div');
          description.className = 'sub';
          description.textContent = item.description;
          text.appendChild(description);
        }
        info.append(icon, text);
        card.appendChild(info);

        if (isAvailable) {
          var arrow = document.createElement('span');
          arrow.className = 'arrow';
          arrow.textContent = item.type === 'download' ? '⬇' : '←';
          card.appendChild(arrow);
        }
        sectionElement.appendChild(card);
      });
      linksContainer.appendChild(sectionElement);
    });

    // Filter tabs for link sections (All / Websites / Apps & Downloads / ...)
    var linkTabsContainer = document.getElementById('link-filter-tabs');
    if (linkTabsContainer) {
      var sectionTitles = linksData.map(function (s) { return s.title; });
      var linkFilters = ['all'].concat(sectionTitles);
      linkFilters.forEach(function (title, i) {
        var btn = document.createElement('button');
        btn.className = 'filter-tab' + (i === 0 ? ' active' : '');
        btn.textContent = title === 'all' ? 'الكل' : title;
        btn.dataset.filter = title;
        btn.addEventListener('click', function () {
          linkTabsContainer.querySelectorAll('.filter-tab').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          linksContainer.querySelectorAll('.link-section').forEach(function (sec) {
            sec.style.display = (title === 'all' || sec.dataset.title === title) ? '' : 'none';
          });
        });
        linkTabsContainer.appendChild(btn);
      });
    }
  }

  // ---------- Projects grid + filter tabs (projects.html) ----------
  var projectsContainer = document.getElementById('projects-container');
  if (projectsContainer && typeof projectsData !== 'undefined' && Array.isArray(projectsData)) {
    var CATEGORY_LABELS = { all: 'الكل', games: 'ألعاب', ai: 'AI', tools: 'أدوات', web: 'Web' };

    function renderProjectCard(p) {
      var card = document.createElement('div');
      card.className = 'card project-card reveal';
      card.dataset.category = p.category;

      var thumb = document.createElement('div');
      thumb.className = 'project-thumb';
      thumb.textContent = p.icon || '📦';
      var badge = document.createElement('span');
      badge.className = 'status-badge' + (p.status === 'live' ? ' live' : '');
      badge.textContent = p.status === 'live' ? 'LIVE' : 'Coming Soon';
      thumb.appendChild(badge);

      var body = document.createElement('div');
      body.className = 'project-body';
      var h3 = document.createElement('h3');
      h3.textContent = p.name;
      var tags = document.createElement('span');
      tags.className = 'project-tags';
      tags.textContent = p.tagline || '';
      var desc = document.createElement('p');
      desc.className = 'project-desc';
      desc.textContent = p.shortDesc || '';
      body.append(h3, tags, desc);

      if (p.status === 'soon' && (p.progress != null || p.eta)) {
        var prog = document.createElement('div');
        prog.className = 'soon-progress';
        var track = document.createElement('div');
        track.className = 'bar-track';
        var fill = document.createElement('div');
        fill.className = 'bar-fill';
        fill.style.width = (p.progress != null ? p.progress : 0) + '%';
        track.appendChild(fill);
        var meta = document.createElement('div');
        meta.className = 'bar-meta';
        var etaSpan = document.createElement('span');
        etaSpan.textContent = p.eta || '';
        var pctSpan = document.createElement('span');
        pctSpan.className = 'pct';
        pctSpan.textContent = p.progress != null ? p.progress + '%' : '';
        meta.append(etaSpan, pctSpan);
        prog.append(track, meta);
        body.appendChild(prog);
      }

      var actions = document.createElement('div');
      actions.className = 'project-actions';
      var link = document.createElement('a');
      link.className = 'link-btn';
      link.href = 'project.html?id=' + encodeURIComponent(p.id);
      link.textContent = 'التفاصيل ←';
      actions.appendChild(link);
      body.appendChild(actions);

      card.append(thumb, body);
      return card;
    }

    function renderProjects(filter) {
      projectsContainer.innerHTML = '';
      projectsData.forEach(function (p) {
        if (filter === 'all' || p.category === filter) {
          projectsContainer.appendChild(renderProjectCard(p));
        }
      });
      observeReveals(projectsContainer);
    }

    var tabsContainer = document.getElementById('filter-tabs');
    if (tabsContainer) {
      var categories = ['all'].concat(
        projectsData.map(function (p) { return p.category; })
          .filter(function (c, i, arr) { return arr.indexOf(c) === i; })
      );
      categories.forEach(function (cat, i) {
        var btn = document.createElement('button');
        btn.className = 'filter-tab' + (i === 0 ? ' active' : '');
        btn.textContent = CATEGORY_LABELS[cat] || cat;
        btn.dataset.filter = cat;
        btn.addEventListener('click', function () {
          tabsContainer.querySelectorAll('.filter-tab').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          renderProjects(cat);
        });
        tabsContainer.appendChild(btn);
      });
    }

    renderProjects('all');
  }

  // ---------- Project detail page (project.html) ----------
  var detailContainer = document.getElementById('project-detail');
  if (detailContainer && typeof projectsData !== 'undefined' && Array.isArray(projectsData)) {
    var params = new URLSearchParams(window.location.search);
    var pid = params.get('id');
    var project = projectsData.find(function (p) { return p.id === pid; });

    if (project) {
      document.title = project.name + ' — CodePrint';

      var hero = document.createElement('header');
      hero.className = 'project-hero';
      var heroInner = document.createElement('div');
      heroInner.className = 'container';

      var thumbBig = document.createElement('div');
      thumbBig.className = 'thumb-big';
      thumbBig.textContent = project.icon || '📦';

      var h1 = document.createElement('h1');
      h1.textContent = project.name;

      var taglineEl = document.createElement('div');
      taglineEl.className = 'tagline';
      taglineEl.textContent = project.tagline || '';

      var statusBadge = document.createElement('span');
      statusBadge.className = 'status-badge' + (project.status === 'live' ? ' live' : '');
      statusBadge.textContent = project.status === 'live' ? 'LIVE' : 'Coming Soon';

      var heroActions = document.createElement('div');
      heroActions.className = 'actions';
      if (project.links) {
        if (project.links.play) {
          var a1 = document.createElement('a');
          a1.href = project.links.play; a1.className = 'btn btn-liquid';
          a1.target = '_blank'; a1.rel = 'noopener noreferrer';
          var s1 = document.createElement('span'); s1.textContent = 'تجربة المشروع';
          a1.appendChild(s1);
          heroActions.appendChild(a1);
        }
        if (project.links.download) {
          var a2 = document.createElement('a');
          a2.href = project.links.download; a2.className = 'btn btn-ghost';
          a2.setAttribute('download', '');
          a2.textContent = 'تحميل';
          heroActions.appendChild(a2);
        }
        if (project.links.source) {
          var a3 = document.createElement('a');
          a3.href = project.links.source; a3.className = 'btn btn-ghost';
          a3.target = '_blank'; a3.rel = 'noopener noreferrer';
          a3.textContent = 'الكود المصدري';
          heroActions.appendChild(a3);
        }
      }

      heroInner.append(thumbBig, h1, taglineEl, statusBadge, heroActions);
      hero.appendChild(heroInner);
      detailContainer.appendChild(hero);

      if (project.description && project.description.length) {
        var descSection = document.createElement('section');
        descSection.className = 'project-section reveal';
        var h2d = document.createElement('h2');
        h2d.textContent = 'إزاي المشروع اتبنى';
        descSection.appendChild(h2d);
        project.description.forEach(function (para) {
          var p = document.createElement('p');
          p.textContent = para;
          descSection.appendChild(p);
        });
        detailContainer.appendChild(descSection);
      }

      if (project.screenshots && project.screenshots.length) {
        var galSection = document.createElement('section');
        galSection.className = 'project-section reveal';
        var h2g = document.createElement('h2');
        h2g.textContent = 'صور من المشروع';
        galSection.appendChild(h2g);
        var gallery = document.createElement('div');
        gallery.className = 'project-gallery';
        project.screenshots.forEach(function (src) {
          var img = document.createElement('img');
          img.src = src; img.alt = project.name; img.loading = 'lazy';
          gallery.appendChild(img);
        });
        galSection.appendChild(gallery);
        detailContainer.appendChild(galSection);
      }

      var clSection = document.createElement('section');
      clSection.className = 'project-section reveal';
      var h2c = document.createElement('h2');
      h2c.textContent = 'سجل التحديثات';
      clSection.appendChild(h2c);
      if (project.changelog && project.changelog.length) {
        var list = document.createElement('div');
        list.className = 'changelog-list';
        project.changelog.forEach(function (entry) {
          var item = document.createElement('div');
          item.className = 'changelog-entry';
          var row = document.createElement('div');
          row.className = 'row';
          var ver = document.createElement('span');
          ver.className = 'version';
          ver.textContent = 'v' + entry.version;
          var date = document.createElement('span');
          date.className = 'date';
          date.textContent = entry.date || '';
          row.append(ver, date);
          var notes = document.createElement('div');
          notes.className = 'notes';
          notes.textContent = entry.notes || '';
          item.append(row, notes);
          list.appendChild(item);
        });
        clSection.appendChild(list);
      } else {
        var empty = document.createElement('div');
        empty.className = 'project-empty-note';
        empty.textContent = 'لسه مفيش تحديثات مسجّلة لهذا المشروع.';
        clSection.appendChild(empty);
      }
      detailContainer.appendChild(clSection);

      observeReveals(detailContainer);
    } else {
      var notFound = document.createElement('div');
      notFound.className = 'project-empty-note';
      notFound.style.margin = '80px auto';
      notFound.style.maxWidth = '400px';
      notFound.textContent = 'المشروع غير موجود.';
      detailContainer.appendChild(notFound);
    }
  }
});


// ---------- Contact form submit (index.html) ----------
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("contact-form-status");

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwiDLlKdDCCsYV-Wc0UG99OV2CXiOZbAJOMHoGwYCmI5M6aZQ4_FwyCJKiCUZU5eyMP/exec"; // Google Apps Script (backup copy)
const FORMSPREE_URL = "https://formspree.io/f/xjyvkdld"; // Formspree (sends the email)

if (contactForm) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = {
      name: document.getElementById("cf-name").value.trim(),
      email: document.getElementById("cf-email").value.trim(),
      message: document.getElementById("cf-message").value.trim()
    };

    submitButton.disabled = true;
    submitButton.innerHTML = "<span>جارٍ الإرسال...</span>";
    formStatus.textContent = "جارٍ إرسال رسالتك...";

    try {
      const googleRequest = fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(formData)
      });

      const formspreeRequest = fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(formData)
      });

      const results = await Promise.all([googleRequest, formspreeRequest]);
      if (!results[1].ok) throw new Error("Formspree submission failed");

      formStatus.textContent = "✓ تم إرسال رسالتك بنجاح! تحقق من بريدك الإلكتروني.";
      contactForm.reset();
    } catch (error) {
      console.error(error);
      formStatus.textContent = "حدث خطأ أثناء الإرسال. حاول مرة أخرى.";
    }

    submitButton.disabled = false;
    submitButton.innerHTML = "<span>إرسال</span>";
  });
}