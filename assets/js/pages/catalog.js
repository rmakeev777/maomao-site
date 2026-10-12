/* MAOMAO — каталог (catalog.html). Рендер из window.MAOMAO_DATA, фильтр серий синхронизирован с ?series= */
(function () {
  "use strict";
  var D = window.MAOMAO_DATA, M = window.MAOMAO;
  if (!D || !M) return;
  var esc = M.esc, t = M.t || function (s) { return s; }, EN = M.lang === "en";
  var SERIES = {};
  D.series.forEach(function (s) { SERIES[s.id] = s; });

  // ---------- общие форматтеры (используются и на work.html через MAOMAO_CAT) ----------
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function priceText(w) {
    if (w.price && window.MAOMAO_EN && MAOMAO_EN.usd) {
      return MAOMAO_EN.usd(w.price) + (w.series === "stickers" && /шт/.test(w.priceUnit || "") ? " / pc" : "");
    }
    if (w.price) {
      if (w.series === "stickers") return money(w.price) + (/шт/.test(w.priceUnit || "") ? t(" р./шт") : t(" р."));
      return money(w.price) + " ₽";
    }
    return "";
  }
  function statusText(w) {
    if (w.status === "available" && w.price && w.series !== "stickers") return priceText(w) + t(" · оригинал в наличии");
    if (w.status === "available") return priceText(w) || t("В наличии");
    if (w.status === "print") return t("Доступна печать");
    if (w.status === "sold") return t("Продана");
    if (w.status === "order") return t("Под заказ");
    return t("Цена по запросу");
  }
  function metaText(w) {
    if (w.series === "stickers") return priceText(w);
    return w.year ? String(w.year) : "";
  }
  window.MAOMAO_CAT = { priceText: priceText, statusText: statusText, metaText: metaText, money: money, series: SERIES };

  var grid = document.querySelector("[data-catalog-grid]");
  if (!grid) return; // подключён на work.html только ради форматтеров
  var filters = document.querySelector("[data-catalog-filters]");
  var intro = document.querySelector("[data-catalog-intro]");
  var count = document.querySelector("[data-catalog-count]");

  function plural(n, a, b, c) {
    var m10 = n % 10, m100 = n % 100;
    return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c);
  }

  function card(w, i) {
    var note = w.series === "stickers" ? "" : statusText(w);
    return '<a class="art-card cat-card" href="work.html?id=' + encodeURIComponent(w.id) + '" style="--i:' + (i % 8) + '">' +
      '<span class="art-card__media" style="--card-ratio:' + w.img.w + ' / ' + w.img.h + '">' +
      M.img(w.img, { alt: w.title + (w.medium ? " — " + w.medium.toLowerCase() : ""), sizes: "(max-width: 767px) 46vw, (max-width: 1199px) 30vw, 22vw" }) +
      "</span>" +
      '<span class="art-card__body"><span class="art-card__title">' + esc(w.title) + '</span><span class="art-card__meta">' + esc(metaText(w)) + "</span></span>" +
      (note ? '<span class="art-card__note">' + esc(note) + "</span>" : "") +
      "</a>";
  }

  function current() {
    var s = new URLSearchParams(location.search).get("series");
    return SERIES[s] ? s : "all";
  }

  function renderFilters(active) {
    var items = [{ id: "all", title: t("Все работы") }].concat(D.series);
    filters.innerHTML = items.map(function (s) {
      var n = s.id === "all" ? D.works.length : D.works.filter(function (w) { return w.series === s.id; }).length;
      return '<button class="cat-filter" type="button" data-series="' + s.id + '" aria-pressed="' + (s.id === active) + '">' +
        esc(s.title) + '<span class="cat-filter__n">' + n + "</span></button>";
    }).join("");
  }

  function renderIntro(active) {
    if (active === "all") { intro.innerHTML = ""; intro.hidden = true; return; }
    var s = SERIES[active];
    intro.hidden = false;
    intro.innerHTML =
      '<div class="cat-intro">' +
      '<div class="cat-intro__titles">' +
      (active === "between-moments" || active === "perlamutr" ? '<p class="t-series-label">' + t("серия") + '</p>' : "") +
      '<h2 class="cat-intro__title">' + esc(s.title) + "</h2>" +
      '<p class="cat-intro__kind">' + esc(s.kind) + "</p>" +
      "</div>" +
      '<p class="cat-intro__text">' + esc(s.text) + "</p>" +
      "</div>";
  }

  function render(active, push) {
    var list = active === "all" ? D.works : D.works.filter(function (w) { return w.series === active; });
    renderFilters(active);
    renderIntro(active);
    count.textContent = list.length + " " + (EN ? (list.length === 1 ? "work" : "works") : plural(list.length, "работа", "работы", "работ"));
    grid.classList.remove("is-shown");
    grid.innerHTML = list.map(card).join("");
    if (M.markSold) M.markSold(grid);
    // мягкое появление сетки
    requestAnimationFrame(function () { requestAnimationFrame(function () { grid.classList.add("is-shown"); }); });
    var title = active === "all" ? t("Каталог работ") : SERIES[active].title + t(" — каталог работ");
    document.title = title + t(" — Катерина Макеева · МАОМАО");
    if (push) {
      var url = active === "all" ? "catalog.html" : "catalog.html?series=" + active;
      history.pushState({ series: active }, "", url);
    }
  }

  filters.addEventListener("click", function (e) {
    var b = e.target.closest("[data-series]");
    if (!b) return;
    var s = b.getAttribute("data-series");
    if (s === current() && b.getAttribute("aria-pressed") === "true") return;
    render(s, true);
  });
  window.addEventListener("popstate", function () { render(current(), false); });

  render(current(), false);
})();
