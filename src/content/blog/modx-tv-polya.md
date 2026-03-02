---
title: "TV-поля в MODX: типы ввода, вывод, MIGX"
description: "Полное руководство по TV-полям в MODX Revolution. Типы ввода, фильтры вывода, MIGX для сложных структур. Практические примеры использования."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-tv-polya.webp"
tags: ["MODX", "TV-поля", "MIGX", "Пользовательские поля"]
draft: false
---

# TV-поля в MODX: типы ввода, вывод, MIGX

TV-поля (Template Variables) — это пользовательские поля, которые расширяют возможности стандартных полей страниц в MODX. За годы работы я использовал TV-поля для создания интернет-магазинов, каталогов, портфолио и сложных корпоративных сайтов. В этой статье расскажу всё о TV-полях — от простых текстовых до сложных структур с MIGX.

## Что такое TV-поля

### Определение и назначение

Template Variables (TV) — пользовательские поля, которые можно привязать к шаблонам и заполнять для каждой страницы индивидуально. Это способ добавить любые дополнительные данные к страницам.

**Примеры использования:**
- Цена и характеристики товара
- Галерея изображений
- Контактная информация
- SEO-теги
- Дополнительные блоки контента

### Как работают TV-поля

```html
<!-- В шаблоне -->
<h1>[[*pagetitle]]</h1>
<div class="price">[[*product_price]] ₽</div>
<div class="gallery">[[*gallery_images]]</div>

<!-- В сниппете -->
$price = $resource->getTVValue('product_price');
$images = $resource->getTVValue('gallery_images');
```

## Создание TV-поля

### Шаг 1: Основные настройки

1. **Элементы** → **Template Variables** → **Создать TV**
2. Заполните основные поля:

```
Имя: product_price
Заголовок: Цена товара
Описание: Цена в рублях
Категория: Товары
```

### Шаг 2: Тип ввода

Выберите подходящий тип ввода из списка:
- **Text** — простой текст
- **Number** — числовое поле
- **Email** — email с валидацией
- **Date** — дата
- **Image** — изображение
- **File** — файл
- **Textarea** — многострочный текст

### Шаг 3: Привязка к шаблонам

Во вкладке **Доступ к шаблону** отметьте шаблоны, где будет доступно поле.

## Типы ввода TV-полей

### Текстовые поля

**Text (Текст):**
```html
<!-- Настройки ввода -->
Тип ввода: Text
Значение по умолчанию: 0
Параметры ввода: @INHERIT

<!-- Использование -->
<div class="price">[[*product_price:default=`Цена не указана`]] ₽</div>
```

**Textarea (Текстовая область):**
```html
<!-- Настройки -->
Тип ввода: Textarea
Параметры ввода: {"cols":"50","rows":"10"}

<!-- Использование -->
<div class="description">
    [[*product_description:nl2br]]
</div>
```

**RichText (HTML-редактор):**
```html
<!-- Настройки -->
Тип ввода: RichText
Параметры ввода: {"width":"100%","height":"400"}

<!-- Использование -->
<div class="content">
    [[*additional_content]]
</div>
```

### Списки и выборы

**DropDown List (Выпадающий список):**
```html
<!-- Настройки ввода -->
Тип ввода: DropDown List
Параметры ввода: 
Новинка==new||Хит продаж==hit||Скидка==sale||Обычный==normal

<!-- Использование -->
[[*product_label:switch=`
    new=<span class="label label-success">Новинка</span>
    hit=<span class="label label-danger">Хит продаж</span>
    sale=<span class="label label-warning">Скидка</span>
    default=
`]]
```

**Radio Options (Переключатели):**
```html
<!-- Параметры ввода -->
Да==1||Нет==0

<!-- Использование -->
[[*show_contacts:is=`1`:then=`
    <div class="contacts">[[*contact_info]]</div>
`]]
```

**Checkbox (Флажок):**
```html
<!-- Использование -->
[[*featured:is=`1`:then=`
    <div class="featured-badge">Рекомендуем</div>
`]]
```

### Файлы и изображения

**Image (Изображение):**
```html
<!-- Настройки вывода -->
Тип вывода: Image
Параметры вывода: w=300&h=200&zc=1

<!-- Использование -->
<div class="product-image">
    <img src="[[*product_image:phpthumb=`w=400&h=300&zc=1`]]" 
         alt="[[*pagetitle]]" loading="lazy">
</div>
```

**File (Файл):**
```html
<!-- Использование -->
[[*product_manual:notempty=`
    <div class="download">
        <a href="[[*product_manual]]" download>
            <i class="icon-download"></i> Скачать инструкцию
        </a>
    </div>
`]]
```

### Дата и время

**Date (Дата):**
```html
<!-- Настройки -->
Тип ввода: Date
Параметры ввода: {"format":"Y-m-d"}

<!-- Использование -->
<div class="event-date">
    [[*event_date:strtotime:date=`d.m.Y`]]
</div>
```

**DateTime (Дата и время):**
```html
<!-- Использование -->
<div class="event-datetime">
    Начало: [[*event_start:strtotime:date=`d.m.Y H:i`]]
</div>
```

## Продвинутые техники

### Связанные TV-поля

**Категории и подкатегории:**

TV-поле `category`:
```html
Тип: DropDown List
Параметры: @SELECT pagetitle as name, id as value FROM modx_site_content WHERE parent=5 AND published=1
```

TV-поле `subcategory`:
```html
Тип: DropDown List  
Параметры: @SELECT pagetitle as name, id as value FROM modx_site_content WHERE parent IN (SELECT tv_value FROM modx_site_tmplvar_contentvalues WHERE contentid=1 AND tmplvarid=5)
```

### Условная логика

**Показ блоков по условиям:**
```html
<!-- В зависимости от типа товара показываем разные блоки -->
[[*product_type:switch=`
    physical=<div class="shipping">[[*shipping_info]]</div>
    digital=<div class="download">[[*download_link]]</div>
    service=<div class="booking">[[*booking_form]]</div>
`]]
```

### Мультиязычность

**TV-поля для разных языков:**
```html
<!-- Создаём TV-поля для каждого языка -->
title_en, title_ru, title_de
description_en, description_ru, description_de

<!-- Вывод на нужном языке -->
<h1>[[*title_[[++cultureKey]]:default=`[[*pagetitle]]`]]</h1>
<p>[[*description_[[++cultureKey]]:default=`[[*content]]`]]</p>
```

## MIGX: мощные структуры данных

### Что такое MIGX

MIGX (Multi Items Grid for TV) — дополнение, которое превращает обычные TV-поля в мощные структуры данных с множественными элементами.

### Установка MIGX

1. **Дополнения** → **Установщик пакетов**
2. Найдите и установите **MIGX**
3. Очистите кэш

### Простой пример: галерея изображений

**Создание TV-поля с MIGX:**

1. Создайте TV-поле `gallery`
2. Тип ввода: **migx**
3. Конфигурация MIGX:

```json
{
    "formtabs": [
        {
            "caption": "Изображение",
            "fields": [
                {
                    "field": "title",
                    "caption": "Название"
                },
                {
                    "field": "image",
                    "caption": "Изображение",
                    "inputTV": "image"
                },
                {
                    "field": "description",
                    "caption": "Описание",
                    "inputTVtype": "textarea"
                }
            ]
        }
    ],
    "columns": [
        {
            "header": "Название",
            "dataIndex": "title"
        },
        {
            "header": "Изображение", 
            "dataIndex": "image",
            "renderer": "this.renderImage"
        }
    ]
}
```

### Вывод MIGX в шаблоне

**Сниппет для вывода галереи:**
```php
<?php
// getGallery
$tvName = $scriptProperties['tv'] ?? 'gallery';
$tpl = $scriptProperties['tpl'] ?? 'gallery-item';

$tvValue = $modx->resource->getTVValue($tvName);
if (empty($tvValue)) {
    return '';
}

$items = json_decode($tvValue, true);
if (!is_array($items)) {
    return '';
}

$output = [];
foreach ($items as $item) {
    // Добавляем обработку изображений
    if (!empty($item['image'])) {
        $item['image_thumb'] = $modx->runSnippet('phpthumb', [
            'input' => $item['image'],
            'options' => 'w=300&h=200&zc=1'
        ]);
    }
    
    $output[] = $modx->getChunk($tpl, $item);
}

return implode("\n", $output);
?>
```

**Чанк `gallery-item`:**
```html
<div class="gallery-item">
    <a href="[[+image]]" data-lightbox="gallery">
        <img src="[[+image_thumb]]" alt="[[+title]]" loading="lazy">
    </a>
    [[+title:notempty=`<h4>[[+title]]</h4>`]]
    [[+description:notempty=`<p>[[+description]]</p>`]]
</div>
```

**Использование:**
```html
<div class="gallery">
    [[!getGallery? &tv=`gallery` &tpl=`gallery-item`]]
</div>
```

### Сложные структуры MIGX

**Пример: характеристики товара**

MIGX конфигурация:
```json
{
    "formtabs": [
        {
            "caption": "Характеристика",
            "fields": [
                {
                    "field": "group",
                    "caption": "Группа",
                    "inputTVtype": "dropdown",
                    "inputOptionValues": "Основные==main||Технические==tech||Дополнительные==extra"
                },
                {
                    "field": "name",
                    "caption": "Название"
                },
                {
                    "field": "value", 
                    "caption": "Значение"
                },
                {
                    "field": "unit",
                    "caption": "Единица измерения"
                },
                {
                    "field": "sort",
                    "caption": "Порядок",
                    "inputTVtype": "number"
                }
            ]
        }
    ],
    "columns": [
        {
            "header": "Группа",
            "dataIndex": "group"
        },
        {
            "header": "Название",
            "dataIndex": "name"
        },
        {
            "header": "Значение",
            "dataIndex": "value"
        },
        {
            "header": "Порядок",
            "dataIndex": "sort"
        }
    ]
}
```

**Сниппет для вывода характеристик:**
```php
<?php
// getSpecifications
$tvValue = $modx->resource->getTVValue('specifications');
if (empty($tvValue)) {
    return '';
}

$items = json_decode($tvValue, true);
if (!is_array($items)) {
    return '';
}

// Группируем по группам и сортируем
$groups = [];
foreach ($items as $item) {
    $group = $item['group'] ?? 'other';
    $groups[$group][] = $item;
}

// Сортируем внутри групп
foreach ($groups as &$group) {
    usort($group, function($a, $b) {
        return ($a['sort'] ?? 0) - ($b['sort'] ?? 0);
    });
}

$output = [];
$groupNames = [
    'main' => 'Основные характеристики',
    'tech' => 'Технические характеристики', 
    'extra' => 'Дополнительные характеристики'
];

foreach ($groups as $groupKey => $specs) {
    $groupName = $groupNames[$groupKey] ?? 'Прочие характеристики';
    
    $output[] = '<div class="specs-group">';
    $output[] = '<h3>' . $groupName . '</h3>';
    $output[] = '<dl class="specs-list">';
    
    foreach ($specs as $spec) {
        $value = $spec['value'];
        if (!empty($spec['unit'])) {
            $value .= ' ' . $spec['unit'];
        }
        
        $output[] = '<dt>' . htmlspecialchars($spec['name']) . '</dt>';
        $output[] = '<dd>' . htmlspecialchars($value) . '</dd>';
    }
    
    $output[] = '</dl>';
    $output[] = '</div>';
}

return implode("\n", $output);
?>
```

### MIGX с вложенными структурами

**Пример: команда с социальными сетями**

```json
{
    "formtabs": [
        {
            "caption": "Сотрудник",
            "fields": [
                {
                    "field": "name",
                    "caption": "Имя"
                },
                {
                    "field": "position", 
                    "caption": "Должность"
                },
                {
                    "field": "photo",
                    "caption": "Фото",
                    "inputTV": "image"
                },
                {
                    "field": "bio",
                    "caption": "Биография",
                    "inputTVtype": "textarea"
                },
                {
                    "field": "social",
                    "caption": "Соцсети",
                    "inputTVtype": "migx",
                    "configs": "social-networks"
                }
            ]
        }
    ]
}
```

## Оптимизация TV-полей

### Кэширование TV-значений

```php
<?php
// Получаем TV-значения с кэшированием
function getTVValueCached($modx, $resourceId, $tvName, $cacheExpire = 3600) {
    $cacheKey = "tv_{$resourceId}_{$tvName}";
    
    $value = $modx->cacheManager->get($cacheKey);
    if ($value !== null) {
        return $value;
    }
    
    $resource = $modx->getObject('modResource', $resourceId);
    if ($resource) {
        $value = $resource->getTVValue($tvName);
        $modx->cacheManager->set($cacheKey, $value, $cacheExpire);
        return $value;
    }
    
    return '';
}
?>
```

### Пакетная загрузка TV-полей

```php
<?php
// Получаем TV-поля для множества ресурсов одним запросом
function getTVsForResources($modx, $resourceIds, $tvNames) {
    $query = $modx->newQuery('modTemplateVarResource');
    $query->where([
        'contentid:IN' => $resourceIds
    ]);
    
    $query->leftJoin('modTemplateVar', 'TV', 'TV.id = modTemplateVarResource.tmplvarid');
    $query->where(['TV.name:IN' => $tvNames]);
    
    $query->select([
        'modTemplateVarResource.contentid',
        'TV.name as tv_name',
        'modTemplateVarResource.value'
    ]);
    
    $tvData = $modx->getCollection('modTemplateVarResource', $query);
    
    // Организуем данные по ресурсам
    $result = [];
    foreach ($tvData as $item) {
        $resourceId = $item['contentid'];
        $tvName = $item['tv_name'];
        $value = $item['value'];
        
        $result[$resourceId][$tvName] = $value;
    }
    
    return $result;
}
?>
```

## Фильтры вывода для TV-полей

### Стандартные фильтры

```html
<!-- Ограничение длины -->
[[*description:limit=`100`]]

<!-- Форматирование даты -->
[[*event_date:strtotime:date=`d.m.Y`]]

<!-- Перевод строк в BR -->
[[*text_content:nl2br]]

<!-- Удаление HTML -->
[[*content:strip_tags]]

<!-- Замена пробелов -->
[[*title:replace=` ==-`]]

<!-- Приведение к числу -->
[[*price:tonumber:add=`100`]]

<!-- Условный вывод -->
[[*featured:is=`1`:then=`featured`:else=`normal`]]
```

### Пользовательские фильтры

```php
<?php
// Фильтр для форматирования цены
$modx->addPackage('modx.filters');

$modx->map['modOutputFilter']['formatPrice'] = function($input, $options, $tag) {
    $price = (float)$input;
    if ($price == 0) {
        return 'Цена не указана';
    }
    
    return number_format($price, 0, ',', ' ') . ' ₽';
};

// Использование: [[*price:formatPrice]]
?>
```

## Интеграция TV-полей с поиском

### Поиск по TV-полям

```php
<?php
// Сниппет для поиска по товарам
$query = $modx->newQuery('modResource');

// Базовые условия
$query->where([
    'published' => 1,
    'deleted' => 0,
    'template:IN' => [5] // ID шаблона товара
]);

// Поиск по цене
$priceFrom = $_GET['price_from'] ?? 0;
$priceTo = $_GET['price_to'] ?? 999999;

$query->leftJoin('modTemplateVarResource', 'PriceTV', [
    'PriceTV.contentid = modResource.id'
]);
$query->leftJoin('modTemplateVar', 'PriceTVDef', [
    'PriceTVDef.id = PriceTV.tmplvarid',
    'PriceTVDef.name' => 'price'
]);

$query->where([
    'PriceTV.value:>=' => $priceFrom,
    'PriceTV.value:<=' => $priceTo
]);

// Поиск по характеристикам
$brand = $_GET['brand'] ?? '';
if ($brand) {
    $query->leftJoin('modTemplateVarResource', 'BrandTV', [
        'BrandTV.contentid = modResource.id'
    ]);
    $query->leftJoin('modTemplateVar', 'BrandTVDef', [
        'BrandTVDef.id = BrandTV.tmplvarid',
        'BrandTVDef.name' => 'brand'
    ]);
    
    $query->where(['BrandTV.value:LIKE' => "%{$brand}%"]);
}

$products = $modx->getCollection('modResource', $query);
?>
```

## Миграция и экспорт TV-полей

### Экспорт TV-данных

```php
<?php
// Экспорт всех TV-полей ресурса в JSON
function exportTVs($modx, $resourceId) {
    $resource = $modx->getObject('modResource', $resourceId);
    if (!$resource) {
        return false;
    }
    
    $tvs = $resource->getTemplateVars();
    $data = [];
    
    foreach ($tvs as $tv) {
        $data[$tv->get('name')] = $tv->getValue($resourceId);
    }
    
    return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>
```

### Массовое обновление TV-полей

```php
<?php
// Массовое обновление TV-поля для группы ресурсов
function bulkUpdateTV($modx, $tvName, $value, $resourceIds) {
    $tv = $modx->getObject('modTemplateVar', ['name' => $tvName]);
    if (!$tv) {
        return false;
    }
    
    $updated = 0;
    foreach ($resourceIds as $resourceId) {
        $resource = $modx->getObject('modResource', $resourceId);
        if ($resource) {
            $resource->setTVValue($tvName, $value);
            $updated++;
        }
    }
    
    return $updated;
}
?>
```

## Заключение

TV-поля — мощный инструмент для создания гибких структур данных в MODX. Основные принципы работы с TV-полями:

1. **Планируйте структуру** заранее — проще создать правильно, чем переделывать
2. **Используйте подходящие типы ввода** для каждого случая
3. **MIGX для сложных структур** — лучше чем множество отдельных TV-полей
4. **Оптимизируйте производительность** — кэшируйте и группируйте запросы
5. **Документируйте назначение** каждого TV-поля
6. **Тестируйте с реальными данными** в разных объёмах

TV-поля превращают MODX из простой CMS в мощный фреймворк для любых задач — от лендингов до сложных каталогов и порталов.

---

*Хотите изучить все элементы MODX? Читайте полный обзор «[Элементы MODX: шаблоны, чанки, сниппеты](/blog/modx-elementy-shablony-chanki-snippety/)» — всё о системе элементов в одном месте.*

## Полезные ресурсы

- [Документация по TV-полям](https://docs.modx.com/revolution/2.x/making-sites-with-modx/customizing-content/template-variables)
- [MIGX документация](https://docs.modx.com/extras/revo/migx)
- [Фильтры вывода](https://docs.modx.com/revolution/2.x/making-sites-with-modx/customizing-content/input-and-output-filters)

## Чек-лист TV-поля

- [ ] Говорящее имя поля (без пробелов, snake_case)
- [ ] Понятный заголовок для редакторов
- [ ] Описание назначения поля
- [ ] Правильный тип ввода
- [ ] Значение по умолчанию (если нужно)
- [ ] Привязка к нужным шаблонам
- [ ] Группировка в логические категории
- [ ] Тестирование с разными типами данных
- [ ] Документация для команды