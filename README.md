# Сайт МАОМАО — Катерина Макеева (Катя Мао Мао)

Обычный статический сайт: HTML + CSS + JS, без сборки и без сервера. Работает на любом хостинге.

## Страницы
| Файл | Что это |
|---|---|
| `index.html` | Главная — по макету Figma (все 12 комментариев учтены) |
| `catalog.html` | Каталог работ, фильтр по сериям (`catalog.html?series=perlamutr`) |
| `work.html` | Карточка работы (`work.html?id=gratsiya`) |
| `about.html` | О художнике + Artist Statement |
| `exhibitions.html` | Выставки, перформанс, фестивали, арт-встречи |
| `services.html` | Услуги, этапы работы, все вопросы-ответы (`services.html?tab=3` — открыть вкладку) |
| `reviews.html` | Все отзывы |
| `privacy.html`, `consent.html` | Политика и согласие (152-ФЗ) |
| `404.html` | Страница «не найдено» |

## Что нужно сделать перед публикацией
1. **Форма заявки (Web3Forms):** зайдите на https://web3forms.com, введите почту `kate.maomao@mail.ru`, получите Access Key и вставьте его в `assets/js/config.js` → `web3formsKey: "..."`. Пока ключа нет, форма открывает почтовую программу с готовым письмом.
2. **ИНН:** впишите в `assets/js/config.js` → `inn: "..."` (появится внизу блока формы) и замените `[ИНН]` в `privacy.html` и `consent.html`.
3. **Домен:** замените `https://example.com` на свой домен в `sitemap.xml`, `robots.txt` и в `<head>` страниц (canonical / og:url).

## Как менять работы и цены
Все работы каталога — в одном файле `assets/js/data.js` (название, год, техника, размер, цена, статус, описание).
Статусы: `available` — в наличии, `print` — доступна печать, `request` — цена по запросу, `sold` — продана, `order` — под заказ.
Названия серии «Перламутр» и стикерпаков — рабочие (помечены `workingTitle`), их можно заменить.

## Публикация
Загрузите содержимое папки `maomao-site` на любой хостинг статических сайтов (например, Netlify Drop — перетащить папку в браузер; GitHub Pages; Timeweb/Beget — в папку `public_html`).
Папки `_partials/` и файл `styleguide.html` служебные — их можно не загружать.

## Шрифты
Libertinus Serif и Unageo подключены локально (лицензия OFL, файлы в `assets/fonts`), Ysabeau Infant — через Google Fonts.
