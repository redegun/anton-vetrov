# ТЗ: SEO-фиксы для antonvetrov.ru

**Дата:** 03.03.2026  
**Приоритет:** Высокий  
**Сайт:** https://antonvetrov.ru  
**Стек:** Astro.js + Markdown, деплой через FTP

---

## 1. 🔴 Sitemap не содержит 30 статей (критично)

**Проблема:** В sitemap.xml 37 blog-статей, а на сайте 67. Все новые MODX-статьи отсутствуют. Поисковики их не индексируют.

**Причина:** Скрипт `scripts/generate-sitemap.mjs` не подхватывает новые статьи после билда, либо sitemap не перезаливается на FTP.

**Что сделать:**
1. Проверить `scripts/generate-sitemap.mjs` — убедиться что он сканирует все файлы из `dist/blog/`
2. Перегенерировать sitemap: `node scripts/generate-sitemap.mjs`
3. Проверить что все 67+ blog-URL присутствуют в `dist/sitemap.xml`
4. Залить обновлённый sitemap.xml на FTP

**Проверка:** `curl -s https://antonvetrov.ru/sitemap.xml | grep '/blog/' | wc -l` должен вернуть ≥67

---

## 2. 🔴 Schema.org — устаревшие данные

**Проблема:** В JSON-LD на главной:
- `"15+ лет опыта, 200+ проектов"` — а на сайте уже "20 лет, 60+ проектов"

**Файл:** `src/pages/index.astro` (или layout, где вставлен `<script type="application/ld+json">`)

**Что сделать:**
1. Найти блоки `application/ld+json` в шаблоне главной
2. Обновить description в ProfessionalService: `"Разработка сайтов, SEO-продвижение и техническая поддержка. 20+ лет опыта, 60+ проектов."`
3. Обновить description в Person: `"Разработка сайтов и SEO-продвижение. 20+ лет опыта."`

---

## 3. 🟡 Нет security-заголовков

**Проблема:** Отсутствуют HTTP-заголовки безопасности:
- `X-Frame-Options`
- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options`
- `Referrer-Policy`

**Что сделать:** Добавить в `.htaccess` (или конфиг nginx):
```apache
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

---

## 4. 🟡 Слабая внутренняя перелинковка

**Проблема:** 
- С главной всего 4 ссылки на блог (показываются последние 4 статьи)
- Со страницы /services/ — 1 ссылка на блог
- В статьях нет блока «Похожие статьи»

**Что сделать:**
1. На главной увеличить количество статей в блоке "Блог" до 6–8
2. На странице /services/ добавить блок "Полезные статьи" с 3–4 ссылками на релевантные статьи
3. В шаблоне статьи (`BlogPost.astro` или аналог) добавить компонент "Похожие статьи" — 3 статьи из той же категории
4. В MODX-статьях добавить перелинковку на страницы услуг (например, "Заказать настройку MODX →")

---

## 5. 🟡 robots.txt — расширить

**Текущий:**
```
User-agent: *
Allow: /
Sitemap: https://antonvetrov.ru/sitemap.xml
```

**Рекомендуемый:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_astro/

Sitemap: https://antonvetrov.ru/sitemap.xml
```

---

## Порядок выполнения

1. **Sitemap** (п.1) — самое критичное, без этого 30 статей невидимы
2. **Schema** (п.2) — быстрый фикс, 5 минут
3. **Перелинковка** (п.4) — среднее время, большой SEO-эффект
4. **Security headers** (п.3) — .htaccess
5. **robots.txt** (п.5) — 1 минута

---

## После выполнения

- Пересобрать: `npm run build`
- Залить на FTP: `lftp -e "open -u redegun_openclo,99smbHmB 185.114.245.107; set ftp:ssl-allow no; mirror -R --delete dist/ /antonvetrov/public_html/; quit"`
- Проверить sitemap: `curl -s https://antonvetrov.ru/sitemap.xml | grep '<loc>' | wc -l`
- Запросить переобход в Яндекс.Вебмастер и Google Search Console
