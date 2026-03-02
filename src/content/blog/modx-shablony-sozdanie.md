---
title: "Шаблоны в MODX: создание, вёрстка и лучшие практики"
description: "Как создавать шаблоны в MODX Revolution? Вёрстка, плейсхолдеры, условия, наследование. Практические советы с примерами кода для начинающих."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-shablony-sozdanie.webp"
tags: ["MODX", "Шаблоны", "Вёрстка", "Frontend"]
draft: false
---


Шаблоны — основа любого сайта на MODX. Они определяют внешний вид страниц и структуру HTML-кода. За годы работы я создал сотни шаблонов для MODX и выработал систему, которая экономит время и делает код поддерживаемым. В этой статье поделюсь практическим опытом.

## Что такое шаблон в MODX

### Определение и назначение

Шаблон в MODX — это HTML-каркас страницы с специальными тегами (плейсхолдерами), которые заменяются на реальный контент. В отличие от WordPress, где темы перемешивают PHP и HTML, шаблоны MODX остаются чистыми.

```html
<!-- Простейший шаблон MODX -->
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>[[*pagetitle]] - [[++site_name]]</title>
    <meta name="description" content="[[*description]]">
</head>
<body>
    <header>
        <h1>[[++site_name]]</h1>
        <nav>[[!Wayfinder]]</nav>
    </header>
    
    <main>
        <h1>[[*pagetitle]]</h1>
        <div>[[*content]]</div>
    </main>
    
    <footer>
        <p>&copy; 2026 [[++site_name]]</p>
    </footer>
</body>
</html>
```

### Типы плейсхолдеров

**Системные настройки (`[[++]]`):**
```html
[[++site_name]]       <!-- Название сайта -->
[[++site_url]]        <!-- URL сайта -->
[[++emailsender]]     <!-- Email отправителя -->
```

**Поля ресурса (`[[*]]`):**
```html
[[*pagetitle]]        <!-- Заголовок страницы -->
[[*content]]          <!-- Содержимое -->
[[*description]]      <!-- Описание -->
[[*createdon]]        <!-- Дата создания -->
[[*id]]               <!-- ID страницы -->
```

**TV-поля (`[[*]]`):**
```html
[[*my_custom_field]]  <!-- Пользовательское TV-поле -->
[[*product_price]]    <!-- Цена товара -->
[[*gallery_images]]   <!-- Галерея изображений -->
```

**Вызовы сниппетов (`[[!]]` или `[[]]`):**
```html
[[!Wayfinder]]        <!-- Некэшируемый вызов меню -->
[[getResources]]      <!-- Кэшируемый список статей -->
[[!FormIt]]           <!-- Некэшируемая форма -->
```

## Создание первого шаблона

### Шаг 1: Подготовка HTML-макета

Начните с готового HTML-макета. Например, базовый макет для корпоративного сайта:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Заголовок страницы - Название сайта</title>
    <meta name="description" content="Описание страницы">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <!-- Шапка -->
    <header class="header">
        <div class="container">
            <div class="header__logo">
                <img src="assets/img/logo.png" alt="Логотип">
            </div>
            <nav class="header__nav">
                <ul>
                    <li><a href="/">Главная</a></li>
                    <li><a href="/about/">О нас</a></li>
                    <li><a href="/services/">Услуги</a></li>
                    <li><a href="/contacts/">Контакты</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Основной контент -->
    <main class="main">
        <div class="container">
            <div class="breadcrumbs">
                <a href="/">Главная</a> → <span>Текущая страница</span>
            </div>
            <h1>Заголовок страницы</h1>
            <div class="content">
                <p>Содержимое страницы...</p>
            </div>
        </div>
    </main>

    <!-- Подвал -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 Название компании. Все права защищены.</p>
        </div>
    </footer>

    <script src="assets/js/script.js"></script>
</body>
</html>
```

### Шаг 2: Замена статичного контента плейсхолдерами

Превращаем статичный макет в динамический шаблон MODX:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[[*pagetitle]] - [[++site_name]]</title>
    <meta name="description" content="[[*description:default=`[[*pagetitle]] - [[++site_name]]`]]">
    <link rel="stylesheet" href="[[++assets_url]]css/style.css">
    
    <!-- Дополнительные meta-теги для SEO -->
    [[*meta_keywords:notempty=`<meta name="keywords" content="[[*meta_keywords]]">`]]
    [[*og_image:notempty=`<meta property="og:image" content="[[*og_image]]">`]]
</head>
<body>
    <!-- Шапка -->
    <header class="header">
        <div class="container">
            <div class="header__logo">
                <a href="[[++site_url]]">
                    <img src="[[++assets_url]]img/logo.png" alt="[[++site_name]]">
                </a>
            </div>
            <nav class="header__nav">
                [[!Wayfinder? 
                    &startId=`0` 
                    &level=`1` 
                    &outerTpl=`<ul>[[+wf.wrapper]]</ul>`
                    &rowTpl=`<li><a href="[[+wf.link]]"[[+wf.classes]]>[[+wf.linktext]]</a></li>`
                ]]
            </nav>
        </div>
    </header>

    <!-- Основной контент -->
    <main class="main">
        <div class="container">
            <!-- Хлебные крошки -->
            [[!Breadcrumb? 
                &showHomeCrumb=`1`
                &homeCrumbTitle=`Главная`
                &maxCrumbs=`6`
            ]]
            
            <h1>[[*pagetitle]]</h1>
            <div class="content">
                [[*content]]
            </div>
        </div>
    </main>

    <!-- Подвал -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 [[++site_name]]. Все права защищены.</p>
            <p>Телефон: [[++company_phone:default=`+7 (495) 123-45-67`]]</p>
        </div>
    </footer>

    <script src="[[++assets_url]]js/script.js"></script>
</body>
</html>
```

### Шаг 3: Создание шаблона в админке

1. **Элементы** → **Шаблоны** → **Создать шаблон**
2. Введите название: `Основной шаблон`
3. Вставьте подготовленный код
4. Сохраните

## Продвинутые техники

### Условные блоки

Показывайте разные блоки в зависимости от условий:

```html
<!-- Показать блок только на главной странице -->
[[[[*id:is=`1`:then=`<div class="hero-slider">[[!getResources? &parents=`5` &tpl=`slide`]]</div>`]]]]

<!-- Показать sidebar только если есть контент -->
[[*sidebar:notempty=`
<aside class="sidebar">
    <h3>Дополнительная информация</h3>
    [[*sidebar]]
</aside>
`]]

<!-- Разный контент для разных шаблонов -->
[[*template:is=`1`:then=`
    <!-- Для главной страницы -->
    <div class="hero">[[*hero_content]]</div>
`:else=`
    <!-- Для обычных страниц -->
    <div class="page-header">[[*pagetitle]]</div>
`]]
```

### Наследование контента родительских страниц

```html
<!-- Показать заголовок родителя, если у текущей страницы его нет -->
<h1>[[*pagetitle:default=`[[pdoField? &id=`[[*parent]]` &field=`pagetitle`]]`]]</h1>

<!-- Описание: сначала своё, потом родительское -->
<meta name="description" content="[[*description:default=`[[pdoField? &id=`[[*parent]]` &field=`description`]]`]]">

<!-- Изображение из галереи родителя -->
[[*image:isempty=`
    [[pdoField? &id=`[[*parent]]` &field=`gallery_images` &top=`1`]]
`:notempty=`
    <img src="[[*image]]" alt="[[*pagetitle]]">
`]]
```

### Многоязычность в шаблонах

```html
<!-- Переключатель языков -->
<div class="lang-switcher">
    [[!BabelLinks? 
        &tpl=`<a href="[[+url]]" class="lang-link[[+active]]">[[+name]]</a>`
        &activeCls=` active`
    ]]
</div>

<!-- Локализованный контент -->
<title>[[*pagetitle]] - [[%site.title? &language=`[[++cultureKey]]`]]</title>
```

## Модульная структура шаблонов

### Использование чанков для переиспользования

Вместо копирования кода создавайте чанки для повторяющихся блоков:

```html
<!-- Основной шаблон -->
<!DOCTYPE html>
<html lang="ru">
<head>
    [[$head]]
</head>
<body>
    [[$header]]
    <main class="main">
        <div class="container">
            [[*content]]
        </div>
    </main>
    [[$footer]]
    [[$scripts]]
</body>
</html>
```

**Чанк `head`:**
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[[*pagetitle]] - [[++site_name]]</title>
<meta name="description" content="[[*description:default=`[[*pagetitle]]`]]">
<link rel="stylesheet" href="[[++assets_url]]css/style.css">
```

**Чанк `header`:**
```html
<header class="header">
    <div class="container">
        <div class="header__logo">
            <a href="[[++site_url]]">
                <img src="[[++assets_url]]img/logo.png" alt="[[++site_name]]">
            </a>
        </div>
        <nav class="header__nav">
            [[!Wayfinder? &startId=`0` &level=`1`]]
        </nav>
    </div>
</header>
```

### Система шаблонов для разных типов страниц

**Базовый шаблон (`base`):**
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    [[$head]]
</head>
<body>
    [[$header]]
    <main class="main">
        [[+content]]
    </main>
    [[$footer]]
</body>
</html>
```

**Шаблон статьи (`article`):**
```html
[[$base? &content=`
    <article class="article">
        <div class="container">
            <h1>[[*pagetitle]]</h1>
            <div class="article__meta">
                <time>[[*publishedon:strtotime:date=`d.m.Y`]]</time>
                <span>Автор: [[*createdby:userinfo=`fullname`]]</span>
            </div>
            <div class="article__content">
                [[*content]]
            </div>
            <div class="article__tags">
                [[!getImageList? &tvname=`tags` &tpl=`tag-item`]]
            </div>
        </div>
    </article>
`]]
```

## Оптимизация производительности

### Правильное использование кэширования

```html
<!-- Кэшируемые вызовы (статичный контент) -->
[[getResources? &parents=`5`]]         <!-- Список статей -->
[[pdoMenu]]                            <!-- Меню -->
[[Breadcrumb]]                         <!-- Хлебные крошки -->

<!-- Некэшируемые вызовы (динамичный контент) -->
[[!Login]]                             <!-- Форма входа -->
[[!FormIt]]                           <!-- Обратная связь -->
[[!getPage]]                          <!-- Пагинация -->
```

### Ленивая загрузка ресурсов

```html
<!-- CSS критичный - загружаем сразу -->
<link rel="stylesheet" href="[[++assets_url]]css/critical.css">

<!-- CSS не критичный - загружаем асинхронно -->
<link rel="preload" href="[[++assets_url]]css/style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- JavaScript - загружаем в конце -->
<script src="[[++assets_url]]js/script.js" defer></script>

<!-- Изображения с lazy loading -->
<img src="placeholder.jpg" data-src="[[*image]]" alt="[[*pagetitle]]" loading="lazy">
```

### Минификация и объединение

```html
[[!MinifyX? 
    &cssSources=`
        [[++assets_url]]css/bootstrap.css,
        [[++assets_url]]css/style.css,
        [[++assets_url]]css/responsive.css
    `
    &jsSources=`
        [[++assets_url]]js/jquery.js,
        [[++assets_url]]js/script.js
    `
]]
```

## Адаптивность и современная вёрстка

### Современная CSS Grid разметка

```html
<div class="page-layout">
    <header class="header">
        [[$header]]
    </header>
    
    <nav class="nav">
        [[!pdoMenu]]
    </nav>
    
    <main class="content">
        [[*content]]
    </main>
    
    <aside class="sidebar">
        [[*sidebar:default=`[[$default-sidebar]]`]]
    </aside>
    
    <footer class="footer">
        [[$footer]]
    </footer>
</div>

<style>
.page-layout {
    display: grid;
    grid-template-areas:
        "header header"
        "nav content"
        "sidebar content"
        "footer footer";
    grid-template-columns: 250px 1fr;
    min-height: 100vh;
}

@media (max-width: 768px) {
    .page-layout {
        grid-template-areas:
            "header"
            "nav"
            "content"
            "sidebar"
            "footer";
        grid-template-columns: 1fr;
    }
}
</style>
```

### Компоненты для мобильных устройств

```html
<!-- Мобильное меню -->
<div class="mobile-menu-toggle">
    <button class="burger" onclick="toggleMobileMenu()">
        <span></span>
        <span></span>
        <span></span>
    </button>
</div>

<nav class="mobile-menu" id="mobileMenu">
    [[!pdoMenu? 
        &parents=`0`
        &level=`2`
        &tplOuter=`<ul class="mobile-nav">[[+wrapper]]</ul>`
        &tpl=`<li><a href="[[+link]]">[[+menutitle]]</a>[[+wrapper]]</li>`
    ]]
</nav>

<!-- Кнопка "Наверх" -->
[[*id:gt=`1`:then=`
<button class="scroll-top" id="scrollTop" onclick="scrollToTop()">
    ↑
</button>
`]]
```

## SEO-оптимизация шаблонов

### Микроразметка Schema.org

```html
<article itemscope itemtype="http://schema.org/Article">
    <h1 itemprop="headline">[[*pagetitle]]</h1>
    
    <div itemprop="author" itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">[[*createdby:userinfo=`fullname`]]</span>
    </div>
    
    <time itemprop="datePublished" datetime="[[*publishedon:date=`c`]]">
        [[*publishedon:date=`d.m.Y`]]
    </time>
    
    <div itemprop="articleBody">
        [[*content]]
    </div>
</article>
```

### Open Graph и Twitter Cards

```html
<!-- Open Graph -->
<meta property="og:title" content="[[*pagetitle]] - [[++site_name]]">
<meta property="og:description" content="[[*description:limit=`160`]]">
<meta property="og:image" content="[[*og_image:default=`[[++site_url]]assets/img/default-og.jpg`]]">
<meta property="og:url" content="[[*uri:replace=`^:==[[++site_url]]`]]">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[[*pagetitle]]">
<meta name="twitter:description" content="[[*description:limit=`200`]]">
<meta name="twitter:image" content="[[*og_image:default=`[[++site_url]]assets/img/default-twitter.jpg`]]">
```

## Отладка и тестирование шаблонов

### Режим разработки

```html
<!-- Показать отладочную информацию только в dev-режиме -->
[[++dev_mode:is=`1`:then=`
<div class="debug-info">
    <p>ID страницы: [[*id]]</p>
    <p>Шаблон: [[*template:template]]</p>
    <p>Родитель: [[*parent]]</p>
    <p>Контекст: [[*context_key]]</p>
</div>
`]]

<!-- Использование разных CSS для разработки -->
<link rel="stylesheet" href="[[++assets_url]]css/[[++dev_mode:is=`1`:then=`dev`:else=`prod`]]/style.css">
```

### Проверка производительности

```html
<!-- Время генерации страницы -->
[[++dev_mode:is=`1`:then=`
<div class="performance-info">
    Страница сгенерирована за [[+scriptTime]] сек, [[+queryTime]] сек на запросы к БД ([[+queries]] запросов)
</div>
`]]
```

## Распространённые ошибки и их решения

### Ошибка: пустые плейсхолдеры

```html
<!-- ❌ Неправильно -->
<title>[[*pagetitle]] - [[++site_name]]</title>
<!-- Если pagetitle пустой, получим " - Сайт" -->

<!-- ✅ Правильно -->
<title>[[*pagetitle:default=`[[++site_name]]`]] - [[++site_name]]</title>
<!-- Или с условием -->
[[*pagetitle:notempty=`[[*pagetitle]] - `]][[++site_name]]
```

### Ошибка: неправильное кэширование

```html
<!-- ❌ Форма обратной связи кэшируется -->
[[FormIt]]

<!-- ✅ Форма не кэшируется -->
[[!FormIt]]

<!-- ❌ Статичное меню не кэшируется -->
[[!pdoMenu]]

<!-- ✅ Статичное меню кэшируется -->
[[pdoMenu]]
```

### Ошибка: смешивание логики и представления

```html
<!-- ❌ Логика в шаблоне -->
[[getResources? 
    &where=`{
        "published": 1,
        "deleted": 0,
        "template": 5,
        "createdon:>": "2026-01-01"
    }`
]]

<!-- ✅ Логика в сниппете -->
[[!BlogArticles]]
```

## Лучшие практики

### 1. Структурируйте код

```html
<!-- Группируйте связанные блоки -->
<!-- === HEADER === -->
[[$header]]

<!-- === MAIN CONTENT === -->
<main class="main">
    [[*content]]
</main>

<!-- === SIDEBAR === -->
[[*sidebar:notempty=`[[$sidebar]]`]]

<!-- === FOOTER === -->
[[$footer]]
```

### 2. Используйте семантическую разметку

```html
<article>  <!-- Для статей -->
<section>  <!-- Для разделов -->
<aside>    <!-- Для боковых блоков -->
<nav>      <!-- Для навигации -->
<header>   <!-- Для шапки -->
<footer>   <!-- Для подвала -->
<main>     <!-- Для основного контента -->
```

### 3. Планируйте масштабируемость

```html
<!-- Создавайте гибкие системы -->
[[*page_type:switch=`
    product=[[!ProductTemplate]]
    news=[[!NewsTemplate]]  
    default=[[!DefaultTemplate]]
`]]
```

## Заключение

Качественные шаблоны — основа успешного проекта на MODX. Главные принципы:

1. **Разделяйте логику и представление** — HTML в шаблонах, PHP в сниппетах
2. **Используйте чанки** для переиспользования кода
3. **Планируйте структуру** заранее — лучше потратить час на планирование, чем день на переделку
4. **Оптимизируйте производительность** — правильно кэшируйте и минифицируйте ресурсы
5. **Думайте о SEO** с самого начала

Помните: хороший шаблон должен быть понятным, быстрым и легко поддерживаемым. Следуйте этим принципам, и ваши проекты на MODX будут радовать и вас, и пользователей.

---

*Хотите изучить другие элементы MODX? Читайте мой обзор «[Элементы MODX: шаблоны, чанки, сниппеты](/blog/modx-elementy-shablony-chanki-snippety/)» — полное руководство по архитектуре MODX.*

## Полезные ресурсы

- [Документация по шаблонам](https://docs.modx.com/revolution/2.x/making-sites-with-modx/structuring-your-site/templates)
- [Теги MODX](https://docs.modx.com/revolution/2.x/making-sites-with-modx/customizing-content/template-variables)
- [Фильтры вывода](https://docs.modx.com/revolution/2.x/making-sites-with-modx/customizing-content/input-and-output-filters)

## Чек-лист готового шаблона

- [ ] HTML5 семантическая разметка
- [ ] Адаптивность для всех устройств  
- [ ] SEO-оптимизация (meta-теги, Schema.org)
- [ ] Правильное кэширование элементов
- [ ] Обработка пустых значений
- [ ] Оптимизация загрузки ресурсов
- [ ] Микроразметка для поисковиков
- [ ] Доступность (accessibility)
- [ ] Кроссбраузерность
