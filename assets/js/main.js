/* ============================================================
   师伟越 · youthat.github.io — interactions
   Vanilla JS, no dependencies, respects reduced motion.
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function on(el, type, fn, opts) { if (el) el.addEventListener(type, fn, opts || false); }

  /* ---------------- 1. Reveal ---------------- */
  function initReveal() {
    var items = qsa('.reveal');
    if (items.length === 0) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-inview'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- 2. Scrollspy ---------------- */
  function initNav() {
    var links = qsa('.nav-links a');
    var sections = qsa('main section[id]');
    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    var byId = {};
    links.forEach(function (link) {
      var id = (link.getAttribute('href') || '').replace('#', '');
      if (id) byId[id] = link;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = byId[entry.target.id];
        if (!link) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, { rootMargin: '-40% 0px -52% 0px', threshold: 0 });

    sections.forEach(function (section) { io.observe(section); });
  }

  /* ---------------- 3. Copy email ---------------- */
  function initCopy() {
    var toast = qs('#toast');
    var timer = null;

    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('is-show');
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { toast.classList.remove('is-show'); }, 2400);
    }

    function legacyCopy(text) {
      var area = doc.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-100px';
      area.style.opacity = '0';
      doc.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
      doc.body.removeChild(area);
      return ok;
    }

    function done(ok, btn) {
      if (ok) {
        showToast('邮箱已复制到剪贴板');
        if (btn) {
          var label = btn.textContent;
          btn.textContent = '已复制 ✓';
          window.setTimeout(function () { btn.textContent = label; }, 2000);
        }
      } else {
        showToast('复制失败，请手动选择邮箱');
      }
    }

    qsa('.copy-btn').forEach(function (btn) {
      on(btn, 'click', function () {
        var text = btn.getAttribute('data-copy') || '';
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true, btn); }, function () { done(legacyCopy(text), btn); });
        } else {
          done(legacyCopy(text), btn);
        }
      });
    });
  }

  function ready(fn) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    initReveal();
    initNav();
    initCopy();
  });
})();
