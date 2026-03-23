# Инструкция по деплою на antonvetrov.ru (для SEO-бота)

## Принцип

**Деплой ТОЛЬКО через git.** Никакого FTP, SCP или ручной загрузки файлов.

```
git push → GitHub Actions → автосборка → деплой
```

Ты пушишь код — CI делает всё остальное.

---

## Пошаговый процесс

### 1. Подготовка

```bash
cd /root/projects/anton-vetrov
git pull origin main
```

**Всегда** начинай с `git pull`. Без исключений.

### 2. Добавление контента

#### Статья в блог

Создай файл `src/content/blog/{slug}.md`:

```yaml
---
title: "Заголовок статьи"
description: "Мета-описание для SEO (до 160 символов)"
pubDate: 2026-03-23
category: "Разработка"
tags: ["тег1", "тег2"]
author: "Антон Ветров"
heroImage: "/images/blog/hero-{slug}.webp"
---

Текст статьи в Markdown...
```

**Slug** — транслит без кириллицы: `adaptivnyj-dizajn`, не `адаптивный-дизайн`.

#### Hero-изображение

Положи в `public/images/blog/hero-{slug}.webp` (формат webp, 720×480).

### 3. Локальная проверка

```bash
npm run build
```

Если билд упал — **не пушить**. Исправь ошибки.

### 4. Коммит и пуш

```bash
git add -A
git commit -m "feat(blog): добавлена статья — {название}"
git push origin main
```

### 5. Проверка CI

После пуша CI автоматически:
- Установит зависимости (`npm ci`)
- Соберёт проект (`npm run build`)
- Задеплоит на GitHub Pages

Проверь статус:
```bash
curl -s -H "Authorization: token $(cat /root/.openclaw/workspace/.github-token 2>/dev/null || echo '')" \
  "https://api.github.com/repos/redegun/anton-vetrov/actions/runs?per_page=1" \
  | python3 -c "import sys,json; r=json.load(sys.stdin)['workflow_runs'][0]; print(f'{r[\"status\"]} / {r[\"conclusion\"] or \"pending\"}')"
```

Должно быть: `completed / success`

---

## Правила

| ✅ Делай | ❌ Не делай |
|----------|-------------|
| `git pull` перед работой | Деплоить через FTP/SCP |
| `npm run build` перед пушем | Пушить без проверки билда |
| Работать в `/root/projects/anton-vetrov/` | Создавать копии в `/tmp/` |
| Slug латиницей | Кириллица в URL |
| Коммиты по фичам | Один гигантский коммит на всё |

## Структура проекта

```
src/
├── content/blog/       ← статьи (.md)
├── pages/
│   ├── blog/           ← шаблоны блога
│   ├── services/       ← страницы услуг (.astro)
│   ├── portfolio/      ← портфолио
│   └── contacts/       ← контакты
public/
├── images/blog/        ← hero-изображения
knowledge/              ← база знаний (используй для контента)
```

## Формат коммитов

```
feat(blog): добавлена статья — название
feat(services): новая услуга — название
fix(blog): исправлен frontmatter в статье X
content(blog): обновлён контент статьи X
```

## Если CI упал

1. Прочитай ошибку в логах GitHub Actions
2. Исправь локально
3. `npm run build` — убедись что работает
4. `git push` снова

**Не игнорируй красный CI.** Пока CI красный — сайт не обновится.

## Известные грабли

- **`padding: X 0` на `.container`** — ломает боковые отступы. Используй `padding-top` / `padding-bottom` отдельно
- **`overflow-x: hidden`** — не ставить на внутренние контейнеры (только `html`, `body`, `main`)
- **CSS 404** — не бывает при git-деплое (CI собирает всё атомарно)

## База знаний

Перед написанием статей загляни в `knowledge/` — там уникальный контент для насыщения текстов.
