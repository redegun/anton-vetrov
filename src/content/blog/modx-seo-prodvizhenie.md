---
title: "SEO-оптимизация сайта на MODX: полный чеклист"
description: "Полный гайд по SEO-оптимизации сайтов на MODX Revolution. ЧПУ, метатеги, sitemap, Schema.org, скорость загрузки. Практический опыт продвижения 20 сайтов."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-seo-prodvizhenie-blog.webp"
tags: ["MODX", "SEO", "Продвижение"]
draft: false
---

# SEO-оптимизация сайта на MODX: полный чеклист

За 20 лет работы с MODX я продвинул в топ более 20 сайтов на этой платформе. Секрет в том, что MODX изначально создавался с учётом требований поисковых систем. Сегодня поделюсь полным чеклистом SEO-оптимизации, который привёл мои проекты на первые страницы Яндекса и Google.

## Почему MODX — SEO-дружелюбная CMS

MODX даёт для SEO больше, чем большинство других CMS. Это не случайность — архитектура системы изначально проектировалась с учётом требований поисковых роботов.

### Что MODX даёт из коробки:

**1. Чистая структура URL**
```
https://site.ru/katalog/category/product/
```
Никаких `?page_id=123` или сложных параметров.

**2. Полный контроль над HTML**
В отличие от WordPress с его «макаронами», в MODX вы контролируете каждый тег в коде.

**3. Быстрая генерация страниц**
Встроенная система кэширования обеспечивает высокую скорость.

**4. Семантическая структура**
Ресурсы MODX идеально подходят под концепцию «сущностей», о которой сейчас говорят поисковики.

### Реальный кейс: переезд с Symfony на MODX

К нам обратился клиент с сайтом на Symfony. Разработчик два месяца делал то, что в MODX работает из коробки — редиректы, ЧПУ, управление метатегами. После переезда на MODX позиции выросли на 40% за полгода.

Поняли: зачем строить SEO-машину с нуля, если можно взять готовую?

## Настройка ЧПУ (дружелюбных URL)

### Базовая настройка

1. **Включаем ЧПУ в настройках:**
```
Система → Настройки → Дружелюбные URL = Да
Использовать ЧПУ = Да
```

2. **Настраиваем .htaccess:**
```apache
# Включаем mod_rewrite
RewriteEngine On
RewriteBase /

# Убираем index.php из URL
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?q=$1 [L,QSA]

# Убираем слеш на конце для файлов
RewriteRule ^(.+)/$ $1 [R=301,L]

# Принудительно HTTPS (если нужно)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Продвинутые настройки ЧПУ

**Автоматическая генерация алиасов:**
```
Автоматически генерировать псевдоним = Да
Транслитерация псевдонимов = Да
```

**Удаление стоп-слов из URL:**
```php
// В плагине OnDocFormSave
$stopWords = array('и', 'в', 'на', 'с', 'по', 'для', 'от');
$alias = $resource->get('alias');
$words = explode('-', $alias);
$cleanWords = array_diff($words, $stopWords);
$resource->set('alias', implode('-', $cleanWords));
```

**Структурированные URL для каталога:**
```
/katalog/ — главная каталога
/katalog/category/ — категория
/katalog/category/product/ — товар
```

## Метатеги и заголовки

### Title (заголовок страницы)

**Лучшая практика для Title:**
```html
<title>[[*longtitle:default=`[[*pagetitle]]`]] | [[++site_name]]</title>
```

**Правила Title:**
- Длина 50-60 символов
- Ключевые слова в начале
- Уникальность для каждой страницы
- Без переспама ключевиками

### Description (описание)

**TV-поле для описания:**
```html
<meta name="description" content="[[*description:limit=`160`]]">
```

**Если описания нет — генерируем из контента:**
```php
// Плагин автогенерации Description
if (empty($resource->getTVValue('description'))) {
    $content = strip_tags($resource->get('content'));
    $description = substr($content, 0, 140) . '...';
    
    $tv = $modx->getObject('modTemplateVar', array('name' => 'description'));
    $tv->setValue($resource->get('id'), $description);
}
```

### H1-H6 структура

**Правильная иерархия заголовков:**
```html
<!-- Шаблон страницы -->
<h1>[[*pagetitle]]</h1> <!-- Один H1 на страницу -->

<div class="content">
    [[*content]] <!-- Здесь H2, H3, H4... -->
</div>
```

**Автоматическое оглавление:**
```php
// Сниппет генерации TOC из заголовков
<?php
$content = $modx->resource->get('content');
preg_match_all('/<h([2-6])[^>]*>(.+?)<\/h[2-6]>/i', $content, $matches);

$toc = '';
foreach ($matches[0] as $key => $heading) {
    $level = $matches[1][$key];
    $text = strip_tags($matches[2][$key]);
    $anchor = strtolower(preg_replace('/[^a-z0-9]+/', '-', $text));
    
    $toc .= '<li class="toc-level-' . $level . '"><a href="#' . $anchor . '">' . $text . '</a></li>';
}

return '<ul class="table-of-contents">' . $toc . '</ul>';
```

## XML Sitemap

### Автоматическая генерация

**Через дополнение Sitemap:**
```php
[[Sitemap? 
    &startId=`0`
    &showHidden=`0`
    &published=`1`
    &where=`{"class_key":"modDocument"}`
]]
```

### Кастомная sitemap

**Сниппет для гибкой настройки:**
```php
<?php
// getSitemap
header('Content-Type: application/xml');

$output = '<?xml version="1.0" encoding="UTF-8"?>';
$output .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

$resources = $modx->getCollection('modResource', array(
    'published' => 1,
    'deleted' => 0,
    'searchable' => 1
));

foreach ($resources as $resource) {
    $url = $modx->makeUrl($resource->get('id'), '', '', 'full');
    $lastmod = date('Y-m-d', strtotime($resource->get('editedon')));
    
    $priority = $resource->get('parent') == 0 ? '1.0' : '0.8';
    
    $output .= '<url>';
    $output .= '<loc>' . $url . '</loc>';
    $output .= '<lastmod>' . $lastmod . '</lastmod>';
    $output .= '<priority>' . $priority . '</priority>';
    $output .= '</url>';
}

$output .= '</urlset>';
return $output;
```

**Создаём ресурс sitemap.xml:**
- Content-Type: `xml`
- Контент: `[[getSitemap]]`
- Кэшируемость: Нет

## Микроразметка Schema.org

### Базовая разметка организации

```html
<!-- В шаблоне -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "[[++site_name]]",
    "url": "[[++site_url]]",
    "logo": "[[++site_url]]assets/images/logo.png",
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+7-495-123-45-67",
        "contactType": "customer service"
    }
}
</script>
```

### Разметка хлебных крошек

```php
// Сниппет getBreadcrumbsJSON
<?php
$trail = $modx->runSnippet('BreadCrumb', array(
    'showHomeCrumb' => 1,
    'homeCrumbTitle' => 'Главная'
));

$crumbs = array();
preg_match_all('/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/', $trail, $matches);

foreach ($matches[1] as $key => $url) {
    $crumbs[] = array(
        '@type' => 'ListItem',
        'position' => $key + 1,
        'item' => array(
            '@id' => $url,
            'name' => $matches[2][$key]
        )
    );
}

$schema = array(
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => $crumbs
);

return '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE) . '</script>';
```

### Разметка товаров (для каталога)

```php
// TV-поля товара: price, brand, description, image
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "[[*pagetitle]]",
    "description": "[[*description]]",
    "brand": {
        "@type": "Brand",
        "name": "[[*brand]]"
    },
    "image": "[[*image]]",
    "offers": {
        "@type": "Offer",
        "priceCurrency": "RUB",
        "price": "[[*price]]",
        "availability": "https://schema.org/InStock",
        "seller": {
            "@type": "Organization",
            "name": "[[++site_name]]"
        }
    }
}
</script>
```

### FAQ разметка

```php
// Для страниц с часто задаваемыми вопросами
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Как заказать услугу?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Позвоните по телефону или заполните форму на сайте."
            }
        }
    ]
}
</script>
```

## StercSEO — профессиональное SEO

### Установка и базовая настройка

**Через MODStore:**
1. Система → Управление пакетами
2. Скачать дополнения → StercSEO
3. Установить

**Основные возможности:**
- Автогенерация Title и Description
- Управление метатегами
- Open Graph разметка  
- Мониторинг 404 ошибок
- XML-карты сайта

### Настройка шаблонов метатегов

```
Title: {pagetitle} | {site_name}
Description: {introtext:limit=160} | {site_name}
```

### Массовое редактирование SEO

**Bulk SEO operations:**
- Выбираем страницы
- Применяем шаблон метатегов
- Проверяем результат

## Оптимизация скорости загрузки

### Сжатие и минификация

**.htaccess для сжатия:**
```apache
# Gzip сжатие
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

# Кэширование браузера
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
</IfModule>
```

### Оптимизация изображений

**Сжатие через плагин:**
```php
// Плагин автосжатия изображений
switch ($modx->event->name) {
    case 'OnFileManagerUpload':
        $file = $scriptProperties['files']['file'];
        if (in_array($file['type'], array('image/jpeg', 'image/png'))) {
            // Сжимаем изображение
            $source = imagecreatefromjpeg($file['tmp_name']);
            imagejpeg($source, $file['tmp_name'], 85); // 85% качества
        }
        break;
}
```

**WebP конвертация:**
```php
// Автоматическое создание WebP версий
if (function_exists('imagewebp')) {
    $webpPath = str_replace('.jpg', '.webp', $imagePath);
    imagewebp($source, $webpPath, 80);
}
```

### Lazy loading изображений

```html
<!-- В чанке изображения -->
<img src="placeholder.jpg" 
     data-src="[[+image]]" 
     class="lazy" 
     alt="[[+alt]]">

<script>
// Подключаем Intersection Observer для lazy loading
const images = document.querySelectorAll('.lazy');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));
</script>
```

## Оптимизация кэширования

### Настройка кэширования MODX

**Системные настройки:**
```
Использовать кэш = Да
Время жизни кэша = 3600 (1 час)
Кэш по умолчанию = xPDO
```

**Кэшируемые и некэшируемые элементы:**
```html
<!-- Кэшируемые (статичные) -->
[[getMenu]]
[[getBreadcrumbs]]
[[$header]]

<!-- Некэшируемые (динамические) -->
[[!getCart]]
[[!UserInfo]]
[[!getRandomProducts]]
```

### Кэширование запросов к базе

```php
// В сниппете с кэшированием
$cacheKey = 'products_' . md5(serialize($scriptProperties));
$output = $modx->cacheManager->get($cacheKey);

if (empty($output)) {
    // Тяжёлый запрос к базе
    $output = $modx->runSnippet('pdoResources', $params);
    
    // Кэшируем на час
    $modx->cacheManager->set($cacheKey, $output, 3600);
}

return $output;
```

## Robots.txt

### Базовая структура

```
User-agent: *
Allow: /

# Закрываем служебные папки
Disallow: /manager/
Disallow: /core/
Disallow: /assets/components/
Disallow: /connectors/

# Закрываем дубли
Disallow: /*?*

# Указываем sitemap
Sitemap: https://site.ru/sitemap.xml
```

### Динамический robots.txt

**Ресурс robots с Content-Type `text/plain`:**
```
[[getRobots]]
```

**Сниппет getRobots:**
```php
<?php
$robots = "User-agent: *\nAllow: /\n\n";

// Закрываем неопубликованные страницы
$hidden = $modx->getCollection('modResource', array(
    'published' => 0
));

foreach ($hidden as $page) {
    $robots .= "Disallow: " . $modx->makeUrl($page->get('id')) . "\n";
}

$robots .= "\nSitemap: " . $modx->getOption('site_url') . "sitemap.xml";

return $robots;
```

## Мониторинг и аналитика

### Google Analytics 4

```html
<!-- В шаблоне head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Яндекс.Метрика

```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(XXXXXX, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
   });
</script>
```

### Search Console

**Автоматическая отправка sitemap:**
```php
// Плагин отправки sitemap в Google
$sitemapUrl = $modx->getOption('site_url') . 'sitemap.xml';
$pingUrl = 'https://www.google.com/ping?sitemap=' . urlencode($sitemapUrl);

// Отправляем пинг при изменении контента
if ($modx->event->name === 'OnDocFormSave') {
    file_get_contents($pingUrl);
}
```

## SEO-чеклист перед запуском

### Технический SEO ✅
- [ ] ЧПУ включены и настроены
- [ ] .htaccess для редиректов и сжатия
- [ ] Все Title уникальные (до 60 символов)
- [ ] Все Description уникальные (до 160 символов)
- [ ] H1 на каждой странице (только один)
- [ ] Структура заголовков H1-H6
- [ ] Alt-теги для всех изображений
- [ ] Sitemap.xml генерируется автоматически
- [ ] Robots.txt настроен правильно

### Контентный SEO ✅
- [ ] Ключевые слова исследованы
- [ ] Title содержит главный ключ
- [ ] H1 отличается от Title
- [ ] Контент минимум 500 слов
- [ ] Внутренние ссылки расставлены
- [ ] Нет дублированного контента

### Технический аудит ✅
- [ ] Скорость загрузки < 3 сек
- [ ] Мобильная версия оптимизирована  
- [ ] HTTPS подключён
- [ ] 404 ошибки отслеживаются
- [ ] Редиректы настроены
- [ ] Google Analytics подключён

## Заключение

MODX даёт отличную основу для SEO-продвижения. В отличие от WordPress, где приходится бороться с «макаронами» в коде, здесь всё чисто и логично.

Главное в SEO сегодня — не технические хитрости, а понимание сущностей и создание релевантного контента. Раньше мы делали страницы под ключевые слова, теперь — под сущности. MODX отлично подходит для такого подхода.

### Мои услуги SEO

Если нужна помощь с продвижением MODX-сайта:
- **[SEO-оптимизация MODX](/services/modx-seo/)** — полный комплекс работ
- **[Разработка с учётом SEO](/services/modx-razrabotka/)** — сразу создаём SEO-дружелюбный сайт

### Что дальше?

Изучите другие аспекты MODX:
- **[Разработка сайта на MODX: полное руководство](/blog/razrabotka-sajta-na-modx/)** — обзор всего процесса
- **[Топ-20 дополнений MODX](/blog/modx-dopolneniya-top/)** — полезные инструменты, включая SEO-дополнения

*Антон Ветров, SEO-специалист с 2006 года. Продвинул в топ 20+ сайтов на MODX Revolution.*