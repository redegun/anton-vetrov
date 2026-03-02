---
title: "Фильтрация товаров на MODX: mFilter2, mSearch2"
description: "Настройка фильтрации товаров в интернет-магазине на MODX: mFilter2 и mSearch2, создание удобных фильтров по характеристикам, цене и производителю."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-filtracija-mfilter2.webp"
tags: ["MODX", "mFilter2", "mSearch2", "Фильтрация", "Интернет-магазин"]
draft: false
---

# Фильтрация товаров на MODX: mFilter2, mSearch2

Удобная фильтрация — основа успешного интернет-магазина. Пользователи должны быстро находить нужные товары среди тысяч позиций. В MODX для этого есть два мощных инструмента: mFilter2 для фильтрации по характеристикам и mSearch2 для полнотекстового поиска. Расскажу, как настроить их для максимальной эффективности.

## Обзор решений для фильтрации

### mFilter2 — фильтрация по характеристикам

**Возможности:**
- Фильтры по TV-параметрам и опциям miniShop2
- Поддержка числовых диапазонов (цена, размер)
- Множественный выбор значений
- AJAX обновление без перезагрузки страницы
- Интеграция с pdoPage для пагинации

### mSearch2 — полнотекстовый поиск

**Возможности:**
- Поиск по названию, описанию, артикулу
- Автодополнение запросов
- Поиск по синонимам и морфологии
- Интеграция с Elasticsearch для больших каталогов
- Поисковая аналитика

### Зачем использовать оба

Связка mFilter2 + mSearch2 покрывает все потребности пользователей:
- **mFilter2** — для уточнения по параметрам («красные платья размера M»)
- **mSearch2** — для поиска по названию («iPhone 15 Pro»)

## Установка и базовая настройка

### Установка компонентов

```bash
# В менеджере MODX через Управление пакетами:
# 1. miniShop2 (если ещё не установлен)
# 2. mSearch2
# 3. mFilter2
# 4. pdoTools (зависимость)
```

### Настройка индекса mSearch2

```php
// Системные настройки mSearch2
'mse2_index_fields' => 'pagetitle,description,content,article,vendor.name'
'mse2_exclude_fields' => 'password,email'  
'mse2_search_class' => 'msProduct'
```

**Запуск индексации:**
```bash
# В терминале сервера
php manager/index.php --action=index --class=mSearch2\\
```

Или через планировщик cron:
```bash
# Ежедневная переиндексация в 2:00
0 2 * * * /usr/bin/php /path/to/modx/manager/index.php --action=index --class=mSearch2
```

## Создание каталога с фильтрацией

### Основной шаблон каталога

```html
<!DOCTYPE html>
<html>
<head>
    <title>[[*pagetitle]] - каталог товаров</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="catalog-container">
        <!-- Поиск -->
        <div class="search-block">
            [[!mSearch2? 
                &tpl=`tpl.mSearch2.row`
                &limit=`12`
                &outputSeparator=``
                &ajaxMode=`scroll`
                &showResults=`0`
            ]]
        </div>
        
        <!-- Фильтры -->
        <div class="filters-sidebar">
            [[!mFilter2?
                &class=`msProduct`
                &parents=`[[*id]]`
                &tpl=`tpl.msProducts.row`
                &limit=`12`
                &ajaxMode=`default`
                &filters=`vendor,price,color,size,material`
                &suggestionsRadio=`vendor`
                &suggestionsCheckbox=`color,size,material`  
                &suggestionsSlider=`price`
            ]]
        </div>
        
        <!-- Результаты -->
        <div class="products-grid">
            <div id="mse2_results">
                <!-- Товары загружаются через AJAX -->
            </div>
        </div>
    </div>
</body>
</html>
```

### Чанки для фильтров

**Фильтр по производителю (tpl.mFilter2.outer.vendor):**
```html
<div class="filter-group">
    <h3>Производитель</h3>
    <div class="filter-options">
        [[+rows]]
    </div>
</div>
```

**Опции производителя (tpl.mFilter2.row.vendor):**
```html
<label class="filter-option">
    <input type="radio" name="vendor" value="[[+value]]" [[+selected]]>
    <span class="filter-label">[[+title]] ([[+num]])</span>
</label>
```

**Фильтр-слайдер для цены (tpl.mFilter2.outer.price):**
```html
<div class="filter-group">
    <h3>Цена, руб.</h3>
    <div class="price-slider">
        <div id="price-range" 
             data-min="[[+min]]" 
             data-max="[[+max]]"
             data-value-min="[[+value_min]]"
             data-value-max="[[+value_max]]">
        </div>
        <div class="price-inputs">
            <input type="number" name="price_min" value="[[+value_min]]" placeholder="от">
            <span>—</span>
            <input type="number" name="price_max" value="[[+value_max]]" placeholder="до">
        </div>
    </div>
</div>
```

**Множественный выбор для цветов (tpl.mFilter2.outer.color):**
```html
<div class="filter-group">
    <h3>Цвет</h3>
    <div class="filter-checkboxes">
        [[+rows]]
    </div>
</div>
```

**Опции цветов (tpl.mFilter2.row.color):**
```html
<label class="filter-checkbox">
    <input type="checkbox" name="color[]" value="[[+value]]" [[+selected]]>
    <span class="color-swatch" style="background-color: [[+value]];"></span>
    <span class="filter-label">[[+title]] ([[+num]])</span>
</label>
```

## Настройка поиска mSearch2

### Форма поиска с автодополнением

```html
<!-- Чанк: tpl.mSearch2.form -->
<form class="search-form" id="mse2_form">
    <div class="search-input-wrapper">
        <input type="text" 
               name="query" 
               placeholder="Поиск товаров..." 
               value="[[+mse2_query]]"
               autocomplete="off"
               id="mse2_query">
        
        <div id="mse2_suggestions" class="search-suggestions">
            <!-- Автодополнение -->
        </div>
    </div>
    
    <button type="submit" class="search-btn">
        Найти
    </button>
    
    <div class="search-filters">
        <select name="category" id="mse2_category">
            <option value="">Все категории</option>
            [[pdoMenu? 
                &parents=`[[mse2_get_parents]]`
                &level=`1`
                &tpl=`@INLINE <option value="[[+id]]" [[+mse2_selected]]>[[+menutitle]]</option>`
            ]]
        </select>
        
        <select name="sort" id="mse2_sort">
            <option value="publishedon|desc">По новизне</option>
            <option value="price|asc">По цене ↑</option>
            <option value="price|desc">По цене ↓</option>
            <option value="rank|desc">По релевантности</option>
        </select>
    </div>
</form>
```

### Шаблон результатов поиска

```html
<!-- Чанк: tpl.mSearch2.row -->
<div class="product-card" data-id="[[+id]]">
    <div class="product-image">
        <a href="[[+uri]]">
            [[+thumb:is=``:then=`
                <img src="[[+image]]" alt="[[+pagetitle]]" loading="lazy">
            `:else=`
                [[msGallery? &id=`[[+id]]` &tpl=`tpl.msGallery.thumb` &limit=`1`]]
            `]]
        </a>
        
        [[+old_price:gt=`[[+price]]`:then=`
            <div class="product-badge sale">Скидка</div>
        `]]
    </div>
    
    <div class="product-info">
        <h3 class="product-title">
            <a href="[[+uri]]">[[+pagetitle]]</a>
        </h3>
        
        <div class="product-vendor">[[+vendor.name]]</div>
        
        <div class="product-description">
            [[+description:limit=`150`]]
        </div>
        
        <div class="product-properties">
            [[+color:notempty=`<span class="prop">Цвет: [[+color]]</span>`]]
            [[+size:notempty=`<span class="prop">Размер: [[+size]]</span>`]]
        </div>
        
        <div class="product-price">
            [[+old_price:gt=`[[+price]]`:then=`
                <span class="price-old">[[+old_price]] ₽</span>
            `]]
            <span class="price-current">[[+price]] ₽</span>
        </div>
        
        <div class="product-actions">
            [[+count:gt=`0`:then=`
                <button class="btn-cart" data-id="[[+id]]">В корзину</button>
            `:else=`
                <button class="btn-notify" data-id="[[+id]]">Сообщить о поступлении</button>
            `]]
            
            <button class="btn-favorite" data-id="[[+id]]">♡</button>
        </div>
    </div>
</div>
```

## Продвинутая настройка фильтров

### Создание кастомного фильтра по брендам

```php
<?php
// Сниппет: CustomBrandFilter
$brands = $modx->getCollection('msVendor', ['active' => 1]);
$currentBrand = $_GET['vendor'] ?? '';

$output = '<div class="brand-filter">';
$output .= '<h3>Бренды</h3>';

foreach ($brands as $brand) {
    $count = $modx->getCount('msProduct', [
        'vendor' => $brand->get('id'),
        'published' => 1,
        'deleted' => 0
    ]);
    
    if ($count > 0) {
        $selected = ($currentBrand == $brand->get('id')) ? 'checked' : '';
        $logo = $brand->get('logo') ? '<img src="' . $brand->get('logo') . '" alt="' . $brand->get('name') . '">' : '';
        
        $output .= '<label class="brand-option">';
        $output .= '<input type="radio" name="vendor" value="' . $brand->get('id') . '" ' . $selected . '>';
        $output .= $logo;
        $output .= '<span>' . $brand->get('name') . ' (' . $count . ')</span>';
        $output .= '</label>';
    }
}

$output .= '</div>';
return $output;
```

### Фильтр по наличию и доставке

```php
<?php
// Сниппет: AvailabilityFilter
$filters = [
    'in_stock' => 'В наличии',
    'quick_delivery' => 'Быстрая доставка', 
    'free_delivery' => 'Бесплатная доставка'
];

$output = '<div class="availability-filter">';
$output .= '<h3>Наличие и доставка</h3>';

foreach ($filters as $key => $label) {
    $checked = !empty($_GET[$key]) ? 'checked' : '';
    
    $output .= '<label class="availability-option">';
    $output .= '<input type="checkbox" name="' . $key . '" value="1" ' . $checked . '>';
    $output .= '<span>' . $label . '</span>';
    $output .= '</label>';
}

$output .= '</div>';
return $output;
```

### Интеграция с рейтингами

```php
<?php
// Модификация mFilter2 для учёта рейтингов
// В файле core/components/mfilter2/processors/web/filter.class.php

public function addRatingFilter($c, $filter_key) {
    $rating = $this->getProperty($filter_key);
    if (empty($rating)) return $c;
    
    // Подключаем таблицу отзывов
    $c->leftJoin('TicketComment', 'Comments', [
        'Comments.parent = msProduct.id',
        'Comments.published' => 1
    ]);
    
    // Группируем и фильтруем по среднему рейтингу
    $c->select('AVG(Comments.rating) as avg_rating');
    $c->groupby('msProduct.id');
    $c->having('avg_rating >= ' . (float)$rating);
    
    return $c;
}
```

## JavaScript для улучшения UX

### Автоматическое обновление фильтров

```javascript
// assets/js/catalog-filters.js
(function($) {
    'use strict';
    
    var CatalogFilters = {
        init: function() {
            this.bindEvents();
            this.initPriceSlider();
            this.initSearch();
        },
        
        bindEvents: function() {
            // Автоматическая отправка при изменении фильтров
            $(document).on('change', '.filter-option input', function() {
                CatalogFilters.applyFilters();
            });
            
            // Дебаунс для текстовых полей
            $(document).on('input', '.price-inputs input', 
                CatalogFilters.debounce(function() {
                    CatalogFilters.applyFilters();
                }, 500)
            );
            
            // Очистка фильтров
            $(document).on('click', '.clear-filters', function() {
                CatalogFilters.clearFilters();
            });
        },
        
        applyFilters: function() {
            var data = $('#mse2_form, .filters-form').serialize();
            
            // Показываем лоадер
            $('.products-grid').addClass('loading');
            
            $.post('/assets/connectors/mfilter2/connector.php', data)
                .done(function(response) {
                    if (response.success) {
                        $('.products-grid').html(response.data.output);
                        CatalogFilters.updateUrl(data);
                        CatalogFilters.updateFilterCounts(response.data.filters);
                    }
                })
                .always(function() {
                    $('.products-grid').removeClass('loading');
                });
        },
        
        initPriceSlider: function() {
            var $slider = $('#price-range');
            if (!$slider.length) return;
            
            var min = parseInt($slider.data('min'));
            var max = parseInt($slider.data('max'));
            var valueMin = parseInt($slider.data('value-min')) || min;
            var valueMax = parseInt($slider.data('value-max')) || max;
            
            // Используем noUiSlider для красивого слайдера
            if (typeof noUiSlider !== 'undefined') {
                noUiSlider.create($slider[0], {
                    start: [valueMin, valueMax],
                    connect: true,
                    range: {
                        'min': min,
                        'max': max
                    },
                    format: {
                        to: function(value) {
                            return Math.round(value);
                        },
                        from: function(value) {
                            return Number(value);
                        }
                    }
                });
                
                $slider[0].noUiSlider.on('change', function(values) {
                    $('input[name="price_min"]').val(values[0]);
                    $('input[name="price_max"]').val(values[1]);
                    CatalogFilters.applyFilters();
                });
            }
        },
        
        initSearch: function() {
            var $input = $('#mse2_query');
            var $suggestions = $('#mse2_suggestions');
            
            $input.on('input', CatalogFilters.debounce(function() {
                var query = $input.val().trim();
                
                if (query.length >= 2) {
                    $.get('/assets/connectors/msearch2/connector.php', {
                        action: 'suggest',
                        query: query,
                        limit: 8
                    })
                    .done(function(response) {
                        if (response.success && response.data.length) {
                            var html = '';
                            response.data.forEach(function(item) {
                                html += '<div class="suggestion-item" data-query="' + item.query + '">';
                                html += item.title;
                                html += '</div>';
                            });
                            $suggestions.html(html).show();
                        } else {
                            $suggestions.hide();
                        }
                    });
                } else {
                    $suggestions.hide();
                }
            }, 300));
            
            // Выбор из автодополнения
            $(document).on('click', '.suggestion-item', function() {
                var query = $(this).data('query');
                $input.val(query);
                $suggestions.hide();
                $('#mse2_form').submit();
            });
            
            // Скрытие подсказок при клике вне поиска
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.search-input-wrapper').length) {
                    $suggestions.hide();
                }
            });
        },
        
        updateUrl: function(data) {
            // Обновляем URL без перезагрузки страницы
            var params = new URLSearchParams(data);
            var newUrl = window.location.pathname + '?' + params.toString();
            history.replaceState({}, '', newUrl);
        },
        
        updateFilterCounts: function(filters) {
            // Обновляем количество товаров в фильтрах
            Object.keys(filters).forEach(function(key) {
                Object.keys(filters[key]).forEach(function(value) {
                    var $option = $('.filter-option input[name="' + key + '"][value="' + value + '"]');
                    var $label = $option.siblings('.filter-label');
                    
                    if ($label.length) {
                        var text = $label.text().replace(/\(\d+\)/, '(' + filters[key][value] + ')');
                        $label.text(text);
                    }
                });
            });
        },
        
        clearFilters: function() {
            $('.filter-option input').prop('checked', false);
            $('.price-inputs input').val('');
            this.applyFilters();
        },
        
        debounce: function(func, wait) {
            var timeout;
            return function executedFunction() {
                var later = function() {
                    clearTimeout(timeout);
                    func.apply(this, arguments);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };
    
    $(document).ready(function() {
        CatalogFilters.init();
    });
    
})(jQuery);
```

## Оптимизация производительности

### Кеширование фильтров

```php
<?php
// Плагин: FilterCache
// События: OnBeforeManagerPageInit, OnDocFormSave

switch ($modx->event->name) {
    case 'OnDocFormSave':
        $resource = $modx->event->params['resource'];
        
        // Очищаем кеш фильтров при изменении товара
        if ($resource instanceof msProduct) {
            $modx->cacheManager->delete('filter_options_' . $resource->get('parent'));
            $modx->cacheManager->delete('mse2_index');
        }
        break;
}

// В сниппете фильтра используем кеш
$cacheKey = 'filter_options_' . $modx->resource->get('id');
$options = $modx->cacheManager->get($cacheKey);

if (!$options) {
    // Генерируем опции фильтра
    $options = generateFilterOptions();
    $modx->cacheManager->set($cacheKey, $options, 3600); // 1 час
}
```

### Индексы базы данных

```sql
-- Для ускорения фильтрации по опциям
CREATE INDEX idx_ms_product_options_filter ON modx_ms2_product_options (key, value, product_id);

-- Для быстрого поиска
CREATE FULLTEXT INDEX idx_ms_products_search ON modx_ms2_products (pagetitle, description, content);

-- Для фильтра по цене
CREATE INDEX idx_ms_products_price ON modx_ms2_products (price, published, deleted);

-- Для сортировки
CREATE INDEX idx_ms_products_sort ON modx_ms2_products (publishedon, price, pagetitle);
```

### AJAX-пагинация

```javascript
// Подгрузка товаров при прокрутке
var isLoading = false;
var hasMore = true;
var currentPage = 1;

$(window).scroll(function() {
    if (!isLoading && hasMore && $(window).scrollTop() + $(window).height() >= $(document).height() - 1000) {
        loadMoreProducts();
    }
});

function loadMoreProducts() {
    if (isLoading) return;
    
    isLoading = true;
    currentPage++;
    
    var data = $('#mse2_form').serialize() + '&page=' + currentPage;
    
    $.post('/assets/connectors/mfilter2/connector.php', data)
        .done(function(response) {
            if (response.success && response.data.output.trim()) {
                $('.products-grid').append(response.data.output);
            } else {
                hasMore = false;
            }
        })
        .always(function() {
            isLoading = false;
        });
}
```

## Заключение

Эффективная фильтрация товаров в MODX требует правильной настройки mFilter2 и mSearch2. Ключевые принципы успешной реализации:

1. **Продумайте структуру фильтров** — не перегружайте интерфейс
2. **Оптимизируйте производительность** — используйте кеширование и индексы
3. **Улучшайте UX** — автодополнение, AJAX, сохранение состояния
4. **Тестируйте на реальных данных** — производительность может отличаться

Правильно настроенная фильтрация повышает конверсию интернет-магазина на 20-40%, так как пользователи быстрее находят нужные товары. MODX даёт все инструменты для создания мощной и гибкой системы поиска.

---

*Связанные статьи: [Создание каталога товаров на MODX](/blog/modx-katalog-tovarov/)*