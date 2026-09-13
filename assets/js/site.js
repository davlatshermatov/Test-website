/* Shared site behaviour: mobile nav, theme toggle, copy buttons, footer year.
   Written to degrade gracefully — every page is fully readable without JS. */
(function () {
  'use strict';

  var STORAGE_KEY = 'mr-theme';

  /* ---- Mobile navigation -------------------------------------------------
     The nav starts visible in the HTML so that a no-JS visitor can still
     reach every page. We collapse it here; above 900px the stylesheet
     overrides [hidden] so the desktop bar is unaffected by this state. */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    nav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', function () {
      var open = nav.hidden;
      nav.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close the menu after following an in-page link on small screens.
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && window.innerWidth <= 900) {
        nav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !nav.hidden && window.innerWidth <= 900) {
        nav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---- Theme toggle ------------------------------------------------------
     Three states: unset (follow the OS), "light", "dark". An inline snippet
     in each page's <head> applies the stored value before first paint. */
  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  function currentTheme() {
    var set = document.documentElement.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  function paintToggle(btn) {
    var dark = currentTheme() === 'dark';
    btn.textContent = dark ? '☀' : '☾';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.title = btn.getAttribute('aria-label');
  }

  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    paintToggle(themeBtn);
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      store(STORAGE_KEY, next);
      paintToggle(themeBtn);
    });
  }

  /* ---- Copy-to-clipboard for templates ----------------------------------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (!btn) return;

    var source = document.getElementById(btn.getAttribute('data-copy'));
    if (!source || !navigator.clipboard) return;

    navigator.clipboard.writeText(source.innerText.trim()).then(function () {
      var original = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = original; }, 1600);
    }).catch(function () { /* clipboard blocked — leave the button as is */ });
  });

  /* ---- Footer year -------------------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}());
