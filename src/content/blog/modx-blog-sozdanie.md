---
title: "Блог на MODX: настройка, категории, теги, RSS"
description: "Полное руководство по созданию блога на MODX Revolution. Структура, категории, теги, комментарии, RSS-ленты и SEO-оптимизация блога."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-blog-sozdanie.webp"
tags: ["MODX", "Блог", "Контент", "RSS"]
draft: false
---

# Блог на MODX: настройка, категории, теги, RSS

Создание блога на MODX Revolution — это отличный способ добавить динамический контент на сайт и улучшить SEO-показатели. MODX предоставляет всю необходимую функциональность для полноценного блога: от простой структуры статей до сложных систем с тегами, категориями и комментариями.

## Планирование структуры блога

### Базовая архитектура

Правильная структура — основа успешного блога:

```
Блог (/)
├── Категории
│   ├── Веб-разработка (/web-development/)
│   ├── Дизайн (/design/)
│   └── Маркетинг (/marketing/)
├── Архив по датам
│   ├── 2026 (/2026/)
│   ├── 2025 (/2025/)
├── Авторы (/authors/)
└── Теги (/tags/)
```

### URL-структура

Рекомендуемая структура URL для SEO:

```
/blog/ - главная страница блога
/blog/web-development/ - категория
/blog/web-development/how-to-create-website/ - статья
/blog/2026/ - архив по году
/blog/2026/03/ - архив по месяцу
/blog/tag/modx/ - страница тега
/blog/author/john-smith/ - страница автора
```

## Создание базовой структуры

### Корневая страница блога

Создайте основную страницу блога:

```
Название: Блог
Псевдоним: blog
Шаблон: BlogHomeTemplate
Тип содержимого: text/html
Опубликован: Да
Показывать в меню: Да
```

### Шаблон главной страницы блога

**BlogHomeTemplate:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>[[*pagetitle]] - [[++site_name]]</title>
    <meta name="description" content="[[*description:default=`Блог о веб-разработке, дизайне и интернет-маркетинге`]]">
    <link rel="canonical" href="[[~[[*id]]]]">
    <link rel="alternate" type="application/rss+xml" title="RSS" href="[[~[[*id]]]]rss/">
</head>
<body>
    <header>
        <h1>[[*pagetitle]]</h1>
        [[*content]]
    </header>
    
    <main class="blog-main">
        <!-- Последние статьи -->
        <section class="latest-posts">
            [[!pdoResources?
                &parents=`[[*id]]`
                &depth=`3`
                &limit=`10`
                &includeTVs=`blog_image,blog_excerpt,blog_author`
                &tpl=`BlogPostThumbnail`
                &sortby=`publishedon`
                &sortdir=`DESC`
                &where=`{"template:IN":[5,6]}`
            ]]
        </section>
        
        <!-- Пагинация -->
        [[!+page.nav]]
        
        <!-- Сайдбар -->
        <aside class="blog-sidebar">
            <!-- Категории -->
            <section class="blog-categories">
                <h3>Категории</h3>
                [[!pdoMenu?
                    &parents=`[[*id]]`
                    &level=`1`
                    &tpl=`BlogCategoryLink`
                    &where=`{"class_key":"modResource","published":1}`
                ]]
            </section>
            
            <!-- Популярные теги -->
            <section class="blog-tags">
                <h3>Популярные теги</h3>
                [[!TagLister?
                    &parents=`[[*id]]`
                    &limit=`20`
                    &tpl=`BlogTagLink`
                ]]
            </section>
            
            <!-- Архив -->
            <section class="blog-archive">
                <h3>Архив</h3>
                [[!ArchiveLister?
                    &parents=`[[*id]]`
                    &depth=`3`
                    &tpl=`BlogArchiveLink`
                ]]
            </section>
        </aside>
    </main>
</body>
</html>
```

### Шаблон превью статьи

**BlogPostThumbnail:**
```html
<article class="blog-post-preview">
    [[+blog_image:notempty=`
        <div class="post-image">
            <a href="[[+uri]]">
                <img src="[[+blog_image]]" alt="[[+pagetitle]]" loading="lazy">
            </a>
        </div>
    `]]
    
    <div class="post-content">
        <header class="post-header">
            <h2 class="post-title">
                <a href="[[+uri]]">[[+pagetitle]]</a>
            </h2>
            
            <div class="post-meta">
                <time datetime="[[+publishedon:date=`%Y-%m-%d`]]">
                    [[+publishedon:date=`%d.%m.%Y`]]
                </time>
                
                [[+blog_author:notempty=`
                    <span class="post-author">
                        Автор: [[+blog_author]]
                    </span>
                `]]
                
                [[+parent:ne=`[[*id]]`:then=`
                    <span class="post-category">
                        <a href="[[~[[+parent]]]]">[[+parent:is=``:then=`Разное`:else=`[[+parent:getPageTitle]]`]]</a>
                    </span>
                `]]
            </div>
        </header>
        
        <div class="post-excerpt">
            [[+blog_excerpt:default=`[[+introtext:limit=`300`:strip_tags]]`]]
        </div>
        
        <footer class="post-footer">
            <a href="[[+uri]]" class="read-more">Читать далее →</a>
            
            [[+tags:notempty=`
                <div class="post-tags">
                    [[+tags]]
                </div>
            `]]
        </footer>
    </div>
</article>
```

## Создание категорий блога

### Структура категорий

Создайте категории как дочерние страницы блога:

```
Категория "Веб-разработка":
- Название: Веб-разработка  
- Псевдоним: web-development
- Родитель: Блог
- Шаблон: BlogCategoryTemplate
- Описание: Статьи о создании сайтов, программировании и новых технологиях
```

### Шаблон категории

**BlogCategoryTemplate:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>[[*pagetitle]] - Блог - [[++site_name]]</title>
    <meta name="description" content="[[*description]]">
    <link rel="canonical" href="[[~[[*id]]]]">
</head>
<body>
    <main class="category-page">
        <header class="category-header">
            <h1>[[*pagetitle]]</h1>
            [[*content:notempty=`<div class="category-description">[[*content]]</div>`]]
            
            <nav class="breadcrumbs">
                <a href="[[~[[*parent]]]]">Блог</a> → [[*pagetitle]]
            </nav>
        </header>
        
        <section class="category-posts">
            [[!pdoPage?
                &element=`pdoResources`
                &parents=`[[*id]]`
                &depth=`2`
                &limit=`10`
                &includeTVs=`blog_image,blog_excerpt,blog_author`
                &tpl=`BlogPostThumbnail`
                &sortby=`publishedon`
                &sortdir=`DESC`
                &pageLimit=`10`
            ]]
            
            [[!+page.nav]]
        </section>
        
        <!-- Сайдбар с подкатегориями -->
        <aside class="category-sidebar">
            [[!pdoMenu?
                &parents=`[[*id]]`
                &level=`1`
                &tpl=`BlogSubcategoryLink`
                &where=`{"published":1}`
            ]]
        </aside>
    </main>
</body>
</html>
```

### Автоматические категории по тегам

Можно создать динамические категории на основе тегов:

```
[[!getResources?
    &parents=`5`
    &includeTVs=`tags`
    &where=`{"tags:LIKE":"%[[+tag]]%"}`
    &tpl=`BlogPostThumbnail`
]]
```

## Шаблон отдельной статьи

### Структура статьи

**BlogPostTemplate:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>[[*pagetitle]] - Блог - [[++site_name]]</title>
    <meta name="description" content="[[*description:default=`[[*introtext:limit=160:strip_tags]]`]]">
    <meta property="og:title" content="[[*pagetitle]]">
    <meta property="og:description" content="[[*description:default=`[[*introtext:limit=160:strip_tags]]`]]">
    <meta property="og:image" content="[[*blog_image:phpthumbof=`w=1200&h=630&zc=1`]]">
    <meta property="og:type" content="article">
    <meta property="article:published_time" content="[[*publishedon:date=`c`]]">
    <meta property="article:modified_time" content="[[*editedon:date=`c`]]">
    <link rel="canonical" href="[[~[[*id]]]]">
    
    <!-- JSON-LD структурированные данные -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "[[*pagetitle:escape]]",
        "description": "[[*description:default=`[[*introtext:limit=160:strip_tags]]`:escape]]",
        "image": "[[*blog_image:phpthumbof=`w=1200&h=630&zc=1`:toAbsoluteUrl]]",
        "author": {
            "@type": "Person",
            "name": "[[*blog_author:default=`[[++site_name]]`]]"
        },
        "publisher": {
            "@type": "Organization",
            "name": "[[++site_name]]",
            "logo": {
                "@type": "ImageObject",
                "url": "[[++site_url]]assets/images/logo.png"
            }
        },
        "datePublished": "[[*publishedon:date=`c`]]",
        "dateModified": "[[*editedon:date=`c`]]",
        "mainEntityOfPage": "[[~[[*id]]]]"
    }
    </script>
</head>
<body>
    <article class="blog-post">
        <header class="post-header">
            <nav class="breadcrumbs">
                <a href="[[~[[GetPage? &id=`[[*parent]]` &field=`parent`]]]]">Блог</a> →
                <a href="[[~[[*parent]]]]">[[*parent:pageTitle]]</a> →
                <span>[[*pagetitle]]</span>
            </nav>
            
            <h1 class="post-title">[[*pagetitle]]</h1>
            
            <div class="post-meta">
                <time datetime="[[*publishedon:date=`%Y-%m-%d`]]" class="post-date">
                    [[*publishedon:date=`%d.%m.%Y`]]
                </time>
                
                [[*blog_author:notempty=`
                    <span class="post-author">
                        Автор: <strong>[[*blog_author]]</strong>
                    </span>
                `]]
                
                [[*blog_reading_time:notempty=`
                    <span class="reading-time">
                        Время чтения: [[*blog_reading_time]] мин
                    </span>
                `]]
                
                <span class="post-category">
                    Рубрика: <a href="[[~[[*parent]]]]">[[*parent:pageTitle]]</a>
                </span>
            </div>
            
            [[*blog_image:notempty=`
                <div class="post-featured-image">
                    <img src="[[*blog_image]]" alt="[[*pagetitle]]" />
                </div>
            `]]
        </header>
        
        <div class="post-content">
            [[*content]]
        </div>
        
        <footer class="post-footer">
            [[*tags:notempty=`
                <div class="post-tags">
                    <strong>Теги:</strong> [[*tags]]
                </div>
            `]]
            
            <!-- Социальные кнопки -->
            <div class="social-share">
                <h4>Поделиться:</h4>
                <a href="https://vk.com/share.php?url=[[~[[*id]]]]&title=[[*pagetitle:encode]]" target="_blank">ВКонтакте</a>
                <a href="https://telegram.me/share/url?url=[[~[[*id]]]]&text=[[*pagetitle:encode]]" target="_blank">Telegram</a>
                <a href="https://twitter.com/intent/tweet?url=[[~[[*id]]]]&text=[[*pagetitle:encode]]" target="_blank">Twitter</a>
            </div>
            
            <!-- Навигация к соседним постам -->
            <nav class="post-navigation">
                [[!pdoNeighbors?
                    &tplPrev=`<div class="nav-prev"><a href="[[+uri]]">← [[+pagetitle]]</a></div>`
                    &tplNext=`<div class="nav-next"><a href="[[+uri]]">[[+pagetitle]] →</a></div>`
                    &tplWrapper=`<div class="post-nav-wrapper">[[+prev]][[+next]]</div>`
                ]]
            </nav>
        </footer>
    </article>
    
    <!-- Похожие статьи -->
    <section class="related-posts">
        <h3>Похожие статьи</h3>
        [[!pdoResources?
            &parents=`[[*parent]]`
            &resources=`-[[*id]]`
            &limit=`3`
            &tpl=`BlogRelatedPost`
            &includeTVs=`blog_image`
            &sortby=`RAND()`
        ]]
    </section>
</body>
</html>
```

### TV поля для статей

Создайте дополнительные поля для статей:

```
TV "blog_image":
- Тип ввода: Изображение
- Категория: Блог
- Шаблоны: BlogPostTemplate

TV "blog_excerpt":  
- Тип ввода: Текст (многострочный)
- Категория: Блог
- Описание: Краткое описание статьи

TV "blog_author":
- Тип ввода: Текст
- Категория: Блог  
- Значение по умолчанию: [[++site_name]]

TV "blog_reading_time":
- Тип ввода: Число
- Категория: Блог
- Описание: Время чтения в минутах

TV "tags":
- Тип ввода: Список тегов
- Категория: Блог
- Для автодополнения и фильтрации
```

## Система тегов

### Создание тегов

Теги можно реализовать через TV поле или отдельную таблицу:

**Простой вариант через TV:**
```
TV "tags":
Тип ввода: Текст
Обработка вывода: 
@SELECT `tag` as name, `tag` as value FROM `custom_tags` WHERE FIND_IN_SET(`tag`, '[[+value]]') ORDER BY `tag`

Или простое перечисление через запятую:
веб-разработка, MODX, PHP, фронтенд
```

### Страницы тегов

Создайте динамические страницы для тегов:

```
Страница "Теги": /blog/tags/
[[!TagLister?
    &parents=`5`
    &limit=`50`
    &tpl=`BlogTagCloud`
    &sortBy=`count`
    &sortDir=`DESC`
]]
```

**BlogTagCloud:**
```html
<div class="tag-cloud">
    [[+tags]]
</div>

<!-- Для отдельного тега -->
<a href="[[~TagPage? &tag=`[[+tag]]`]]" 
   class="tag-link tag-size-[[+weight]]" 
   title="[[+count]] статей">
    [[+tag]]
</a>
```

### Фильтрация по тегам

```
<!-- Страница тега: /blog/tag/modx/ -->
[[!pdoResources?
    &parents=`5`
    &depth=`3`
    &includeTVs=`tags`
    &where=`{"tags:LIKE":"%[[!+tag]]%"}`
    &tpl=`BlogPostThumbnail`
    &limit=`10`
]]
```

## RSS-лента

### Создание RSS-ресурса

Создайте страницу RSS:

```
Название: RSS Feed
Псевдоним: rss  
Родитель: Блог
Тип содержимого: application/rss+xml
Шаблон: RSSTemplate
Опубликован: Да
Показывать в меню: Нет
```

### RSS шаблон

**RSSTemplate:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>[[++site_name]] - Блог</title>
        <link>[[++site_url]]blog/</link>
        <description>[[++site_description]]</description>
        <language>ru-ru</language>
        <atom:link href="[[~[[*id]]]]" rel="self" type="application/rss+xml" />
        <lastBuildDate>[[pdoResources? &parents=`[[*parent]]` &limit=`1` &sortby=`publishedon` &sortdir=`DESC` &tpl=`@INLINE [[+publishedon:date=`D, d M Y H:i:s O`]]`]]</lastBuildDate>
        
        [[!pdoResources?
            &parents=`[[*parent]]`
            &depth=`3`
            &limit=`20`
            &sortby=`publishedon`
            &sortdir=`DESC`
            &tpl=`RSSItem`
            &includeTVs=`blog_image,blog_excerpt`
            &where=`{"published":1}`
        ]]
    </channel>
</rss>
```

**RSSItem:**
```xml
<item>
    <title><![CDATA[[[+pagetitle]]]]></title>
    <link>[[+uri:toAbsoluteUrl]]</link>
    <description><![CDATA[[[+blog_excerpt:default=`[[+introtext:limit=300:strip_tags]]`]]]]></description>
    <author>[[+blog_author:default=`noreply@[[++http_host]]`]] ([[+blog_author:default=`[[++site_name]]`]])</author>
    <category><![CDATA[[[+parent:pageTitle]]]]></category>
    <guid isPermaLink="false">[[+uri:toAbsoluteUrl]]</guid>
    <pubDate>[[+publishedon:date=`D, d M Y H:i:s O`]]</pubDate>
    [[+blog_image:notempty=`
        <enclosure url="[[+blog_image:toAbsoluteUrl]]" type="image/jpeg" length="0" />
    `]]
</item>
```

### JSON Feed

Также можно создать современную JSON-ленту:

```
Тип содержимого: application/feed+json
```

**JSONFeedTemplate:**
```json
{
    "version": "https://jsonfeed.org/version/1",
    "title": "[[++site_name]] - Блог",
    "home_page_url": "[[++site_url]]blog/",
    "feed_url": "[[~[[*id]]]]",
    "description": "[[++site_description]]",
    "items": [
        [[!pdoResources?
            &parents=`[[*parent]]`
            &limit=`20`
            &tpl=`JSONFeedItem`
            &outputSeparator=`,`
            &sortby=`publishedon`
            &sortdir=`DESC`
        ]]
    ]
}
```

## Комментарии

### Интеграция с Quip

Для комментариев используйте дополнение Quip:

```
<!-- В шаблоне статьи -->
<section class="comments">
    <h3>Комментарии</h3>
    
    [[!QuipReply? 
        &thread=`blog-post-[[*id]]`
        &threadCreateIfNotExists=`1`
        &requireAuth=`1`
        &useCaptcha=`1`
    ]]
    
    [[!Quip?
        &thread=`blog-post-[[*id]]`
        &tplComment=`BlogComment`
        &limit=`20`
        &sortBy=`createdon`
        &sortDir=`ASC`
    ]]
</section>
```

**BlogComment:**
```html
<article class="comment" id="comment-[[+id]]">
    <header class="comment-meta">
        <strong class="comment-author">[[+username:default=`[[+name]]`]]</strong>
        <time datetime="[[+createdon:date=`%Y-%m-%d %H:%M`]]">
            [[+createdon:date=`%d.%m.%Y в %H:%M`]]
        </time>
        <a href="#comment-[[+id]]" class="comment-link">#</a>
    </header>
    
    <div class="comment-content">
        [[+body:nl2br]]
    </div>
    
    <footer class="comment-actions">
        [[+can_reply:is=`1`:then=`
            <a href="#" class="comment-reply" data-comment="[[+id]]">Ответить</a>
        `]]
        [[+can_edit:is=`1`:then=`
            <a href="#" class="comment-edit" data-comment="[[+id]]">Редактировать</a>
        `]]
    </footer>
    
    [[+children:notempty=`
        <div class="comment-children">
            [[+children]]
        </div>
    `]]
</article>
```

### Дисqus как альтернатива

```html
<!-- В конце шаблона статьи -->
<div id="disqus_thread"></div>
<script>
var disqus_config = function () {
    this.page.url = '[[~[[*id]]]]';
    this.page.identifier = 'post-[[*id]]';
    this.page.title = '[[*pagetitle:escape]]';
};

(function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://YOUR-SITE.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
})();
</script>
```

## Поиск по блогу

### SimpleSearch интеграция

```
<!-- Форма поиска -->
<form action="[[~[[*id]]]]" method="get" class="search-form">
    <input type="text" name="search" value="[[!+search]]" placeholder="Поиск по блогу...">
    <button type="submit">Найти</button>
</form>

<!-- Результаты поиска -->
[[!SimpleSearch?
    &searchIndex=`blog`
    &contexts=`web`
    &containerTpl=`SearchResults`
    &tpl=`SearchResult`
    &includeTVs=`blog_image,blog_excerpt`
    &processTVs=`1`
    &highlightResults=`1`
    &highlightClass=`search-highlight`
    &searchEngine=`zend`
    &method=`GET`
]]
```

### Полнотекстовый поиск

Больше возможностей с mSearch2:

```
[[!mSearch2?
    &parents=`5`
    &returnIds=`1`
    &showLog=`0`
    &includeTVs=`tags,blog_author`
    &class=`modResource`
]]

[[!pdoResources?
    &resources=`[[+mSearch2.ids]]`
    &parents=`0`
    &tpl=`BlogSearchResult`
    &includeTVs=`blog_image,blog_excerpt`
]]
```

## SEO-оптимизация блога

### Автоматические мета-теги

Создайте плагин для автогенерации мета-тегов:

```php
// Событие: OnWebPagePrerender
switch($modx->resource->get('template')) {
    case 5: // BlogPostTemplate
        // Автогенерация description из контента
        if(empty($modx->resource->get('description'))) {
            $content = strip_tags($modx->resource->get('content'));
            $description = substr($content, 0, 160);
            $modx->resource->set('description', $description);
        }
        
        // Генерация keywords из тегов
        $tags = $modx->resource->getTVValue('tags');
        if($tags) {
            $keywords = str_replace(',', ', ', $tags);
            $modx->regClientStartupHTMLBlock('<meta name="keywords" content="'.$keywords.'">');
        }
        break;
}
```

### Sitemap.xml для блога

Создайте отдельную карту сайта для блога с использованием pdoTools. Подробнее о работе с pdoTools можно узнать в статье [pdoTools: полное руководство](/blog/modx-pdotools-rukovodstvo/).

```xml
<!-- /blog/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    [[!pdoSitemap?
        &parents=`5`
        &depth=`10`  
        &templates=`5,6`
        &tpl=`SitemapBlogItem`
        &sortby=`publishedon`
        &sortdir=`DESC`
        &limit=`0`
    ]]
</urlset>
```

**SitemapBlogItem:**
```xml
<url>
    <loc>[[+url]]</loc>
    <lastmod>[[+editedon:default=`[[+publishedon]]`:date=`%Y-%m-%d`]]</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
</url>
```

## Аналитика и метрики блога

### Интеграция с Google Analytics

```html
<!-- Отслеживание чтения статей -->
<script>
// Отправка события при прочтении 50% статьи
window.addEventListener('scroll', function() {
    var scrollPercent = (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercent > 50 && !window.halfReadSent) {
        gtag('event', 'scroll', {
            'event_category': 'engagement',
            'event_label': '[[*pagetitle]]',
            'value': 50
        });
        window.halfReadSent = true;
    }
});

// Время на странице
var startTime = Date.now();
window.addEventListener('beforeunload', function() {
    var timeOnPage = Math.round((Date.now() - startTime) / 1000);
    gtag('event', 'timing_complete', {
        'name': 'time_on_page',
        'value': timeOnPage
    });
});
</script>
```

### Счетчик просмотров

```php
// Плагин для подсчета просмотров
// Событие: OnWebPageInit
if($modx->resource->get('template') == 5) { // BlogPostTemplate
    $views = (int)$modx->resource->getTVValue('views') + 1;
    $modx->resource->setTVValue('views', $views);
    $modx->resource->save();
}
```

## Интеграция с дополнениями

Блог можно расширить различными дополнениями. Список лучших дополнений MODX смотрите в статье [Топ дополнений MODX](/blog/modx-dopolneniya-top/).

### Collections для массовых статей

```
// Для блогов с сотнями статей
Collections позволяет:
- Быструю загрузку списков
- Массовое редактирование
- Импорт/экспорт статей
- Дублирование контента
```

### Tickets как готовое решение

```
// Альтернатива собственному блогу
Tickets включает:
- Готовые шаблоны блога
- Систему комментариев  
- Голосования и рейтинги
- Уведомления по email
- Модерацию контента
```

## Производительность блога

### Кеширование

```
// Кеширование списков статей
[[pdoResources?
    &cache=`1`
    &cacheTime=`3600`
    &cacheKey=`blog_posts_page_[[+page]]`
]]

// Кеширование сайдбара
[[!+blog_sidebar:empty=`
    [[!pdoMenu:cache=`blog_categories`:cacheTime=`7200`?
        &parents=`[[*id]]`
        &level=`1`
    ]]
    [[!+blog_sidebar:set=`[[+output]]`]]
`]]
[[!+blog_sidebar]]
```

### Оптимизация изображений

```
// Автоматическое создание WebP версий
TV "blog_image" с обработкой:
@EVAL return '[[+value:phpthumbof=`w=800&h=400&zc=1&f=webp`:default=`[[+value:phpthumbof=`w=800&h=400&zc=1`]]`]]';
```

## Заключение

Создание блога на MODX Revolution — это гибкое решение, которое можно адаптировать под любые требования:

**Основные компоненты:**
- Продуманная структура категорий и статей
- Система тегов для группировки контента
- RSS-ленты для подписчиков
- SEO-оптимизация и аналитика
- Комментарии и социальная интеграция

**Лучшие практики:**
1. **Планируйте структуру заранее** — правильная иерархия упростит навигацию
2. **Используйте TV поля** для дополнительных данных (автор, время чтения, изображения)
3. **Настройте кеширование** для улучшения производительности
4. **Добавьте RSS-ленты** для удержания аудитории
5. **Мониторьте SEO-показатели** и пользовательское поведение

MODX предоставляет все необходимые инструменты для создания успешного блога — от простого корпоративного блога до крупного медиа-проекта с тысячами статей.