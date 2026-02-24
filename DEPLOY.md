# Инструкция по деплою antonvetrov.ru

## ⚠️ ВАЖНО — НЕ МЕНЯТЬ

```js
// astro.config.mjs
site: 'https://antonvetrov.ru',
base: '/',
```

**НЕ** `base: '/anton-vetrov/'` — это ломает ВСЁ на хостинге.

## Как добавить статью

1. Создай файл `src/content/blog/<slug>.md`
2. Frontmatter:

```yaml
---
title: "Заголовок статьи"
description: "Описание для SEO (до 160 символов)"
pubDate: 2025-02-24
category: "ИИ"          # ИИ | Разработка | SEO | Хостинги (или новая)
tags: ["тег1", "тег2"]
author: "Антон Ветров"
heroImage: "/images/blog/hero-slug.webp"
draft: false
---
```

3. Картинку для статьи положи в `public/images/blog/`
4. Пути к картинкам **БЕЗ** `/anton-vetrov/` — просто `/images/blog/...`

## Категории

Страницы категорий генерируются автоматически из `category` в frontmatter.
Существующие: ИИ, Разработка, SEO, Хостинги.
Новые создадутся автоматически.

## Партнёрские ссылки

Перед публикацией проверь файл партнёрок (спроси у Антона или Сани).
Вставляй партнёрские ссылки в статьи где уместно.

## CSS правила

- **Ссылки в статьях:** светло-синие (#60a5fa), видимые
- **TOC:** на десктопе справа (sidebar), на мобильном — над текстом
- **Inline padding:** используй `padding-top` / `padding-bottom` отдельно, **НЕ** `padding: X 0 Y`

## Деплой на хостинг

После пуша в git:

```bash
cd <repo> && npx astro build
cd dist && lftp -e "
open -u redegun_openclo,99smbHmB 185.114.245.107
set ftp:ssl-allow no
mirror -R --delete . /antonvetrov/public_html/
bye
"
```

## Не трогать

- `src/layouts/BlogPost.astro` — sidebar TOC layout
- `src/styles/global.css` — .article-layout, .toc-sidebar, .toc-mobile, .prose a
- `src/layouts/BaseLayout.astro` — yandex-verification мета-тег
- `astro.config.mjs` — site и base
