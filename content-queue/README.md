# Content Publishing Queue

Система автоматической публикации контента для antonvetrov.ru.

## Структура директорий

```
content-queue/
├── blog/           # Статьи для блога (markdown)
├── services/       # Страницы услуг (astro)
├── images/         # Изображения для публикации
└── manifest.json   # Очередь публикации
```

## Как добавить контент в очередь

### 1. Статьи блога
1. Поместите markdown файл в `content-queue/blog/`
2. Убедитесь что frontmatter корректный:
   ```yaml
   ---
   title: "Заголовок статьи"
   description: "Описание"
   pubDate: 2025-06-24
   category: "Разработка"
   tags: ["тег1", "тег2"]
   author: "Антон Ветров"
   heroImage: "/images/blog/hero-filename.webp"
   ---
   ```
3. Если есть hero изображение, поместите его в `content-queue/images/blog/`

### 2. Страницы услуг
1. Поместите .astro файл в `content-queue/services/`
2. Убедитесь что используется правильный layout `ServicePage.astro`

### 3. Redizajn Cocoon страницы
1. Поместите готовые страницы в `content-queue/services/`
2. Файлы должны быть в формате .astro
3. При необходимости добавьте изображения в `content-queue/images/`

## Управление очередью

### Автоматический порядок (по умолчанию)
Публикация по алфавитному порядку файлов. Используйте префиксы:
- `001-first-article.md`
- `002-second-article.md`
- `010-important-service.astro`

### Ручной порядок
Создайте/отредактируйте `manifest.json`:
```json
{
  "queue": [
    {
      "type": "blog",
      "file": "article-name.md",
      "heroImage": "hero-article-name.webp"
    },
    {
      "type": "service", 
      "file": "service-name.astro"
    }
  ]
}
```

## Автоматическая публикация

Настроена публикация каждый день в 09:00 UTC через cron.

### Проверить статус очереди:
```bash
./scripts/publish-queue.sh --status
```

### Тестовая публикация (dry-run):
```bash
./scripts/publish-queue.sh --dry-run
```

### Ручная публикация одного элемента:
```bash
./scripts/publish-queue.sh --publish
```

## Логи

Логи публикации сохраняются в `logs/publish-queue.log`

## Важно

- НЕ публикуйте элементы вручную без тестирования
- Всегда проверяйте dry-run перед реальной публикацией
- Убедитесь что frontmatter валиден
- Проверьте что изображения существуют