---
title: "Fenom в MODX: синтаксис, примеры, переход с тегов"
description: "Полное руководство по шаблонизатору Fenom в MODX Revolution. Синтаксис, функции, фильтры и переход с тегов MODX на современный подход."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-fenom-shablonizator.webp"
tags: ["MODX", "Fenom", "Шаблоны", "Frontend"]
draft: false
---

# Fenom в MODX: синтаксис, примеры, переход с тегов MODX

Fenom — это мощный PHP-шаблонизатор, который кардинально изменил подход к созданию шаблонов в MODX Revolution. Если вы до сих пор используете теги MODX, то после изучения Fenom поймете, насколько проще и элегантнее может быть работа с шаблонами.

## Что такое Fenom и зачем он нужен

Fenom (ранее известный как Twig for MODX) — это современный шаблонизатор, который позволяет писать более чистый и читаемый код шаблонов. Основные преимущества:

- **Читаемость** — синтаксис интуитивно понятен даже новичкам
- **Безопасность** — автоматическое экранирование XSS
- **Производительность** — компиляция шаблонов в PHP-код
- **Функциональность** — богатый набор фильтров и функций

### История появления в MODX

В MODX Revolution 2.4.0 Fenom стал основным шаблонизатором, заменив устаревшие теги MODX. Хотя старые теги продолжают работать для обратной совместимости, все новые проекты рекомендуется создавать на Fenom.

## Основы синтаксиса Fenom

### Основные конструкции

Fenom использует фигурные скобки для обозначения логики шаблона:

```smarty
{* Это комментарий в Fenom *}

{* Вывод переменной *}
{$pagetitle}

{* Вывод с фильтром *}
{$content | truncate : 100}

{* Условие *}
{if $user.id}
    Добро пожаловать, {$user.username}!
{else}
    Необходимо авторизоваться
{/if}

{* Цикл *}
{foreach $resources as $resource}
    <h3>{$resource.pagetitle}</h3>
{/foreach}
```

### Переменные и их типы

В Fenom доступны все плейсхолдеры MODX, но синтаксис обращения к ним изменился:

```smarty
{* Старый MODX тег *}
[[*pagetitle]]

{* Новый Fenom синтаксис *}
{$_modx->resource.pagetitle}
{* или сокращенно *}
{$pagetitle}
```

### Массивы и объекты

```smarty
{* Доступ к элементу массива *}
{$user.profile.email}

{* Проверка существования *}
{if $user.profile.email?}
    Email: {$user.profile.email}
{/if}

{* Альтернативное значение *}
{$user.profile.phone ?: 'Не указан'}
```

## Фильтры в Fenom

Фильтры — это мощный инструмент для обработки данных прямо в шаблоне:

### Текстовые фильтры

```smarty
{* Обрезка текста *}
{$content | truncate : 200}

{* Очистка от HTML *}
{$content | strip_tags}

{* Первая заглавная буква *}
{$title | capitalize}

{* Замена *}
{$content | replace : 'старый текст' : 'новый текст'}

{* Экранирование HTML *}
{$user_input | escape}
```

### Числовые фильтры

```smarty
{* Форматирование чисел *}
{$price | number_format : 2 : ',' : ' '}

{* Математические операции *}
{$count | math : '+' : 5}

{* Округление *}
{$average | round : 2}
```

### Фильтры даты

```smarty
{* Форматирование даты *}
{$publishedon | date : 'd.m.Y H:i'}

{* Относительная дата *}
{$createdon | date_modify : '+1 day' | date : 'd.m.Y'}
```

## Условная логика

### Простые условия

```smarty
{if $published}
    <span class="status published">Опубликовано</span>
{elseif $draft}
    <span class="status draft">Черновик</span>
{else}
    <span class="status hidden">Скрыто</span>
{/if}
```

### Сложные условия

```smarty
{if $user.id && ($user.role == 'Administrator' || $user.role == 'Manager')}
    <a href="/admin/" class="admin-link">Админ-панель</a>
{/if}
```

### Проверка на существование

```smarty
{if $tv.gallery?}
    <div class="gallery">
        {$tv.gallery}
    </div>
{/if}
```

## Циклы и итерация

### Базовый foreach

```smarty
{foreach $children as $child}
    <article class="child-page">
        <h3><a href="{$child.uri}">{$child.pagetitle}</a></h3>
        <p>{$child.introtext}</p>
    </article>
{/foreach}
```

### Циклы с ключами

```smarty
{foreach $tvs as $name => $value}
    <div class="tv-item">
        <strong>{$name}:</strong> {$value}
    </div>
{/foreach}
```

### Специальные переменные цикла

```smarty
{foreach $resources as $resource}
    <div class="resource-item {if $.foreach.first}first{/if} {if $.foreach.last}last{/if}">
        <span class="number">{$.foreach.iteration}</span>
        <h3>{$resource.pagetitle}</h3>
    </div>
{/foreach}
```

### Альтернативный контент

```smarty
{foreach $comments as $comment}
    <div class="comment">{$comment.content}</div>
{foreachelse}
    <p>Комментариев пока нет</p>
{/foreach}
```

## Встроенные функции

### Функции для работы с ресурсами

```smarty
{* Получение ресурса по ID *}
{set $product = $_modx->getResource(45)}
{$product.pagetitle}

{* Получение дочерних ресурсов *}
{set $children = $_modx->getChildIds($_modx->resource.id)}
{foreach $children as $childId}
    {set $child = $_modx->getResource($childId)}
    <a href="{$child.uri}">{$child.pagetitle}</a>
{/foreach}
```

### Работа с TV полями

```smarty
{* Получение TV *}
{set $gallery = $_modx->resource | tv : 'gallery'}
{if $gallery}
    <div class="gallery">{$gallery}</div>
{/if}
```

### Полезные функции

```smarty
{* Генерация URL *}
<a href="{'contact' | url}">Контакты</a>

{* Лексикон *}
{$_modx->lexicon('contact_form_submit')}

{* Настройки системы *}
{$_modx->getOption('site_name')}
```

## Переход с тегов MODX на Fenom

### Замена базовых тегов

| Старый MODX тег | Fenom синтаксис |
|---|---|
| `[[*pagetitle]]` | `{$pagetitle}` |
| `[[*content]]` | `{$content}` |
| `[[++site_name]]` | `{$_modx->getOption('site_name')}` |
| `[[~5]]` | `{5 | url}` |
| `[[%contact_us]]` | `{$_modx->lexicon('contact_us')}` |

### Сниппеты в Fenom

```smarty
{* Старый способ *}
[[pdoResources? 
    &parents=`0`
    &depth=`1`
    &limit=`10`
]]

{* Новый способ *}
{$_modx->runSnippet('pdoResources', [
    'parents' => 0,
    'depth' => 1,
    'limit' => 10
])}
```

### Чанки в Fenom

```smarty
{* Подключение чанка *}
{include 'header'}

{* Чанк с параметрами *}
{include 'product-card' product=$product featured=true}
```

## Продвинутые техники

### Создание макросов

```smarty
{macro 'breadcrumb'}
    <nav class="breadcrumb">
        {foreach $breadcrumbs as $crumb}
            {if $.foreach.last}
                <span>{$crumb.pagetitle}</span>
            {else}
                <a href="{$crumb.uri}">{$crumb.pagetitle}</a> →
            {/if}
        {/foreach}
    </nav>
{/macro}

{* Использование макроса *}
{call 'breadcrumb' breadcrumbs=$_modx->getBreadcrumbs()}
```

### Кастомные фильтры

```php
// В файле плагина или сниппета
$_modx->services->get('twig')->addFilter(
    new Twig_SimpleFilter('price', function ($number) {
        return number_format($number, 2, ',', ' ') . ' ₽';
    })
);
```

```smarty
{* Использование кастомного фильтра *}
<span class="price">{$product.price | price}</span>
```

### Оптимизация производительности

```smarty
{* Кеширование фрагментов *}
{cache 'product-list' 3600}
    {foreach $products as $product}
        <div class="product">{$product.title}</div>
    {/foreach}
{/cache}

{* Ленивая загрузка *}
{if $show_gallery}
    {include 'gallery' lazy=true}
{/if}
```

## Интеграция с популярными дополнениями

Fenom прекрасно интегрируется с основными дополнениями MODX. Рассмотрим примеры:

### Работа с pdoTools

```smarty
{* pdoMenu в Fenom *}
{set $menu = $_modx->runSnippet('pdoMenu', [
    'parents' => 0,
    'level' => 2,
    'return' => 'data'
])}

<nav class="main-menu">
    {foreach $menu as $item}
        <a href="{$item.link}" 
           class="{if $item.current}current{/if}">
            {$item.menutitle ?: $item.pagetitle}
        </a>
    {/foreach}
</nav>
```

Больше о работе с элементами MODX можно узнать в статье [Элементы MODX: шаблоны, чанки, сниппеты](/blog/modx-elementy-shablony-chanki-snippety/), а создание шаблонов подробно описано в руководстве [Создание шаблонов в MODX](/blog/modx-shablony-sozdanie/).

### miniShop2

```smarty
{* Корзина в Fenom *}
{set $cart = $_modx->runSnippet('msCart', ['return' => 'data'])}

<div class="cart">
    <span class="count">{$cart.total_count}</span>
    <span class="total">{$cart.total_cost | price}</span>
</div>
```

## Отладка и работа с ошибками

### Отладочная информация

```smarty
{* Вывод всех доступных переменных *}
{if $_modx->getOption('debug')}
    <pre>{$_modx->toJSON($_modx->resource.toArray())}</pre>
{/if}

{* Проверка типа переменной *}
{if $data is array}
    Это массив с {$data | count} элементами
{elseif $data is string}
    Это строка длиной {$data | length} символов
{/if}
```

### Обработка ошибок

```smarty
{try}
    {$_modx->runSnippet('SomeSnippet')}
{catch}
    <p class="error">Произошла ошибка при загрузке данных</p>
{/try}
```

## Лучшие практики

### Структура шаблонов

```smarty
{* Главный шаблон *}
{include 'chunks/head'}
<body>
    {include 'chunks/header'}
    
    <main class="main">
        {block 'content'}
            {$content}
        {/block}
    </main>
    
    {include 'chunks/footer'}
</body>
</html>
```

### Переиспользование кода

```smarty
{* Создание переменных для часто используемых значений *}
{set $current_year = 'now' | date : 'Y'}
{set $site_name = $_modx->getOption('site_name')}

{* Использование в шаблоне *}
<footer>
    © {$current_year} {$site_name}
</footer>
```

### Безопасность

```smarty
{* Всегда экранируйте пользовательский ввод *}
{$user_comment | escape}

{* Проверяйте данные перед использованием *}
{if $email && $email | match : '/^[\w\.-]+@[\w\.-]+\.\w+$/'}
    <a href="mailto:{$email}">{$email}</a>
{/if}
```

## Заключение

Fenom значительно упрощает создание шаблонов в MODX, делая код более читаемым и поддерживаемым. Переход с тегов MODX на Fenom может показаться сложным на первый взгляд, но преимущества очевидны:

- Современный синтаксис
- Богатые возможности обработки данных  
- Лучшая производительность
- Удобная отладка

Начните с простых шаблонов, постепенно изучая новые возможности. Fenom поможет вам создавать более качественные и гибкие веб-сайты на MODX Revolution.