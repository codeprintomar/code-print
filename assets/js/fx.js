/* CodePrint — 3D pointer effects (desktop only; touch devices get the CSS idle motion) */
(function () {
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;
  var cur = null, raf = 0, hero = null;

  function reset(t) {
    t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); t.classList.remove('tilting');
  }
  document.addEventListener('pointermove', function (e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var t = e.target.closest ? e.target.closest('.pj,.feat,.reach a,.pd-pager a') : null;
      if (cur && cur !== t) reset(cur);
      if (t) {
        var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
        t.style.setProperty('--rx', ((0.5 - y) * 16).toFixed(2) + 'deg');
        t.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        t.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        t.classList.add('tilting');
      }
      cur = t;
      hero = hero || document.querySelector('.hero');
      if (hero) {
        var h = hero.getBoundingClientRect();
        if (e.clientY >= h.top && e.clientY <= h.bottom) {
          hero.style.setProperty('--px', (e.clientX / window.innerWidth - 0.5).toFixed(3));
          hero.style.setProperty('--py', ((e.clientY - h.top) / h.height - 0.5).toFixed(3));
        }
      }
    });
  }, { passive: true });
  document.addEventListener('pointerleave', function () { if (cur) reset(cur); cur = null; }, true);
})();
