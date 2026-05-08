/* DigiPrompts — JS común
 * Toast, copia al portapapeles, filtros, navegación responsive.
 * Sin dependencias.
 */
(function () {
  'use strict';

  // ===== Toast =====
  function ensureToastHost() {
    var host = document.querySelector('.toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toast-host';
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(message) {
    var host = ensureToastHost();
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    host.appendChild(el);
    setTimeout(function () { el.remove(); }, 1900);
  }

  // ===== Copiar al portapapeles =====
  function copyText(text) {
    if (!text) return Promise.reject(new Error('vacío'));
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        document.body.removeChild(ta);
        reject(e);
      }
    });
  }

  function bindCopyButtons() {
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!(t instanceof Element)) return;
      var btn = t.closest('[data-copy]');
      if (!btn) return;
      var sel = btn.getAttribute('data-copy');
      var text = '';
      if (sel.startsWith('#')) {
        var node = document.querySelector(sel);
        if (node) text = node.value !== undefined ? node.value : node.textContent;
      } else if (sel === 'parent-output') {
        var out = btn.parentElement && btn.parentElement.querySelector('.fancy-output, .copy-target');
        if (out) text = out.textContent;
      } else {
        text = sel;
      }
      copyText(text).then(function () {
        toast(btn.getAttribute('data-copy-msg') || 'Copiado');
      }).catch(function () {
        toast('No se pudo copiar');
      });
    });
  }

  // ===== Filtro de cards (página índice) =====
  function bindFilters() {
    var bar = document.querySelector('[data-filter-bar]');
    if (!bar) return;
    var grid = document.querySelector('[data-filter-target]');
    if (!grid) return;
    bar.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!(t instanceof Element)) return;
      var pill = t.closest('.pill');
      if (!pill) return;
      var cat = pill.getAttribute('data-cat') || 'all';
      bar.querySelectorAll('.pill').forEach(function (p) { p.classList.toggle('active', p === pill); });
      var visible = 0;
      grid.querySelectorAll('[data-cat]').forEach(function (card) {
        var c = card.getAttribute('data-cat');
        var show = cat === 'all' || c === cat;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      var empty = document.querySelector('[data-empty]');
      if (empty) empty.style.display = visible === 0 ? '' : 'none';
    });
  }

  // ===== Toggle nav móvil =====
  function bindNavToggle() {
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!(t instanceof Element)) return;
      var btn = t.closest('[data-nav-toggle]');
      if (!btn) return;
      var header = document.querySelector('.site-header');
      if (header) header.classList.toggle('is-open');
    });
  }

  // ===== Dropdown del menú "Utilidades" =====
  // Hover en desktop (CSS lo gestiona). Clic en móvil para abrir/cerrar.
  function bindDropdown() {
    var mql = window.matchMedia('(max-width: 960px)');
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!(t instanceof Element)) return;
      var trigger = t.closest('.dropdown-trigger');
      if (trigger) {
        var dd = trigger.parentElement;
        if (mql.matches) {
          ev.preventDefault();
          dd.classList.toggle('is-open');
        }
        return;
      }
      // Click fuera: cerrar todos los dropdowns abiertos
      if (!t.closest('.has-dropdown')) {
        document.querySelectorAll('.has-dropdown.is-open').forEach(function (d) {
          d.classList.remove('is-open');
        });
      }
    });
    // Cerrar dropdown al cambiar de breakpoint
    mql.addEventListener && mql.addEventListener('change', function () {
      document.querySelectorAll('.has-dropdown.is-open').forEach(function (d) {
        d.classList.remove('is-open');
      });
    });
  }

  // ===== Helpers expuestos =====
  window.DigiUI = {
    toast: toast,
    copy: copyText,
    download: function (filename, blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    },
    formatBytes: function (n) {
      if (!n && n !== 0) return '—';
      if (n < 1024) return n + ' B';
      if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
      return (n / (1024 * 1024)).toFixed(2) + ' MB';
    },
    debounce: function (fn, ms) {
      var t;
      return function () {
        var ctx = this, args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, ms);
      };
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindCopyButtons();
    bindFilters();
    bindNavToggle();
    bindDropdown();
  });
})();
