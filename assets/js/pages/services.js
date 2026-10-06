/* MAOMAO — услуги: ?tab=1..4 открывает нужную вкладку папки (ссылки с других страниц). */
(function () {
  "use strict";
  var n = parseInt(new URLSearchParams(location.search).get("tab"), 10);
  var tabs = document.querySelectorAll("#services-tabs [role=tab]");
  if (!n || n < 1 || n > tabs.length) return;
  // выставляем до авто-инициализации main.js (она стартует с вкладки aria-selected="true")
  tabs.forEach(function (t, i) { t.setAttribute("aria-selected", i === n - 1 ? "true" : "false"); });
})();
