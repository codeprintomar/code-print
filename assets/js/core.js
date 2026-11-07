window.CP = {
  observeReveals: function (root) {
    var els = root.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('revealed'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el) { obs.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('revealed'); });
    }
  }
};

document.addEventListener('DOMContentLoaded', async function () {
  if (window.cmsReady) await window.cmsReady;
  document.querySelectorAll('[data-cms]').forEach(function (el) {
    var v = window.siteTexts && window.siteTexts[el.dataset.cms];
    if (v) el.textContent = v;
  });
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

  var observeReveals = CP.observeReveals;
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

  document.querySelectorAll('.icon, .emoji, .thumb-big').forEach(function (el) { el.setAttribute('aria-hidden', 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && toggle) { drawer.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  });
});
