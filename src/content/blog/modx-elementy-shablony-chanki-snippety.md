---
title: "Элементы MODX: шаблоны, чанки, сниппеты, плагины — полный гайд"
description: "Полное руководство по элементам MODX Revolution: шаблоны, чанки, сниппеты, плагины. Примеры кода, связи между элементами, лучшие практики от эксперта."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-ai-news-default.webp"
tags: ["MODX", "Элементы", "Шаблоны"]
draft: false
---

# Элементы MODX: шаблоны, чанки, сниппеты, плагины — полный гайд

Элементы — это сердце MODX. Именно они делают эту CMS по-настоящему гибкой и мощной. За 20 лет работы с MODX я понял: правильная архитектура элементов — залог успешного проекта. Расскажу, как правильно использовать каждый тип элемента и как они связаны между собой.

## Что такое элементы MODX

Элементы (Elements) — это строительные блоки MODX-сайта. Они хранятся в базе данных и могут использоваться в любом месте сайта через систему плейсхолдеров.

### 4 типа элементов:
1. **Шаблоны (Templates)** — основа страниц
2. **Чанки (Chunks)** — переиспользуемые фрагменты
3. **Сниппеты (Snippets)** — динамическая логика
4. **Плагины (Plugins)** — расширения системы

## Шаблоны (Templates): основа каждой страницы

Шаблон определяет структуру HTML-страницы. Каждый ресурс (страница) использует какой-то шаблон.

### Базовая структура шаблона

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[[*longtitle:default=`[[*pagetitle]]`]] | [[++site_name]]</title>
    <meta name="description" content="[[*description]]">
    
    <link rel="stylesheet" href="[[++assets_url]]css/style.css">
</head>
<body>
    <div class="wrapper">
        [[$header]]
        
        <main class="main">
            <h1>[[*pagetitle]]</h1>
            [[*content]]
        </main>
        
        [[$footer]]
    </div>
    
    <script src="[[++assets_url]]js/script.js"></script>
</body>
</html>
```

### Плейсхолдеры в шаблонах

**Системные переменные:**
```html
[[++site_name]] <!-- Название сайта -->
[[++site_url]] <!-- URL сайта -->
[[++assets_url]] <!-- Путь к assets -->
[[++base_url]] <!-- Базовый URL -->
```

**Поля ресурса:**
```html
[[*pagetitle]] <!-- Заголовок страницы -->
[[*longtitle]] <!-- Расширенный заголовок -->
[[*description]] <!-- Описание -->
[[*content]] <!-- Основной контент -->
[[*createdon]] <!-- Дата создания -->
[[*id]] <!-- ID ресурса -->
```

**TV-поля (Template Variables):**
```html
[[*banner_image]] <!-- Кастомное поле -->
[[*page_color]] <!-- Цвет страницы -->
[[*gallery]] <!-- Галерея изображений -->
```

### Модификаторы вывода

Модификаторы позволяют форматировать данные:

```html
<!-- Дата в нужном формате -->
[[*createdon:date=`%d.%m.%Y`]]

<!-- Обрезка текста -->
[[*content:limit=`200`]]

<!-- Значение по умолчанию -->
[[*description:default=`Описание не указано`]]

<!-- Удаление HTML тегов -->
[[*content:stripTags]]

<!-- Первая буква заглавная -->
[[*pagetitle:ucfirst]]
```

## Чанки (Chunks): переиспользуемые блоки

Чанки — это фрагменты кода, которые можно использовать в разных местах сайта.

### Чанк шапки (header)

```html
<!-- Чанк: header -->
<header class="header">
    <div class="container">
        <a href="[[++site_url]]" class="logo">
            <img src="[[++assets_url]]images/logo.png" alt="[[++site_name]]">
        </a>
        
        <nav class="nav">
            [[getMenu? &parents=`0` &level=`1` &tpl=`menuItem`]]
        </nav>
        
        <button class="mobile-menu-toggle">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</header>
```

### Чанк элемента меню (menuItem)

```html
<!-- Чанк: menuItem -->
<li class="nav__item [[+classnames]]">
    <a href="[[+link]]" [[+attributes]] class="nav__link">
        [[+menutitle]]
    </a>
    [[+wrapper]]
</li>
```

### Чанк карточки товара (productCard)

```html
<!-- Чанк: productCard -->
<div class="product-card">
    <a href="[[~[[+id]]]]" class="product-card__link">
        <div class="product-card__image">
            <img src="[[+image:default=`[[++assets_url]]images/no-image.jpg`]]" alt="[[+pagetitle]]">
        </div>
        
        <div class="product-card__content">
            <h3 class="product-card__title">[[+pagetitle]]</h3>
            
            [[+price:gt=`0`:then=`
                <div class="product-card__price">[[+price]] ₽</div>
            `:else=`
                <div class="product-card__price">Цена по запросу</div>
            `]]
        </div>
    </a>
</div>
```

### Вложенные чанки

Чанки могут включать другие чанки:

```html
<!-- Чанк: articleCard -->
<article class="article-card">
    [[$articleImage]]
    [[$articleContent]]
    [[$articleMeta]]
</article>
```

## Сниппеты (Snippets): динамическая логика

Сниппеты — это PHP-код, который выполняется на сервере и возвращает результат.

### Простой сниппет: вывод новостей

```php
<?php
// Сниппет: getNews
$output = '';
$limit = (int)$modx->getOption('limit', $scriptProperties, 10);
$parents = $modx->getOption('parents', $scriptProperties, 0);
$tpl = $modx->getOption('tpl', $scriptProperties, 'newsItem');

// Получаем ресурсы
$resources = $modx->getCollection('modResource', array(
    'parent:IN' => explode(',', $parents),
    'published' => 1,
    'deleted' => 0,
    'hidemenu' => 0
), array(
    'limit' => $limit,
    'sortby' => 'createdon',
    'sortdir' => 'DESC'
));

// Формируем вывод
foreach ($resources as $resource) {
    $data = $resource->toArray();
    $data['url'] = $modx->makeUrl($resource->get('id'));
    $data['date'] = date('d.m.Y', strtotime($data['createdon']));
    
    $output .= $modx->getChunk($tpl, $data);
}

return $output;
```

### Сниппет с использованием pdoTools

```php
<?php
// Сниппет: getProductsByCategory
return $modx->runSnippet('pdoResources', array(
    'parents' => $modx->getOption('category', $scriptProperties, 0),
    'includeTVs' => 'price,image,brand',
    'processTVs' => 1,
    'limit' => $modx->getOption('limit', $scriptProperties, 12),
    'tpl' => $modx->getOption('tpl', $scriptProperties, 'productCard'),
    'sortby' => 'price',
    'sortdir' => 'ASC',
    'where' => array(
        'published' => 1,
        'deleted' => 0
    )
));
```

### Сниппет формы обратной связи

```php
<?php
// Сниппет: contactForm
$formId = $modx->getOption('formId', $scriptProperties, 'contact');

return $modx->runSnippet('FormIt', array(
    'hooks' => 'email,redirect',
    'emailTpl' => 'emailTpl',
    'emailTo' => $modx->getOption('emailsender'),
    'emailSubject' => 'Новое сообщение с сайта',
    'redirectTo' => $modx->getOption('thanksPage', $scriptProperties, 1),
    'validate' => 'name:required,email:required:email,message:required'
));
```

### Сниппет поиска

```php
<?php
// Сниппет: siteSearch
$query = $modx->getOption('query', $_GET, '');
$query = trim(strip_tags($query));

if (empty($query)) {
    return '<p>Введите поисковый запрос</p>';
}

// Поиск через mSearch2
return $modx->runSnippet('mSearch2', array(
    'tpl' => 'searchResult',
    'limit' => 20,
    'outputSeparator' => '',
    'returnIds' => false,
    'showLog' => false
));
```

## Плагины (Plugins): расширение функциональности

Плагины «слушают» события MODX и выполняют код при их наступлении.

### События MODX

**Основные события:**
- `OnDocFormSave` — сохранение документа
- `OnUserFormSave` — сохранение пользователя
- `OnWebPageInit` — инициализация страницы
- `OnLoadWebDocument` — загрузка документа
- `OnPageNotFound` — страница не найдена

### Плагин автоматического SEO

```php
<?php
// Плагин: autoSEO
switch ($modx->event->name) {
    case 'OnDocFormSave':
        if ($mode == 'new') {
            $resource = $resource ?? $object;
            
            // Автогенерация описания из контента
            if (empty($resource->getTVValue('description'))) {
                $content = strip_tags($resource->get('content'));
                $description = substr($content, 0, 160) . '...';
                
                $tv = $modx->getObject('modTemplateVar', array('name' => 'description'));
                if ($tv) {
                    $tv->setValue($resource->get('id'), $description);
                    $tv->save();
                }
            }
            
            // Автогенерация алиаса
            if (empty($resource->get('alias'))) {
                $alias = $modx->runSnippet('translit', array(
                    'input' => $resource->get('pagetitle')
                ));
                $resource->set('alias', $alias);
                $resource->save();
            }
        }
        break;
}
```

### Плагин кэширования

```php
<?php
// Плагин: customCache
switch ($modx->event->name) {
    case 'OnDocFormSave':
        // Очистка кэша при сохранении документа
        $modx->cacheManager->refresh(array(
            'db' => array(),
            'auto_publish' => array('contexts' => array('web')),
            'context_settings' => array('contexts' => array('web')),
            'resource' => array('contexts' => array('web'))
        ));
        break;
        
    case 'OnSiteRefresh':
        // Дополнительные действия при очистке кэша
        $customCacheDir = MODX_CORE_PATH . 'cache/custom/';
        if (is_dir($customCacheDir)) {
            $modx->cacheManager->deleteTree($customCacheDir, false);
        }
        break;
}
```

## Связи между элементами

### Шаблон → Чанки → Сниппеты

```html
<!-- Шаблон использует чанк header -->
[[$header]]

<!-- Чанк header использует сниппет getMenu -->
[[getMenu? &tpl=`menuItem`]]

<!-- Сниппет getMenu использует чанк menuItem -->
return $modx->getChunk('menuItem', $data);
```

### Каскадное использование

```html
<!-- В шаблоне -->
<div class="sidebar">
    [[getWidgets? &tpl=`widget`]]
</div>

<!-- Сниппет getWidgets -->
<?php
$widgets = array('news', 'products', 'banners');
$output = '';

foreach ($widgets as $widget) {
    $output .= $modx->getChunk('widget', array(
        'title' => 'Заголовок ' . $widget,
        'content' => $modx->runSnippet('get' . ucfirst($widget))
    ));
}

return $output;
```

## Лучшие практики

### 1. Именование элементов

**Шаблоны:** `page`, `article`, `product`, `homepage`
**Чанки:** `header`, `footer`, `productCard`, `newsItem`  
**Сниппеты:** `getNews`, `getProducts`, `contactForm`
**Плагины:** `autoSEO`, `customAuth`, `cacheManager`

### 2. Структура чанков

Группируйте связанные чанки:
```
header/
├── header
├── nav
├── breadcrumbs
└── userMenu

cards/
├── productCard
├── newsCard
├── serviceCard
└── teamCard
```

### 3. Параметризация сниппетов

Делайте сниппеты гибкими через параметры:

```php
<?php
$limit = (int)$modx->getOption('limit', $scriptProperties, 10);
$parents = $modx->getOption('parents', $scriptProperties, 0);
$tpl = $modx->getOption('tpl', $scriptProperties, 'defaultTpl');
$sortby = $modx->getOption('sortby', $scriptProperties, 'publishedon');
$sortdir = $modx->getOption('sortdir', $scriptProperties, 'DESC');
```

### 4. Кэширование элементов

Используйте некэшируемые вызовы только когда нужно:

```html
<!-- Кэшируемый вызов -->
[[getMenu]]

<!-- Некэшируемый вызов -->
[[!getCart]]
```

## Отладка элементов

### Проверка существования элемента

```php
<?php
// В сниппете
if (!$modx->getChunk('myChunk')) {
    return 'Чанк не найден';
}
```

### Вывод отладочной информации

```php
<?php
// Логирование в MODX
$modx->log(modX::LOG_LEVEL_ERROR, 'Отладочное сообщение');

// Временный вывод для разработки
if ($modx->getOption('debug')) {
    echo '<pre>' . print_r($data, true) . '</pre>';
}
```

## Заключение

Правильное использование элементов — основа качественного MODX-сайта. Разделение логики на шаблоны, чанки, сниппеты и плагины делает код чистым, переиспользуемым и легко поддерживаемым.

Помните главное правило: **один элемент — одна задача**. Не пытайтесь запихнуть всю логику в один сниппет. Лучше создать несколько простых элементов, чем один сложный.

### Что дальше?

Изучите остальные аспекты MODX:

- **[Разработка сайта на MODX Revolution: полное руководство](/blog/razrabotka-sajta-na-modx/)** — общий обзор разработки
- **[Топ-20 дополнений MODX](/blog/modx-dopolneniya-top/)** — полезные пакеты для расширения функциональности

*Антон Ветров, веб-разработчик с 2006 года. 60+ проектов на MODX, 20 лет практического опыта.*