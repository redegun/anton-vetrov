---
title: "ЧПУ в MODX: настройка friendly URLs для Nginx и Apache"
description: "Полное руководство по настройке человекопонятных URL в MODX Revolution. Конфигурация для Apache и Nginx, решение типовых проблем."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-friendly-url-nastrojka.webp"
tags: ["MODX", "ЧПУ", "SEO", "Apache", "Nginx"]
draft: false
---

# ЧПУ в MODX: настройка friendly URLs для Nginx и Apache

Человекопонятные URL (ЧПУ, Friendly URLs) — это основа SEO-оптимизации любого сайта. MODX Revolution имеет мощную встроенную систему для создания красивых и поисковых URL вместо стандартных `index.php?id=5`. В этом руководстве разберем полную настройку ЧПУ для разных веб-серверов.

## Что такое ЧПУ и зачем они нужны

### Преимущества friendly URLs

**Для SEO:**
- Лучшая индексация поисковыми системами
- Ключевые слова в URL влияют на ранжирование
- Более высокий CTR в поисковой выдаче
- Простота для понимания алгоритмов поисковых систем

**Для пользователей:**
- Понятная структура сайта
- Возможность предугадать контент по URL
- Удобство копирования и передачи ссылок
- Лучшая навигация и юзабилити

### Примеры URL до и после

**Без ЧПУ:**
```
https://site.com/index.php?id=5
https://site.com/index.php?id=15&mode=view
```

**С ЧПУ:**
```
https://site.com/services/
https://site.com/services/web-development/
https://site.com/blog/modx-setup-guide/
```

## Базовая настройка ЧПУ в MODX

### Системные настройки

Откройте **Система → Настройки системы** и найдите следующие параметры:

```
friendly_urls = Да
use_alias_path = Да  
friendly_alias_urls = Да
allow_duplicate_alias = Нет
automatic_alias = Да
friendly_urls_strict = Да
container_suffix = /
```

### Подробное описание настроек

#### friendly_urls
**Значение:** Да  
**Описание:** Включает систему ЧПУ в MODX

#### use_alias_path
**Значение:** Да  
**Описание:** Использует полный путь в URL (включая родительские страницы)

```
Да: /company/about/team/
Нет: /team/
```

#### friendly_alias_urls  
**Значение:** Да  
**Описание:** Разрешает использование алиасов в URL вместо ID

#### allow_duplicate_alias
**Значение:** Нет  
**Описание:** Запрещает одинаковые алиасы на одном уровне

#### automatic_alias
**Значение:** Да  
**Описание:** Автоматически генерирует алиас из заголовка страницы

#### friendly_urls_strict
**Значение:** Да  
**Описание:** Строгое соответствие URL (предотвращает дублирование контента)

#### container_suffix
**Значение:** /  
**Описание:** Добавляет слеш в конце URL для контейнеров

### Дополнительные настройки

```
publish_default = Да
searchable_default = Да
richtext_default = Да
hidemenu_default = Нет

# Настройки алиасов
friendly_alias_max_length = 100
friendly_alias_lowercase_only = Да
friendly_alias_word_delimiter = -
friendly_alias_realtime = Нет
```

## Настройка для Apache

### Основной .htaccess файл

Создайте файл `.htaccess` в корне сайта:

```apache
# MODX supports Friendly URLs via this .htaccess file
# Ensure the RewriteEngine is turned on
RewriteEngine On

# Основные настройки для MODX
RewriteBase /

# Исключения для файлов и папок  
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Исключения для системных папок
RewriteRule ^(.*)$ index.php?q=$1 [L,QSA]

# Безопасность - скрытие системных файлов
<Files ".htaccess">
    Order Allow,Deny
    Deny from all
</Files>

<Files "config.inc.php">
    Order Allow,Deny  
    Deny from all
</Files>

# Скрытие папки core
RewriteRule ^core/(.*)$ - [F,L]

# Скрытие служебных файлов MODX
RedirectMatch 403 /\..*$
RedirectMatch 403 core/.*
RedirectMatch 403 /config\.core\.php$
RedirectMatch 403 /config\.inc\.php$

# Принудительное использование слеша для папок
RewriteCond %{REQUEST_FILENAME} -d
RewriteCond %{REQUEST_URI} !/$
RewriteRule ^(.*)$ $1/ [R=301,L]

# Принудительное удаление index.php из URL
RewriteCond %{THE_REQUEST} ^[A-Z]{3,}\s/+index\.php[\s?] [NC]
RewriteRule ^index\.php/?(.*)$ /$1 [R=301,L]

# Удаление множественных слешей
RewriteCond %{THE_REQUEST} //
RewriteRule .* /$0 [R=301,L]

# Принудительное использование www (опционально)
# RewriteCond %{HTTP_HOST} !^www\.
# RewriteCond %{HTTP_HOST} !^localhost$ [NC]
# RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

### Расширенная конфигурация Apache

```apache
# Дополнительные настройки производительности и безопасности

# Включение сжатия
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Кеширование статических файлов
<IfModule mod_expires.c>
    ExpiresActive on
    
    # Изображения
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    
    # CSS и JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType text/js "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    
    # Шрифты
    ExpiresByType application/x-font-ttf "access plus 1 year"
    ExpiresByType font/opentype "access plus 1 year"
    ExpiresByType application/x-font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Защита от hotlinking изображений  
RewriteCond %{HTTP_REFERER} !^$
RewriteCond %{HTTP_REFERER} !^http(s)?://(www\.)?yourdomain\.com [NC]
RewriteCond %{REQUEST_URI} \.(jpg|jpeg|png|gif|webp)$ [NC]
RewriteRule \.(jpg|jpeg|png|gif|webp)$ - [F]

# Блокировка вредоносных ботов
RewriteCond %{HTTP_USER_AGENT} (libwww-perl|wget|python|nikto|curl|scan|java|winhttp|clshttp|loader) [NC,OR]
RewriteCond %{HTTP_USER_AGENT} (%0A|%0D|%27|%3C|%3E|%00) [NC,OR] 
RewriteCond %{HTTP_USER_AGENT} (;|<|>|'|"|\)|\(|%0A|%0D|%22|%27|%28|%3C|%3E|%00).*(libwww-perl|wget|python|nikto|curl|scan|java|winhttp|HTTrack|clshttp|archiver|loader|email|harvest|extract|grab|miner) [NC]
RewriteRule .* - [F]
```

### Настройка для поддоменов

```apache
# Если сайт находится в подпапке
RewriteBase /subfolder/

# Или для поддомена
RewriteCond %{HTTP_HOST} ^subdomain\.example\.com$ [NC]
RewriteRule ^(.*)$ /subdomain/$1 [L]
```

## Настройка для Nginx

### Основная конфигурация Nginx

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/html;
    index index.php index.html;
    
    # Логи
    access_log /var/log/nginx/example.com.access.log;
    error_log /var/log/nginx/example.com.error.log;
    
    # Основное правило для MODX friendly URLs
    location / {
        try_files $uri $uri/ @modx-rewrite;
    }
    
    location @modx-rewrite {
        rewrite ^/(.*)$ /index.php?q=$1 last;
    }
    
    # Обработка PHP файлов
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock; # или 127.0.0.1:9000
        fastcgi_index index.php;
    }
    
    # Запрет доступа к служебным файлам
    location ~ /\. {
        deny all;
    }
    
    location ~* ^/(core|config\.inc\.php|config\.core\.php) {
        deny all;
        return 403;
    }
    
    # Оптимизация статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Принудительный слеш для папок
    location ~ ^/[^.]*[^/]$ {
        return 301 $scheme://$host$uri/;
    }
}
```

### HTTPS конфигурация для Nginx

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://www.example.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    return 301 https://www.example.com$request_uri;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
}

server {
    listen 443 ssl http2;
    server_name www.example.com;
    root /var/www/html;
    index index.php index.html;
    
    # SSL настройки
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    
    # HSTS заголовок
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Основные правила MODX
    location / {
        try_files $uri $uri/ @modx-rewrite;
    }
    
    location @modx-rewrite {
        rewrite ^/(.*)$ /index.php?q=$1 last;
    }
    
    # PHP обработка
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTPS on;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        
        # Увеличение лимитов для больших форм
        fastcgi_read_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
    }
    
    # Безопасность
    location ~ /\. {
        deny all;
    }
    
    location ~* ^/(core|config\.inc\.php|config\.core\.php|\.ht) {
        deny all;
        return 403;
    }
    
    # Кеширование и сжатие
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # Сжатие для текстовых файлов
        gzip_static on;
    }
}
```

### Расширенная Nginx конфигурация

```nginx
# Включение в основной nginx.conf или в server блоке

# Сжатие
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json;

# Безопасность заголовков
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# Ограничение размера загружаемых файлов
client_max_body_size 50M;

# Таймауты
client_body_timeout 60;
client_header_timeout 60;
keepalive_timeout 10 10;
send_timeout 60;

# Лимиты подключений
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
location /manager/ {
    limit_req zone=login burst=5 nodelay;
    # остальные правила для админки
}
```

## Специальные случаи настройки

### Мультисайтовая конфигурация

```apache
# .htaccess для нескольких сайтов на одном домене
RewriteEngine On
RewriteBase /

# Сайт 1 в подпапке /site1/
RewriteCond %{HTTP_HOST} ^site1\.example\.com$ [NC]
RewriteCond %{REQUEST_URI} !^/site1/
RewriteRule ^(.*)$ /site1/$1 [L]

# Сайт 2 в подпапке /site2/  
RewriteCond %{HTTP_HOST} ^site2\.example\.com$ [NC]
RewriteCond %{REQUEST_URI} !^/site2/
RewriteRule ^(.*)$ /site2/$1 [L]

# Основной сайт
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?q=$1 [L,QSA]
```

### Поддержка нескольких языков

```apache
# Автоматическое определение языка
RewriteCond %{HTTP:Accept-Language} ^ru [NC]
RewriteCond %{REQUEST_URI} ^/$
RewriteRule ^(.*)$ /ru/ [R=302,L]

RewriteCond %{HTTP:Accept-Language} ^en [NC]  
RewriteCond %{REQUEST_URI} ^/$
RewriteRule ^(.*)$ /en/ [R=302,L]

# По умолчанию английский
RewriteCond %{REQUEST_URI} ^/$
RewriteRule ^(.*)$ /en/ [R=302,L]
```

## Диагностика и решение проблем

### Проверка работы ЧПУ

1. **Проверьте системные настройки** в MODX
2. **Убедитесь в наличии .htaccess** (для Apache) 
3. **Проверьте права доступа** к файлам конфигурации
4. **Включите отладку** в MODX

### Типичные проблемы и решения

#### Ошибка 404 на всех страницах

**Причина:** Неправильная настройка RewriteBase или путей

**Решение:**
```apache
# Если сайт в подпапке
RewriteBase /subfolder/

# Если в корне
RewriteBase /
```

#### Бесконечные редиректы

**Причина:** Конфликт правил в .htaccess

**Решение:**
```apache
# Добавьте условие для предотвращения зацикливания
RewriteCond %{ENV:REDIRECT_STATUS} !^$
RewriteRule ^.*$ - [L]
```

#### ЧПУ работают, но страницы загружаются медленно

**Причина:** Неоптимальные правила rewrite

**Решение:**
```apache
# Добавьте исключения для существующих файлов
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule ^(.*)$ index.php?q=$1 [L,QSA]
```

#### Проблемы с кириллицей в URL

**Настройка в MODX:**
```
friendly_alias_translit = iconv
friendly_alias_translit_class = translit.modTransliterate
friendly_alias_translit_class_path = {core_path}components/
```

#### Дубли страниц с www и без

**Для Apache:**
```apache
# Принудительное www
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

**Для Nginx:**
```nginx
# Редирект на www
server {
    listen 80;
    server_name example.com;
    return 301 https://www.example.com$request_uri;
}
```

### Отладка ЧПУ

Включите отладку в MODX:

```
# Системные настройки
log_level = MODX_LOG_LEVEL_INFO
log_target = FILE

# В .htaccess добавьте для отладки
RewriteEngine On
RewriteLog /var/log/apache2/rewrite.log
RewriteLogLevel 3
```

Проверьте логи:
- Apache: `/var/log/apache2/error.log`
- Nginx: `/var/log/nginx/error.log`
- MODX: `core/cache/logs/`

## SEO-оптимизация ЧПУ

### Правила создания SEO-дружелюбных URL

1. **Используйте ключевые слова** в URL
2. **Делайте URL короткими** (до 60 символов)
3. **Используйте дефисы** вместо подчеркиваний
4. **Избегайте спецсимволов** и чисел
5. **Создавайте логичную иерархию**

### Автоматизация создания алиасов

Создайте плагин для автогенерации алиасов:

```php
<?php
// Событие: OnDocFormSave
switch($modx->event->name) {
    case 'OnDocFormSave':
        if(empty($resource->get('alias'))) {
            // Генерация алиаса из заголовка
            $alias = $modx->filterPathSegment($resource->get('pagetitle'));
            
            // Транслитерация
            $alias = $modx->runSnippet('Translit', array('str' => $alias));
            
            // Проверка уникальности
            $count = 1;
            $original_alias = $alias;
            while($modx->getCount('modResource', array('alias' => $alias, 'parent' => $resource->get('parent')))) {
                $alias = $original_alias . '-' . $count;
                $count++;
            }
            
            $resource->set('alias', $alias);
        }
        break;
}
?>
```

### Мониторинг SEO-показателей

Больше о SEO-продвижении MODX сайтов можно узнать в статье [SEO и продвижение сайтов на MODX](/blog/modx-seo-prodvizhenie/).

```php
// Плагин для отслеживания изменений URL
switch($modx->event->name) {
    case 'OnDocFormSave':
        $old_uri = $resource->get('uri');
        // После сохранения проверяем изменение URI
        if($old_uri !== $resource->get('uri')) {
            // Создание 301 редиректа
            $redirect = $modx->newObject('Redirect');
            $redirect->set('pattern', $old_uri);
            $redirect->set('target', $resource->get('uri'));
            $redirect->set('http_response_code', 301);
            $redirect->save();
        }
        break;
}
```

## Продвинутые техники

### Динамические URL на основе TV полей

```php
// Плагин для создания URL на основе TV
switch($modx->event->name) {
    case 'OnDocFormSave':
        if($resource->get('template') == 5) { // Шаблон товара
            $brand = $resource->getTVValue('brand');
            $model = $resource->getTVValue('model'); 
            
            if($brand && $model) {
                $alias = strtolower($brand . '-' . $model);
                $alias = preg_replace('/[^a-z0-9\-]/', '', $alias);
                $resource->set('alias', $alias);
            }
        }
        break;
}
```

### Кастомные правила маршрутизации

```php
// Создание кастомного роутера
$modx->map->add('Route', array(
    'class' => 'CustomRoute',
    'path' => '/catalog/{category}/{product}/',
    'handler' => 'CatalogHandler'
));

class CatalogHandler {
    public function handle($category, $product) {
        // Логика обработки маршрута
        $categoryId = $this->getCategoryByAlias($category);
        $productId = $this->getProductByAlias($product, $categoryId);
        
        if($productId) {
            $modx->sendRedirect($modx->makeUrl($productId));
        } else {
            $modx->sendErrorPage();
        }
    }
}
```

## Заключение

Правильная настройка ЧПУ в MODX — это фундамент успешного SEO-продвижения сайта. Система friendly URLs в MODX предоставляет гибкие возможности для создания красивых и поисково-оптимизированных адресов.

**Ключевые моменты:**

1. **Включите все необходимые системные настройки** в MODX
2. **Настройте корректный .htaccess** для Apache или конфигурацию Nginx
3. **Протестируйте работу** на всех типах страниц
4. **Настройте 301-редиректы** при изменении URL
5. **Мониторьте производительность** и SEO-показатели

**Безопасность:**
- Ограничьте доступ к служебным файлам
- Используйте HTTPS
- Настройте защиту от ботов и спама

**Производительность:**
- Включите сжатие и кеширование
- Оптимизируйте правила rewrite
- Настройте CDN для статических файлов

ЧПУ в MODX — это не просто красивые URL, а мощный инструмент для улучшения пользовательского опыта и поисковой оптимизации вашего сайта.