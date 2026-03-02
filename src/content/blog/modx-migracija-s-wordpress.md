---
title: "Миграция с WordPress на MODX: пошаговый план"
description: "Полное руководство по миграции с WordPress на MODX: перенос контента, пользователей, настройка редиректов, сохранение SEO, почему стоит перейти."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-migracija-s-wordpress.webp"
tags: ["MODX", "WordPress", "Миграция", "Перенос сайта", "SEO"]
draft: false
---


Переход с WordPress на MODX — серьёзное решение, которое может кардинально улучшить производительность и управляемость сайта. За 18 лет работы я помог десяткам клиентов избавиться от «макаронного» кода WordPress и перейти на чистую архитектуру MODX. Расскажу, как это сделать правильно.

## Почему стоит мигрировать с WordPress

### Проблемы WordPress

**Архитектурные проблемы:**
- **«Макаронный» код** — PHP, HTML и JavaScript смешаны в одном файле
- **Жёсткая структура** — сложно создать нестандартную логику
- **Избыточность** — функционал, который никогда не используется
- **Конфликты плагинов** — один плагин может сломать весь сайт

**Проблемы производительности:**
- **Медленные запросы** — wp_postmeta создаёт огромное количество записей
- **Раздутая админка** — загружается много лишнего JS/CSS
- **Плохое кеширование** — сложно настроить эффективный кеш

**Безопасность:**
- **Популярная цель** — хакеры знают все уязвимости WordPress
- **Небезопасные плагины** — много кода от неопытных разработчиков
- **Частые обновления** — постоянный риск что-то сломать

### Преимущества MODX

**Чистая архитектура:**
- **Разделение логики и представления** — PHP-код отдельно от HTML
- **Гибкость** — можно реализовать любую идею
- **Производительность** — только нужный функционал

**SEO из коробки:**
- **ЧПУ** — настраиваются без плагинов
- **Редиректы** — встроенная система управления
- **Метатеги** — гибкая настройка для каждой страницы

**Безопасность:**
- **Малоизвестная система** — меньше автоматических атак
- **Контролируемый код** — вы знаете, что установлено на сайте
- **Стабильные обновления** — редкие, но качественные релизы

## Планирование миграции

### Анализ текущего сайта

```bash
# Инструменты для анализа WordPress-сайта

# 1. Экспорт контента
wp export --allow-root

# 2. Анализ структуры URL
wp post list --post_type=page --format=csv --fields=ID,post_title,post_name

# 3. Список активных плагинов
wp plugin list --status=active

# 4. Используемые кастомные поля
wp db query "SELECT DISTINCT meta_key FROM wp_postmeta ORDER BY meta_key"

# 5. Анализ медиафайлов
find wp-content/uploads -type f | wc -l
du -sh wp-content/uploads
```

### Карта миграции функционала

```
WordPress → MODX

Страницы/Записи → modResource
Категории → Родительские ресурсы
Метки → TV-параметры или теги
Кастомные поля → TV-параметры
Меню → pdoMenu/Wayfinder
Виджеты → Сниппеты в шаблоне
Плагины → Дополнения MODX
Пользователи → modUser
Комментарии → Tickets/Disqus
```

### Контрольный чек-лист

```markdown
Подготовка:
- [ ] Полный бэкап WordPress-сайта
- [ ] Список всех URL для редиректов
- [ ] Анализ используемого функционала
- [ ] Подготовка тестового домена

Контент:
- [ ] Экспорт страниц и записей
- [ ] Сохранение медиафайлов
- [ ] Список кастомных полей
- [ ] Экспорт пользователей

SEO:
- [ ] Карта редиректов
- [ ] Список ключевых страниц
- [ ] Настройки метатегов
- [ ] Sitemap.xml

Функционал:
- [ ] Формы обратной связи
- [ ] Интеграции (аналитика, CRM)
- [ ] E-commerce функционал
- [ ] Кастомный код/скрипты
```

## Автоматизированная миграция контента

### Скрипт экспорта из WordPress

```php
<?php
// export_wordpress.php - скрипт экспорта данных WordPress

require_once 'wp-config.php';

// Подключение к базе WordPress
$wpdb = new wpdb(DB_USER, DB_PASSWORD, DB_NAME, DB_HOST);

function exportPages($wpdb) {
    $pages = $wpdb->get_results("
        SELECT 
            p.ID,
            p.post_title,
            p.post_name,
            p.post_content,
            p.post_excerpt,
            p.post_date,
            p.post_modified,
            p.post_parent,
            p.menu_order,
            p.post_status,
            p.post_type
        FROM {$wpdb->posts} p 
        WHERE p.post_type IN ('page', 'post') 
        AND p.post_status = 'publish'
        ORDER BY p.post_parent, p.menu_order
    ");
    
    $export = [];
    
    foreach ($pages as $page) {
        // Получаем мета-поля
        $meta = $wpdb->get_results($wpdb->prepare("
            SELECT meta_key, meta_value 
            FROM {$wpdb->postmeta} 
            WHERE post_id = %d
        ", $page->ID));
        
        $metaFields = [];
        foreach ($meta as $m) {
            $metaFields[$m->meta_key] = $m->meta_value;
        }
        
        // Получаем категории/теги
        $terms = $wpdb->get_results($wpdb->prepare("
            SELECT t.name, t.slug, tt.taxonomy
            FROM {$wpdb->term_relationships} tr
            JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
            JOIN {$wpdb->terms} t ON tt.term_id = t.term_id
            WHERE tr.object_id = %d
        ", $page->ID));
        
        $categories = [];
        $tags = [];
        foreach ($terms as $term) {
            if ($term->taxonomy === 'category') {
                $categories[] = $term->name;
            } elseif ($term->taxonomy === 'post_tag') {
                $tags[] = $term->name;
            }
        }
        
        $export[] = [
            'id' => $page->ID,
            'title' => $page->post_title,
            'alias' => $page->post_name,
            'content' => $page->post_content,
            'summary' => $page->post_excerpt,
            'published_date' => $page->post_date,
            'modified_date' => $page->post_modified,
            'parent_id' => $page->post_parent,
            'menu_order' => $page->menu_order,
            'post_type' => $page->post_type,
            'meta_fields' => $metaFields,
            'categories' => $categories,
            'tags' => $tags
        ];
    }
    
    return $export;
}

function exportUsers($wpdb) {
    $users = $wpdb->get_results("
        SELECT 
            u.ID,
            u.user_login,
            u.user_email,
            u.user_registered,
            u.display_name,
            um1.meta_value as first_name,
            um2.meta_value as last_name
        FROM {$wpdb->users} u
        LEFT JOIN {$wpdb->usermeta} um1 ON u.ID = um1.user_id AND um1.meta_key = 'first_name'
        LEFT JOIN {$wpdb->usermeta} um2 ON u.ID = um2.user_id AND um2.meta_key = 'last_name'
        ORDER BY u.ID
    ");
    
    return $users;
}

function exportAttachments($wpdb) {
    $attachments = $wpdb->get_results("
        SELECT 
            p.ID,
            p.post_title,
            p.post_name,
            p.post_parent,
            p.guid,
            pm.meta_value as file_path
        FROM {$wpdb->posts} p
        JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
        WHERE p.post_type = 'attachment'
        AND pm.meta_key = '_wp_attached_file'
    ");
    
    return $attachments;
}

// Экспортируем данные
$export_data = [
    'pages' => exportPages($wpdb),
    'users' => exportUsers($wpdb),
    'attachments' => exportAttachments($wpdb),
    'site_url' => get_option('siteurl'),
    'export_date' => date('Y-m-d H:i:s')
];

// Сохраняем в JSON
file_put_contents('wordpress_export.json', json_encode($export_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Экспорт завершён. Файл: wordpress_export.json\n";
echo "Страниц экспортировано: " . count($export_data['pages']) . "\n";
echo "Пользователей: " . count($export_data['users']) . "\n";
echo "Медиафайлов: " . count($export_data['attachments']) . "\n";
```

### Скрипт импорта в MODX

```php
<?php
// import_to_modx.php - скрипт импорта в MODX

require_once 'config.core.php';
require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';

$modx = new modX();
$modx->initialize('mgr');

// Загружаем данные экспорта
$exportData = json_decode(file_get_contents('wordpress_export.json'), true);

class WordPressImporter {
    private $modx;
    private $wpToModxMap = []; // Маппинг ID WordPress -> MODX
    
    public function __construct($modx) {
        $this->modx = $modx;
    }
    
    public function importPages($pages) {
        // Сортируем страницы: сначала родители, потом дети
        usort($pages, function($a, $b) {
            return $a['parent_id'] <=> $b['parent_id'];
        });
        
        foreach ($pages as $wpPage) {
            $resource = $this->modx->newObject('modResource');
            
            // Определяем родителя
            $parentId = 0;
            if ($wpPage['parent_id'] > 0 && isset($this->wpToModxMap[$wpPage['parent_id']])) {
                $parentId = $this->wpToModxMap[$wpPage['parent_id']];
            }
            
            // Определяем шаблон
            $template = ($wpPage['post_type'] === 'page') ? 2 : 3; // Страница или статья
            
            // Конвертируем контент
            $content = $this->convertContent($wpPage['content']);
            
            $resource->fromArray([
                'pagetitle' => $wpPage['title'],
                'longtitle' => $wpPage['title'],
                'alias' => $wpPage['alias'],
                'description' => $this->cleanText($wpPage['summary']),
                'content' => $content,
                'template' => $template,
                'parent' => $parentId,
                'published' => 1,
                'publishedon' => strtotime($wpPage['published_date']),
                'editedon' => strtotime($wpPage['modified_date']),
                'menuindex' => $wpPage['menu_order'],
                'context_key' => 'web',
                'class_key' => 'modDocument'
            ]);
            
            if ($resource->save()) {
                $modxId = $resource->get('id');
                $this->wpToModxMap[$wpPage['id']] = $modxId;
                
                // Импортируем мета-поля как TV
                $this->importMetaFields($resource, $wpPage['meta_fields']);
                
                // Импортируем категории как теги
                if (!empty($wpPage['categories']) || !empty($wpPage['tags'])) {
                    $allTags = array_merge($wpPage['categories'], $wpPage['tags']);
                    $resource->setTVValue('tags', implode(',', $allTags));
                }
                
                echo "Импортирована страница: {$wpPage['title']} (ID: {$modxId})\n";
            } else {
                echo "Ошибка импорта страницы: {$wpPage['title']}\n";
            }
        }
    }
    
    private function convertContent($content) {
        // Конвертируем шорткоды WordPress
        $content = preg_replace('/\[gallery[^\]]*\]/', '[[Gallery]]', $content);
        $content = preg_replace('/\[contact-form[^\]]*\]/', '[[FormIt]]', $content);
        
        // Обновляем ссылки на изображения
        $content = str_replace('/wp-content/uploads/', '/assets/images/', $content);
        
        // Убираем ненужные классы и атрибуты
        $content = preg_replace('/class="[^"]*"/', '', $content);
        $content = preg_replace('/style="[^"]*"/', '', $content);
        
        return $content;
    }
    
    private function importMetaFields($resource, $metaFields) {
        // Маппинг популярных мета-полей WordPress
        $fieldMapping = [
            '_yoast_wpseo_title' => 'seo_title',
            '_yoast_wpseo_metadesc' => 'seo_description',
            '_yoast_wpseo_opengraph-title' => 'og_title',
            '_yoast_wpseo_opengraph-description' => 'og_description',
            '_thumbnail_id' => 'image',
            'price' => 'price',
            'gallery' => 'gallery'
        ];
        
        foreach ($metaFields as $key => $value) {
            if (isset($fieldMapping[$key])) {
                $tvName = $fieldMapping[$key];
                
                // Специальная обработка для thumbnail
                if ($key === '_thumbnail_id') {
                    $value = $this->getAttachmentUrl($value);
                }
                
                $resource->setTVValue($tvName, $value);
            }
        }
        
        $resource->save();
    }
    
    private function getAttachmentUrl($attachmentId) {
        // Здесь должна быть логика получения URL файла по ID
        // Упрощённая версия
        return "/assets/images/imported_{$attachmentId}.jpg";
    }
    
    public function importUsers($users) {
        foreach ($users as $wpUser) {
            // Проверяем, не существует ли уже пользователь
            $existingUser = $this->modx->getObject('modUser', ['username' => $wpUser->user_login]);
            if ($existingUser) {
                continue;
            }
            
            $user = $this->modx->newObject('modUser');
            $user->fromArray([
                'username' => $wpUser->user_login,
                'password' => md5(time()), // Случайный пароль
                'email' => $wpUser->user_email,
                'active' => 1,
                'createdon' => strtotime($wpUser->user_registered)
            ]);
            
            if ($user->save()) {
                // Создаём профиль
                $profile = $this->modx->newObject('modUserProfile');
                $profile->fromArray([
                    'internalKey' => $user->get('id'),
                    'fullname' => $wpUser->display_name,
                    'email' => $wpUser->user_email
                ]);
                $profile->save();
                
                echo "Импортирован пользователь: {$wpUser->user_login}\n";
            }
        }
    }
    
    public function generateRedirects() {
        // Создаём файл редиректов для .htaccess
        $redirects = [];
        
        foreach ($this->wpToModxMap as $wpId => $modxId) {
            $modxResource = $this->modx->getObject('modResource', $modxId);
            if ($modxResource) {
                $newUrl = $this->modx->makeUrl($modxId);
                
                // WordPress URL patterns
                $redirects[] = "Redirect 301 /?p={$wpId} {$newUrl}";
                $redirects[] = "Redirect 301 /{$modxResource->get('alias')}/ {$newUrl}";
            }
        }
        
        file_put_contents('redirects.htaccess', implode("\n", $redirects));
        echo "Файл редиректов создан: redirects.htaccess\n";
    }
    
    private function cleanText($text) {
        return trim(strip_tags($text));
    }
}

// Запуск импорта
$importer = new WordPressImporter($modx);

echo "Начинаем импорт страниц...\n";
$importer->importPages($exportData['pages']);

echo "Импортируем пользователей...\n";
$importer->importUsers($exportData['users']);

echo "Генерируем редиректы...\n";
$importer->generateRedirects();

echo "Импорт завершён!\n";
```

## Миграция медиафайлов

### Скрипт переноса файлов

```bash
#!/bin/bash
# migrate_media.sh

WORDPRESS_UPLOADS="/path/to/wordpress/wp-content/uploads"
MODX_ASSETS="/path/to/modx/assets/images"

echo "Начинаем перенос медиафайлов..."

# Создаём структуру папок в MODX
mkdir -p "$MODX_ASSETS/imported"
mkdir -p "$MODX_ASSETS/gallery"
mkdir -p "$MODX_ASSETS/docs"

# Переносим изображения
find "$WORDPRESS_UPLOADS" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) -exec cp {} "$MODX_ASSETS/imported/" \;

# Переносим документы
find "$WORDPRESS_UPLOADS" -type f \( -name "*.pdf" -o -name "*.doc" -o -name "*.docx" -o -name "*.xls" -o -name "*.xlsx" \) -exec cp {} "$MODX_ASSETS/docs/" \;

# Оптимизируем изображения
if command -v jpegoptim &> /dev/null; then
    jpegoptim "$MODX_ASSETS/imported/"*.jpg
fi

if command -v pngquant &> /dev/null; then
    pngquant --ext=.png --force "$MODX_ASSETS/imported/"*.png
fi

echo "Перенос медиафайлов завершён"
```

### Обновление ссылок в контенте

```php
<?php
// update_media_links.php

require_once 'config.core.php';
require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';

$modx = new modX();
$modx->initialize('mgr');

// Паттерны для замены
$patterns = [
    '/wp-content\/uploads\/\d{4}\/\d{2}\//i' => '/assets/images/imported/',
    '/https?:\/\/old-domain\.com/i' => 'https://new-domain.com',
    '/\[gallery[^\]]*\]/i' => '[[Gallery]]',
    '/\[contact-form-7[^\]]*\]/i' => '[[FormIt]]'
];

// Получаем все ресурсы
$resources = $modx->getCollection('modResource');

foreach ($resources as $resource) {
    $content = $resource->get('content');
    $originalContent = $content;
    
    // Применяем замены
    foreach ($patterns as $pattern => $replacement) {
        $content = preg_replace($pattern, $replacement, $content);
    }
    
    // Если контент изменился, сохраняем
    if ($content !== $originalContent) {
        $resource->set('content', $content);
        $resource->save();
        echo "Обновлён ресурс: " . $resource->get('pagetitle') . "\n";
    }
}

echo "Обновление ссылок завершено\n";
```

## Настройка редиректов

### Автоматическая генерация .htaccess

```php
<?php
// generate_redirects.php

require_once 'config.core.php';
require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';

$modx = new modX();
$modx->initialize('web');

class RedirectGenerator {
    private $modx;
    private $wpUrls = [];
    
    public function __construct($modx) {
        $this->modx = $modx;
        $this->loadWordPressUrls();
    }
    
    private function loadWordPressUrls() {
        // Загружаем старые URL из файла экспорта или базы
        $exportData = json_decode(file_get_contents('wordpress_export.json'), true);
        
        foreach ($exportData['pages'] as $page) {
            $this->wpUrls[$page['id']] = [
                'slug' => $page['alias'],
                'title' => $page['title'],
                'post_type' => $page['post_type']
            ];
        }
    }
    
    public function generateRedirects() {
        $redirects = [];
        
        // Заголовок файла
        $redirects[] = "# WordPress to MODX Redirects";
        $redirects[] = "# Generated on " . date('Y-m-d H:i:s');
        $redirects[] = "";
        
        // Получаем все ресурсы MODX
        $resources = $modx->getCollection('modResource');
        
        foreach ($resources as $resource) {
            $modxUrl = $modx->makeUrl($resource->get('id'));
            $alias = $resource->get('alias');
            
            // Ищем соответствующую страницу WordPress
            foreach ($this->wpUrls as $wpId => $wpData) {
                if ($wpData['slug'] === $alias || 
                    $this->similar($wpData['title'], $resource->get('pagetitle'))) {
                    
                    // WordPress паттерны URL
                    if ($wpData['post_type'] === 'post') {
                        // Записи: /2024/03/post-name/
                        $redirects[] = "RedirectMatch 301 ^/\\d{4}/\\d{2}/" . preg_quote($wpData['slug'], '/') . "/?$ " . $modxUrl;
                        // Записи: /?p=123
                        $redirects[] = "Redirect 301 /?p=" . $wpId . " " . $modxUrl;
                    } else {
                        // Страницы: /page-name/
                        $redirects[] = "Redirect 301 /" . $wpData['slug'] . "/ " . $modxUrl;
                        // Страницы: /?page_id=123
                        $redirects[] = "Redirect 301 /?page_id=" . $wpId . " " . $modxUrl;
                    }
                    
                    break;
                }
            }
        }
        
        // Специальные редиректы WordPress
        $redirects[] = "";
        $redirects[] = "# WordPress specific redirects";
        $redirects[] = "Redirect 301 /wp-admin/ /manager/";
        $redirects[] = "Redirect 301 /feed/ /rss.xml";
        $redirects[] = "Redirect 301 /comments/feed/ /rss.xml";
        $redirects[] = "RedirectMatch 301 ^/author/.* /";
        $redirects[] = "RedirectMatch 301 ^/tag/.* /";
        $redirects[] = "RedirectMatch 301 ^/\\d{4}/$ /blog/";
        $redirects[] = "RedirectMatch 301 ^/\\d{4}/\\d{2}/$ /blog/";
        
        return implode("\n", $redirects);
    }
    
    private function similar($str1, $str2) {
        return similar_text(strtolower($str1), strtolower($str2), $percent) && $percent > 80;
    }
}

$generator = new RedirectGenerator($modx);
$redirectContent = $generator->generateRedirects();

file_put_contents('.htaccess_redirects', $redirectContent);

echo "Файл редиректов создан: .htaccess_redirects\n";
echo "Добавьте содержимое этого файла в ваш .htaccess перед основными правилами MODX\n";
```

### Мониторинг 404 ошибок

```php
<?php
// Плагин: Monitor404
// События: OnPageNotFound

switch ($modx->event->name) {
    case 'OnPageNotFound':
        $requestUri = $_SERVER['REQUEST_URI'];
        
        // Логируем 404 ошибки
        $logFile = MODX_CORE_PATH . 'cache/logs/404_errors.log';
        $logEntry = date('Y-m-d H:i:s') . " | " . $_SERVER['HTTP_HOST'] . $requestUri . " | " . 
                   ($_SERVER['HTTP_REFERER'] ?? 'Direct') . " | " . $_SERVER['HTTP_USER_AGENT'] . "\n";
        
        file_put_contents($logFile, $logEntry, FILE_APPEND);
        
        // Пытаемся найти похожую страницу
        $suggestedUrl = $this->findSimilarPage($requestUri);
        
        if ($suggestedUrl) {
            // Автоматический редирект на похожую страницу
            $modx->sendRedirect($suggestedUrl, ['responseCode' => 'HTTP/1.1 301 Moved Permanently']);
        }
        
        break;
}

function findSimilarPage($requestUri) {
    global $modx;
    
    // Убираем слеши и расширения
    $cleanUri = trim(str_replace(['.html', '.php', '/'], '', $requestUri));
    
    // Ищем ресурс с похожим алиасом
    $resource = $modx->getObject('modResource', [
        'alias:LIKE' => '%' . $cleanUri . '%',
        'published' => 1,
        'deleted' => 0
    ]);
    
    if ($resource) {
        return $modx->makeUrl($resource->get('id'), '', '', 'full');
    }
    
    return null;
}
```

## Замена функционала плагинов

### Contact Form 7 → FormIt

```html
<!-- WordPress: Contact Form 7 -->
[contact-form-7 id="123" title="Contact form"]

<!-- MODX: FormIt -->
[[!FormIt? 
    &hooks=`spam,email,redirect`
    &emailTpl=`ContactEmailTpl`
    &emailTo=`admin@site.com`
    &redirectTo=`2`
    &validate=`name:required,email:email:required,message:required`
]]

<form method="post">
    <label>Имя: <input type="text" name="name" value="[[!+fi.name]]" required></label>
    <label>Email: <input type="email" name="email" value="[[!+fi.email]]" required></label>  
    <label>Сообщение: <textarea name="message" required>[[!+fi.message]]</textarea></label>
    <button type="submit">Отправить</button>
</form>
```

### Yoast SEO → SEO Suite

```php
// WordPress мета-поля Yoast
_yoast_wpseo_title
_yoast_wpseo_metadesc
_yoast_wpseo_canonical

// MODX TV-параметры
seo_title
seo_description  
canonical_url

// В шаблоне MODX
<title>[[*seo_title:default=`[[*pagetitle]]`]] - [[++site_name]]</title>
<meta name="description" content="[[*seo_description:default=`[[*description]]`]]">
<link rel="canonical" href="[[*canonical_url:default=`[[~[[*id]]]]`]]">
```

### WooCommerce → miniShop2

```php
// Маппинг структуры данных

// WordPress WooCommerce
wp_posts (post_type = 'product')
wp_postmeta (_price, _stock, _sku)
wp_woocommerce_order_items

// MODX miniShop2  
ms2_products
ms2_product_data (price, article, weight)
ms2_orders / ms2_order_products
```

## Тестирование и запуск

### Чек-лист тестирования

```markdown
Контент:
- [ ] Все страницы отображаются корректно
- [ ] Сохранена иерархия страниц
- [ ] Медиафайлы загружаются
- [ ] Формы работают

SEO:
- [ ] URL структура сохранена или настроены редиректы
- [ ] Метатеги перенесены корректно
- [ ] Sitemap.xml обновлён
- [ ] Роботс.txt актуализирован

Функционал:
- [ ] Поиск работает
- [ ] Пользователи могут авторизоваться
- [ ] Интеграции (аналитика, формы) настроены
- [ ] Производительность оптимизирована

Безопасность:
- [ ] Старые файлы WordPress удалены
- [ ] Настроены права доступа к файлам
- [ ] SSL сертификат работает
- [ ] Настроен файрвол
```

### Скрипт финальной очистки

```bash
#!/bin/bash
# cleanup_wordpress.sh

echo "Очистка файлов WordPress..."

# Удаляем WordPress файлы (ОСТОРОЖНО!)
rm -rf wp-admin/
rm -rf wp-includes/  
rm -f wp-*.php
rm -f xmlrpc.php
rm -f license.txt
rm -f readme.html

# Очищаем .htaccess от WordPress правил
sed -i '/# BEGIN WordPress/,/# END WordPress/d' .htaccess

echo "Очистка завершена"
echo "ВНИМАНИЕ: Проверьте работоспособность сайта!"
```

## Заключение

Миграция с WordPress на MODX — серьёзный проект, который требует тщательного планирования. Ключевые принципы успешной миграции:

1. **Детальное планирование** — анализируйте текущий функционал перед началом
2. **Поэтапная реализация** — тестируйте каждый этап на копии сайта
3. **Сохранение SEO** — настройте все редиректы перед переключением DNS
4. **Тестирование** — проверьте все функции перед запуском

**Почему стоит мигрировать:**
- **Чистый код** вместо «макарон» WordPress
- **Лучшая производительность** и безопасность  
- **Гибкость** в реализации любых идей
- **SEO из коробки** без дополнительных плагинов

MODX даёт вам контроль над каждой строчкой кода и позволяет создавать действительно профессиональные решения. Время, потраченное на миграцию, окупится удобством разработки и поддержки.

---

*Связанные статьи: [Продвинутая разработка на MODX](/blog/modx-prodvinutaya-razrabotka/), [MODX vs WordPress: сравнение CMS](/blog/modx-vs-wordpress/)*
