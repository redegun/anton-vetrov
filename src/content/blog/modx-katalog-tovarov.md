---
title: "Каталог товаров на MODX: архитектура, фильтрация, карточки"
description: "Полный гайд по созданию каталога товаров на MODX Revolution. MIGX vs miniShop2, mFilter2, mSearch2. Архитектура, карточки товаров, фильтрация, SEO."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-katalog-tovarov.webp"
tags: ["MODX", "Каталог", "Товары"]
draft: false
---


За 20 лет работы с MODX я создал десятки каталогов товаров — от простых списков услуг до сложных интернет-магазинов с тысячами позиций. MODX отлично подходит для каталогов благодаря гибкой архитектуре и чистому коду. Расскажу, как правильно построить каталог любой сложности.

## Выбор архитектуры: MIGX vs miniShop2

Первый вопрос при создании каталога — какой подход использовать. У меня есть два проверенных варианта.

### MIGX — для простых каталогов

**Когда использовать:**
- Каталог услуг или направлений
- До 500 позиций
- Простая структура товара
- Без корзины и заказов
- Быстрая разработка

**Преимущества:**
- Простота настройки
- Полный контроль над структурой
- Легко кастомизировать
- Не требует изучения API

**Недостатки:**
- Нет встроенной корзины
- Сложно масштабировать
- Нет системы заказов
- Ручная работа с характеристиками

### miniShop2 — для полноценных магазинов

**Когда использовать:**
- Интернет-магазин с корзиной
- Более 500 товаров
- Сложные характеристики товаров
- Система заказов и оплаты
- Варианты товаров (размер, цвет)

**Преимущества:**
- Готовая корзина и заказы
- Масштабируемость
- Система скидок
- Интеграция с платежами
- Большое сообщество

**Недостатки:**
- Сложность изучения
- Больше ресурсов сервера
- Необходимость понимания API

## Каталог на MIGX: пошаговая инструкция

Начнём с простого каталога услуг на MIGX.

### Шаг 1: Установка MIGX

```
Система → Управление пакетами → Скачать дополнения → MIGX
```

### Шаг 2: Создание структуры каталога

**Структура ресурсов:**
```
Каталог (ID: 5)
├── Категория 1 (ID: 6)
├── Категория 2 (ID: 7)
└── Категория 3 (ID: 8)
```

### Шаг 3: Настройка MIGX

**Создаём TV-поле "products":**
1. Элементы → Template Variables → Создать
2. Имя: `products`
3. Тип ввода: `migx`
4. Привязываем к шаблону каталога

**Конфигурация MIGX:**
```json
{
    "formtabs": [
        {
            "MIGX_id": 1,
            "caption": "Товар",
            "print_before_tabs": "0",
            "fields": [
                {
                    "MIGX_id": 1,
                    "field": "title",
                    "caption": "Название",
                    "description": "",
                    "description_is_code": "0",
                    "inputTV": "",
                    "inputTVtype": "text",
                    "validation": "",
                    "configs": "",
                    "restrictive_condition": "",
                    "display": "",
                    "sourceFrom": "config",
                    "sources": "",
                    "inputOptionValues": "",
                    "default": ""
                },
                {
                    "MIGX_id": 2,
                    "field": "price",
                    "caption": "Цена",
                    "inputTVtype": "number"
                },
                {
                    "MIGX_id": 3,
                    "field": "image",
                    "caption": "Изображение",
                    "inputTVtype": "image"
                },
                {
                    "MIGX_id": 4,
                    "field": "description",
                    "caption": "Описание",
                    "inputTVtype": "richtext"
                }
            ]
        }
    ],
    "contextmenus": "update||duplicate||recall_remove_delete",
    "actionbuttons": "addItem||removeItem",
    "columnbuttons": "",
    "filters": "",
    "extended": {
        "migx_add": "Добавить товар",
        "disable_add_item": "",
        "add_items_directly": "",
        "formcaption": "",
        "update_win_title": "",
        "win_id": "",
        "maxRecords": "",
        "addNewItemAt": "bottom"
    },
    "columns": [
        {
            "MIGX_id": 1,
            "header": "Название",
            "dataIndex": "title",
            "width": "",
            "sortType": "",
            "sortDir": "",
            "renderer": "",
            "clickaction": "",
            "selectorconfig": "",
            "renderchunktpl": "",
            "renderoptions": ""
        },
        {
            "MIGX_id": 2,
            "header": "Цена",
            "dataIndex": "price",
            "width": "60"
        }
    ]
}
```

### Шаг 4: Вывод каталога

**Сниппет getProducts:**
```php
<?php
// Сниппет для вывода товаров MIGX
$products = $modx->resource->getTVValue('products');
if (empty($products)) return '';

$products = json_decode($products, true);
if (!is_array($products)) return '';

$output = '';
$tpl = $modx->getOption('tpl', $scriptProperties, 'productCard');

foreach ($products as $product) {
    // Добавляем ID ресурса для ссылок
    $product['resource_id'] = $modx->resource->get('id');
    $output .= $modx->getChunk($tpl, $product);
}

return $output;
```

**Чанк productCard:**
```html
<div class="product-card" data-id="[[+MIGX_id]]">
    <div class="product-card__image">
        [[+image:notempty=`<img src="[[+image]]" alt="[[+title]]">`]]
    </div>
    
    <div class="product-card__content">
        <h3 class="product-card__title">[[+title]]</h3>
        
        [[+price:gt=`0`:then=`
            <div class="product-card__price">[[+price]] ₽</div>
        `]]
        
        <div class="product-card__description">
            [[+description:stripTags:limit=`100`]]
        </div>
        
        <button class="btn btn-primary" data-action="add-to-cart" data-id="[[+MIGX_id]]">
            Заказать
        </button>
    </div>
</div>
```

### Шаг 5: Детальная страница товара

**URL товара:**
```
/katalog/category/product-name/
```

**Сниппет getProduct:**
```php
<?php
// Получение товара по ID из MIGX
$productId = (int)$modx->getOption('id', $scriptProperties, 0);
$parentId = (int)$modx->getOption('parent', $scriptProperties, 0);

if (empty($productId) || empty($parentId)) {
    return 'Товар не найден';
}

$parent = $modx->getObject('modResource', $parentId);
if (!$parent) return 'Категория не найдена';

$products = json_decode($parent->getTVValue('products'), true);
if (!is_array($products)) return 'Товары не найдены';

foreach ($products as $product) {
    if ($product['MIGX_id'] == $productId) {
        return $modx->getChunk('productDetail', $product);
    }
}

return 'Товар не найден';
```

## Каталог на miniShop2

Для серьёзных интернет-магазинов рекомендую miniShop2.

### Установка miniShop2

```
Система → Управление пакетами → Скачать дополнения → miniShop2
```

**Базовые зависимости:**
- pdoTools (обязательно)
- mSearch2 (для поиска)
- mFilter2 (для фильтров)

### Структура каталога miniShop2

**Ресурсы:**
```
Магазин (msCategory)
├── Одежда (msCategory)
│   ├── Мужская (msCategory)  
│   └── Женская (msCategory)
└── Обувь (msCategory)
    ├── Кроссовки (msProduct)
    └── Ботинки (msProduct)
```

### Настройка товаров

**Основные поля товара:**
- Артикул (article)
- Цена (price)
- Вес (weight)
- Изображения (gallery)
- Характеристики (options)

**Создание опций (характеристик):**
```
Дополнения → miniShop2 → Настройки → Опции товаров
```

**Пример опций:**
- Размер: XS, S, M, L, XL
- Цвет: Красный, Синий, Зелёный
- Материал: Хлопок, Полиэстер

### Шаблоны вывода

**Список товаров (msProducts):**
```html
[[msProducts?
    &parents=`5`
    &limit=`12`
    &tpl=`tpl.msProducts.row`
    &includeTVs=`image,brand`
]]
```

**Чанк товара (tpl.msProducts.row):**
```html
<div class="ms2_product col-md-4">
    <div class="ms2_product_image">
        <a href="[[~[[+id]]]]">
            [[+thumb?
                &input=`image`
                &options=`300x250&zc=1&q=90`
            ]]
        </a>
    </div>
    
    <div class="ms2_product_title">
        <a href="[[~[[+id]]]]">[[+pagetitle]]</a>
    </div>
    
    <div class="ms2_product_price">
        [[+price]] ₽
        [[+old_price:gt=`0`:then=`
            <span class="old_price">[[+old_price]] ₽</span>
        `]]
    </div>
    
    <div class="ms2_product_options">
        [[msOptions?
            &product=`[[+id]]`
            &tpl=`tpl.msOption`
        ]]
    </div>
    
    <div class="ms2_actions">
        [[msProductOptions?
            &product=`[[+id]]`
            &tpl=`tpl.msProductOptions`
        ]]
    </div>
</div>
```

**Корзина:**
```html
[[msCart?
    &tpl=`tpl.msCart`
    &includeTVs=`image`
]]
```

## Фильтрация товаров с mFilter2

### Установка и настройка

```
Дополнения → mFilter2 → Настройки
```

**Основные настройки:**
- Класс для фильтрации: msProduct
- Родители для поиска: ID категорий
- Шаблон результатов: tpl.msProducts.row

### Настройка фильтров

**Автоматические фильтры:**
```html
[[mFilter2?
    &parents=`5`
    &resources=``
    &element=`msProducts`
    &limit=`12`
    &tpl=`tpl.msProducts.row`
    &filters=`
        ms|price:number,
        ms|vendor:select,
        ms|color:checkbox,
        ms|size:checkbox
    `
    &aliases=`
        ms|price==цена,
        ms|vendor==производитель,
        ms|color==цвет,
        ms|size==размер
    `
]]
```

### Кастомные фильтры

**Фильтр по TV-полям:**
```html
[[mFilter2?
    &filters=`
        tv|brand:select,
        tv|material:checkbox,
        resource|template:select
    `
]]
```

**Фильтр по цене:**
```html
<div class="mse2_filter_block">
    <h5>Цена</h5>
    <div class="price-range">
        <input type="number" name="ms|price:gte" placeholder="От">
        <input type="number" name="ms|price:lte" placeholder="До">
    </div>
</div>
```

## Поиск с mSearch2

### Базовая настройка поиска

```html
<!-- Форма поиска -->
<form action="[[~5]]" method="get">
    <input type="text" name="query" value="[[+mse2_query]]" placeholder="Поиск товаров">
    <button type="submit">Найти</button>
</form>

<!-- Результаты поиска -->
[[mSearch2?
    &element=`msProducts`
    &parents=`5`
    &returnIds=`1`
    &showLog=`0`
    &limit=`20`
    &tpl=`tpl.msProducts.row`
    &includeTVs=`image,brand`
    &fields=`pagetitle,longtitle,description,content`
]]
```

### Продвинутый поиск

**Поиск с подсказками:**
```javascript
// AJAX подсказки при вводе
$('#search-input').on('input', function() {
    const query = $(this).val();
    if (query.length < 3) return;
    
    $.post('/', {
        'mse2_action': 'search',
        'mse2_query': query,
        'limit': 5
    }, function(data) {
        $('#search-suggestions').html(data);
    });
});
```

## Оптимизация производительности

### Кэширование запросов

```php
// В сниппете каталога
$cacheKey = 'products_' . $modx->resource->get('id') . '_' . md5(serialize($scriptProperties));
$output = $modx->cacheManager->get($cacheKey);

if (empty($output)) {
    $output = $modx->runSnippet('msProducts', $scriptProperties);
    $modx->cacheManager->set($cacheKey, $output, 3600); // Кэш на час
}

return $output;
```

### Ленивая загрузка изображений

```html
<!-- В чанке товара -->
<img class="lazy" 
     src="placeholder.jpg" 
     data-src="[[+thumb]]" 
     alt="[[+pagetitle]]">
```

### Пагинация с AJAX

```html
[[pdoPage?
    &element=`msProducts`
    &limit=`12`
    &ajaxMode=`button`
    &ajaxElemMore=`.load-more`
    &ajaxTplMore=`@INLINE <button class="btn load-more">Показать ещё</button>`
]]
```

## SEO для каталога

### URL-структура

**Для MIGX:**
```
/katalog/ — главная каталога
/katalog/category/ — категория
/katalog/category/item-[[+MIGX_id]]/ — товар
```

**Для miniShop2:**
```
/shop/ — главная магазина  
/shop/category/ — категория
/shop/category/product/ — товар
```

### Метатеги для товаров

**Автоматическая генерация:**
```php
// Плагин для товаров miniShop2
if ($resource->class_key === 'msProduct') {
    $title = $resource->get('pagetitle');
    $price = $resource->get('price');
    $vendor = $resource->getTVValue('vendor');
    
    $seoTitle = $title . ' купить';
    if ($vendor) $seoTitle .= ' ' . $vendor;
    if ($price) $seoTitle .= ' за ' . $price . ' руб';
    
    $resource->set('longtitle', $seoTitle);
}
```

### Schema.org разметка

```html
<!-- Для товара -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "[[*pagetitle]]",
    "description": "[[*description]]",
    "image": "[[*image]]",
    "brand": {
        "@type": "Brand",
        "name": "[[*vendor]]"
    },
    "offers": {
        "@type": "Offer",
        "priceCurrency": "RUB",
        "price": "[[*price]]",
        "availability": "https://schema.org/InStock"
    }
}
</script>
```

## Мобильная оптимизация

### Адаптивные карточки

```css
.product-card {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

@media (max-width: 768px) {
    .product-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    
    .product-card {
        font-size: 14px;
    }
}
```

### Мобильные фильтры

```html
<!-- Кнопка фильтров на мобильном -->
<button class="filter-toggle d-md-none" data-target="#filters">
    Фильтры
</button>

<!-- Выезжающая панель фильтров -->
<div id="filters" class="filters-panel">
    [[mFilter2]]
</div>
```

## Заключение

MODX отлично подходит для каталогов любой сложности. Для простых каталогов используйте MIGX — быстро и гибко. Для полноценных магазинов выбирайте miniShop2 — функционально и масштабируемо.

Главное — правильно спланировать архитектуру с самого начала. Потом будет сложно всё переделывать.

### Мои услуги

Нужна помощь с каталогом товаров на MODX?
- **[Создание каталогов на MODX](/services/modx-sajt-katalog/)** — от простых списков до сложных магазинов
- **[Разработка на MODX](/services/modx-razrabotka/)** — комплексная разработка сайтов

### Что дальше?

Изучите связанные темы:
- **[Разработка сайта на MODX: полное руководство](/blog/razrabotka-sajta-na-modx/)** — общий обзор разработки
- **[Топ-20 дополнений MODX](/blog/modx-dopolneniya-top/)** — полезные пакеты, включая miniShop2 и mFilter2

*Антон Ветров, веб-разработчик с 2006 года. Создал десятки каталогов товаров на MODX Revolution.*
