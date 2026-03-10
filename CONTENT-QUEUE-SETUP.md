# Content Publishing Queue - Setup Guide

Автоматическая система публикации контента для antonvetrov.ru.

## Быстрый старт

### 1. Установка cron задачи
```bash
cd /root/projects/anton-vetrov
./scripts/setup-cron.sh
```

### 2. Проверка статуса очереди
```bash
./scripts/publish-queue.sh --status
```

### 3. Тестирование (dry-run)
```bash
./scripts/publish-queue.sh --dry-run
```

## Структура файлов

```
/root/projects/anton-vetrov/
├── content-queue/
│   ├── blog/                    # Статьи для блога (.md)
│   ├── services/                # Страницы услуг (.astro)  
│   ├── images/                  # Изображения для публикации
│   │   └── blog/               # Hero-изображения для статей
│   ├── manifest.json           # Управление порядком публикации (опционально)
│   └── README.md               # Документация по использованию
├── scripts/
│   ├── publish-queue.sh        # Основной скрипт публикации
│   └── setup-cron.sh           # Установка cron задачи
└── logs/
    ├── publish-queue.log       # Логи публикации
    └── cron-publish.log        # Логи cron задачи
```

## Добавление контента в очередь

### Статьи блога
1. Создайте markdown файл в `content-queue/blog/`
2. Убедитесь в корректности frontmatter:
   ```yaml
   ---
   title: "Заголовок статьи"
   description: "Описание для SEO"
   pubDate: 2025-06-24
   category: "Разработка" 
   tags: ["тег1", "тег2"]
   author: "Антон Ветров"
   heroImage: "/images/blog/hero-filename.webp"
   ---
   ```
3. При наличии hero-изображения поместите его в `content-queue/images/blog/`

### Страницы услуг
1. Создайте .astro файл в `content-queue/services/`
2. Используйте layout `ServicePage.astro`
3. Пример структуры см. в `content-queue/services/EXAMPLE-test-service.astro`

### Redizajn Cocoon страницы
1. Готовые .astro страницы помещайте в `content-queue/services/`
2. При необходимости добавляйте изображения в `content-queue/images/`
3. Убедитесь что используется правильная структура ServicePage

## Управление порядком публикации

### Автоматический порядок (по умолчанию)
Файлы публикуются в алфавитном порядке. Для контроля используйте префиксы:
```
001-important-article.md
002-second-priority.md  
010-service-page.astro
```

### Ручной порядок через manifest.json
Создайте файл `content-queue/manifest.json`:
```json
{
  "queue": [
    {
      "type": "blog",
      "file": "article-name.md",
      "heroImage": "hero-article.webp"
    },
    {
      "type": "service",
      "file": "service-name.astro"
    }
  ]
}
```

## Расписание публикации

- **Частота:** Ежедневно
- **Время:** 09:00 UTC  
- **Количество:** 1 элемент за запуск
- **Логи:** `logs/cron-publish.log`

## Команды управления

```bash
# Проверить статус очереди
./scripts/publish-queue.sh --status

# Тестирование без публикации
./scripts/publish-queue.sh --dry-run

# Ручная публикация одного элемента
./scripts/publish-queue.sh --publish

# Просмотр логов
tail -f logs/publish-queue.log
tail -f logs/cron-publish.log

# Проверка cron задачи
crontab -l | grep publish-queue

# Удаление cron задачи
crontab -l | grep -v publish-queue | crontab -
```

## Процесс публикации

1. **Валидация** - проверка frontmatter и структуры файла
2. **Копирование** - перенос файла в целевую директорию
3. **Изображения** - копирование связанных hero-изображений
4. **Сборка** - `npm run build`
5. **Деплой** - FTP загрузка по процедуре из DEPLOY.md
6. **Очистка** - удаление из очереди
7. **Git** - автоматический коммит изменений
8. **Логирование** - запись результатов

## Безопасность

- ✅ Dry-run режим для безопасного тестирования
- ✅ Валидация контента перед публикацией  
- ✅ Полное логирование всех операций
- ✅ Автоматический git commit
- ⚠️ Тестовые файлы с префиксом `EXAMPLE-` НЕ публиковать!

## Устранение проблем

### Очередь пуста
```bash
# Проверить наличие файлов
ls -la content-queue/blog/ content-queue/services/
```

### Ошибки валидации
```bash
# Проверить логи
tail logs/publish-queue.log
```

### Проблемы с cron
```bash
# Проверить логи cron
tail logs/cron-publish.log

# Переустановить cron задачу  
./scripts/setup-cron.sh
```

### Проблемы деплоя
```bash
# Проверить доступность FTP
lftp -u redegun_openclo,99smbHmB 185.114.245.107 -e "pwd; quit"

# Проверить сборку вручную
npm run build
```

## Мониторинг

Следите за логами для контроля публикации:
```bash
# Последние записи
tail -20 logs/publish-queue.log

# Мониторинг в реальном времени
tail -f logs/publish-queue.log
```

## Удаление системы

Если нужно отключить автоматическую публикацию:
```bash
# Удалить cron задачу
crontab -l | grep -v publish-queue | crontab -

# Удалить файлы очереди (опционально)
rm -rf content-queue/ logs/
```