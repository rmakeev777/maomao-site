/* MAOMAO — карточка работы (work.html?id=<id>). Данные — window.MAOMAO_DATA, форматтеры — MAOMAO_CAT (catalog.js). */
(function () {
  "use strict";
  var D = window.MAOMAO_DATA, M = window.MAOMAO, C = window.MAOMAO_CAT;
  var root = document.querySelector("[data-work]");
  if (!D || !M || !C || !root) return;
  var esc = M.esc, t = M.t || function (s) { return s; };
  var id = new URLSearchParams(location.search).get("id");
  // старые адреса работ «Перламутра» (до официальных названий из каталога Martemanchello, 11.10.2026)
  var OLD_IDS = { "zhasmin": "vnutrennee-otrazhenie", "zhemchuzhnaya-serga": "vzglyad-vnutr", "zhemchuzhina": "nimfa" };
  if (OLD_IDS[id]) {
    id = OLD_IDS[id];
    try { history.replaceState(null, "", "work.html?id=" + id + location.hash); } catch (e) {}
  }
  var w = D.works.filter(function (x) { return x.id === id; })[0];
  var crumbs = document.querySelector("[data-work-crumbs]");

  if (!w) {
    document.title = t("Работа не найдена") + t(" — Катерина Макеева · МАОМАО");
    root.innerHTML =
      '<div class="work-missing"><h1 class="work-missing__title">' + t("Работа не найдена") + '</h1>' +
      '<p class="work-missing__text">' + t("Возможно, ссылка устарела. Посмотрите все работы в каталоге.") + '</p>' +
      '<a class="btn btn--green" href="catalog.html">' + t("Каталог работ") + '</a></div>';
    return;
  }

  var s = C.series[w.series];
  var list = D.works.filter(function (x) { return x.series === w.series; });
  var idx = list.indexOf(w);
  var prev = list[(idx - 1 + list.length) % list.length];
  var next = list[(idx + 1) % list.length];
  var isSeries = w.series === "between-moments" || w.series === "perlamutr";

  // ---------- мета ----------
  var tt = w.title + ((w.title === "Без названия" || w.title === "Untitled") && w.year ? " (" + w.year + ")" : "");
  document.title = tt + " — " + s.title + t(" · Катерина Макеева · МАОМАО");
  var md = document.querySelector('meta[name="description"]');
  var desc = (w.description || s.text || "").replace(/\s+/g, " ").slice(0, 155);
  if (md) md.setAttribute("content", t("«") + w.title + t("», ") + (w.medium || "").toLowerCase() + ". " + desc);
  var canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute("href", canon.getAttribute("href").replace(/work\.html.*$/, "work.html?id=" + encodeURIComponent(w.id)));
  var ogu = document.querySelector('meta[property="og:url"]');
  if (ogu) ogu.setAttribute("content", ogu.getAttribute("content").replace(/work\.html.*$/, "work.html?id=" + encodeURIComponent(w.id)));
  var ogt = document.querySelector('meta[property="og:title"]');
  if (ogt) ogt.setAttribute("content", document.title);
  crumbs.insertAdjacentHTML("beforeend",
    '<li><a href="catalog.html?series=' + w.series + '">' + esc(s.title) + '</a></li><li><span aria-current="page">' + esc(w.title) + "</span></li>");

  // ---------- галерея ----------
  var imgs = [w.img].concat(w.gallery || []);
  function lbAttrs(im) {
    return 'data-lightbox="work" data-srcset="' + esc(im.srcset) + '" data-w="' + im.w + '" data-h="' + im.h + '" data-caption="' + esc(w.title) + '"';
  }
  var main =
    '<a class="work__main" href="' + esc(im0().src) + '" ' + lbAttrs(im0()) + ' aria-label="' + esc(t("Открыть изображение «") + w.title + t("» крупно")) + '">' +
    M.img(im0(), { alt: w.title + (w.medium ? " — " + w.medium.toLowerCase() : ""), sizes: "(max-width: 767px) 92vw, 46vw", eager: true }) +
    (w.status === "sold" ? '<span class="sold-badge sold-badge--lg">' + t("Продана") + '</span>' : "") +
    '<span class="work__zoom" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6"/></svg></span></a>';
  function im0() { return imgs[0]; }
  var thumbs = imgs.length > 1 ? '<div class="work__thumbs">' + imgs.map(function (im, i) {
    return '<a class="work__thumb" href="' + esc(im.src) + '" ' + lbAttrs(im) + (i === 0 ? ' aria-current="true"' : "") + ' aria-label="' + t("Фото ") + (i + 1) + '">' +
      M.img(im, { alt: "", sizes: "120px" }) + "</a>";
  }).join("") + "</div>" : "";

  // ---------- характеристики ----------
  var rows = [];
  if (w.year) rows.push([t("Год"), String(w.year)]);
  if (w.medium) rows.push([t("Техника"), w.medium]);
  if (w.size) rows.push([t("Размер"), w.size]);
  rows.push([isSeries ? t("Серия") : t("Раздел"), '<a class="link-more link-more--lg" href="catalog.html?series=' + w.series + '">' + esc(s.title) + "</a>", true]);
  var st = C.statusText(w);
  rows.push([w.series === "stickers" ? t("Цена") : t("Наличие"), esc(st), true]);
  if (w.prints && w.prints.length) rows.push([t("Печать"), t("Доступно для печати: ") + w.prints.map(t).join(", "), false]);

  var paragraphs = (w.description || "").split("\n").filter(Boolean).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  if (!paragraphs && s.text) paragraphs = "<p>" + esc(s.text) + "</p>";

  var wantText = t(w.series === "stickers" ? "Заказать" : (w.status === "available" ? "Хочу эту работу" : (w.status === "sold" ? "Хочу похожую работу" : "Узнать о работе")));

  root.innerHTML =
    '<div class="work__media">' + main + thumbs + "</div>" +
    '<div class="work__info">' +
      (isSeries ? '<p class="t-series-label">' + t("серия") + '</p><p class="work__series"><a href="catalog.html?series=' + w.series + '">' + esc(s.title) + "</a></p>"
                : '<p class="work__series work__series--plain"><a href="catalog.html?series=' + w.series + '">' + esc(s.title) + "</a></p>") +
      '<h1 class="work__title">' + esc(w.title) + "</h1>" +
      '<dl class="work__rows">' + rows.map(function (r) {
        return '<div class="work__row"><dt>' + esc(r[0]) + "</dt><dd>" + (r[2] === undefined ? esc(r[1]) : r[1]) + "</dd></div>";
      }).join("") + "</dl>" +
      '<div class="work__desc">' + paragraphs + "</div>" +
      '<div class="work__actions">' +
        '<a class="btn btn--green-wide btn--md" href="#contact" data-want>' + wantText + "</a>" +
        '<a class="btn btn--pink btn--md" href="https://t.me/katemaomao" data-contact="telegram" target="_blank" rel="noopener">' + t("Написать в Telegram") + '</a>' +
      "</div>" +
      '<nav class="work__pager" aria-label="' + t("Соседние работы") + '">' +
        '<a class="work__pager-link" href="work.html?id=' + prev.id + '" rel="prev"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M16 4 7 13l9 9"/></svg><span><span class="t-label">' + t("Предыдущая") + '</span>' + esc(prev.title) + "</span></a>" +
        '<a class="work__pager-link work__pager-link--next" href="work.html?id=' + next.id + '" rel="next"><span><span class="t-label">' + t("Следующая") + '</span>' + esc(next.title) + '</span><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m10 4 9 9-9 9"/></svg></a>' +
      "</nav>" +
    "</div>";

  // предзаполнение формы при «Хочу эту работу»
  var want = root.querySelector("[data-want]");
  want.addEventListener("click", function () {
    M.prefill(t(w.status === "sold" ? "Хочу работу в духе «" : "Интересует работа «") + w.title + t("»") + (isSeries ? t(" (серия «") + s.title + t("»)") : ""));
  });

  // ---------- другие работы серии (слайдер как на главной) ----------
  var others = list.filter(function (x) { return x !== w; });
  var more = document.querySelector("[data-work-more]");
  if (more && others.length) {
    more.hidden = false;
    more.innerHTML =
      '<div class="series-head">' +
        '<div class="series-head__titles">' + '<p class="t-series-label">' + t(isSeries ? "серия" : "ещё") + '</p>' +
        '<h2 class="series-head__title" id="work-more-title">' + esc(s.title) + "</h2></div>" +
        '<div class="series-head__actions"><div class="slider__controls">' +
          '<button class="slider__btn slider__btn--prev" type="button" data-slider-prev="more-slider" aria-label="' + t("Предыдущие работы") + '"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M16 4 7 13l9 9"/></svg></button>' +
          '<button class="slider__btn slider__btn--next" type="button" data-slider-next="more-slider" aria-label="' + t("Следующие работы") + '"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m10 4 9 9-9 9"/></svg></button>' +
        '</div><a class="btn ' + (w.series === "perlamutr" ? "btn--pink" : "btn--green") + '" href="catalog.html?series=' + w.series + '">' + t("Каталог серии") + '</a></div>' +
      "</div>" +
      '<div class="slider work-more__slider" id="more-slider" data-slider data-slider-label="' + esc(t("Другие работы: ") + s.title) + '"><div class="slider__track" data-slider-track>' +
      others.map(function (x) {
        var r = x.img.w / x.img.h;
        var v = r < 0.9 ? "slide-s" : "slide-l";
        return '<a class="art-card art-card--' + v + ' slider__slide" href="work.html?id=' + x.id + '">' +
          '<span class="art-card__media">' + M.img(x.img, { alt: x.title, sizes: v === "slide-l" ? "(max-width: 767px) 152px, 23vw" : "(max-width: 767px) 152px, 15vw" }) + "</span>" +
          '<span class="art-card__body"><span class="art-card__title">' + esc(x.title) + '</span><span class="art-card__meta">' + esc(C.metaText(x)) + "</span></span></a>";
      }).join("") + "</div></div>";
  }
})();
