---
title: "Галерея в MODX: загрузка фото, слайдеры, лайтбоксы"
description: "Полное руководство по работе с изображениями в MODX. Установка Gallery, создание фотогалерей, слайдеров, лайтбоксов и оптимизация изображений."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-gallery-rabota-s-foto.webp"
tags: ["MODX", "Gallery", "Изображения", "Фото"]
draft: false
---


Gallery — это одно из самых популярных дополнений MODX для управления изображениями. Оно предоставляет полный функционал для загрузки, организации и отображения фотографий: от простых галерей до сложных слайдеров с множественными эффектами.

## Что такое Gallery и зачем оно нужно

Gallery решает все задачи, связанные с изображениями на сайте:

- **Пакетная загрузка** — загружайте десятки изображений одновременно
- **Автоматическая оптимизация** — создание превью разных размеров
- **Управление альбомами** — организация по категориям и альбомам
- **Гибкий вывод** — множество готовых шаблонов отображения
- **SEO-дружелюбность** — автоматические alt и title для изображений

### Преимущества Gallery

- Простота использования для клиентов
- Автоматическая обработка изображений
- Поддержка watermark (водяных знаков)
- Интеграция с популярными JavaScript библиотеками
- Гибкая система разрешений доступа

## Установка и базовая настройка

### Установка через менеджер пакетов

1. Зайдите в **Управление → Установщики пакетов**
2. Найдите "Gallery" в репозитории
3. Нажмите "Загрузить" и затем "Установить"
4. Следуйте инструкциям мастера установки

### Первоначальная настройка

После установки настройте основные параметры в **Система → Настройки системы**, пространство имен "gallery":

```
gallery.thumbnails_prepend_site_url = Yes
gallery.backend_thumb_far = Yes  
gallery.backend_thumb_quality = 90
gallery.debug = No
gallery.use_richtext = Yes
gallery.crops_dir = assets/components/gallery/crops/
```

### Создание первого альбома

1. Перейдите в **Дополнения → Gallery**
2. Нажмите "Создать альбом"
3. Заполните основные поля:
   - Название: "Фотогалерея"
   - Описание: "Основная галерея сайта"
   - Активен: Да

## Структура и управление альбомами

### Создание альбомов

Альбомы в Gallery — это контейнеры для группировки изображений:

```
Альбом "Наши работы"
├── Подальбом "Интерьеры"
├── Подальбом "Экстерьеры" 
└── Подальбом "Ландшафтный дизайн"
```

### Настройки альбома

При создании альбома можно настроить:

- **Название и описание**
- **Родительский альбом** (для создания иерархии)
- **Разрешения доступа** (кто может просматривать/редактировать)
- **Настройки водяного знака**
- **Размеры превью**

### Массовые операции

Gallery поддерживает массовые операции:

```
Выделить все изображения → Действия:
- Переместить в другой альбом
- Изменить теги
- Применить водяной знак
- Удалить
- Экспорт в ZIP
```

## Загрузка и обработка изображений

### Простая загрузка

Для загрузки изображений:

1. Откройте нужный альбом
2. Нажмите "Загрузить изображения"
3. Выберите файлы (поддерживается drag&drop)
4. Дождитесь обработки

### Пакетная загрузка

```
Настройки пакетной загрузки:
- Максимальный размер файла: 10MB
- Разрешенные форматы: JPG, PNG, GIF, WebP
- Максимальное разрешение: 4000x4000px
- Автоматическое изменение размера: Да
```

### Настройки обработки изображений

```
// Размеры превью в системных настройках
gallery.backend_thumb_width = 150
gallery.backend_thumb_height = 150
gallery.backend_thumb_zoomcrop = Yes
gallery.backend_thumb_quality = 90

// Настройки основного изображения  
gallery.image_width = 1200
gallery.image_height = 800
gallery.image_quality = 85
```

### Водяные знаки

Настройка watermark:

```
gallery.watermark_image = assets/images/watermark.png
gallery.watermark_position = br (bottom-right)
gallery.watermark_margin_right = 10
gallery.watermark_margin_bottom = 10
```

## Вывод галерей на сайте

### Основной сниппет Gallery

```
[[!Gallery?
    &album=`1`
    &thumbTpl=`galItemThumb`
    &containerTpl=`galContainer`
    &thumbWidth=`200`
    &thumbHeight=`200`
    &thumbZoomCrop=`1`
    &limit=`12`
]]
```

### Параметры сниппета

#### Основные параметры

```
&album=`1` - ID альбома
&limit=`12` - количество изображений
&sort=`rank` - сортировка (rank, name, createdon)
&dir=`ASC` - направление сортировки
&offset=`0` - смещение для пагинации
```

#### Настройки превью

```
&thumbWidth=`300`
&thumbHeight=`200` 
&thumbZoomCrop=`1` - обрезка по центру
&thumbFar=`C` - точка фокуса (C, TL, T, TR, L, R, BL, B, BR)
&thumbQuality=`85` - качество JPEG
```

#### Шаблоны

```
&containerTpl=`galContainer` - обертка галереи
&thumbTpl=`galItemThumb` - элемент изображения
&tagTpl=`galTagLink` - ссылка на тег
&pageTpl=`galPage` - пагинация
```

### Шаблон контейнера галереи

**galContainer:**
```html
<div class="gallery-container" id="gallery-[[+album]]">
    [[+thumbnails]]
    
    [[+pagination:notempty=`
        <div class="gallery-pagination">
            [[+pagination]]
        </div>
    `]]
</div>
```

### Шаблон элемента изображения

**galItemThumb:**
```html
<div class="gallery-item" data-id="[[+id]]">
    <a href="[[+image_absolute]]" 
       class="gallery-link"
       title="[[+name]]"
       data-lightbox="gallery-[[+album]]">
        <img src="[[+thumbnail]]" 
             alt="[[+name]]" 
             class="gallery-thumb"
             width="[[+thumb_width]]"
             height="[[+thumb_height]]">
        
        [[+name:notempty=`
            <div class="gallery-caption">
                [[+name]]
            </div>
        `]]
    </a>
    
    [[+tags:notempty=`
        <div class="gallery-tags">
            [[+tags]]
        </div>
    `]]
</div>
```

## Создание слайдеров

### Swiper.js слайдер

```html
<!-- Подключение Swiper -->
<link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css">
<script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>

<div class="swiper gallery-slider">
    <div class="swiper-wrapper">
        [[!Gallery?
            &album=`1`
            &thumbTpl=`galSliderItem`
            &containerTpl=`galSliderContainer`
            &limit=`0`
        ]]
    </div>
    
    <!-- Navigation -->
    <div class="swiper-button-next"></div>
    <div class="swiper-button-prev"></div>
    
    <!-- Pagination -->
    <div class="swiper-pagination"></div>
</div>

<script>
const swiper = new Swiper('.gallery-slider', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});
</script>
```

**galSliderItem:**
```html
<div class="swiper-slide">
    <img src="[[+image]]" alt="[[+name]]" class="slider-image">
    [[+description:notempty=`
        <div class="slide-caption">[[+description]]</div>
    `]]
</div>
```

### Owl Carousel слайдер

```html
<!-- Подключение Owl Carousel -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"></script>

<div class="owl-carousel gallery-owl">
    [[!Gallery?
        &album=`1`
        &thumbTpl=`galOwlItem`
        &containerTpl=`@INLINE [[+thumbnails]]`
    ]]
</div>

<script>
$('.gallery-owl').owlCarousel({
    loop: true,
    margin: 10,
    nav: true,
    navText: ['←', '→'],
    autoplay: true,
    autoplayTimeout: 3000,
    responsive: {
        0: { items: 1 },
        600: { items: 2 },
        1000: { items: 3 }
    }
});
</script>
```

## Лайтбоксы и модальные окна

### Lightbox2

```html
<!-- Подключение Lightbox2 -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox.min.js"></script>

<div class="gallery-lightbox">
    [[!Gallery?
        &album=`1`
        &thumbTpl=`galLightboxThumb`
        &containerTpl=`galContainer`
    ]]
</div>

<script>
lightbox.option({
    'resizeDuration': 200,
    'wrapAround': true,
    'albumLabel': 'Изображение %1 из %2'
});
</script>
```

**galLightboxThumb:**
```html
<div class="gallery-item">
    <a href="[[+image_absolute]]" 
       data-lightbox="gallery"
       data-title="[[+name]][[+description:notempty=` - [[+description]]`]]">
        <img src="[[+thumbnail]]" 
             alt="[[+name]]" 
             class="gallery-thumb">
    </a>
</div>
```

### Fancybox

```html
<!-- Подключение Fancybox -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.js"></script>

<div class="gallery-fancybox">
    [[!Gallery?
        &album=`1`
        &thumbTpl=`galFancyboxThumb`
        &containerTpl=`galContainer`
    ]]
</div>

<script>
$('[data-fancybox="gallery"]').fancybox({
    buttons: ['slideShow', 'thumbs', 'zoom', 'fullScreen', 'close'],
    loop: true,
    animationEffect: 'fade',
    transitionEffect: 'slide'
});
</script>
```

**galFancyboxThumb:**
```html
<div class="gallery-item">
    <a href="[[+image_absolute]]" 
       data-fancybox="gallery"
       data-caption="[[+name]]">
        <img src="[[+thumbnail]]" alt="[[+name]]">
        
        <div class="gallery-overlay">
            <span class="zoom-icon">🔍</span>
        </div>
    </a>
</div>
```

## Адаптивные галереи

### CSS Grid галерея

```css
.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
}

.gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.gallery-item:hover {
    transform: scale(1.05);
}

.gallery-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
}

.gallery-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    color: white;
    padding: 20px 15px 15px;
    font-size: 14px;
}

@media (max-width: 768px) {
    .gallery-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
        padding: 10px;
    }
    
    .gallery-item img {
        height: 150px;
    }
}
```

### Masonry (кирпичная кладка)

```html
<!-- Подключение Masonry -->
<script src="https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js"></script>

<div class="gallery-masonry" data-masonry='{"itemSelector": ".gallery-item", "columnWidth": 300, "gutter": 20}'>
    [[!Gallery?
        &album=`1`
        &thumbTpl=`galMasonryItem`
        &containerTpl=`@INLINE [[+thumbnails]]`
        &thumbWidth=`300`
        &thumbHeight=`0` // Сохранить пропорции
        &thumbZoomCrop=`0`
    ]]
</div>

<script>
// Инициализация после загрузки изображений
window.addEventListener('load', function() {
    $('.gallery-masonry').masonry({
        itemSelector: '.gallery-item',
        columnWidth: 300,
        gutter: 20,
        fitWidth: true
    });
});
</script>
```

## Фильтрация и поиск

### Фильтр по тегам

```
[[!Gallery?
    &album=`1`
    &tag=`[[!+fi.tag]]`
    &thumbTpl=`galItemThumb`
]]

<!-- Форма фильтрации -->
<form method="get" class="gallery-filter">
    <select name="tag" onchange="this.form.submit()">
        <option value="">Все изображения</option>
        <option value="интерьер" [[!+fi.tag:FormItIsSelected=`интерьер`]]>Интерьер</option>
        <option value="экстерьер" [[!+fi.tag:FormItIsSelected=`экстерьер`]]>Экстерьер</option>
        <option value="ландшафт" [[!+fi.tag:FormItIsSelected=`ландшафт`]]>Ландшафт</option>
    </select>
</form>
```

### JavaScript фильтрация

```html
<div class="filter-controls">
    <button class="filter-btn active" data-filter="*">Все</button>
    <button class="filter-btn" data-filter=".interior">Интерьер</button>
    <button class="filter-btn" data-filter=".exterior">Экстерьер</button>
    <button class="filter-btn" data-filter=".landscape">Ландшафт</button>
</div>

<div class="gallery-filterable">
    [[!Gallery?
        &album=`1`
        &thumbTpl=`galFilterableThumb`
    ]]
</div>

<script>
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Убираем активный класс у всех кнопок
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        // Добавляем активный класс текущей кнопке
        this.classList.add('active');
        
        const filter = this.getAttribute('data-filter');
        const items = document.querySelectorAll('.gallery-item');
        
        items.forEach(item => {
            if (filter === '*' || item.classList.contains(filter.slice(1))) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});
</script>
```

**galFilterableThumb:**
```html
<div class="gallery-item [[+tags:replace=` `:``]]">
    <a href="[[+image_absolute]]" data-lightbox="gallery">
        <img src="[[+thumbnail]]" alt="[[+name]]">
    </a>
</div>
```

## Интеграция с другими компонентами

Gallery хорошо интегрируется с другими дополнениями MODX. Подробнее о дополнениях читайте в статье [Топ дополнений MODX](/blog/modx-dopolneniya-top/).

### Integration с Articles

```
<!-- В шаблоне статьи -->
[[+gallery:notempty=`
    <div class="article-gallery">
        <h3>Галерея</h3>
        [[!Gallery? &album=`[[+gallery]]`]]
    </div>
`]]
```

### Collections + Gallery

```
<!-- Для каждого элемента коллекции своя галерея -->
[[!getResources?
    &parents=`[[*id]]`
    &tpl=`collectionItemWithGallery`
]]
```

**collectionItemWithGallery:**
```html
<article class="collection-item">
    <h3>[[+pagetitle]]</h3>
    [[+content]]
    
    [[+gallery_album:notempty=`
        <div class="item-gallery">
            [[!Gallery? &album=`[[+gallery_album]]` &limit=`6`]]
        </div>
    `]]
</article>
```

## SEO-оптимизация изображений

### Автоматические alt и title

```
// При загрузке изображений автоматически заполнять:
Alt текст: название файла без расширения
Title: название альбома + номер изображения
Description: извлечение EXIF данных (если есть)
```

### Ленивая загрузка (Lazy Loading)

```html
<!-- Современный подход с loading="lazy" -->
<img src="[[+thumbnail]]" 
     loading="lazy"
     alt="[[+name]]"
     width="[[+thumb_width]]"
     height="[[+thumb_height]]">

<!-- Или с JavaScript библиотекой -->
<script src="https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.8.3/dist/lazyload.min.js"></script>

<img data-src="[[+thumbnail]]"
     class="lazy"
     alt="[[+name]]">

<script>
var lazyLoad = new LazyLoad({
    elements_selector: ".lazy"
});
</script>
```

### Структурированные данные

```html
<!-- JSON-LD разметка для галереи -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "[[+album.name]]",
    "description": "[[+album.description]]",
    "image": [
        [[!Gallery?
            &album=`1`
            &thumbTpl=`galSchemaItem`
            &containerTpl=`@INLINE [[+thumbnails]]`
            &limit=`0`
        ]]
    ]
}
</script>
```

**galSchemaItem:**
```html
{
    "@type": "ImageObject",
    "url": "[[+image_absolute]]",
    "thumbnail": "[[+thumbnail_absolute]]",
    "name": "[[+name:escape]]",
    "description": "[[+description:escape]]"
}[[+idx:ne=`[[+total]]`:then=`,`]]
```

## Оптимизация производительности

### WebP поддержка

```php
// Хук для автоматического создания WebP версий
public function generateWebP($image_path) {
    $webp_path = str_replace(['.jpg', '.jpeg', '.png'], '.webp', $image_path);
    
    $image_info = getimagesize($image_path);
    $mime_type = $image_info['mime'];
    
    switch ($mime_type) {
        case 'image/jpeg':
            $image = imagecreatefromjpeg($image_path);
            break;
        case 'image/png':
            $image = imagecreatefrompng($image_path);
            break;
        default:
            return false;
    }
    
    imagewebp($image, $webp_path, 85);
    imagedestroy($image);
    
    return $webp_path;
}
```

```html
<!-- Использование WebP с fallback -->
<picture>
    <source srcset="[[+thumbnail:replace=`.jpg`:``.webp`:replace=`.png`:``.webp`]]" type="image/webp">
    <img src="[[+thumbnail]]" alt="[[+name]]">
</picture>
```

### Кеширование галерей

```
[[Gallery?
    &album=`1`
    &cache=`1`
    &cacheKey=`gallery_album_1`
    &cacheExpires=`3600`
]]
```

### Оптимизация загрузки

```css
/* Предотвращение скачков при загрузке */
.gallery-item {
    aspect-ratio: 4/3; /* Задаем соотношение сторон */
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Skeleton loader */
.gallery-item.loading {
    background: linear-gradient(90deg, #f0f0f0 25%, transparent 37%, #f0f0f0 63%);
    background-size: 400% 100%;
    animation: skeleton 1.5s ease-in-out infinite;
}

@keyframes skeleton {
    0% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
```

## Безопасность и права доступа

### Настройка разрешений

```
// В настройках альбома
Просмотр: Все пользователи
Загрузка: Зарегистрированные пользователи  
Редактирование: Модераторы
Удаление: Администраторы
```

### Защита от прямого доступа

```apache
# В .htaccess папки с изображениями
<Files ~ "\.(php|phtml|php3|php4|php5|pl|py|jsp|asp|sh|cgi)$">
    Deny from all
</Files>

# Защита от hotlinking
RewriteCond %{HTTP_REFERER} !^$
RewriteCond %{HTTP_REFERER} !^http(s)?://(www\.)?yourdomain\.com [NC]
RewriteRule \.(jpg|jpeg|png|gif|webp)$ - [F,L]
```

### Валидация загружаемых файлов

```php
// Проверка типа файла по содержимому, а не расширению
function validateImageUpload($file) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($fileInfo, $file);
    finfo_close($fileInfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        return false;
    }
    
    // Дополнительная проверка на PHP-код в изображениях
    $content = file_get_contents($file);
    if (strpos($content, '<?php') !== false || strpos($content, '<?=') !== false) {
        return false;
    }
    
    return true;
}
```

## Заключение

Gallery — это мощное и гибкое решение для работы с изображениями в MODX Revolution. Оно покрывает все потребности современного веб-сайта:

**Основные возможности:**
- Удобная загрузка и организация изображений
- Автоматическая обработка и оптимизация
- Гибкие варианты отображения (сетки, слайдеры, лайтбоксы)
- SEO-оптимизация и структурированные данные
- Адаптивность и производительность

**Лучшие практики:**
1. **Оптимизируйте изображения** при загрузке
2. **Используйте ленивую загрузку** для больших галерей
3. **Настройте правильные размеры превью** под дизайн
4. **Добавляйте alt и title** для всех изображений
5. **Тестируйте на мобильных устройствах**

Gallery превращает управление изображениями из сложной задачи в простой и приятный процесс, позволяя создавать красивые и функциональные фотогалереи любой сложности.
