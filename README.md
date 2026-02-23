# antonvetrov.ru

Личный сайт Антона Ветрова — разработка сайтов, SEO, блог.

## Стек

- [Astro](https://astro.build/) — генератор статических сайтов
- Markdown — для статей
- Cloudflare Pages — хостинг

## Разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Структура

```
src/
├── content/blog/    # Статьи (Markdown)
├── layouts/         # Шаблоны страниц
├── pages/           # Страницы сайта
├── components/      # Компоненты
└── styles/          # Стили
```

## Добавление статьи

Создайте файл в `src/content/blog/`:

```markdown
---
title: "Название статьи"
description: "Краткое описание"
pubDate: 2025-02-23
category: "Категория"
tags: ["тег1", "тег2"]
author: "Антон Ветров"
---

Текст статьи...
```
