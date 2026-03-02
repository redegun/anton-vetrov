---
title: "Чанки в MODX: что это, как использовать, примеры"
description: "Полное руководство по чанкам в MODX Revolution. Что такое чанки, как создавать, практические примеры использования. Советы от разработчика с 18-летним опытом."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-chanki-primery.webp"
tags: ["MODX", "Чанки", "Вёрстка", "Разработка"]
draft: false
---

# Чанки в MODX: что это, как использовать, примеры

Чанки — один из самых полезных элементов MODX, который часто недооценивают новички. За годы работы я понял: правильное использование чанков экономит массу времени и делает код чистым и поддерживаемым. В этой статье расскажу всё о чанках — от базовых примеров до продвинутых техник.

## Что такое чанки в MODX

### Определение и назначение

Чанк (Chunk) — это фрагмент HTML-кода с плейсхолдерами, который можно переиспользовать в разных местах сайта. Это как «кирпичик» для строительства страниц.

**Простая аналогия:** представьте, что вам нужно на 10 страницах разместить одинаковые карточки товаров. Вместо копирования HTML-кода 10 раз, создаёте один чанк и используете его везде.

### Синтаксис вызова чанков

```html
[[$имя_чанка]]                    <!-- Простой вызов -->
[[$имя_чанка? &param=`value`]]    <!-- С параметрами -->
```

### Отличие от шаблонов и сниппетов

```html
<!-- Шаблон - структура всей страницы -->
Шаблон = HTML каркас страницы

<!-- Чанк - переиспользуемый блок HTML -->
Чанк = Фрагмент HTML с плейсхолдерами  

<!-- Сниппет - PHP логика -->
Сниппет = PHP код для обработки данных
```

## Базовые примеры чанков

### Пример 1: Карточка товара

**Чанк `product-card`:**
```html
<div class="product-card">
    <div class="product-card__image">
        <img src="[[+image]]" alt="[[+title]]">
        [[+sale:notempty=`<div class="sale-badge">Скидка [[+sale]]%</div>`]]
    </div>
    <div class="product-card__info">
        <h3 class="product-card__title">[[+title]]</h3>
        <p class="product-card__description">[[+description:limit=`100`]]</p>
        <div class="product-card__price">
            [[+old_price:notempty=`<span class="old-price">[[+old_price]] ₽</span>`]]
            <span class="price">[[+price]] ₽</span>
        </div>
        <a href="[[+link]]" class="btn btn-primary">Подробнее</a>
    </div>
</div>
```

**Использование в сниппете:**
```php
// В сниппете getProducts
return $modx->getChunk('product-card', [
    'title' => $product['pagetitle'],
    'description' => $product['content'],
    'image' => $product['image'],
    'price' => $product['price'],
    'old_price' => $product['old_price'],
    'sale' => $product['sale_percent'],
    'link' => $modx->makeUrl($product['id'])
]);
```

### Пример 2: Элемент списка новостей

**Чанк `news-item`:**
```html
<article class="news-item">
    <div class="news-item__date">
        <span class="day">[[+publishedon:date=`d`]]</span>
        <span class="month">[[+publishedon:date=`M`]]</span>
    </div>
    <div class="news-item__content">
        <h3><a href="[[+link]]">[[+title]]</a></h3>
        <p>[[+introtext:default=`[[+content:limit=150]]`]]</p>
        <div class="news-item__meta">
            <span class="author">[[+author]]</span>
            <span class="views">Просмотров: [[+views:default=`0`]]</span>
        </div>
    </div>
</article>
```

**Использование с getResources:**
```html
[[!getResources? 
    &parents=`5`
    &limit=`10`
    &tpl=`news-item`
    &includeContent=`1`
]]
```

### Пример 3: Форма обратной связи

**Чанк `contact-form`:**
```html
<form class="contact-form" method="post">
    <div class="form-group">
        <label for="name">Имя *</label>
        <input type="text" id="name" name="name" value="[[+fi.name]]" required>
        [[!+fi.error.name:notempty=`<div class="error">[[!+fi.error.name]]</div>`]]
    </div>
    
    <div class="form-group">
        <label for="email">Email *</label>
        <input type="email" id="email" name="email" value="[[+fi.email]]" required>
        [[!+fi.error.email:notempty=`<div class="error">[[!+fi.error.email]]</div>`]]
    </div>
    
    <div class="form-group">
        <label for="message">Сообщение *</label>
        <textarea id="message" name="message" rows="5" required>[[+fi.message]]</textarea>
        [[!+fi.error.message:notempty=`<div class="error">[[!+fi.error.message]]</div>`]]
    </div>
    
    <div class="form-group">
        <button type="submit" class="btn btn-primary">Отправить</button>
    </div>
    
    [[!+fi.successMessage:notempty=`<div class="success">[[!+fi.successMessage]]</div>`]]
    [[!+fi.validation_error_message:notempty=`<div class="error">[[!+fi.validation_error_message]]</div>`]]
</form>
```

## Продвинутые техники работы с чанками

### Условная логика в чанках

**Чанк `user-menu`:**
```html
<!-- Проверяем, авторизован ли пользователь -->
[[!+modx.user.id:gt=`0`:then=`
    <!-- Меню для авторизованных -->
    <div class="user-menu">
        <span class="welcome">Добро пожаловать, [[!+modx.user.fullname:default=`[[!+modx.user.username]]`]]!</span>
        <ul class="user-nav">
            <li><a href="/profile/">Профиль</a></li>
            <li><a href="/orders/">Заказы</a></li>
            <li><a href="/logout/">Выход</a></li>
        </ul>
    </div>
`:else=`
    <!-- Меню для неавторизованных -->
    <div class="auth-links">
        <a href="/login/">Вход</a>
        <a href="/register/">Регистрация</a>
    </div>
`]]
```

### Вложенные чанки

**Главный чанк `product-list`:**
```html
<div class="products-grid">
    [[+products]]
    [[+pagination]]
</div>
```

**Чанк продукта `product-item`:**
```html
<div class="product-item">
    [[$product-image? &src=`[[+image]]` &alt=`[[+title]]`]]
    [[$product-info? &title=`[[+title]]` &price=`[[+price]]`]]
    [[$product-buttons? &id=`[[+id]]` &inStock=`[[+in_stock]]`]]
</div>
```

**Чанк изображения `product-image`:**
```html
<div class="product-image">
    <img src="[[+src:phpthumb=`w=300&h=300&zc=1`]]" alt="[[+alt]]" loading="lazy">
    [[+sale:notempty=`<span class="sale-badge">-[[+sale]]%</span>`]]
</div>
```

### Параметры в чанках

**Чанк `button` с параметрами:**
```html
<a href="[[+url:default=`#`]]" 
   class="btn [[+class:default=`btn-primary`]] [[+size:notempty=`btn-[[+size]]`]]"
   [[+target:notempty=`target="[[+target]]"`]]
   [[+onclick:notempty=`onclick="[[+onclick]]"`]]>
    [[+icon:notempty=`<i class="icon-[[+icon]]"></i> `]][[+text:default=`Кнопка`]]
</a>
```

**Использование:**
```html
<!-- Простая кнопка -->
[[$button? &text=`Отправить` &url=`/contact/`]]

<!-- Кнопка с иконкой -->
[[$button? &text=`Скачать` &icon=`download` &class=`btn-success`]]

<!-- Большая кнопка с JavaScript -->
[[$button? 
    &text=`Купить сейчас` 
    &size=`lg` 
    &onclick=`addToCart(123)`
    &class=`btn-danger`
]]
```

## Чанки для разных типов контента

### Хлебные крошки

**Чанк `breadcrumb-item`:**
```html
[[+active:is=`1`:then=`
    <span class="breadcrumb-current">[[+title]]</span>
`:else=`
    <a href="[[+link]]" class="breadcrumb-link">[[+title]]</a>
`]]
```

**Чанк `breadcrumb-separator`:**
```html
<span class="breadcrumb-separator">→</span>
```

### Пагинация

**Чанк `pagination-item`:**
```html
[[+active:is=`1`:then=`
    <span class="page-current">[[+pageNo]]</span>
`:else=`
    <a href="[[+href]]" class="page-link">[[+pageNo]]</a>
`]]
```

**Чанк `pagination-wrapper`:**
```html
<nav class="pagination" aria-label="Навигация по страницам">
    [[+first]]
    [[+prev]]
    <div class="page-numbers">
        [[+pages]]
    </div>
    [[+next]]
    [[+last]]
</nav>
```

### Галерея изображений

**Чанк `gallery-item`:**
```html
<div class="gallery-item">
    <a href="[[+large]]" class="gallery-link" data-lightbox="gallery">
        <img src="[[+thumb]]" alt="[[+alt:default=`Изображение галереи`]]" loading="lazy">
        [[+title:notempty=`<div class="gallery-caption">[[+title]]</div>`]]
    </a>
</div>
```

**Чанк `gallery-wrapper`:**
```html
<div class="gallery" data-gallery="[[+galleryId]]">
    [[+items]]
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {
    initLightbox();
});
</script>
```

## Организация и именование чанков

### Система именования

```html
<!-- По функции -->
header-main           <!-- Основная шапка -->
header-simple         <!-- Упрощённая шапка -->

<!-- По компоненту -->
product-card          <!-- Карточка товара -->
product-details       <!-- Детали товара -->
product-reviews       <!-- Отзывы о товаре -->

<!-- По местоположению -->
sidebar-news          <!-- Новости в сайдбаре -->
footer-contacts       <!-- Контакты в футере -->

<!-- Вспомогательные -->
btn-primary           <!-- Основная кнопка -->
icon-social           <!-- Иконка соц.сети -->
```

### Структура папок

Хотя MODX не поддерживает папки чанков в админке, используйте префиксы:

```html
<!-- Блоки страниц -->
page-header
page-footer
page-sidebar

<!-- Формы -->
form-contact
form-search  
form-subscribe

<!-- Списки -->
list-news
list-products
list-services

<!-- UI элементы -->
ui-button
ui-modal
ui-tooltip
```

## Оптимизация и производительность

### Кэширование чанков

```html
<!-- Статичный чанк - кэшируется -->
[[$header]]

<!-- Динамичный чанк - не кэшируется -->  
[[!$user-menu]]

<!-- Условное кэширование -->
[[[[+userId:gt=`0`:then=`!`:else=``]]$user-content]]
```

### Минимизация чанков

```html
<!-- ❌ Громоздкий чанк -->
<div class="product-card">
    <div class="product-image-wrapper">
        <div class="product-image-container">
            <img class="product-image" src="[[+image]]">
        </div>
    </div>
    <!-- 50 строк HTML... -->
</div>

<!-- ✅ Оптимизированный чанк -->
<div class="card">
    <img src="[[+image]]" alt="[[+title]]" class="card-img">
    <div class="card-body">
        <h3 class="card-title">[[+title]]</h3>
        <p class="card-price">[[+price]] ₽</p>
        <a href="[[+url]]" class="btn">Купить</a>
    </div>
</div>
```

### Избегание дублирования

```html
<!-- ❌ Дублирование кода -->
<!-- Чанк news-card -->
<div class="card news-card">
    <img src="[[+image]]" alt="[[+title]]">
    <h3>[[+title]]</h3>
    <p>[[+description]]</p>
    <a href="[[+link]]">Читать</a>
</div>

<!-- Чанк product-card -->  
<div class="card product-card">
    <img src="[[+image]]" alt="[[+title]]">
    <h3>[[+title]]</h3>
    <p>[[+description]]</p>
    <a href="[[+link]]">Купить</a>
</div>

<!-- ✅ Универсальный чанк -->
<!-- Чанк universal-card -->
<div class="card [[+type:default=`generic`]]-card">
    <img src="[[+image]]" alt="[[+title]]">
    <h3>[[+title]]</h3>
    <p>[[+description]]</p>
    <a href="[[+link]]">[[+button_text:default=`Подробнее`]]</a>
</div>
```

## Чанки с JavaScript и CSS

### Интерактивные компоненты

**Чанк `modal-window`:**
```html
<div class="modal" id="modal-[[+id]]" style="display: none;">
    <div class="modal-overlay" onclick="closeModal('[[+id]]')"></div>
    <div class="modal-content">
        <div class="modal-header">
            <h3>[[+title]]</h3>
            <button class="modal-close" onclick="closeModal('[[+id]]')">&times;</button>
        </div>
        <div class="modal-body">
            [[+content]]
        </div>
        [[+footer:notempty=`
        <div class="modal-footer">
            [[+footer]]
        </div>
        `]]
    </div>
</div>

<script>
function openModal(id) {
    document.getElementById('modal-' + id).style.display = 'block';
}

function closeModal(id) {
    document.getElementById('modal-' + id).style.display = 'none';
}
</script>
```

### Чанки со стилями

**Чанк `progress-bar`:**
```html
<div class="progress-bar" data-percent="[[+percent:default=`0`]]">
    <div class="progress-label">[[+label]]</div>
    <div class="progress-track">
        <div class="progress-fill" style="width: [[+percent:default=`0`]]%"></div>
    </div>
    <div class="progress-value">[[+percent:default=`0`]]%</div>
</div>

<style>
.progress-bar {
    margin: 10px 0;
}

.progress-track {
    background: #eee;
    border-radius: 10px;
    height: 20px;
    overflow: hidden;
}

.progress-fill {
    background: linear-gradient(45deg, #007bff, #0056b3);
    height: 100%;
    transition: width 0.3s ease;
}
</style>
```

## Адаптивные чанки

### Мобильная навигация

**Чанк `mobile-menu`:**
```html
<div class="mobile-menu [[+active:is=`1`:then=`active`]]">
    <div class="mobile-menu-overlay" onclick="closeMobileMenu()"></div>
    <div class="mobile-menu-content">
        <div class="mobile-menu-header">
            <span class="mobile-menu-title">[[++site_name]]</span>
            <button class="mobile-menu-close" onclick="closeMobileMenu()">×</button>
        </div>
        <nav class="mobile-menu-nav">
            [[!pdoMenu? 
                &parents=`0`
                &level=`2`
                &tplOuter=`<ul class="mobile-nav">[[+wrapper]]</ul>`
                &tpl=`<li><a href="[[+link]]">[[+menutitle]]</a>[[+wrapper]]</li>`
            ]]
        </nav>
    </div>
</div>

<style>
@media (min-width: 769px) {
    .mobile-menu {
        display: none !important;
    }
}

@media (max-width: 768px) {
    .mobile-menu {
        position: fixed;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        transition: left 0.3s ease;
        z-index: 9999;
    }
    
    .mobile-menu.active {
        left: 0;
    }
}
</style>
```

### Адаптивные сетки

**Чанк `responsive-grid`:**
```html
<div class="responsive-grid grid-cols-[[+cols:default=`3`]]">
    [[+items]]
</div>

<style>
.responsive-grid {
    display: grid;
    gap: 20px;
}

.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
    .grid-cols-2, .grid-cols-3, .grid-cols-4 {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 992px) {
    .grid-cols-3, .grid-cols-4 {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
```

## Отладка чанков

### Режим разработки

```html
<!-- В начале чанка добавьте отладочную информацию -->
[[++debug_mode:is=`1`:then=`
<!-- DEBUG: Chunk "[[+chunk_name:default=`unknown`]]" -->
<!-- Параметры: [[+debug_params]] -->
`]]

<div class="component">
    <!-- Содержимое чанка -->
</div>

[[++debug_mode:is=`1`:then=`
<!-- END: Chunk "[[+chunk_name]]" -->
`]]
```

### Проверка параметров

```html
<!-- Показать все переданные параметры -->
[[++dev_mode:is=`1`:then=`
<div class="debug-params">
    <h4>Параметры чанка:</h4>
    <pre>[[+_all_params:toJSON:prettyprint]]</pre>
</div>
`]]
```

## Распространённые ошибки

### Ошибка 1: Неправильные плейсхолдеры

```html
<!-- ❌ Неправильно -->
<h1>[[*pagetitle]]</h1>  <!-- В чанке нет доступа к полям ресурса -->

<!-- ✅ Правильно -->
<h1>[[+title]]</h1>      <!-- Используйте переданные параметры -->
```

### Ошибка 2: Смешивание типов тегов

```html
<!-- ❌ Неправильно -->
[[$chunk? &data=`[[!getResources]]`]]  <!-- Сниппет в параметре чанка -->

<!-- ✅ Правильно -->
[[!getResources? &tpl=`chunk`]]        <!-- Чанк как шаблон сниппета -->
```

### Ошибка 3: Сложная логика в чанках

```html
<!-- ❌ Сложная логика в чанке -->
[[+items:split=`,`:count:gt=`5`:then=`много`:else=`мало`]]

<!-- ✅ Логика в сниппете, результат в чанк -->
[[processItems? &items=`[[+items]]` &tpl=`item-display`]]
```

## Заключение

Чанки — мощный инструмент для создания чистого и поддерживаемого кода в MODX. Основные принципы работы с чанками:

1. **Переиспользуйте код** — один чанк лучше, чем 10 копий
2. **Делайте чанки атомарными** — один чанк = одна задача
3. **Используйте параметры** для гибкости
4. **Планируйте структуру** — продумайте систему именования
5. **Оптимизируйте производительность** — кэшируйте статичные чанки

Правильно организованные чанки превращают разработку на MODX в конструктор — быстро, удобно и надёжно.

---

*Изучаете элементы MODX? Читайте полный обзор в статье «[Элементы MODX: шаблоны, чанки, сниппеты](/blog/modx-elementy-shablony-chanki-snippety/)» — всё о системе элементов в одном месте.*

## Полезные ресурсы

- [Документация по чанкам](https://docs.modx.com/revolution/2.x/making-sites-with-modx/structuring-your-site/chunks)
- [Теги и фильтры MODX](https://docs.modx.com/revolution/2.x/making-sites-with-modx/customizing-content/input-and-output-filters)

## Чек-лист качественного чанка

- [ ] Понятное, говорящее название
- [ ] Использует только параметры (без `[[*]]` тегов)
- [ ] Обрабатывает пустые значения
- [ ] Семантичная HTML-разметка
- [ ] Адаптивность для мобильных устройств
- [ ] Оптимизирован для производительности
- [ ] Имеет документацию по параметрам
- [ ] Протестирован в разных контекстах