---
title: "pdoTools: полное руководство по главному пакету MODX"
description: "Все о pdoTools в MODX Revolution: установка, настройка, примеры использования pdoResources, pdoMenu, pdoUsers и других сниппетов пакета."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-pdotools-rukovodstvo.webp"
tags: ["MODX", "pdoTools", "Сниппеты", "Optimization"]
draft: false
---


pdoTools — это самый важный пакет дополнений для MODX Revolution после самой системы. Созданный Василием Наумкиным, он кардинально изменил подход к выборке и выводу данных в MODX, заменив медленные стандартные сниппеты быстрыми и функциональными аналогами.

## Что такое pdoTools и почему он важен

pdoTools — это набор сниппетов, который решает главную проблему стандартных сниппетов MODX — низкую производительность. Если getResources может загрузить сервер при работе с сотней ресурсов, то pdoResources справится с тысячами без особых проблем.

### Ключевые преимущества

- **Скорость** — в 10-100 раз быстрее стандартных сниппетов
- **Гибкость** — богатые возможности фильтрации и сортировки  
- **Совместимость** — работает с Fenom шаблонизатором
- **Функциональность** — покрывает 90% задач по выводу контента

### Состав пакета

pdoTools включает в себя несколько ключевых сниппетов:

- **pdoResources** — выборка ресурсов (замена getResources)
- **pdoMenu** — создание меню (замена Wayfinder)
- **pdoUsers** — работа с пользователями (замена getUsers)
- **pdoSitemap** — генерация карты сайта
- **pdoCrumbs** — хлебные крошки
- **pdoNeighbors** — навигация вперед/назад
- **pdoPage** — пагинация

## Установка и первоначальная настройка

### Установка через менеджер пакетов

1. Зайдите в Управление → Установщики пакетов
2. Найдите "pdoTools" в репозитории
3. Нажмите "Загрузить" и затем "Установить"

### Системные настройки

После установки рекомендуется настроить следующие параметры в Система → Настройки системы:

```
pdotools_elements_path = {core_path}elements/
pdotools_fenom_default = true
pdotools_fenom_php = true
```

### Проверка работоспособности

Создайте тестовую страницу с простым вызовом:

```
[[pdoResources? &parents=`0` &depth=`1` &limit=`5`]]
```

Если появился список страниц первого уровня — всё установлено корректно.

## pdoResources — основа всех выборок

pdoResources — это сердце pdoTools. Он заменяет getResources и множество других сниппетов для выборки ресурсов.

### Базовый синтаксис

```
[[pdoResources?
    &parents=`5`
    &depth=`1`
    &limit=`10`
    &sortby=`publishedon`
    &sortdir=`DESC`
]]
```

### Основные параметры

#### Выборка по родителям

```
<!-- Ресурсы из конкретного контейнера -->
&parents=`5`

<!-- Из нескольких контейнеров -->
&parents=`5,10,15`

<!-- Исключить определенные контейнеры -->
&parents=`5,-10`

<!-- Глубина вложенности -->
&depth=`2`
```

#### Фильтрация

```
<!-- По шаблону -->
&where=`{"template": 5}`

<!-- По нескольким условиям -->
&where=`{"published": 1, "template:IN": [5,6,7]}`

<!-- По TV полям -->
&includeTVs=`price,gallery`
&where=`{"price:>": 1000}`

<!-- По дате -->
&where=`{"publishedon:>": "2026-01-01"}`
```

#### Сортировка

```
<!-- Простая сортировка -->
&sortby=`publishedon`
&sortdir=`DESC`

<!-- Множественная сортировка -->
&sortby=`{"menuindex": "ASC", "publishedon": "DESC"}`

<!-- Случайная сортировка -->
&sortby=`RAND()`
```

### Продвинутые возможности

#### Работа с TV полями

```
[[pdoResources?
    &parents=`5`
    &includeTVs=`price,gallery,featured`
    &processTVs=`1`
    &tvPrefix=``
    &where=`{"featured": "Yes"}`
]]
```

#### Вложенные запросы

```
<!-- Ресурсы с определенным количеством детей -->
&where=`{"id:IN": (SELECT parent FROM modx_site_content WHERE published = 1 GROUP BY parent HAVING COUNT(*) > 3)}`
```

#### Элементы оформления

```
&tpl=`tpl.item`
&tplWrapper=`tpl.wrapper`
&tplFirst=`tpl.item.first`
&tplLast=`tpl.item.last`
&tplOdd=`tpl.item.odd`
&separatorr=`, `
```

## pdoMenu — создание навигации

pdoMenu заменяет устаревший Wayfinder и предоставляет мощные возможности для создания меню любой сложности.

### Простое меню

```
[[pdoMenu?
    &parents=`0`
    &level=`1`
]]
```

### Многоуровневое меню

```
[[pdoMenu?
    &parents=`0`
    &level=`3`
    &tplInner=`tpl.menu.inner`
    &tplParentRow=`tpl.menu.parent`
]]
```

### Шаблоны для меню

**tpl.menu.outer:**
```html
<ul class="nav nav-main[[+classes]]">
[[+wrapper]]
</ul>
```

**tpl.menu.row:**
```html
<li class="nav-item[[+classes]]">
    <a href="[[+link]]" class="nav-link[[+classes]]">
        [[+menutitle:default=`[[+pagetitle]]`]]
    </a>
    [[+wrapper]]
</li>
```

### Параметры pdoMenu

```
<!-- Исключить определенные ресурсы -->
&resources=`-5,-10`

<!-- Показать только опубликованные -->
&showHidden=`0`
&showUnpublished=`0`

<!-- Кеширование -->
&cache=`1`
&cacheTime=`3600`

<!-- Пользовательские поля -->
&select=`{"modResource": "*", "modTemplate": "templatename"}`
```

## pdoUsers — работа с пользователями

pdoUsers позволяет выводить списки пользователей с гибкой фильтрацией и форматированием.

### Базовое использование

```
[[pdoUsers?
    &limit=`10`
    &sortby=`createdon`
    &sortdir=`DESC`
    &tpl=`tpl.user.row`
]]
```

### Фильтрация пользователей

```
<!-- По группам пользователей -->
&groups=`Administrators,Editors`

<!-- По статусу -->
&active=`1`

<!-- По профилю -->
&where=`{"Profile.email:!LIKE": "%@example.com"}`
```

### Шаблон пользователя

**tpl.user.row:**
```html
<div class="user-card">
    <h3>[[+fullname:default=`[[+username]]`]]</h3>
    <p>[[+Profile.email]]</p>
    <small>Зарегистрирован: [[+createdon:date=`%d.%m.%Y`]]</small>
</div>
```

## Специализированные сниппеты

### pdoCrumbs — хлебные крошки

```
[[pdoCrumbs?
    &tpl=`tpl.crumb`
    &tplCurrent=`tpl.crumb.current`
    &tplMax=`tpl.crumb.max`
    &showHome=`1`
]]
```

### pdoNeighbors — навигация

```
[[pdoNeighbors?
    &tplPrev=`<a href="[[+uri]]">← [[+menutitle]]</a>`
    &tplNext=`<a href="[[+uri]]">[[+menutitle]] →</a>`
    &tplUp=`<a href="[[+uri]]">↑ [[+menutitle]]</a>`
]]
```

### pdoSitemap — карта сайта

```
[[pdoSitemap?
    &parents=`0`
    &templates=`2,3,4`
    &level=`3`
    &tpl=`tpl.sitemap.row`
    &tplWrapper=`tpl.sitemap.wrapper`
]]
```

## Оптимизация и производительность

### Настройка кеширования

```
<!-- Кеширование на уровне сниппета -->
&cache=`1`
&cacheTime=`3600`
&cacheKey=`unique_key_here`

<!-- Очистка кеша по времени -->
&cacheExpires=`86400`
```

### Оптимизация запросов

```
<!-- Выбрать только нужные поля -->
&select=`{"modResource": "id,pagetitle,alias,content"}`

<!-- Исключить ненужные данные -->
&includeContent=`0`
&includeTVs=`price,image`
&processTVs=`1`
```

### Использование prepare хуков

```php
// В сниппете prepareData
switch($scriptProperties['object']->get('template')) {
    case 5: // Шаблон товара
        $scriptProperties['object']->set('price', 
            number_format($scriptProperties['object']->get('price'), 2)
        );
        break;
}
return '';
```

```
[[pdoResources?
    &parents=`5`
    &tpl=`tpl.product`
    &prepareSnippet=`prepareData`
]]
```

## Интеграция с другими дополнениями

pdoTools отлично работает с популярными дополнениями MODX. Подробнее о лучших дополнениях можно узнать в статье [Топ дополнений MODX](/blog/modx-dopolneniya-top/).

### miniShop2

```
<!-- Товары в категории -->
[[pdoResources?
    &class=`msProduct`
    &parents=`5`
    &includeTVs=`ms2_price,ms2_article`
    &tpl=`tpl.msProducts.row`
]]
```

### Collections

```
<!-- Элементы коллекции -->
[[pdoResources?
    &parents=`[[*id]]`
    &showHidden=`1`
    &context=`web`
    &tpl=`tpl.collection.item`
]]
```

### Tickets

```
<!-- Последние тикеты -->
[[pdoResources?
    &class=`Ticket`
    &parents=`0`
    &depth=`10`
    &limit=`5`
    &tpl=`tpl.Tickets.row`
]]
```

## Работа с пагинацией

### pdoPage для разбивки на страницы

```
[[pdoPage?
    &element=`pdoResources`
    &parents=`5`
    &limit=`10`
    &tpl=`tpl.row`
    &pageLimit=`5`
]]

<!-- Навигация по страницам -->
[[+page.nav]]
```

### Настройка навигации

```
&tplPage=`<a href="[[+href]]">[[+pageNo]]</a>`
&tplPageActive=`<span class="active">[[+pageNo]]</span>`
&tplPagePrev=`<a href="[[+href]]">← Назад</a>`
&tplPageNext=`<a href="[[+href]]">Вперед →</a>`
```

## Отладка и диагностика

### Включение отладки

```
&showLog=`1`
&debug=`1`
```

### Анализ производительности

```
&timing=`1`
&showSQL=`1`
```

### Логирование запросов

```php
// В системных настройках
log_level = MODX_LOG_LEVEL_INFO
log_target = FILE
```

## Лучшие практики

### Структура чанков

Организуйте чанки по принципу:
- `tpl.resource.row` — элемент списка
- `tpl.resource.wrapper` — обертка списка  
- `tpl.resource.empty` — пустой результат

### Кеширование

```
<!-- Долгий кеш для статичных данных -->
&cache=`1`
&cacheTime=`86400`

<!-- Короткий кеш для динамичных данных -->
&cache=`1` 
&cacheTime=`300`
```

### Безопасность

```
<!-- Фильтрация пользовательского ввода -->
&where=`{"pagetitle:LIKE": "[[!+search:htmlent]]%"}`

<!-- Проверка прав доступа -->
&checkPermissions=`load,list,view`
```

### Оптимизация для больших каталогов

```
<!-- Индексация в базе данных -->
ALTER TABLE modx_site_tmplvar_contentvalues 
ADD INDEX idx_tmplvarid_contentid (tmplvarid, contentid);

<!-- Лимиты для предотвращения перегрузки -->
&limit=`50`
&maxLimit=`100`
```

## Частые ошибки и их решение

### Проблемы с производительностью

**Проблема:** Медленная загрузка при большом количестве ресурсов

**Решение:**
```
<!-- Ограничить выборку -->
&includeContent=`0`
&select=`{"modResource": "id,pagetitle,alias,publishedon"}`

<!-- Использовать кеш -->
&cache=`1`
&cacheTime=`3600`
```

### Ошибки в запросах

**Проблема:** Неправильная работа фильтров

**Решение:**
```
<!-- Правильная запись JSON -->
&where=`{"template": 5, "published": 1}`

<!-- Экранирование спецсимволов -->
&where=`{"pagetitle:LIKE": "%тест%"}`
```

### Проблемы с TV полями

**Проблема:** TV поля не выводятся

**Решение:**
```
&includeTVs=`price,gallery`
&processTVs=`1`
&tvPrefix=``
```

## Заключение

pdoTools — это must-have дополнение для любого проекта на MODX Revolution. Он не просто ускоряет работу сайта, но и предоставляет современные инструменты для работы с данными.

Основные рекомендации:

1. **Всегда используйте pdoResources** вместо getResources
2. **Настройте кеширование** для повышения производительности  
3. **Изучите возможности фильтрации** для точных выборок
4. **Используйте prepare хуки** для сложной обработки данных
5. **Мониторьте производительность** с помощью отладки

pdoTools превратит ваш MODX сайт в быструю и эффективную платформу для любых задач — от простого корпоративного сайта до крупного интернет-магазина.
