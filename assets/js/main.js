/* =========================================================================
   MAOMAO — main.js (общий слой; классический <script defer>, без модулей)
   Всё инициализируется по data-атрибутам и только если элемент есть на странице.
   Публичный API: window.MAOMAO (см. notes/COMPONENTS.md).
   Порядок подключения: config.js → data.js → photos.js → main.js → pages/<page>.js
   Автоинициализация — на DOMContentLoaded (т.е. ПОСЛЕ страничных defer-скриптов),
   поэтому разметка, созданная страничным скриптом синхронно, подхватится сама.
   Для разметки, добавленной позже, вызывайте MAOMAO.init(root).
   ========================================================================= */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var CFG = window.MAOMAO_CONFIG || {};
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqMobile = window.matchMedia("(max-width: 767.98px)");
  var mqFine = window.matchMedia("(hover: hover) and (pointer: fine)");

  root.classList.add("js");

  function reduced() { return mqReduce.matches; }
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); }
  function rafThrottle(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn(); });
    };
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function focusables(ctx) {
    return $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])', ctx)
      .filter(function (el) { return el.offsetWidth || el.offsetHeight || el.getClientRects().length; });
  }
  function trapTab(e, ctx) {
    if (e.key !== "Tab") return;
    var f = focusables(ctx);
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- ширина скроллбара → --sbw (для --u = (100vw − sbw)/1920) ---------- */
  var lockCount = 0;
  function measureScrollbar() {
    if (lockCount) return;
    var sbw = Math.max(0, window.innerWidth - root.clientWidth);
    root.style.setProperty("--sbw", sbw + "px");
  }
  function lockScroll() {
    if (lockCount++ === 0) {
      var sbw = Math.max(0, window.innerWidth - root.clientWidth);
      root.classList.add("is-locked");
      if (sbw) root.style.paddingRight = sbw + "px";
    }
  }
  function unlockScroll() {
    if (lockCount > 0 && --lockCount === 0) {
      root.classList.remove("is-locked");
      root.style.paddingRight = "";
    }
  }

  /* ---------- изображения: helper для страничных скриптов ---------- */
  // img: {src, w, h, srcset} (srcset — строка из data.js/photos.js или массив из manifest.json)
  function imgHTML(img, o) {
    o = o || {};
    if (!img) return "";
    var srcset = img.srcset;
    if (Array.isArray(srcset)) srcset = srcset.map(function (s) { return s.src + " " + s.w + "w"; }).join(", ");
    var a = ['<img src="' + esc(img.src) + '"'];
    if (srcset) a.push('srcset="' + esc(srcset) + '"', 'sizes="' + esc(o.sizes || "100vw") + '"');
    if (img.w) a.push('width="' + img.w + '"');
    if (img.h) a.push('height="' + img.h + '"');
    a.push('alt="' + esc(o.alt || "") + '"');
    if (o.cls) a.push('class="' + esc(o.cls) + '"');
    if (o.eager) { a.push('fetchpriority="high"'); } else { a.push('loading="lazy"'); }
    a.push('decoding="async"');
    if (o.attrs) a.push(o.attrs);
    return a.join(" ") + ">";
  }

  /* ---------- контакты из config.js → ссылки [data-contact] ---------- */
  function initContacts(ctx) {
    $$("[data-contact]", ctx).forEach(function (a) {
      var k = a.getAttribute("data-contact");
      var href = { email: CFG.email && "mailto:" + CFG.email, phone: CFG.phoneHref, telegram: CFG.telegramUrl, instagram: CFG.instagramUrl }[k];
      var text = { email: CFG.email, phone: CFG.phone, telegram: CFG.telegram, instagram: CFG.instagram }[k];
      if (href && a.tagName === "A") a.setAttribute("href", href);
      if (text && a.hasAttribute("data-contact-text")) a.textContent = text;
    });
    $$("[data-inn]", ctx).forEach(function (el) {
      if (CFG.inn) {
        var v = $("[data-inn-value]", el);
        if (v) v.textContent = CFG.inn;
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
  }

  /* ---------- шапка ---------- */
  function currentFile() {
    var p = location.pathname.split("/").pop();
    return p || "index.html";
  }
  function markActive(ctx) {
    var file = currentFile();
    $$(".site-nav, .menu__list, .site-footer__nav", ctx).forEach(function (nav) {
      var links = $$("a[href]", nav);
      if (links.some(function (l) { return l.hasAttribute("aria-current"); })) return;
      links.forEach(function (l) {
        var h = l.getAttribute("href");
        if (!h || h.charAt(0) === "#") return;
        if (h.split("?")[0].split("#")[0] === file) l.setAttribute("aria-current", "page");
      });
    });
  }

  function initHeader() {
    var h = $("[data-header]");
    if (!h || h.__ready) return;
    h.__ready = true;
    if (h.getAttribute("data-header") !== "home") return;
    var hero = $("[data-hero]") || ($("main") && $("main").firstElementChild);
    var stuck = false, threshold = 0, hideTimer = 0;
    function measure() {
      threshold = hero ? hero.getBoundingClientRect().bottom + window.scrollY - (mqMobile.matches ? 0 : 40) : window.innerHeight;
      threshold = Math.max(threshold, 120);
    }
    function update() {
      var y = window.scrollY;
      if (y > threshold && !stuck) {
        stuck = true;
        clearTimeout(hideTimer);
        h.classList.add("no-anim", "is-stuck");
        void h.offsetHeight;
        h.classList.remove("no-anim");
        requestAnimationFrame(function () { if (stuck) h.classList.add("is-shown"); });
      } else if (y <= threshold && stuck) {
        stuck = false;
        h.classList.remove("is-shown");
        hideTimer = setTimeout(function () {
          if (!stuck) {
            h.classList.add("no-anim");
            h.classList.remove("is-stuck");
            void h.offsetHeight;
            h.classList.remove("no-anim");
          }
        }, reduced() ? 0 : 520);
      }
    }
    measure();
    update();
    on(window, "scroll", rafThrottle(update), { passive: true });
    on(window, "resize", rafThrottle(function () { measure(); update(); }));
    on(window, "load", function () { measure(); update(); });
  }

  /* ---------- мобильное меню ---------- */
  var menuApi = null;
  function initMenu() {
    var menu = $("[data-menu]");
    if (!menu || menu.__ready) return;
    menu.__ready = true;
    var openers = $$("[data-menu-open]");
    var lastFocus = null;
    var isOpen = false;
    $$(".menu__list li", menu).forEach(function (li, i) { li.style.setProperty("--i", i); });
    function setExpanded(v) { openers.forEach(function (b) { b.setAttribute("aria-expanded", v ? "true" : "false"); }); }
    function open() {
      if (isOpen) return;
      isOpen = true;
      lastFocus = doc.activeElement;
      menu.removeAttribute("inert");
      menu.removeAttribute("aria-hidden");
      void menu.offsetHeight;
      menu.classList.add("is-open");
      lockScroll();
      setExpanded(true);
      setTimeout(function () { var c = $("[data-menu-close]", menu) || focusables(menu)[0]; if (c) c.focus(); }, 60);
    }
    function close(restore) {
      if (!isOpen) return;
      isOpen = false;
      menu.classList.remove("is-open");
      menu.setAttribute("inert", "");
      menu.setAttribute("aria-hidden", "true");
      unlockScroll();
      setExpanded(false);
      if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
    }
    openers.forEach(function (b) { on(b, "click", open); });
    $$("[data-menu-close]", menu).forEach(function (b) { on(b, "click", function () { close(); }); });
    on(menu, "click", function (e) {
      var a = e.target.closest("a[href]");
      if (a) close(false);
    });
    on(menu, "keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else trapTab(e, menu);
    });
    var onMq = function () { if (!mqMobile.matches) close(false); };
    if (mqMobile.addEventListener) mqMobile.addEventListener("change", onMq);
    menuApi = { open: open, close: close };
  }

  /* ---------- reveal / прорисовка / intro ---------- */
  var io = null;
  function revealEl(el) {
    el.classList.add("is-revealed");
    if (el.hasAttribute("data-draw")) drawEl(el);
    $$("[data-draw]", el).forEach(drawEl);
    if (el.hasAttribute("data-parallax")) armParallax(el, 1400);
  }
  function prepDraw(el) {
    if (el.__draw) return;
    el.__draw = true;
    if (reduced()) return;
    $$("path, line, polyline", el).forEach(function (p, i) {
      var len = 0;
      try { len = p.getTotalLength(); } catch (err) { len = 0; }
      if (!len) return;
      p.style.strokeDasharray = len + " " + len;
      p.style.strokeDashoffset = len;
      p.style.setProperty("--i", i);
    });
  }
  function drawEl(el) {
    prepDraw(el);
    requestAnimationFrame(function () {
      $$("path, line, polyline", el).forEach(function (p) { p.style.strokeDashoffset = "0"; });
    });
  }
  function observeReveal(ctx) {
    ctx = ctx || doc;
    $$("[data-reveal-stagger]", ctx).forEach(function (c) {
      var max = parseInt(c.getAttribute("data-reveal-stagger"), 10) || 8;
      Array.prototype.forEach.call(c.children, function (ch, i) {
        if (!ch.style.getPropertyValue("--i")) ch.style.setProperty("--i", Math.min(i, max));
      });
    });
    var els = $$("[data-reveal], [data-reveal-stagger], [data-draw]", ctx);
    if (ctx !== doc && ctx.matches && ctx.matches("[data-reveal], [data-reveal-stagger], [data-draw]")) els.unshift(ctx);
    els.forEach(function (el) {
      if (el.__obs) return;
      el.__obs = true;
      if (el.hasAttribute("data-draw")) prepDraw(el);
      if (!io) { revealEl(el); return; }
      io.observe(el);
    });
  }
  function initRevealObserver() {
    if (io || !("IntersectionObserver" in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); revealEl(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
  }
  function initIntro(ctx) {
    var els = $$("[data-intro]", ctx || doc).filter(function (el) { return !el.__intro; });
    if (!els.length) return;
    els.forEach(function (el, i) {
      el.__intro = true;
      if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", i);
    });
    var done = false;
    function go() {
      if (done) return;
      done = true;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          els.forEach(function (el) {
            el.classList.add("is-in");
            if (el.hasAttribute("data-parallax")) armParallax(el, 1600);
          });
        });
      });
    }
    if (doc.fonts && doc.fonts.ready && !reduced()) {
      doc.fonts.ready.then(go, go);
      setTimeout(go, 700);
    } else go();
  }

  /* ---------- параллакс коллажа от мыши (desktop, ≤8px) ---------- */
  var parallax = { items: [], x: 0, y: 0, on: false };
  function armParallax(el, delay) {
    setTimeout(function () { el.classList.add("is-parallax-live"); }, reduced() ? 0 : delay || 0);
  }
  function initParallax(ctx) {
    var els = $$("[data-parallax]", ctx || doc).filter(function (el) { return !el.__px; });
    els.forEach(function (el) {
      el.__px = true;
      parallax.items.push(el);
      if (!el.hasAttribute("data-reveal") && !el.hasAttribute("data-intro")) armParallax(el, 0);
    });
    if (parallax.on || !parallax.items.length) return;
    if (reduced() || !mqFine.matches) return;
    parallax.on = true;
    var apply = rafThrottle(function () {
      var vh = window.innerHeight;
      parallax.items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var depth = parseFloat(el.getAttribute("data-parallax")) || 1;
        var max = 8 * Math.min(depth, 1.5);
        el.style.setProperty("--px", (-parallax.x * max).toFixed(2) + "px");
        el.style.setProperty("--py", (-parallax.y * max).toFixed(2) + "px");
      });
    });
    on(window, "pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      parallax.x = (e.clientX / window.innerWidth - 0.5) * 2;
      parallax.y = (e.clientY / window.innerHeight - 0.5) * 2;
      apply();
    }, { passive: true });
  }

  /* ---------- слайдер ---------- */
  function initSlider(el) {
    if (!el || el.__slider) return el && el.__slider;
    var track = el.hasAttribute("data-slider-track") ? el : $("[data-slider-track]", el) || el;
    var id = el.id;
    var prev = $("[data-slider-prev]", el) || (id && $('[data-slider-prev="' + id + '"]'));
    var next = $("[data-slider-next]", el) || (id && $('[data-slider-next="' + id + '"]'));
    if (!track.hasAttribute("tabindex")) track.setAttribute("tabindex", "0");
    if (!track.hasAttribute("role")) track.setAttribute("role", "region");
    if (!track.hasAttribute("aria-label")) track.setAttribute("aria-label", el.getAttribute("data-slider-label") || "Галерея, листайте вбок");
    function gap() { return parseFloat(getComputedStyle(track).columnGap) || 0; }
    function slides() { return Array.prototype.slice.call(track.children); }
    function step() {
      var s = slides()[0];
      return s ? s.getBoundingClientRect().width + gap() : track.clientWidth * 0.8;
    }
    function maxScroll() { return track.scrollWidth - track.clientWidth; }
    function go(dir) {
      // к следующему/предыдущему краю слайда
      var left = track.scrollLeft, base = track.getBoundingClientRect().left + (parseFloat(getComputedStyle(track).paddingLeft) || 0);
      var target = null;
      var list = slides().map(function (s) { return s.getBoundingClientRect().left - base + left; });
      if (dir > 0) { for (var i = 0; i < list.length; i++) if (list[i] > left + 4) { target = list[i]; break; } }
      else { for (var j = list.length - 1; j >= 0; j--) if (list[j] < left - 4) { target = list[j]; break; } }
      if (target === null) target = dir > 0 ? maxScroll() : 0;
      track.scrollTo({ left: Math.max(0, Math.min(maxScroll(), target)), behavior: reduced() ? "auto" : "smooth" });
    }
    function update() {
      var l = track.scrollLeft, m = maxScroll();
      if (prev) prev.setAttribute("aria-disabled", l <= 2 ? "true" : "false");
      if (next) next.setAttribute("aria-disabled", l >= m - 2 ? "true" : "false");
      el.classList.toggle("is-static", m <= 2);
    }
    if (prev) on(prev, "click", function () { if (prev.getAttribute("aria-disabled") !== "true") go(-1); });
    if (next) on(next, "click", function () { if (next.getAttribute("aria-disabled") !== "true") go(1); });
    on(track, "scroll", rafThrottle(update), { passive: true });
    on(window, "resize", rafThrottle(update));
    on(track, "keydown", function (e) {
      if (e.target !== track) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === "Home") { e.preventDefault(); track.scrollTo({ left: 0, behavior: "smooth" }); }
      else if (e.key === "End") { e.preventDefault(); track.scrollTo({ left: maxScroll(), behavior: "smooth" }); }
    });
    // перетаскивание мышью
    var drag = null, moved = false;
    on(track, "pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft, id: e.pointerId, t: Date.now(), v: 0, lx: e.clientX };
      moved = false;
    });
    on(track, "pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        track.classList.add("is-dragging");
        try { track.setPointerCapture(drag.id); } catch (err) {}
      }
      if (moved) {
        drag.v = e.clientX - drag.lx;
        drag.lx = e.clientX;
        track.scrollLeft = drag.left - dx;
      }
    });
    function endDrag() {
      if (!drag) return;
      var wasMoved = moved, v = drag.v;
      drag = null;
      if (!wasMoved) return;
      // снап к ближайшему слайду с учётом направления броска
      var left = track.scrollLeft;
      track.classList.remove("is-dragging");
      track.scrollLeft = left;
      var base = track.getBoundingClientRect().left + (parseFloat(getComputedStyle(track).paddingLeft) || 0);
      var pos = slides().map(function (s) { return s.getBoundingClientRect().left - base + left; });
      var best = 0, bd = Infinity;
      pos.forEach(function (p) { var d = Math.abs(p - left + v * 6); if (d < bd) { bd = d; best = p; } });
      track.scrollTo({ left: Math.max(0, Math.min(maxScroll(), best)), behavior: reduced() ? "auto" : "smooth" });
      setTimeout(function () { moved = false; }, 0);
    }
    on(track, "pointerup", endDrag);
    on(track, "pointercancel", endDrag);
    on(track, "lostpointercapture", endDrag);
    on(track, "click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    on(track, "dragstart", function (e) { e.preventDefault(); });
    if ("ResizeObserver" in window) new ResizeObserver(rafThrottle(update)).observe(track);
    update();
    el.__slider = { go: go, update: update, track: track };
    return el.__slider;
  }

  /* ---------- папка-табы (ARIA tabs) ---------- */
  var TAB_COLORS = ["#F6DCB9", "#EBD8C6", "#E1E6D3", "#D3DCE7"];
  var CARET = '<svg viewBox="0 0 14 9" aria-hidden="true"><path d="M1 1.2 7 7.4l6-6.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  function initTabs(el) {
    if (!el || el.__tabs) return el && el.__tabs;
    var list = $('[role="tablist"]', el);
    var tabs = $$('[role="tab"]', el);
    if (!list || !tabs.length) return;
    var uid = el.id || "tabs-" + Math.random().toString(36).slice(2, 7);
    if (!list.id) list.id = uid + "-list";
    var panels = tabs.map(function (t, i) {
      var p = t.getAttribute("aria-controls") && doc.getElementById(t.getAttribute("aria-controls"));
      if (!t.id) t.id = uid + "-tab-" + i;
      if (p && !p.hasAttribute("aria-labelledby")) p.setAttribute("aria-labelledby", t.id);
      if (p) { p.setAttribute("role", "tabpanel"); if (!p.hasAttribute("tabindex")) p.setAttribute("tabindex", "0"); }
      return p;
    });
    // мобильный «селект»
    var toggle = $(".folder__toggle", el);
    if (!toggle) {
      toggle = doc.createElement("button");
      toggle.type = "button";
      toggle.className = "folder__toggle";
      toggle.innerHTML = '<span class="folder__toggle-label"></span>' + CARET;
      list.parentNode.insertBefore(toggle, list);
    }
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", list.id);
    toggle.setAttribute("aria-haspopup", "true");
    function setList(open) {
      el.classList.toggle("is-list-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    on(toggle, "click", function () { setList(!el.classList.contains("is-list-open")); });
    on(doc, "pointerdown", function (e) {
      if (!el.classList.contains("is-list-open")) return;
      if (!toggle.contains(e.target) && !list.contains(e.target)) setList(false);
    });
    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var sel = j === i;
        t.setAttribute("aria-selected", sel ? "true" : "false");
        t.tabIndex = sel ? 0 : -1;
        if (panels[j]) {
          panels[j].classList.toggle("is-active", sel);
          if (sel) panels[j].removeAttribute("inert"); else panels[j].setAttribute("inert", "");
        }
      });
      var c = tabs[i].getAttribute("data-color") || TAB_COLORS[i % TAB_COLORS.length];
      el.style.setProperty("--folder-c", c);
      el.setAttribute("data-active", String(i));
      var lbl = $(".folder__toggle-label", toggle);
      if (lbl) lbl.innerHTML = tabs[i].innerHTML;
      if (focus) tabs[i].focus();
      el.dispatchEvent(new CustomEvent("tabs:change", { detail: { index: i, tab: tabs[i], panel: panels[i] } }));
    }
    tabs.forEach(function (t, i) {
      on(t, "click", function () { select(i); setList(false); if (mqMobile.matches) toggle.focus(); });
      on(t, "keydown", function (e) {
        var k = e.key, n = tabs.length, to = null;
        if (k === "ArrowRight" || k === "ArrowDown") to = (i + 1) % n;
        else if (k === "ArrowLeft" || k === "ArrowUp") to = (i - 1 + n) % n;
        else if (k === "Home") to = 0;
        else if (k === "End") to = n - 1;
        else if (k === "Escape") { setList(false); toggle.focus(); return; }
        if (to !== null) { e.preventDefault(); select(to, true); }
      });
    });
    var start = 0;
    tabs.forEach(function (t, i) { if (t.getAttribute("aria-selected") === "true") start = i; });
    var h = location.hash && location.hash.slice(1);
    if (h) tabs.forEach(function (t, i) { if (t.id === h || (panels[i] && panels[i].id === h) || t.getAttribute("data-key") === h) start = i; });
    select(start);
    el.__tabs = { select: select };
    return el.__tabs;
  }

  /* ---------- аккордеон (FAQ) ---------- */
  function initAccordion(el) {
    if (!el || el.__acc) return;
    el.__acc = true;
    var single = el.getAttribute("data-accordion") === "single";
    var triggers = $$("[data-accordion-trigger], .faq__q", el);
    triggers.forEach(function (btn, i) {
      var item = btn.closest(".faq__item, [data-accordion-item]");
      var panel = btn.getAttribute("aria-controls") && doc.getElementById(btn.getAttribute("aria-controls"));
      if (!panel && item) panel = $(".faq__a, [data-accordion-panel]", item);
      if (panel && !panel.id) panel.id = (el.id || "acc") + "-p" + i;
      if (!btn.id) btn.id = (el.id || "acc") + "-q" + i;
      if (panel) {
        btn.setAttribute("aria-controls", panel.id);
        panel.setAttribute("role", "region");
        panel.setAttribute("aria-labelledby", btn.id);
      }
      var open = btn.getAttribute("aria-expanded") === "true" || (item && item.classList.contains("is-open"));
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (item) item.classList.toggle("is-open", open);
      on(btn, "click", function () {
        var willOpen = btn.getAttribute("aria-expanded") !== "true";
        if (single && willOpen) {
          triggers.forEach(function (b) {
            if (b === btn) return;
            b.setAttribute("aria-expanded", "false");
            var it = b.closest(".faq__item, [data-accordion-item]");
            if (it) it.classList.remove("is-open");
          });
        }
        btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
        if (item) item.classList.toggle("is-open", willOpen);
      });
    });
  }

  /* ---------- лайтбокс ---------- */
  var LB = null;
  var ICON = {
    close: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 5l18 18M23 5 5 23" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    prev: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M17.5 4 7.5 14l10 10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    next: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="m10.5 4 10 10-10 10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
  };
  function buildLightbox() {
    if (LB) return LB;
    var box = doc.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Просмотр изображения");
    box.setAttribute("inert", "");
    box.innerHTML =
      '<div class="lightbox__stage"><figure class="lightbox__figure"><img class="lightbox__img" alt="" decoding="async"><figcaption class="lightbox__caption"></figcaption></figure></div>' +
      '<button type="button" class="lightbox__btn lightbox__close" aria-label="Закрыть">' + ICON.close + "</button>" +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Предыдущее изображение">' + ICON.prev + "</button>" +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="Следующее изображение">' + ICON.next + "</button>" +
      '<p class="lightbox__count" aria-live="polite"></p>';
    doc.body.appendChild(box);
    var st = { box: box, items: [], i: 0, opener: null, open: false,
      fig: $(".lightbox__figure", box), img: $(".lightbox__img", box), cap: $(".lightbox__caption", box),
      count: $(".lightbox__count", box), stage: $(".lightbox__stage", box) };
    function show(i) {
      var n = st.items.length;
      st.i = (i + n) % n;
      var it = st.items[st.i];
      st.fig.classList.remove("is-ready");
      var img = st.img;
      var swap = function () {
        img.removeAttribute("srcset");
        if (it.srcset) { img.srcset = it.srcset; img.sizes = "(max-width: 767px) 100vw, 90vw"; }
        img.src = it.src;
        img.alt = it.alt || it.caption || "";
        if (it.w && it.h) { img.width = it.w; img.height = it.h; } else { img.removeAttribute("width"); img.removeAttribute("height"); }
        st.cap.textContent = it.caption || "";
        st.count.textContent = (st.i + 1) + " / " + n;
        var ready = function () { requestAnimationFrame(function () { st.fig.classList.add("is-ready"); }); };
        if (img.complete && img.naturalWidth) ready();
        else { img.onload = ready; img.onerror = ready; }
      };
      if (st.open && !reduced()) setTimeout(swap, 160); else swap();
      // предзагрузка соседей
      [st.i + 1, st.i - 1].forEach(function (k) {
        var nb = st.items[(k + n) % n];
        if (nb && nb.src) { var p = new Image(); if (nb.srcset) { p.srcset = nb.srcset; p.sizes = "90vw"; } p.src = nb.src; }
      });
    }
    function open(items, i, opener) {
      st.items = items;
      st.opener = opener || doc.activeElement;
      box.classList.toggle("is-single", items.length < 2);
      box.removeAttribute("inert");
      show(i || 0);
      st.open = true;
      void box.offsetHeight;
      box.classList.add("is-open");
      lockScroll();
      setTimeout(function () { $(".lightbox__close", box).focus({ preventScroll: true }); }, 30);
    }
    function close() {
      if (!st.open) return;
      st.open = false;
      box.classList.remove("is-open");
      box.setAttribute("inert", "");
      unlockScroll();
      if (st.opener && st.opener.focus) st.opener.focus({ preventScroll: true });
    }
    on($(".lightbox__close", box), "click", close);
    on($(".lightbox__prev", box), "click", function () { show(st.i - 1); });
    on($(".lightbox__next", box), "click", function () { show(st.i + 1); });
    on(st.stage, "click", function (e) { if (e.target === st.stage || e.target === st.fig) close(); });
    on(doc, "keydown", function (e) {
      if (!st.open) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" && st.items.length > 1) { e.preventDefault(); show(st.i + 1); }
      else if (e.key === "ArrowLeft" && st.items.length > 1) { e.preventDefault(); show(st.i - 1); }
      else trapTab(e, box);
    });
    // свайп
    var sx = null, sy = null;
    on(st.stage, "pointerdown", function (e) { if (e.pointerType !== "mouse") { sx = e.clientX; sy = e.clientY; } });
    on(st.stage, "pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      sx = sy = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && st.items.length > 1) show(st.i + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
    });
    on(st.stage, "pointercancel", function () { sx = sy = null; });
    st.show = show; st.openWith = open; st.close = close;
    LB = st;
    return st;
  }
  function lightboxItem(el) {
    var img = $("img", el);
    return {
      src: el.getAttribute("href") || el.getAttribute("data-src") || (img && (img.currentSrc || img.src)),
      srcset: el.getAttribute("data-srcset") || "",
      w: parseInt(el.getAttribute("data-w"), 10) || 0,
      h: parseInt(el.getAttribute("data-h"), 10) || 0,
      caption: el.hasAttribute("data-caption") ? el.getAttribute("data-caption") : (img ? img.alt : ""),
      alt: img ? img.alt : (el.getAttribute("aria-label") || "")
    };
  }
  function initLightboxDelegation() {
    if (initLightboxDelegation.done) return;
    initLightboxDelegation.done = true;
    on(doc, "click", function (e) {
      var a = e.target.closest("[data-lightbox]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      var g = a.getAttribute("data-lightbox");
      var els = g ? $$('[data-lightbox="' + (window.CSS && CSS.escape ? CSS.escape(g) : g) + '"]') : [a];
      // один и тот же src в группе — не дублировать
      var seen = {}, list = [], idx = 0;
      els.forEach(function (el) {
        var it = lightboxItem(el);
        if (seen[it.src] !== undefined) { if (el === a) idx = seen[it.src]; return; }
        seen[it.src] = list.length;
        if (el === a) idx = list.length;
        list.push(it);
      });
      buildLightbox().openWith(list, idx, a);
    });
  }

  /* ---------- форма заявки ---------- */
  function workTitle(id) {
    var d = window.MAOMAO_DATA;
    if (!d || !d.works || !id) return "";
    for (var i = 0; i < d.works.length; i++) if (d.works[i].id === id) return d.works[i].title;
    return "";
  }
  function setFieldValue(input, value) {
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function prefill(text, form) {
    var f = form || $("form[data-contact-form]");
    if (!f || !text) return;
    setFieldValue(f.elements.message, text);
  }
  function autogrow(t) {
    t.style.height = "auto";
    t.style.height = t.scrollHeight + "px";
  }
  function initForm(form) {
    if (!form || form.__form) return;
    form.__form = true;
    form.setAttribute("novalidate", "");
    var btn = $('[type="submit"]', form);
    var btnText = btn ? btn.textContent : "";
    var status = $(".contact-form__status", form) || $("[data-form-status]", form);
    var area = $("textarea", form);
    if (area) {
      on(area, "input", function () { autogrow(area); });
      on(window, "resize", rafThrottle(function () { autogrow(area); }));
    }
    // предзаполнение: ?work=<id> → data-prefill → ничего
    var q = new URLSearchParams(location.search);
    var wt = workTitle(q.get("work") || form.getAttribute("data-prefill-work"));
    var pre = wt ? "Интересует работа «" + wt + "»" : form.getAttribute("data-prefill");
    if (pre && form.elements.message && !form.elements.message.value) prefill(pre, form);

    function fieldOf(input) { return input && input.closest(".field, .consent"); }
    function setError(input, msg) {
      var f = fieldOf(input);
      if (!f) return;
      var err = $(".field__error", f);
      f.classList.toggle("is-invalid", !!msg);
      if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
      if (err) err.textContent = msg || "";
    }
    $$("input, textarea", form).forEach(function (inp) {
      on(inp, "input", function () { if (inp.getAttribute("aria-invalid")) setError(inp, ""); });
      on(inp, "change", function () { if (inp.getAttribute("aria-invalid")) setError(inp, ""); });
    });
    function say(msg, isErr) {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle("is-error", !!isErr);
    }
    function setBtn(text, busy) {
      if (!btn) return;
      btn.textContent = text;
      if (busy) btn.setAttribute("aria-busy", "true"); else btn.removeAttribute("aria-busy");
      btn.disabled = !!busy;
    }
    on(form, "submit", function (e) {
      e.preventDefault();
      var el = form.elements;
      var name = el.name, contact = el.contact, consent = el.consent;
      var bad = [];
      if (name && !name.value.trim()) { setError(name, "Укажите имя"); bad.push(name); }
      if (contact && !contact.value.trim()) { setError(contact, "Укажите почту, телефон или Telegram"); bad.push(contact); }
      if (consent && !consent.checked) { setError(consent, "Нужно согласие на обработку данных"); bad.push(consent); say("Отметьте согласие на обработку персональных данных", true); }
      if (bad.length) { bad[0].focus(); if (!consent || consent.checked) say("Заполните обязательные поля", true); return; }
      say("");
      if (el.botcheck && el.botcheck.checked) { form.reset(); say("Спасибо! Заявка отправлена."); return; }
      var data = {
        name: name ? name.value.trim() : "",
        contact: contact ? contact.value.trim() : "",
        message: el.message ? el.message.value.trim() : "",
        phone: el.phone ? el.phone.value.trim() : ""
      };
      var key = CFG.web3formsKey;
      if (!key) {
        var body = "Имя: " + data.name + "\nКонтакт: " + data.contact + (data.phone ? "\nТелефон: " + data.phone : "") +
          (data.message ? "\n\n" + data.message : "") + "\n\nСтраница: " + location.href;
        var href = "mailto:" + (CFG.email || "") + "?subject=" + encodeURIComponent(CFG.formSubject || "Заявка с сайта MAOMAO") + "&body=" + encodeURIComponent(body);
        window.location.href = href;
        say("Открываем почтовую программу… Если она не открылась, напишите на " + (CFG.email || "почту") + " или в Telegram " + (CFG.telegram || "") + ".");
        return;
      }
      setBtn("Отправляем…", true);
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject: CFG.formSubject || "Заявка с сайта MAOMAO",
          from_name: "Сайт МАОМАО",
          name: data.name,
          contact: data.contact,
          message: data.message,
          phone: data.phone,
          page: location.href,
          botcheck: false
        })
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.success !== false }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error("fail");
          form.reset();
          if (area) autogrow(area);
          setBtn("Запрос отправлен", false);
          say("Спасибо! Я свяжусь с вами в ближайшее время.");
          setTimeout(function () { setBtn(btnText, false); }, 4000);
        })
        .catch(function () {
          setBtn(btnText, false);
          say("Не получилось отправить. Напишите на " + (CFG.email || "почту") + " или в Telegram " + (CFG.telegram || "") + ".", true);
        });
    });
  }

  /* ---------- «наверх» ---------- */
  function initToTop() {
    var b = $("[data-totop]");
    if (!b || b.__ready) return;
    b.__ready = true;
    var upd = rafThrottle(function () { b.classList.toggle("is-visible", window.scrollY > window.innerHeight); });
    on(window, "scroll", upd, { passive: true });
    upd();
    on(b, "click", function (e) {
      window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
      b.blur();
      if (e.detail !== 0) return; // мышь/тап — фокус не трогаем
      var t = $(".site-header__logo") || $("h1");
      if (t) setTimeout(function () { t.focus({ preventScroll: true }); }, reduced() ? 0 : 500);
    });
  }

  /* ---------- плашка «Продана» ----------
     Источник — status: "sold" у работы в data.js. Плашка ставится на любую карточку-ссылку
     work.html?id=… с .art-card__media (главная, каталог, «Другие работы»), повторно не дублируется. */
  function soldIds() {
    var D = window.MAOMAO_DATA, map = {};
    if (D && D.works) D.works.forEach(function (w) { if (w.status === "sold") map[w.id] = true; });
    return map;
  }
  function markSold(ctx) {
    var sold = soldIds();
    $$('a[href*="work.html?id="]', ctx || doc).forEach(function (a) {
      var m = /[?&]id=([^&#]+)/.exec(a.getAttribute("href"));
      var media = $(".art-card__media", a);
      if (!m || !media || !sold[decodeURIComponent(m[1])]) return;
      a.classList.add("is-sold");
      if (!$(".sold-badge", media)) media.insertAdjacentHTML("beforeend", '<span class="sold-badge">Продана</span>');
    });
  }

  /* ---------- модальность ввода ----------
     Safari показывает :focus-visible и при программном фокусе после тапа (лайтбокс, «наверх»).
     html.is-pointer — последний ввод был мышью/пальцем; клавиатура снимает класс, рамки снова видны. */
  on(doc, "pointerdown", function () { root.classList.add("is-pointer"); }, { passive: true, capture: true });
  on(doc, "keydown", function (e) { if (e.key === "Tab" || e.key.indexOf("Arrow") === 0 || e.key === "Enter" || e.key === " ") root.classList.remove("is-pointer"); }, { capture: true });

  /* ---------- якорь из адреса после подгрузки шрифтов ----------
     Браузер прокручивает к #якорю до замены шрифта; после замены тексты выше становятся короче
     и цель уезжает под шапку — поправляем один раз, если пользователь ещё не прокручивал сам. */
  function fixHashAfterFonts() {
    var h = location.hash;
    if (!h || h.length < 2 || !doc.fonts || !doc.fonts.ready) return;
    var target; try { target = doc.getElementById(decodeURIComponent(h.slice(1))); } catch (err) { return; }
    if (!target) return;
    var userScrolled = false;
    var mark = function () { userScrolled = true; };
    on(window, "wheel", mark, { passive: true, once: true });
    on(window, "touchmove", mark, { passive: true, once: true });
    var go = function () { if (!userScrolled) target.scrollIntoView({ block: "start", behavior: "auto" }); };
    doc.fonts.ready.then(function () { requestAnimationFrame(go); });
    on(window, "load", function () { setTimeout(go, 60); });
  }

  /* ---------- init ---------- */
  function init(ctx) {
    ctx = ctx || doc;
    markSold(ctx);
    initContacts(ctx);
    markActive(ctx);
    $$("[data-slider]", ctx).forEach(initSlider);
    $$("[data-tabs]", ctx).forEach(initTabs);
    $$("[data-accordion]", ctx).forEach(initAccordion);
    $$("form[data-contact-form]", ctx).forEach(initForm);
    $$("textarea", ctx).forEach(function (t) { if (t.closest("form[data-contact-form]") && t.value) autogrow(t); });
    observeReveal(ctx);
    initIntro(ctx);
    initParallax(ctx);
  }

  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    measureScrollbar();
    on(window, "resize", rafThrottle(measureScrollbar));
    initRevealObserver();
    initHeader();
    initMenu();
    initLightboxDelegation();
    initToTop();
    init(doc);
    fixHashAfterFonts();
    window.MAOMAO_READY = true;
    root.classList.add("is-ready");
  }

  window.MAOMAO = {
    config: CFG,
    init: init,
    reveal: observeReveal,
    intro: initIntro,
    initSlider: initSlider,
    initTabs: initTabs,
    initAccordion: initAccordion,
    initForm: initForm,
    prefill: prefill,
    img: imgHTML,
    esc: esc,
    markSold: markSold,
    lightbox: {
      open: function (items, i, opener) { buildLightbox().openWith(items, i || 0, opener); },
      close: function () { if (LB) LB.close(); }
    },
    menu: function () { return menuApi; },
    reducedMotion: reduced
  };

  // измерить скроллбар сразу (до первой отрисовки страничных скриптов)
  measureScrollbar();
  if (doc.readyState === "complete") boot();
  else {
    doc.addEventListener("DOMContentLoaded", boot);
    window.addEventListener("load", boot);
  }
})();
