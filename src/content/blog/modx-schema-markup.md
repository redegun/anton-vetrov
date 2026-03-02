---
title: "Schema.org разметка на MODX: сниппеты для микроданных"
description: "Как внедрить Schema.org разметку на сайте MODX: создание сниппетов для микроданных, структурированные данные для SEO, JSON-LD примеры."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-schema-markup.webp"
tags: ["MODX", "Schema.org", "SEO", "Микроданные", "JSON-LD"]
draft: false
---


Структурированные данные Schema.org — один из важнейших факторов современного SEO. Поисковики используют их для создания богатых сниппетов, панелей знаний и голосовых ответов. В MODX реализация Schema разметки максимально гибкая благодаря системе сниппетов и TV-параметров.

## Зачем нужна Schema.org разметка

### Преимущества для SEO

**Богатые сниппеты в поиске:**
- Рейтинги и отзывы (⭐⭐⭐⭐⭐)
- Цены и наличие товаров
- Время работы и контакты
- Изображения и видео в результатах

**Улучшение CTR:**
Сайты с правильной Schema разметкой получают на 15-30% больше кликов из поисковой выдачи.

**Голосовой поиск:**
Google Assistant, Алиса и Siri используют структурированные данные для формирования ответов.

### Что можно размечать

- **Статьи и новости** — Article, NewsArticle
- **Товары** — Product, Offer, AggregateOffer
- **Организации** — Organization, LocalBusiness
- **События** — Event, SportsEvent
- **Люди** — Person, EmployeeRole
- **Рецепты** — Recipe, NutritionInformation
- **Отзывы** — Review, AggregateRating

## Основы Schema разметки в MODX

### JSON-LD vs Microdata

MODX идеально подходит для JSON-LD формата — он не засоряет HTML и легко генерируется сниппетами.

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[[*pagetitle]]",
  "description": "[[*description]]",
  "author": {
    "@type": "Person",
    "name": "Антон Ветров"
  }
}
</script>
```

### Базовый сниппет для статей

```php
<?php
// Сниппет: ArticleSchema
$article = [
    '@context' => 'https://schema.org',
    '@type' => 'Article',
    'headline' => $modx->resource->get('pagetitle'),
    'description' => $modx->resource->get('description'),
    'url' => $modx->makeUrl($modx->resource->get('id'), '', '', 'full'),
    'datePublished' => date('c', $modx->resource->get('publishedon')),
    'dateModified' => date('c', $modx->resource->get('editedon')),
    'author' => [
        '@type' => 'Person',
        'name' => $modx->getPlaceholder('author_name') ?: 'Антон Ветров',
        'url' => 'https://antonvetrov.ru'
    ],
    'publisher' => [
        '@type' => 'Organization',
        'name' => $modx->getOption('site_name'),
        'url' => $modx->getOption('site_url'),
        'logo' => [
            '@type' => 'ImageObject',
            'url' => $modx->getOption('site_url') . 'assets/img/logo.png'
        ]
    ]
];

// Добавляем изображение если есть
$image = $modx->resource->getTVValue('article_image');
if ($image) {
    $article['image'] = [
        '@type' => 'ImageObject',
        'url' => $modx->getOption('site_url') . $image,
        'width' => 1200,
        'height' => 630
    ];
}

// Добавляем рубрику
$parent = $modx->getObject('modResource', $modx->resource->get('parent'));
if ($parent) {
    $article['articleSection'] = $parent->get('pagetitle');
}

$output = '<script type="application/ld+json">' . json_encode($article, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
return $output;
```

## Разметка товаров для интернет-магазинов

### Сниппет для miniShop2

```php
<?php
// Сниппет: ProductSchema
if (!$modx->getService('minishop2', 'miniShop2', MODX_CORE_PATH . 'components/minishop2/model/minishop2/')) {
    return '';
}

$product = $modx->getObject('msProduct', $modx->resource->get('id'));
if (!$product) return '';

$data = $product->toArray();

// Базовая информация о товаре
$schema = [
    '@context' => 'https://schema.org',
    '@type' => 'Product',
    'name' => $data['pagetitle'],
    'description' => strip_tags($data['content']),
    'sku' => $data['article'],
    'brand' => [
        '@type' => 'Brand',
        'name' => $data['vendor_name'] ?: $modx->getOption('site_name')
    ]
];

// Изображения
$images = [];
if ($data['image']) {
    $images[] = $modx->getOption('assets_url') . 'images/products/' . $data['image'];
}

// Дополнительные изображения из галереи
$gallery = $modx->getIterator('msProductFile', ['product_id' => $data['id'], 'parent' => 0]);
foreach ($gallery as $file) {
    $images[] = $file->getUrl();
}

if (!empty($images)) {
    $schema['image'] = $images;
}

// Цена и предложение
$price = $data['old_price'] ?: $data['price'];
if ($price > 0) {
    $schema['offers'] = [
        '@type' => 'Offer',
        'price' => $price,
        'priceCurrency' => 'RUB',
        'availability' => $data['count'] > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller' => [
            '@type' => 'Organization',
            'name' => $modx->getOption('site_name'),
            'url' => $modx->getOption('site_url')
        ]
    ];
    
    // Старая цена как специальное предложение
    if ($data['old_price'] && $data['old_price'] > $data['price']) {
        $schema['offers']['priceValidUntil'] = date('Y-m-d', strtotime('+30 days'));
    }
}

// Отзывы и рейтинг
$reviews = $modx->getCollection('TicketComment', ['class_key' => 'TicketComment', 'parent' => $data['id'], 'published' => 1]);
if (count($reviews) > 0) {
    $totalRating = 0;
    $reviewSchemas = [];
    
    foreach ($reviews as $review) {
        $rating = $review->getTVValue('rating') ?: 5;
        $totalRating += $rating;
        
        $reviewSchemas[] = [
            '@type' => 'Review',
            'author' => [
                '@type' => 'Person',
                'name' => $review->get('name')
            ],
            'reviewBody' => strip_tags($review->get('text')),
            'reviewRating' => [
                '@type' => 'Rating',
                'ratingValue' => $rating,
                'bestRating' => 5
            ],
            'datePublished' => date('c', $review->get('createdon'))
        ];
    }
    
    $avgRating = round($totalRating / count($reviews), 1);
    
    $schema['aggregateRating'] = [
        '@type' => 'AggregateRating',
        'ratingValue' => $avgRating,
        'reviewCount' => count($reviews),
        'bestRating' => 5,
        'worstRating' => 1
    ];
    
    $schema['review'] = $reviewSchemas;
}

// Характеристики товара
$features = $modx->getCollection('msProductOption', ['product_id' => $data['id']]);
if (count($features) > 0) {
    $properties = [];
    foreach ($features as $feature) {
        $option = $modx->getObject('msOption', $feature->get('key'));
        if ($option) {
            $properties[] = [
                '@type' => 'PropertyValue',
                'name' => $option->get('caption'),
                'value' => $feature->get('value')
            ];
        }
    }
    if (!empty($properties)) {
        $schema['additionalProperty'] = $properties;
    }
}

$output = '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
return $output;
```

## Разметка организации и контактов

### Сниппет для LocalBusiness

```php
<?php
// Сниппет: OrganizationSchema
$org = [
    '@context' => 'https://schema.org',
    '@type' => 'LocalBusiness',
    'name' => $modx->getOption('organization_name') ?: $modx->getOption('site_name'),
    'description' => $modx->getOption('organization_description'),
    'url' => $modx->getOption('site_url'),
    'telephone' => $modx->getOption('organization_phone'),
    'email' => $modx->getOption('organization_email')
];

// Адрес
$address = [];
if ($modx->getOption('organization_address')) {
    $address['streetAddress'] = $modx->getOption('organization_address');
}
if ($modx->getOption('organization_city')) {
    $address['addressLocality'] = $modx->getOption('organization_city');
}
if ($modx->getOption('organization_region')) {
    $address['addressRegion'] = $modx->getOption('organization_region');
}
if ($modx->getOption('organization_postal_code')) {
    $address['postalCode'] = $modx->getOption('organization_postal_code');
}
if ($modx->getOption('organization_country')) {
    $address['addressCountry'] = $modx->getOption('organization_country');
}

if (!empty($address)) {
    $org['address'] = array_merge(['@type' => 'PostalAddress'], $address);
}

// Географические координаты
$lat = $modx->getOption('organization_latitude');
$lng = $modx->getOption('organization_longitude');
if ($lat && $lng) {
    $org['geo'] = [
        '@type' => 'GeoCoordinates',
        'latitude' => $lat,
        'longitude' => $lng
    ];
}

// Время работы
$hours = $modx->getOption('organization_hours');
if ($hours) {
    $org['openingHoursSpecification'] = [
        '@type' => 'OpeningHoursSpecification',
        'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens' => '09:00',
        'closes' => '18:00'
    ];
}

// Логотип
$logo = $modx->getOption('organization_logo');
if ($logo) {
    $org['logo'] = [
        '@type' => 'ImageObject',
        'url' => $modx->getOption('site_url') . $logo
    ];
}

// Социальные сети
$social = [];
if ($modx->getOption('social_vk')) $social[] = $modx->getOption('social_vk');
if ($modx->getOption('social_telegram')) $social[] = $modx->getOption('social_telegram');
if ($modx->getOption('social_youtube')) $social[] = $modx->getOption('social_youtube');

if (!empty($social)) {
    $org['sameAs'] = $social;
}

$output = '<script type="application/ld+json">' . json_encode($org, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
return $output;
```

## Хлебные крошки (Breadcrumbs)

### Интеграция с pdoCrumbs

```php
<?php
// Сниппет: BreadcrumbSchema
$crumbs = $modx->runSnippet('pdoCrumbs', [
    'showHome' => 1,
    'tpl' => '@INLINE {"name": "[[+menutitle]]", "url": "[[+link]]"}',
    'outputSeparator' => ','
]);

if (empty($crumbs)) return '';

$breadcrumbList = [
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => []
];

$items = json_decode('[' . $crumbs . ']', true);
if ($items) {
    foreach ($items as $position => $item) {
        $breadcrumbList['itemListElement'][] = [
            '@type' => 'ListItem',
            'position' => $position + 1,
            'name' => $item['name'],
            'item' => $item['url']
        ];
    }
}

$output = '<script type="application/ld+json">' . json_encode($breadcrumbList, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
return $output;
```

## FAQ разметка

### Сниппет для часто задаваемых вопросов

```php
<?php
// Сниппет: FAQSchema
// TV-параметр faq_items должен содержать JSON с вопросами и ответами

$faqData = $modx->resource->getTVValue('faq_items');
if (empty($faqData)) return '';

$faqItems = json_decode($faqData, true);
if (!is_array($faqItems)) return '';

$faq = [
    '@context' => 'https://schema.org',
    '@type' => 'FAQPage',
    'mainEntity' => []
];

foreach ($faqItems as $item) {
    if (empty($item['question']) || empty($item['answer'])) continue;
    
    $faq['mainEntity'][] = [
        '@type' => 'Question',
        'name' => $item['question'],
        'acceptedAnswer' => [
            '@type' => 'Answer',
            'text' => $item['answer']
        ]
    ];
}

if (empty($faq['mainEntity'])) return '';

$output = '<script type="application/ld+json">' . json_encode($faq, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
return $output;
```

## События и мероприятия

### Event Schema для анонсов

```php
<?php
// Сниппет: EventSchema
$eventDate = $modx->resource->getTVValue('event_date');
$eventTime = $modx->resource->getTVValue('event_time');
$eventLocation = $modx->resource->getTVValue('event_location');

if (empty($eventDate)) return '';

$startDate = $eventDate;
if ($eventTime) {
    $startDate .= 'T' . $eventTime . ':00';
}

$event = [
    '@context' => 'https://schema.org',
    '@type' => 'Event',
    'name' => $modx->resource->get('pagetitle'),
    'description' => $modx->resource->get('description'),
    'startDate' => date('c', strtotime($startDate)),
    'url' => $modx->makeUrl($modx->resource->get('id'), '', '', 'full')
];

// Место проведения
if ($eventLocation) {
    $event['location'] = [
        '@type' => 'Place',
        'name' => $eventLocation
    ];
}

// Организатор
$event['organizer'] = [
    '@type' => 'Organization',
    'name' => $modx->getOption('site_name'),
    'url' => $modx->getOption('site_url')
];

// Изображение
$eventImage = $modx->resource->getTVValue('event_image');
if ($eventImage) {
    $event['image'] = [
        '@type' => 'ImageObject',
        'url' => $modx->getOption('site_url') . $eventImage
    ];
}

// Цена
$eventPrice = $modx->resource->getTVValue('event_price');
if ($eventPrice !== null) {
    $offers = [
        '@type' => 'Offer',
        'priceCurrency' => 'RUB',
        'availability' => 'https://schema.org/InStock'
    ];
    
    if ($eventPrice > 0) {
        $offers['price'] = $eventPrice;
    } else {
        $offers['price'] = 0;
        $offers['availability'] = 'https://schema.org/InStock';
    }
    
    $event['offers'] = $offers;
}

$output = '<script type="application/ld+json">' . json_encode($event, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
return $output;
```

## Автоматизация Schema разметки

### Плагин для автоподключения

```php
<?php
// Плагин: AutoSchema
switch ($modx->event->name) {
    case 'OnLoadWebDocument':
        $resource = $modx->resource;
        
        // Определяем тип контента
        $template = $resource->get('template');
        $parent = $resource->get('parent');
        
        $schemas = [];
        
        // Для всех страниц - хлебные крошки и организация
        $schemas[] = '[[BreadcrumbSchema]]';
        
        if ($resource->get('id') == $modx->getOption('site_start')) {
            // Главная страница
            $schemas[] = '[[OrganizationSchema]]';
        } else if ($template == 2) {
            // Шаблон статьи
            $schemas[] = '[[ArticleSchema]]';
        } else if ($template == 3) {
            // Шаблон товара
            $schemas[] = '[[ProductSchema]]';
        } else if ($template == 4) {
            // Шаблон события
            $schemas[] = '[[EventSchema]]';
        }
        
        // FAQ если есть соответствующий TV
        if ($resource->getTVValue('faq_items')) {
            $schemas[] = '[[FAQSchema]]';
        }
        
        // Добавляем схемы в head
        if (!empty($schemas)) {
            $modx->regClientStartupHTMLBlock(implode("\n", $schemas));
        }
        
        break;
}
```

## Тестирование и валидация

### Инструменты проверки

1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Показывает ошибки и превью

2. **Schema.org Validator**
   - https://validator.schema.org/
   - Детальная проверка синтаксиса

3. **Yandex Валидатор**
   - https://webmaster.yandex.ru/tools/microtest/
   - Для российского рынка

### Сниппет для тестирования

```php
<?php
// Сниппет: SchemaDebug - показывает все Schema на странице
if (!$modx->user->isAuthenticated('web')) return '';

$output = '<div style="background:#f5f5f5;padding:20px;margin:20px 0;"><h3>Schema.org Debug</h3>';

// Сканируем все JSON-LD блоки
$content = $modx->resource->getContent();
preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', $content, $matches);

foreach ($matches[1] as $json) {
    $data = json_decode(trim($json), true);
    if ($data) {
        $output .= '<h4>Type: ' . $data['@type'] . '</h4>';
        $output .= '<pre>' . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . '</pre>';
    }
}

$output .= '</div>';
return $output;
```

## Лучшие практики

### Оптимизация производительности

1. **Кеширование схем**
```php
$cacheKey = 'schema_' . $modx->resource->get('id') . '_' . $modx->resource->get('editedon');
$schema = $modx->cacheManager->get($cacheKey);

if (!$schema) {
    // Генерируем схему
    $schema = generateSchema();
    $modx->cacheManager->set($cacheKey, $schema, 3600); // Кеш на час
}
```

2. **Условная загрузка**
```php
// Загружаем схему только для нужных типов страниц
if (in_array($modx->resource->get('template'), [2, 3, 4])) {
    $modx->regClientStartupHTMLBlock('[[ArticleSchema]]');
}
```

### Избегайте ошибок

❌ **Неправильно:**
```json
{
  "@type": "Product",
  "price": "1000 руб." // Цена должна быть числом
}
```

✅ **Правильно:**
```json
{
  "@type": "Product",
  "offers": {
    "@type": "Offer",
    "price": "1000",
    "priceCurrency": "RUB"
  }
}
```

## Заключение

Schema.org разметка в MODX — это мощный инструмент для улучшения видимости сайта в поисковых системах. Гибкая система сниппетов позволяет создавать точную разметку для любого типа контента.

Ключевые принципы:
1. **Используйте JSON-LD** — он чище и проще в поддержке
2. **Автоматизируйте процесс** — создавайте переиспользуемые сниппеты  
3. **Тестируйте разметку** — регулярно проверяйте валидность
4. **Кешируйте результаты** — не генерируйте схемы на каждом запросе

Правильная Schema разметка значительно повышает шансы на попадание в богатые сниппеты и улучшает CTR из поисковой выдачи. В MODX это реализуется элегантно и без лишних сложностей.

---

*Связанные статьи: [SEO-продвижение сайтов на MODX](/blog/modx-seo-prodvizhenie/), [Написание сниппетов для MODX](/blog/modx-snippety-napisanie/)*
