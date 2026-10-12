/* MAOMAO — английская версия (подключается только на страницах /en/, после data.js и до main.js).
   ui    — переводы строк интерфейса из main.js / pages/*.js (ключ — русская строка, см. MAOMAO.t).
   series / works — английские поля поверх window.MAOMAO_DATA (id те же, что в data.js).
   Новую работу добавили в data.js — допишите её перевод в works ниже (иначе на /en/ останется русский текст). */
(function () {
  "use strict";
  var ui = {
    // общее
    "Галерея, листайте вбок": "Gallery, scroll sideways",
    "Просмотр изображения": "Image viewer",
    "Закрыть": "Close",
    "Предыдущее изображение": "Previous image",
    "Следующее изображение": "Next image",
    "Продана": "Sold",
    "серия": "series",
    "ещё": "more",
    "«": "“",
    "»": "”",
    "», ": "”, ",
    // форма
    "Интересует работа «": "I’m interested in “",
    "Хочу работу в духе «": "I’d like a piece in the spirit of “",
    " (серия «": " (series “",
    "»)": "”)",
    "Укажите имя": "Please enter your name",
    "Укажите почту, телефон или Telegram": "Please enter your email, phone or Telegram",
    "Нужно согласие на обработку данных": "Your consent to data processing is required",
    "Отметьте согласие на обработку персональных данных": "Please tick the consent to personal data processing",
    "Заполните обязательные поля": "Please fill in the required fields",
    "Спасибо! Заявка отправлена.": "Thank you! Your request has been sent.",
    "Имя: ": "Name: ",
    "Контакт: ": "Contact: ",
    "Телефон: ": "Phone: ",
    "Страница: ": "Page: ",
    "Заявка с сайта MAOMAO": "Request from the MAOMAO website",
    "Сайт МАОМАО": "MAOMAO website",
    "Открываем почтовую программу… Если она не открылась, напишите на ": "Opening your email app… If it didn’t open, write to ",
    "почту": "email",
    " или в Telegram ": " or on Telegram ",
    "Отправляем…": "Sending…",
    "Запрос отправлен": "Request sent",
    "Спасибо! Я свяжусь с вами в ближайшее время.": "Thank you! I’ll get back to you soon.",
    "Не получилось отправить. Напишите на ": "Couldn’t send the request. Please write to ",
    // каталог
    " · оригинал в наличии": " · original available",
    "В наличии": "Available",
    "Доступна печать": "Prints available",
    "Под заказ": "Made to order",
    "Цена по запросу": "Price on request",
    "Все работы": "All works",
    "Каталог работ": "Artworks",
    " — каталог работ": " — artworks",
    " — Катерина Макеева · МАОМАО": " — Katerina Makeeva · MAOMAO",
    // карточка работы
    "Работа не найдена": "Artwork not found",
    "Возможно, ссылка устарела. Посмотрите все работы в каталоге.": "The link may be out of date. Have a look at all artworks.",
    " · Катерина Макеева · МАОМАО": " · Katerina Makeeva · MAOMAO",
    "Открыть изображение «": "Open image “",
    "» крупно": "” full size",
    "Фото ": "Photo ",
    "Год": "Year",
    "Техника": "Medium",
    "Размер": "Size",
    "Серия": "Series",
    "Раздел": "Section",
    "Цена": "Price",
    "Наличие": "Availability",
    "Печать": "Prints",
    "Доступно для печати: ": "Available as prints: ",
    "холсты": "canvases",
    "открытки": "postcards",
    "шопперы": "tote bags",
    "Заказать": "Order",
    "Хочу эту работу": "I want this piece",
    "Хочу похожую работу": "I’d like a similar piece",
    "Узнать о работе": "Ask about this piece",
    "Соседние работы": "Adjacent works",
    "Предыдущая": "Previous",
    "Следующая": "Next",
    "Предыдущие работы": "Previous works",
    "Следующие работы": "Next works",
    "Каталог серии": "All artworks",
    "Другие работы: ": "More works: ",
    "Написать в Telegram": "Message on Telegram"
  };

  var series = {
    "between-moments": {
      title: "Between Moments", kind: "Digital painting",
      lead: "Paintings about states of mind, closeness, nature and everyday observations.",
      text: "A series about the fragility of the present moment and the fleeting states that so easily go unnoticed. The works are inspired by life in Thailand, Thai visual culture and quiet human stories. In 2026 the series was shown at my first solo exhibition, “Between Moments”, at Teaory Teahouse in Bangkok."
    },
    "perlamutr": {
      title: "Mother of Pearl", kind: "Oil painting",
      lead: "Intimate oil paintings in vintage frames.",
      text: "A series of small oil paintings about the beauty that hides within: shells, pearls, flowers and female figures in carved frames. The pearly glow becomes a metaphor for tenderness and inner strength — things that take shape slowly and with care."
    },
    "raznoe": {
      title: "Paintings & illustrations", kind: "Painting, illustration",
      lead: "Portraits, illustrations and stories caught while travelling.",
      text: "Individual works from different years: oil paintings, digital portraits and illustrations — from northern landscapes to the streets of Bangkok’s Chinatown."
    },
    "stickers": {
      title: "Stickers & postcards", kind: "Printed goods",
      lead: "Original sticker packs and postcards.",
      text: "Small stories you can take with you: sticker packs and postcards with my illustrations. Printed on thick paper — message me to check availability."
    },
    "sketches": {
      title: "Sketches", kind: "Drawing",
      lead: "Academic and quick life drawings.",
      text: "A series of academic and quick life drawings made during my studies and independent practice in Moscow. For me, a sketch is a way to better understand form, movement, light and a person’s character. These observations become the foundation for my paintings, illustrations and portraits."
    }
  };

  var medium = {
    "Цифровая живопись": "Digital painting",
    "Цифровая живопись, холст": "Digital painting on canvas",
    "Открытка": "Postcard",
    "Стикерпак": "Sticker pack",
    "Масло": "Oil",
    "Холст, масло": "Oil on canvas",
    "Графика, набросок с натуры": "Drawing, life sketch",
    "Цифровая иллюстрация": "Digital illustration"
  };

  var works = {
    "gratsiya": ["Grace", "Part of a triptych.\nA portrait inspired by the beauty of age and inner dignity. The flower becomes a symbol of life that keeps blossoming regardless of time. The work is a reminder that true beauty is born from lived experience and self-acceptance."],
    "prikosnovenie-lotosa": ["Lotus Touch", "Part of a triptych.\nIn Thai culture the lotus is a symbol of calm, renewal and inner strength. The gesture of the hands turns an ordinary moment into a quiet ritual of care, inviting you to slow down and notice the simple yet important details."],
    "yunost": ["Youth", "Part of a triptych.\nA portrait about the harmony of people and nature. The flower, a recurring symbol, becomes a continuation of the figure, emphasising the softness, femininity and calm of the moment."],
    "pod-odnim-zontom": ["Under One Umbrella", "Sometimes care shows itself in the smallest gestures. A girl holds an umbrella over a stray cat, turning a chance encounter into a story of kindness, attention and compassion."],
    "vstrecha": ["The Encounter", "The joy of simple interaction. This work is a reminder that the warmest moments often happen unexpectedly — in a glance, a smile or a meeting with an animal."],
    "vesenniy-son": ["Spring Dream", "A cat asleep among blossoming branches seems to become part of nature. The work conveys a sense of peace, spring warmth and the unhurried flow of time.\nInspired by a personal story."],
    "tsvetenie": ["Blossoming", "A portrait in which a person gradually merges with the plant world. The work explores the connection between our inner state and nature and speaks of a constant process of growth and change."],
    "limony": ["Lemons", "Freshness, light and contrast. The lemons become a symbol of vital energy, and the portrait a reflection on the balance between fragility and strength."],
    "svet": ["Light", "An upward gaze filled with anticipation and hope. The work is about searching for light even in the most uncertain periods of life."],
    "teplyy-vecher": ["Warm Evening", "Inspired by life in Southeast Asia and the beauty of everyday scenes. Simple moments become a reason to pause and feel the atmosphere of a place."],
    "vodopad": ["Waterfall", "A landscape about the scale of nature and a sense of freedom. A space filled with light and air invites the viewer to imagine being inside this calm place."],
    "tsvetochnyy-rynok": ["Flower Market", "An everyday scene full of the warmth of human connection. The work tells of the beauty of simple encounters, traditions and lively city spaces."],
    "tsvetochnaya-kompozitsiya": ["Floral Composition", "The tenderness of the flowers and the calm of the portrait create the feeling of a quiet moment you want to hold on to. The work explores the beauty of things that don’t last."],
    "u-morya": ["By the Sea", "Travel as a chance to stop and listen to yourself. The work conveys the calm that comes with sea air and the anticipation of a new journey."],
    "khranitel-khrama": ["Temple Keeper", "A small corner of a temple becomes a meeting place for nature, an animal and the past. The work is dedicated to quiet spaces where time seems to flow more slowly."],
    "sobiraya-tishinu": ["Gathering Silence", "A work about a rare state of inner calm. A girl gathers a bouquet, turning an ordinary moment into a quiet ritual of attentiveness, beauty and closeness to nature. The bright plants and dark background emphasise the fragility of the moment and a sense of focus on the present."],
    "inzhir": ["Fig", ""],
    "vnutrennee-otrazhenie": ["Inner Reflection", "The portrait is set inside the pearly form of a shell, as if the image appears not in front of a mirror but within memory. The flowers heighten the sense of fragility while turning the female profile into an image of inner composure."],
    "rakovina": ["Seashell", ""],
    "iris": ["Iris", ""],
    "babochka": ["Butterfly", ""],
    "zhemchuzhnye-kapli": ["Pearl Drops", ""],
    "ustritsa": ["Oyster", ""],
    "u-vody": ["By the Water", ""],
    "dve-rakoviny": ["Two Shells", ""],
    "vzglyad-vnutr": ["Looking Within", "A female profile and a shell merge into a single image: the outer becomes a continuation of the inner. The work speaks of attention to oneself — not as isolation, but as a way to hear your own state."],
    "lotos-i-zhemchug": ["Lotus and Pearl", ""],
    "pered-vykhodom": ["Before Going Out", "An everyday scene captures a brief pause before stepping outside. Shoes taken off, a book, a shell and fabric keep the trace of a person’s presence, turning the interior into a quiet self-portrait without a figure."],
    "nimfa": ["Nymph", "A figure sheltered inside an open shell exists beside a pearl as part of her own space. Here the shell becomes almost the architecture of an inner world — a place of rest, vulnerability and treasured value."],
    "prikosnovenie": ["Touch", "The painting explores the bond between people and nature through the image of a girl and a deer sharing one space. It is a story of trust, tenderness and a sense of unity with all living things."],
    "bez-nazvaniya-vostok": ["Untitled", "A portrait inspired by Eastern aesthetics."],
    "bez-nazvaniya-tishina": ["Untitled", "A portrait about inner calm and the search for oneself. The muted palette and concise composition create a feeling of silence and focus."],
    "ne-zasypaetsya": ["Can’t Fall Asleep", "An illustration for Lera Yaskevich’s song “Ne zasypaetsya” (“Can’t Fall Asleep”)."],
    "sever": ["North", "An illustration inspired by northern nature and its calm beauty. The image of a girl and an animal speaks of trust, warmth and our connection with the world around us."],
    "bez-nazvaniya-linii": ["Untitled", "A black-and-white portrait exploring a person’s inner world. Abstract lines become a continuation of the thoughts and emotions hidden behind a calm expression."],
    "para-iz-chaynatauna": ["Chinatown Couple", "A story caught on the streets of Bangkok."],
    "lyubov": ["Love", "A portrait inspired by the atmosphere of cold winter days. The contrast of warm clothes and a bright sky creates a feeling of freshness and something bright."],
    "klubnichnyy-tort": ["Strawberry Cake", "A play with shapes and sizes."],
    "otkrytki": ["Original postcards", "Postcards with my illustrations: heroines, Asian food and warm everyday scenes. Printed on thick textured paper."],
    "khao-yai": ["“Khao Yai” stickers", "A sticker pack inspired by Khao Yai National Park: deer, a waterfall, little houses and a road through the jungle."],
    "blooming-bangkokians": ["“Blooming Bangkokians” stickers", "Lotuses, tea ceremonies, cats and an artist’s studio — the small joys of life in Bangkok."],
    "seven-eleven": ["“7‑Eleven” stickers", "A nostalgic sticker pack about Thailand’s favourite corner shop: toasties, onigiri, juices and soda."],
    "milk-tea-club": ["“Milk Tea Club” stickers", "Matcha, Thai tea, mochi and pudding — a sticker pack for lovers of tea breaks."],
    "otkrytka-sestry": ["“Sisters” postcard", "“…while children can stay children, let them.” An illustration about growing up, closeness and warm evenings together."],
    "otkrytka-barista": ["“Barista” postcard", "An illustrated postcard about the small ritual of morning coffee."],
    "otkrytka-treshchina": ["“Crack” postcard", "A graphic portrait about fragility and the light that comes through the cracks."]
  };
  for (var n = 1; n <= 10; n++) works["nabrosok-" + (n < 10 ? "0" + n : n)] = ["Sketch No. " + n, ""];

  var D = window.MAOMAO_DATA;
  if (D) {
    (D.series || []).forEach(function (s) {
      var e = series[s.id];
      if (e) { s.title = e.title; s.kind = e.kind; s.lead = e.lead; s.text = e.text; }
    });
    (D.works || []).forEach(function (w) {
      var e = works[w.id];
      if (e) { w.title = e[0]; w.description = e[1]; }
      if (w.medium && medium[w.medium]) w.medium = medium[w.medium];
      if (w.size) w.size = w.size.replace(/см$/, "cm");
    });
  }
  // страницы /en/ лежат во вложенной папке: пути к картинкам из data.js/photos.js — на уровень выше
  function up(v) { return typeof v === "string" ? v.replace(/(^|,\s*)assets\//g, "$1../assets/") : v; }
  function fixImg(im) { if (im) { im.src = up(im.src); im.srcset = up(im.srcset); } }
  if (D) (D.works || []).forEach(function (w) { fixImg(w.img); (w.gallery || []).forEach(fixImg); });
  var PH = window.MAOMAO_PHOTOS;
  if (PH) Object.keys(PH).forEach(function (g) { (PH[g] || []).forEach(fixImg); });

  var C = window.MAOMAO_CONFIG;
  if (C) { C.siteName = "MAOMAO — Katerina Makeeva"; C.artist = "Katerina Makeeva"; }

  // Цены на английской версии — в долларах. Курс USD/RUB по Google (рынок) на 12.10.2026: 1 $ ≈ 85,03 ₽.
  // Округление: до $1 (меньше $20), до $5 (до $100), до $10 (до $1000), дальше до $50.
  var USD_RUB = 85.03;
  function usd(rub) {
    var v = rub / USD_RUB;
    var step = v < 20 ? 1 : v < 100 ? 5 : v < 1000 ? 10 : 50;
    return "$" + String(Math.round(v / step) * step).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  window.MAOMAO_EN = { ui: ui, usd: usd };
})();
