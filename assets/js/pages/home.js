/* MAOMAO — главная: всё поведение (слайдер, табы, FAQ, лайтбокс, форма, анимации)
   подключает main.js по data-атрибутам. Здесь — только мелочи страницы. */
(function () {
  "use strict";
  // мобильная кнопка «Каталог серии» под слайдером (в шапке серии на мобиле она скрыта)
  var bm = document.querySelector(".series--bm");
  if (bm && !bm.querySelector(".bm-mobile-btn")) {
    var a = document.createElement("a");
    a.className = "btn btn--green-wide btn--block bm-mobile-btn u-show-m";
    a.href = "catalog.html?series=between-moments";
    a.textContent = "Каталог серии";
    bm.appendChild(a);
  }
})();
