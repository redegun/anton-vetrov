---
title: "Ускорение сайта на MODX: кэширование, сжатие, lazy load"
description: "Полное руководство по оптимизации скорости сайта на MODX Revolution. Настройка кеширования, сжатия, ленивой загрузки и выбор быстрого хостинга."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-skorost-optimizaciya.webp"
tags: ["MODX", "Производительность", "Кеширование", "Оптимизация"]
draft: false
---


Скорость загрузки сайта критически важна для пользовательского опыта и SEO-ранжирования. MODX Revolution предоставляет мощные инструменты для оптимизации производительности, но требует правильной настройки. В этом руководстве разберем все аспекты ускорения MODX сайтов.

## Почему скорость сайта важна

### Влияние на SEO

**Google Core Web Vitals:**
- **LCP (Largest Contentful Paint)** — должен быть < 2.5 сек
- **FID (First Input Delay)** — должен быть < 100 мс  
- **CLS (Cumulative Layout Shift)** — должен быть < 0.1

**Влияние на ранжирование:**
- Скорость — официальный фактор ранжирования Google
- Медленные сайты получают меньше трафика
- Высокий показатель отказов снижает позиции

### Влияние на конверсию

**Статистика:**
- 1 секунда задержки = -7% конверсии
- 40% пользователей покидают сайт, если он загружается > 3 секунд
- 1% улучшения скорости = +2% увеличения конверсии

## Диагностика текущей производительности

### Инструменты для тестирования

**Основные сервисы:**
- **Google PageSpeed Insights** — https://pagespeed.web.dev/
- **GTmetrix** — https://gtmetrix.com/
- **WebPageTest** — https://webpagetest.org/
- **Pingdom** — https://tools.pingdom.com/

### Что измерять

```
Ключевые метрики:
- Время до первого байта (TTFB) < 200ms
- Время загрузки страницы < 3 сек
- Размер страницы < 1.5MB
- Количество HTTP-запросов < 50
- Время ответа сервера < 100ms
```

### MODX Debug консоль

Включите отладку в системных настройках:

```
debug = Да
log_level = MODX_LOG_LEVEL_INFO
log_target = HTML
```

Добавьте в конец шаблона:

```html
<!-- Только для разработки -->
[[+modx.user.id:is=`1`:then=`
    <div style="background: #000; color: #fff; padding: 10px; font-size: 12px;">
        <strong>Debug Info:</strong><br>
        Total Time: [[+modx.execution_time]] sec<br>
        Memory Usage: [[+modx.memory_usage]]<br>
        Queries: [[+modx.query_count]]<br>
        Source: [[+modx.source]]
    </div>
`]]
```

## Оптимизация на уровне MODX

### Системные настройки производительности

```
# Кеширование
cache_disabled = Нет
cache_default = Да  
cacheable_default = Да
cache_expires = 0

# Сессии
session_enabled = Да
session_handler_class = modSessionHandler
session_cookie_lifetime = 604800

# Настройки парсера  
parser_max_iterations = 10
enable_gravatar = Нет
emailsender = noreply@yourdomain.com

# Отключение неиспользуемых функций
use_editor = Нет (если не нужен)
which_editor = 
use_browser = Нет
tree_default_sort = menuindex
```

### Оптимизация базы данных

#### Регулярная очистка

```sql
-- Очистка логов старше 30 дней
DELETE FROM modx_manager_log WHERE occurred < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Очистка сессий
DELETE FROM modx_session WHERE access < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Очистка кеша событий
TRUNCATE TABLE modx_event_log;

-- Очистка корзины
DELETE FROM modx_site_content WHERE deleted = 1 AND deletedon < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));
```

#### Индексы для производительности

```sql
-- Добавление полезных индексов
ALTER TABLE modx_site_content ADD INDEX idx_published_deleted (published, deleted);
ALTER TABLE modx_site_content ADD INDEX idx_parent_published (parent, published);  
ALTER TABLE modx_site_content ADD INDEX idx_template (template);
ALTER TABLE modx_site_content ADD INDEX idx_publishedon (publishedon);

-- Для TV полей
ALTER TABLE modx_site_tmplvar_contentvalues ADD INDEX idx_contentid (contentid);
ALTER TABLE modx_site_tmplvar_contentvalues ADD INDEX idx_tmplvarid_contentid (tmplvarid, contentid);
```

### Оптимизация запросов

#### Эффективное использование pdoTools

```
<!-- МЕДЛЕННО: загрузка всех данных -->
[[pdoResources?
    &parents=`5`
    &includeTVs=`*`
    &processTVs=`1`
    &includeContent=`1`
    &limit=`50`
]]

<!-- БЫСТРО: загрузка только нужных данных -->
[[pdoResources?
    &parents=`5`
    &includeTVs=`image,price,featured`
    &processTVs=`1` 
    &includeContent=`0`
    &select=`{"modResource": "id,pagetitle,alias,introtext"}`
    &limit=`12`
    &cache=`1`
    &cacheTime=`3600`
]]
```

#### Оптимизация WHERE условий

```
<!-- МЕДЛЕННО: обработка TV в WHERE -->
&where=`{"tv.price:>": 1000}`

<!-- БЫСТРО: прямой запрос -->
&where=`{"modResource.id:IN": (SELECT contentid FROM modx_site_tmplvar_contentvalues WHERE tmplvarid = 5 AND value > 1000)}`
```

## Кеширование в MODX

### Виды кеширования

**1. Системный кеш (System Cache)**
- Кеширует конфигурацию системы
- Автоматически обновляется при изменениях
- Хранится в `core/cache/`

**2. Кеш ресурсов (Resource Cache)**
- Кеширует содержимое страниц
- Управляется настройкой "Кешируемый"
- Время жизни задается в настройках

**3. Кеш элементов (Element Cache)**  
- Кеширует сниппеты, чанки, плагины
- Включается в вызове элемента
- Улучшает производительность сложных запросов

### Настройка кеширования сниппетов

```
<!-- Кешируемый вызов (рекомендуется) -->
[[pdoResources?
    &cache=`1`
    &cacheTime=`3600`
    &cacheKey=`products_category_[[*id]]`
    &parents=`[[*id]]`
]]

<!-- Некешируемый вызов (только когда нужно) -->
[[!pdoResources? &parents=`[[*id]]`]]
```

#### Стратегии кеширования

```
<!-- Долгий кеш для статичного контента -->
[[pdoMenu?
    &cache=`1`
    &cacheTime=`86400`
    &cacheKey=`main_menu`
]]

<!-- Средний кеш для регулярно обновляемого -->
[[pdoResources?
    &cache=`1`
    &cacheTime=`3600`
    &cacheKey=`blog_posts_[[+page:default=1]]`
]]

<!-- Короткий кеш для динамического -->
[[msCart?
    &cache=`1`
    &cacheTime=`300`
]]
```

### Продвинутое кеширование

#### Условное кеширование

```
<!-- Кеш зависит от контекста пользователя -->
[[pdoResources?
    &cache=`1`
    &cacheTime=`3600`
    &cacheKey=`products_user_[[+modx.user.id:default=0]]_page_[[+page:default=1]]`
]]
```

#### Программная работа с кешем

```php
// Сниппет для кеширования сложных данных
$cacheKey = 'expensive_calculation_' . md5($input);
$cache = $modx->cacheManager->get($cacheKey);

if (empty($cache)) {
    // Выполняем тяжелые вычисления
    $cache = performExpensiveCalculation($input);
    
    // Сохраняем в кеш на 1 час
    $modx->cacheManager->set($cacheKey, $cache, 3600);
}

return $cache;
```

### Инвалидация кеша

```php
// Плагин для автоочистки кеша
switch($modx->event->name) {
    case 'OnDocFormSave':
        // Очищаем кеш меню при изменении страницы
        $modx->cacheManager->delete('main_menu');
        
        // Очищаем кеш родительской категории
        if($resource->get('parent')) {
            $modx->cacheManager->delete('category_' . $resource->get('parent'));
        }
        break;
}
```

## Оптимизация изображений

### Автоматическая оптимизация

#### Настройка phpThumb

```
# Системные настройки phpThumb
phpthumb_cache_maxage = 2592000
phpthumb_cache_maxsize = 100
phpthumb_cache_source_enabled = Да
phpthumb_imagemagick_path = /usr/bin/convert

# Оптимизация качества
phpthumb_jpeg_quality = 85
phpthumb_png_compression = 6
phpthumb_allow_src_above_phpthumb = Да
```

#### Создание оптимизированных превью

```
<!-- Оптимизированные изображения -->
<img src="[[*image:phpthumbof=`w=800&h=400&zc=1&q=85&f=webp&webp_quality=85&fallback_f=jpg`]]" 
     alt="[[*pagetitle]]" 
     width="800" 
     height="400"
     loading="lazy">
```

### WebP поддержка

```php
// Сниппет для WebP с fallback
function generateWebPImage($imagePath, $options = []) {
    $webpPath = str_replace(['.jpg', '.jpeg', '.png'], '.webp', $imagePath);
    
    if (!file_exists($webpPath) || filemtime($imagePath) > filemtime($webpPath)) {
        $image = null;
        $imageInfo = getimagesize($imagePath);
        
        switch ($imageInfo['mime']) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($imagePath);
                break;
            case 'image/png':
                $image = imagecreatefrompng($imagePath);
                break;
        }
        
        if ($image) {
            imagewebp($image, $webpPath, $options['quality'] ?? 85);
            imagedestroy($image);
        }
    }
    
    return $webpPath;
}
```

### Lazy loading изображений

```html
<!-- Нативная ленивая загрузка -->
<img src="[[+image:phpthumbof=`w=400&h=300`]]" 
     loading="lazy" 
     alt="[[+title]]"
     width="400" 
     height="300">

<!-- С JavaScript библиотекой -->
<img data-src="[[+image:phpthumbof=`w=400&h=300`]]"
     class="lazy"
     alt="[[+title]]"
     width="400"
     height="300">

<script src="https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.8.3/dist/lazyload.min.js"></script>
<script>
const lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy",
    threshold: 0,
    // Использование WebP если поддерживается
    use_native: true,
    callback_error: (img) => {
        // Fallback на оригинальное изображение
        img.src = img.dataset.src.replace('.webp', '.jpg');
    }
});
</script>
```

## Оптимизация CSS и JavaScript

### Минификация и объединение

#### CSS оптимизация

```html
<!-- Объединение CSS файлов -->
<link rel="stylesheet" href="/assets/css/combined.min.css">

<!-- Критический CSS inline -->
<style>
/* Только стили выше фолда */
body { font-family: Arial, sans-serif; margin: 0; }
.header { background: #fff; height: 60px; }
.hero { background: #000; color: #fff; height: 500px; }
</style>

<!-- Остальные стили асинхронно -->
<link rel="preload" href="/assets/css/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/css/non-critical.css"></noscript>
```

#### JavaScript оптимизация

```html
<!-- Отложенная загрузка JS -->
<script defer src="/assets/js/main.min.js"></script>

<!-- Асинхронная загрузка не критичных скриптов -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>

<!-- Условная загрузка -->
<script>
// Загружаем тяжелые библиотеки только при необходимости
if (document.querySelector('.gallery')) {
    import('/assets/js/gallery.min.js');
}
</script>
```

### Автоматизация сборки

```javascript
// gulpfile.js для автоматической минификации
const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');

// Сборка CSS
gulp.task('css', function() {
    return gulp.src(['src/scss/**/*.scss'])
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(concat('combined.min.css'))
        .pipe(gulp.dest('assets/css/'));
});

// Сборка JS
gulp.task('js', function() {
    return gulp.src(['src/js/**/*.js'])
        .pipe(concat('combined.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('assets/js/'));
});

gulp.task('build', gulp.parallel('css', 'js'));
```

## Оптимизация шрифтов

### Эффективная загрузка веб-шрифтов

```html
<!-- Предзагрузка критичных шрифтов -->
<link rel="preload" href="/assets/fonts/roboto-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/roboto-bold.woff2" as="font" type="font/woff2" crossorigin>

<!-- Оптимизированное подключение -->
<style>
@font-face {
    font-family: 'Roboto';
    src: url('/assets/fonts/roboto-regular.woff2') format('woff2'),
         url('/assets/fonts/roboto-regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-display: swap; /* Быстрый fallback */
}

@font-face {
    font-family: 'Roboto';
    src: url('/assets/fonts/roboto-bold.woff2') format('woff2'),
         url('/assets/fonts/roboto-bold.woff') format('woff');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}
</style>
```

### Системные шрифты как fallback

```css
/* Оптимизированный font stack */
body {
    font-family: 
        'Roboto',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        'Helvetica Neue',
        Arial,
        sans-serif;
}
```

## Серверная оптимизация

### Настройка хостинга

Для максимальной производительности MODX сайта рекомендуется использовать качественный хостинг. Отличным выбором станет [Timeweb](https://timeweb.cloud/?i=33633) — современная инфраструктура, быстрые SSD-диски, оптимизированные конфигурации PHP и круглосуточная техподдержка обеспечат отличную скорость работы вашего сайта.

### Оптимизация PHP

#### php.ini настройки

```ini
; Увеличение лимитов памяти
memory_limit = 256M
max_execution_time = 300
max_input_time = 300
post_max_size = 64M
upload_max_filesize = 64M

; OPcache включение  
opcache.enable = 1
opcache.enable_cli = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 4000
opcache.validate_timestamps = 0  ; В продакшене
opcache.revalidate_freq = 0
opcache.fast_shutdown = 1

; Сессии в памяти
session.save_handler = redis
session.save_path = "tcp://localhost:6379"
```

#### PHP-FPM настройки

```ini
; /etc/php/8.1/fpm/pool.d/www.conf
[www]
user = www-data
group = www-data

listen = /run/php/php8.1-fpm.sock
listen.owner = www-data
listen.group = www-data

pm = dynamic
pm.max_children = 10
pm.start_servers = 4  
pm.min_spare_servers = 2
pm.max_spare_servers = 6
pm.max_requests = 500
```

### Настройка веб-сервера

#### Apache оптимизация

```apache
# .htaccess производительность
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Длительное кеширование статических файлов
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year" 
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    
    # CSS и JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    
    # Шрифты
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType application/font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Сжатие
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/atom_xml
    AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# Отключение ETags для статических файлов
<IfModule mod_headers.c>
    <FilesMatch "\.(css|js|png|jpg|jpeg|gif|webp|svg|woff|woff2)$">
        FileETag None
        Header unset ETag
        Header unset Last-Modified
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</IfModule>
```

#### Nginx оптимизация

```nginx
# nginx.conf оптимизации
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Базовые настройки
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30 20;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
        
    # Кеширование статических файлов
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        log_not_found off;
    }
    
    location ~* \.(css|js|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        log_not_found off;
    }
    
    # Буферизация
    proxy_buffering on;
    proxy_buffer_size 8k;
    proxy_buffers 8 8k;
    proxy_busy_buffers_size 16k;
}

# Виртуальный хост
server {
    # HTTP/2 поддержка
    listen 443 ssl http2;
    
    # Предкомпиляция gzip
    gzip_static on;
    
    # Микрокеширование для PHP
    location ~ \.php$ {
        fastcgi_cache_key $scheme$request_method$host$request_uri;
        fastcgi_cache_valid 200 60m;
        fastcgi_cache_valid 404 10m;
        fastcgi_cache_methods GET HEAD;
        add_header X-FastCGI-Cache $upstream_cache_status;
        
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

### Использование Redis для кеширования

#### Установка и настройка Redis

```bash
# Установка Redis
sudo apt update
sudo apt install redis-server

# Настройка /etc/redis/redis.conf
maxmemory 128mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

#### Интеграция с MODX

```php
// Конфигурация кеша в config.inc.php
$cache_redis_host = 'localhost';
$cache_redis_port = 6379;
$cache_redis_db = 1;

// Настройка кеш-драйвера
return array(
    'cache_redis_host' => 'localhost',
    'cache_redis_port' => 6379,
    'cache_redis_db' => 1,
    'cache_handler' => 'cache.xPDOAPCCache',
);
```

## Мониторинг и профилирование

### Инструменты мониторинга

```php
// Плагин для логирования медленных запросов
switch($modx->event->name) {
    case 'OnWebPageInit':
        $start_time = microtime(true);
        $modx->setPlaceholder('page_start_time', $start_time);
        break;
        
    case 'OnWebPageComplete':
        $end_time = microtime(true);
        $start_time = $modx->getPlaceholder('page_start_time');
        $execution_time = $end_time - $start_time;
        
        // Логируем медленные страницы (> 2 сек)
        if($execution_time > 2) {
            $modx->log(modX::LOG_LEVEL_WARN, "Slow page: {$modx->resource->get('uri')} - {$execution_time}s");
        }
        break;
}
```

### APM мониторинг

```php
// Интеграция с New Relic
if (function_exists('newrelic_name_transaction')) {
    newrelic_name_transaction($modx->resource->get('pagetitle'));
    newrelic_add_custom_parameter('template', $modx->resource->get('template'));
    newrelic_add_custom_parameter('context', $modx->resource->get('context_key'));
}
```

## Продвинутые техники оптимизации

### Service Workers для кеширования

```javascript
// sw.js - Service Worker для кеширования
const CACHE_NAME = 'modx-site-v1';
const urlsToCache = [
    '/',
    '/assets/css/combined.min.css',
    '/assets/js/combined.min.js',
    '/assets/images/logo.svg'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Возвращаем закешированную версию или загружаем с сервера
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});
```

### CDN интеграция

```html
<!-- Подключение CDN для статических ресурсов -->
<script>
// Автоматическая замена путей на CDN
document.addEventListener('DOMContentLoaded', function() {
    const cdnHost = 'https://cdn.example.com';
    const images = document.querySelectorAll('img[src^="/assets/"]');
    
    images.forEach(function(img) {
        img.src = cdnHost + img.src;
    });
});
</script>
```

### Предзагрузка критических ресурсов

```html
<!-- Предзагрузка критических ресурсов -->
<link rel="preload" href="/assets/css/critical.css" as="style">
<link rel="preload" href="/assets/js/main.js" as="script">
<link rel="preload" href="/assets/fonts/roboto.woff2" as="font" type="font/woff2" crossorigin>

<!-- DNS предзагрузка -->
<link rel="dns-prefetch" href="//google-analytics.com">
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="preconnect" href="//fonts.gstatic.com" crossorigin>
```

## Заключение

Оптимизация скорости MODX сайта — это комплексная задача, требующая внимания к деталям на всех уровнях:

**Уровень MODX:**
- Правильная настройка кеширования
- Оптимизация запросов к базе данных  
- Эффективное использование pdoTools
- Минимизация нагрузки на сервер

**Уровень фронтенда:**
- Оптимизация изображений и WebP
- Минификация CSS/JS
- Ленивая загрузка контента
- Эффективная работа со шрифтами

**Уровень сервера:**
- Качественный хостинг (рекомендуем [Timeweb](https://timeweb.cloud/?i=33633))
- Настройка PHP и веб-сервера
- Использование Redis/Memcached
- CDN для статических файлов

**Мониторинг:**
- Регулярное тестирование скорости
- Профилирование медленных страниц
- Отслеживание Core Web Vitals
- Анализ пользовательского опыта

Правильная оптимизация может улучшить скорость загрузки в 3-5 раз, что критически важно для SEO и конверсии. Больше информации об SEO-оптимизации MODX сайтов можно найти в статье [SEO и продвижение сайтов на MODX](/blog/modx-seo-prodvizhenie/).

Начните с диагностики текущего состояния, выявите узкие места и последовательно внедряйте оптимизации. Помните — скорость сайта влияет не только на пользовательский опыт, но и на успех всего проекта.
