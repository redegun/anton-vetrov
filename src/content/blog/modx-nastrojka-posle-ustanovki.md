---
title: "Настройка MODX после установки: 15 обязательных шагов"
description: "Что делать сразу после установки MODX Revolution? 15 важных настроек для безопасности, SEO и удобства работы. Пошаговое руководство."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-nastrojka-posle-ustanovki.webp"
tags: ["MODX", "Настройка", "Безопасность", "SEO"]
draft: false
---

# Настройка MODX после установки: 15 обязательных шагов

Установили MODX Revolution и не знаете, что делать дальше? Сырая установка — это только начало. За годы работы я выработал список обязательных настроек, которые нужно выполнить сразу после установки. Эти 15 шагов сэкономят вам часы отладки и защитят сайт от проблем.

## Шаг 1: Удаление папки setup (критично!)

**Важность:** 🔥 Критично для безопасности

Если вы ещё не удалили папку `setup/` — сделайте это СЕЙЧАС. Она содержит установочные файлы, через которые злоумышленники могут переустановить ваш сайт.

```bash
# Через SSH
rm -rf setup/

# Через FTP
# Удалите папку setup/ полностью
```

**Как проверить:** попробуйте открыть `ваш-домен.ru/setup/` — должна быть ошибка 404.

## Шаг 2: Изменение стандартных путей

**Важность:** 🔥 Критично для безопасности

По умолчанию MODX использует предсказуемые пути. Переносим ядро за пределы публичной папки:

### Создание новой структуры

```bash
# Создаем папку вне public_html
mkdir /home/username/modx_core
mv core/* /home/username/modx_core/
mv connectors /home/username/modx_core/
```

### Обновление конфигурации

Отредактируйте `core/config/config.inc.php`:

```php
<?php
$modx_core_path = '/home/username/modx_core/';
$modx_processors_path = $modx_core_path . 'model/modx/processors/';  
$modx_connectors_path = $modx_core_path . 'connectors/';
$modx_connectors_url = '/connectors/';

$modx_manager_path = $modx_core_path . 'manager/';
$modx_manager_url = '/manager/';
$modx_base_path = '/home/username/public_html/';
$modx_base_url = '/';
?>
```

## Шаг 3: Настройка ЧПУ (Friendly URLs)

**Важность:** 🔥 Критично для SEO

### Включение в настройках

**Система** → **Настройки системы** → найдите:

```
friendly_urls = Да
use_alias_path = Да  
automatic_alias = Да
```

### Проверка .htaccess

Убедитесь, что в корне сайта есть правильный `.htaccess`:

```apache
RewriteEngine On
RewriteBase /

# Защита системных папок
RewriteRule ^core - [F]
RewriteRule ^assets/(.*)\.php$ - [F]

# Основные правила ЧПУ
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?q=$1 [L,QSA]

# Безопасность
<Files .htaccess>
order allow,deny
deny from all
</Files>
```

### Тест ЧПУ

Создайте тестовую страницу с псевдонимом `test-page` и проверьте, что она открывается по URL `домен.ru/test-page/`

## Шаг 4: Настройка кэширования

**Важность:** 🔸 Важно для производительности

### Основные настройки кэша

**Система** → **Настройки системы**:

```
cache_enabled = Да
cache_db = Да  
cache_db_expires = 3600
cache_default = Да
cache_resource = Да
cache_resource_expires = 86400
```

### Настройка папки кэша

Проверьте права доступа:

```bash
chmod 755 core/cache/
chmod 755 core/cache/resource/
chmod 755 core/cache/db/
```

## Шаг 5: Безопасность администратора

**Важность:** 🔥 Критично для безопасности

### Смена пароля админа

1. **Безопасность** → **Управление пользователями**
2. Найдите пользователя `admin`
3. Смените пароль на сложный:

```
Хороший пароль: Modx!Secure#2026$Admin
Плохой пароль: 123456, admin, password
```

### Переименование пользователя

Измените логин с `admin` на что-то уникальное:

```
Хорошо: site_admin_2026, modx_master
Плохо: admin, administrator, root
```

### Двухфакторная аутентификация

Установите пакет **Login** с 2FA для дополнительной защиты.

## Шаг 6: Настройка локализации

**Важность:** 🔸 Важно для удобства

### Основные параметры

**Система** → **Настройки системы**:

```
locale = ru_RU.UTF-8
manager_language = ru
cultureKey = ru
```

### Формат даты и времени

```
manager_date_format = d.m.Y
manager_time_format = H:i:s
server_offset_time = 0
```

## Шаг 7: Настройка редактора

**Важность:** 🔸 Важно для удобства

### TinyMCE или CKEditor

Если не установлен редактор, поставьте один из них:

**Дополнения** → **Установщик пакетов** → найдите:
- `TinyMCE Rich Text Editor`
- `CKEditor`

### Настройка редактора

**Система** → **Настройки системы**:

```
which_editor = TinyMCE
tiny.custom_plugins = advlist,autolink,lists,link,image,charmap,print,preview
```

## Шаг 8: Настройки медиафайлов

**Важность:** 🔸 Важно для SEO

### Основные настройки

```
upload_maxsize = 2097152  # 2MB
allowed_file_types = jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip
```

### Автоматическая обработка изображений

```
auto_isfolder = Да
automatic_alias = Да
```

## Шаг 9: Настройка ошибок

**Важность:** 🔸 Важно для SEO

### Страница 404

1. Создайте красивую страницу 404
2. **Контексты** → **web** → **Настройки**:

```
error_page = ID_вашей_страницы_404
unauthorized_page = ID_страницы_для_неавторизованных
```

### Логирование ошибок

```
log_level = 1  # Только ошибки
log_target = FILE
```

## Шаг 10: SEO-настройки

**Важность:** 🔥 Критично для SEO

### Базовые meta-теги

Создайте системные настройки:

```
site_name = Название вашего сайта
site_slogan = Краткое описание
emailsender = admin@ваш-домен.ru
```

### Структурные данные

Добавьте в шаблон базовую Schema.org разметку:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "[[++site_name]]",
  "url": "[[++site_url]]",
  "description": "[[++site_slogan]]"
}
</script>
```

## Шаг 11: Настройка SMTP

**Важность:** 🔸 Важно для уведомлений

### Параметры почты

**Система** → **Настройки системы**:

```
mail_type = smtp
mail_smtp_auth = Да
mail_smtp_host = smtp.yandex.ru
mail_smtp_port = 587
mail_smtp_user = ваш_email@домен.ru  
mail_smtp_pass = пароль_от_почты
```

### Тест отправки

Создайте простую форму и проверьте отправку писем.

## Шаг 12: Резервное копирование

**Важность:** 🔥 Критично для сохранности

### Автоматический бэкап

Установите пакет **BackupMODX** или настройте резервирование на хостинге.

### Что бэкапить

```
Файлы:
- Весь сайт (кроме core/cache/)
- Конфиги  
- Загруженные файлы

База данных:
- Полный дамп MySQL
```

## Шаг 13: Мониторинг производительности

**Важность:** 🔸 Важно для развития

### Google Analytics

Добавьте код в шаблон:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Яндекс.Метрика

```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(COUNTER_ID, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
   });
</script>
```

## Шаг 14: Оптимизация безопасности

**Важность:** 🔥 Критично для безопасности

### Скрытие версии MODX

Добавьте в .htaccess:

```apache
# Скрыть версию MODX
<IfModule mod_headers.c>
    Header unset X-Powered-By
    Header always unset X-Powered-By
</IfModule>
```

### Защита важных файлов

```apache
# Защита конфигурационных файлов
<Files "*.inc.php">
    Order Allow,Deny
    Deny from All
</Files>

# Защита от SQL-инъекций
<IfModule mod_rewrite.c>
    RewriteCond %{QUERY_STRING} (\<|%3C).*script.*(\>|%3E) [NC,OR]
    RewriteCond %{QUERY_STRING} GLOBALS(=|\[|\%[0-9A-Z]{0,2}) [OR]
    RewriteCond %{QUERY_STRING} _REQUEST(=|\[|\%[0-9A-Z]{0,2}) [OR]
    RewriteCond %{QUERY_STRING} \.\./\.\./\.\./
    RewriteRule ^(.*)$ index.php [F,L]
</IfModule>
```

## Шаг 15: Первичный контент

**Важность:** 🔸 Важно для тестирования

### Создание базовой структуры

Создайте минимальные страницы:

```
Главная (home)
├── О компании (about)  
├── Услуги (services)
├── Контакты (contacts)
└── Политика конфиденциальности (privacy)
```

### Меню навигации

Создайте простое меню через сниппет **Wayfinder**:

```html
[[Wayfinder? 
    &startId=`0` 
    &level=`1` 
    &outerTpl=`<ul class="nav">[[+wf.wrapper]]</ul>`
    &rowTpl=`<li><a href="[[+wf.link]]">[[+wf.linktext]]</a></li>`
]]
```

## Чек-лист готовности

После выполнения всех шагов проверьте:

### Безопасность ✅
- [ ] Папка `setup/` удалена
- [ ] Системные папки перенесены  
- [ ] Пароль админа сменён
- [ ] Логин админа изменён
- [ ] .htaccess настроен

### SEO ✅
- [ ] ЧПУ включены и работают
- [ ] Страница 404 создана
- [ ] Meta-теги настроены
- [ ] Аналитика подключена

### Производительность ✅
- [ ] Кэширование включено
- [ ] Права доступа корректны
- [ ] Логи настроены

### Удобство ✅
- [ ] Редактор установлен
- [ ] Локализация настроена
- [ ] SMTP работает
- [ ] Резервное копирование настроено

## Что делать дальше

После базовой настройки можно переходить к:

1. **Установке дополнительных пакетов** — MIGX, pdoTools, Fenom
2. **Созданию шаблонов** — дизайн и вёрстка
3. **Настройке форм** — обратная связь, заказы
4. **SEO-оптимизации** — robots.txt, sitemap.xml

## Заключение

Эти 15 шагов — минимум для безопасной и эффективной работы с MODX. Не пропускайте настройки безопасности — их сложно исправить потом.

Правильно настроенный MODX работает годами без проблем. Потратьте час сейчас, сэкономьте дни отладки в будущем.

---

*Хотите изучить MODX глубже? Читайте «[Что такое MODX Revolution](/blog/chto-takoe-modx-revolution/)» — полный обзор возможностей системы.*

## Полезные команды

### Очистка кэша через SSH

```bash
# Полная очистка кэша
rm -rf core/cache/*

# Очистка только кэша ресурсов  
rm -rf core/cache/resource/*
```

### Проверка прав доступа

```bash
# Проверка важных папок
ls -la core/cache/
ls -la core/config/
ls -la assets/
```

### Мониторинг логов

```bash
# Просмотр логов ошибок
tail -f core/cache/logs/error.log

# Последние записи
tail -20 core/cache/logs/error.log
```