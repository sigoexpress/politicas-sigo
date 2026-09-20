/* Sigo App — documentos legales: TOC, tema, anclas y volver-arriba. */
(function () {
  'use strict';

  var STORAGE_KEY = 'sigo-legal-theme';

  /* ---------------------------------------------------------------- tema */

  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function storedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(value) {
    try {
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* modo privado o almacenamiento bloqueado: seguimos sin persistir */
    }
  }

  applyTheme(storedTheme());

  function currentlyDark() {
    var explicit = document.documentElement.getAttribute('data-theme');
    if (explicit) return explicit === 'dark';
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentlyDark() ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
      themeBtn.setAttribute(
        'aria-label',
        next === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
      );
    });
  }

  /* ------------------------------------------------------- anclas en h2/h3 */

  var headings = document.querySelectorAll('.prose h2[id], .prose h3[id]');
  Array.prototype.forEach.call(headings, function (h) {
    var a = document.createElement('a');
    a.className = 'anchor';
    a.href = '#' + h.id;
    a.textContent = '#';
    a.setAttribute('aria-label', 'Enlace a esta sección');
    h.appendChild(a);
  });

  /* ------------------------------------------------------------ TOC móvil */

  var toc = document.querySelector('.toc');
  var tocToggle = document.querySelector('[data-toc-toggle]');
  var scrim = document.querySelector('.toc-scrim');

  function closeToc() {
    if (!toc) return;
    toc.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
    if (tocToggle) tocToggle.setAttribute('aria-expanded', 'false');
  }

  function openToc() {
    if (!toc) return;
    toc.classList.add('is-open');
    if (scrim) scrim.classList.add('is-open');
    if (tocToggle) tocToggle.setAttribute('aria-expanded', 'true');
  }

  if (tocToggle && toc) {
    tocToggle.addEventListener('click', function () {
      if (toc.classList.contains('is-open')) closeToc();
      else openToc();
    });
  }

  if (scrim) scrim.addEventListener('click', closeToc);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeToc();
  });

  if (toc) {
    toc.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeToc();
    });
  }

  /* ---------------------------------------------------------- scrollspy */

  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');

  if (tocLinks.length && 'IntersectionObserver' in window) {
    var linkFor = {};
    Array.prototype.forEach.call(tocLinks, function (link) {
      linkFor[link.getAttribute('href').slice(1)] = link;
    });

    var visible = {};

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });

        var activeId = null;
        var sections = document.querySelectorAll('.prose h2[id]');
        Array.prototype.forEach.call(sections, function (s) {
          if (visible[s.id] && !activeId) activeId = s.id;
        });

        if (!activeId) return;

        Array.prototype.forEach.call(tocLinks, function (l) {
          l.classList.remove('is-active');
          l.removeAttribute('aria-current');
        });

        var active = linkFor[activeId];
        if (active) {
          active.classList.add('is-active');
          active.setAttribute('aria-current', 'true');
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    Array.prototype.forEach.call(
      document.querySelectorAll('.prose h2[id]'),
      function (s) {
        observer.observe(s);
      }
    );
  }

  /* -------------------------------------------------------- volver arriba */

  var toTop = document.querySelector('.to-top');
  if (toTop) {
    var onScroll = function () {
      if (window.scrollY > 700) toTop.classList.add('is-visible');
      else toTop.classList.remove('is-visible');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
