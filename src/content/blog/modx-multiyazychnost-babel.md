---
title: "Мультиязычный сайт на MODX: Babel, контексты, hreflang"
description: "Создание многоязычного сайта на MODX: настройка Babel, работа с контекстами, hreflang теги, переключение языков, мультиязычные формы."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-multiyazychnost-babel.webp"
tags: ["MODX", "Babel", "Мультиязычность", "Локализация", "SEO"]
draft: false
---


Создание качественного мультиязычного сайта — сложная задача, требующая продуманной архитектуры. MODX предлагает гибкую систему контекстов и дополнение Babel для управления переводами. В этой статье покажу, как создать полноценный многоязычный сайт с правильной SEO-оптимизацией.

## Подходы к мультиязычности в MODX

### Сравнение методов

**1. Babel + Контексты (рекомендуемый)**
- ✅ Чистая архитектура
- ✅ Независимые URL для каждого языка  
- ✅ Простое управление переводами
- ❌ Сложность начальной настройки

**2. Только контексты**
- ✅ Максимальная гибкость
- ❌ Много ручной работы
- ❌ Отсутствие связи между переводами

**3. TV-параметры для перевода**
- ✅ Простота реализации
- ❌ Плохая масштабируемость
- ❌ Сложность управления большим объёмом контента

## Архитектура мультиязычного сайта

### Структура контекстов

```
site.com/        → web (русский, основной)
site.com/en/     → en (английский)
site.com/de/     → de (немецкий)  
site.com/fr/     → fr (французский)
```

### Создание контекстов

```php
// Контексты в системе
1. web (ru) - Русский (основной)
   - site_url: https://site.com/
   - base_url: /
   - culture_key: ru

2. en - English
   - site_url: https://site.com/en/
   - base_url: /en/
   - culture_key: en

3. de - Deutsch  
   - site_url: https://site.com/de/
   - base_url: /de/
   - culture_key: de

4. fr - Français
   - site_url: https://site.com/fr/
   - base_url: /fr/
   - culture_key: fr
```

### Настройка .htaccess

```apache
RewriteEngine On

# Редиректы языковых версий
RewriteRule ^en/(.*)$ index.php?cultureKey=en&q=$1 [QSA,L]
RewriteRule ^de/(.*)$ index.php?cultureKey=de&q=$1 [QSA,L]
RewriteRule ^fr/(.*)$ index.php?cultureKey=fr&q=$1 [QSA,L]

# Основной редирект для MODX
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?q=$1 [QSA,L]
```

## Установка и настройка Babel

### Установка дополнения

```bash
# Через менеджер пакетов MODX:
# 1. Babel - основное дополнение
# 2. BabelLinks - для переключателя языков
# 3. BabelTranslation - для переводов интерфейса
```

### Базовая настройка Babel

```php
// Системные настройки Babel
'babel.contextDefault' => 'web'
'babel.linktagscheme' => 'full'
'babel.babelTvName' => 'babelLanguageLinks'

// Настройка контекстов Babel
'babel.contextKeys' => 'web,en,de,fr'
```

### Создание TV-параметра для связей

```php
// TV-параметр: babelLanguageLinks
Имя: babelLanguageLinks
Заголовок: "Языковые версии"
Тип ввода: Hidden
Категория: Babel
Доступ: Все шаблоны
```

### Настройка плагина Babel

```php
<?php
// Плагин: Babel
// События: OnDocFormSave, OnDocFormPrerender, OnDocFormRender

switch ($modx->event->name) {
    case 'OnDocFormSave':
        // Автосоздание переводов при сохранении
        $resource = $modx->event->params['resource'];
        $mode = $modx->event->params['mode'];
        
        if ($mode === modSystemEvent::MODE_NEW) {
            $babel = $modx->getService('babel', 'Babel', 
                MODX_CORE_PATH . 'components/babel/model/babel/');
            
            if ($babel) {
                $babel->createLinkedResources($resource);
            }
        }
        break;
        
    case 'OnDocFormPrerender':
        // Добавление Babel-интерфейса в форму ресурса
        $modx->regClientStartupScript($modx->getOption('babel.assets_url') . 
            'mgr/js/babel.js');
        break;
}
```

## Создание многоязычной структуры

### Автоматическое создание переводов

```php
<?php
// Сниппет: CreateBabelStructure
// Создание языковых версий для существующего контента

$sourceContext = 'web';
$targetContexts = ['en', 'de', 'fr'];
$parentId = $scriptProperties['parent'] ?? 0;

// Получаем ресурсы для перевода
$resources = $modx->getCollection('modResource', [
    'context_key' => $sourceContext,
    'parent' => $parentId,
    'published' => 1,
    'deleted' => 0
]);

foreach ($resources as $resource) {
    $babelLinks = [$sourceContext => $resource->get('id')];
    
    // Создаём переводы для каждого целевого контекста
    foreach ($targetContexts as $context) {
        $translation = $modx->newObject('modResource');
        
        // Копируем основные данные
        $translation->fromArray([
            'context_key' => $context,
            'pagetitle' => $resource->get('pagetitle'), // Будет переведено позже
            'longtitle' => $resource->get('longtitle'),
            'description' => $resource->get('description'),
            'alias' => $resource->get('alias'),
            'template' => $resource->get('template'),
            'parent' => $this->getTranslatedParent($resource->get('parent'), $context),
            'published' => 0, // Не публикуем до перевода
            'content' => $resource->get('content')
        ]);
        
        if ($translation->save()) {
            $babelLinks[$context] = $translation->get('id');
        }
    }
    
    // Устанавливаем связи между переводами
    foreach ($babelLinks as $ctx => $id) {
        $res = $modx->getObject('modResource', $id);
        if ($res) {
            $res->setTVValue('babelLanguageLinks', json_encode($babelLinks));
            $res->save();
        }
    }
}

return 'Структура создана для ' . count($resources) . ' ресурсов';
```

### Синхронизация TV-параметров

```php
<?php
// Плагин: BabelTvSync
// Синхронизация определённых TV между языками

$syncTvs = ['gallery', 'video', 'price', 'article']; // Какие TV синхронизировать

switch ($modx->event->name) {
    case 'OnDocFormSave':
        $resource = $modx->event->params['resource'];
        
        // Получаем связанные переводы
        $babelLinks = $resource->getTVValue('babelLanguageLinks');
        if (empty($babelLinks)) return;
        
        $links = json_decode($babelLinks, true);
        if (!is_array($links)) return;
        
        // Синхронизируем TV для всех переводов
        foreach ($links as $context => $resourceId) {
            if ($resourceId == $resource->get('id')) continue;
            
            $translatedResource = $modx->getObject('modResource', $resourceId);
            if (!$translatedResource) continue;
            
            foreach ($syncTvs as $tvName) {
                $value = $resource->getTVValue($tvName);
                $translatedResource->setTVValue($tvName, $value);
            }
            
            $translatedResource->save();
        }
        break;
}
```

## Переключатель языков

### Сниппет BabelLinks

```php
<?php
// Улучшенный сниппет переключателя языков
$resourceId = $modx->resource->get('id');
$currentContext = $modx->context->get('key');

// Конфигурация языков
$languages = [
    'web' => ['name' => 'Русский', 'code' => 'ru', 'flag' => '🇷🇺'],
    'en' => ['name' => 'English', 'code' => 'en', 'flag' => '🇺🇸'],
    'de' => ['name' => 'Deutsch', 'code' => 'de', 'flag' => '🇩🇪'],
    'fr' => ['name' => 'Français', 'code' => 'fr', 'flag' => '🇫🇷']
];

// Получаем связи переводов
$babelLinks = $modx->resource->getTVValue('babelLanguageLinks');
$links = $babelLinks ? json_decode($babelLinks, true) : [];

$output = '<div class="language-switcher">';

foreach ($languages as $context => $lang) {
    $url = '';
    $available = true;
    
    if (isset($links[$context])) {
        // Есть перевод
        $translatedResource = $modx->getObject('modResource', $links[$context]);
        if ($translatedResource && $translatedResource->get('published')) {
            $url = $modx->makeUrl($links[$context], $context, '', 'full');
        } else {
            $available = false;
        }
    } else {
        // Нет перевода - ссылка на главную
        $homeId = $modx->getOption('site_start', null, 1, $context);
        $url = $modx->makeUrl($homeId, $context, '', 'full');
    }
    
    $activeClass = ($context === $currentContext) ? ' active' : '';
    $disabledClass = (!$available) ? ' disabled' : '';
    
    $output .= '<a href="' . $url . '" class="lang-link' . $activeClass . $disabledClass . '" ';
    $output .= 'data-context="' . $context . '" hreflang="' . $lang['code'] . '">';
    $output .= '<span class="flag">' . $lang['flag'] . '</span>';
    $output .= '<span class="name">' . $lang['name'] . '</span>';
    $output .= '</a>';
}

$output .= '</div>';

return $output;
```

### Стили для переключателя

```css
.language-switcher {
    display: flex;
    gap: 10px;
    align-items: center;
}

.lang-link {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.3s ease;
    color: #666;
}

.lang-link:hover {
    background-color: #f0f0f0;
    color: #333;
}

.lang-link.active {
    background-color: #2196F3;
    color: white;
    font-weight: 500;
}

.lang-link.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.flag {
    font-size: 16px;
}

.name {
    font-size: 14px;
}

/* Мобильная версия */
@media (max-width: 768px) {
    .language-switcher .name {
        display: none;
    }
    
    .lang-link {
        padding: 8px;
    }
}
```

## SEO-оптимизация

### Автоматические hreflang теги

```php
<?php
// Сниппет: HreflangTags
$resourceId = $modx->resource->get('id');

// Получаем связи переводов
$babelLinks = $modx->resource->getTVValue('babelLanguageLinks');
$links = $babelLinks ? json_decode($babelLinks, true) : [];

$hreflangs = [];

// Маппинг контекстов на языковые коды
$langMapping = [
    'web' => 'ru-RU',
    'en' => 'en-US', 
    'de' => 'de-DE',
    'fr' => 'fr-FR'
];

foreach ($links as $context => $resourceId) {
    $resource = $modx->getObject('modResource', $resourceId);
    if (!$resource || !$resource->get('published')) continue;
    
    $url = $modx->makeUrl($resourceId, $context, '', 'full');
    $lang = $langMapping[$context] ?? $context;
    
    $hreflangs[] = '<link rel="alternate" hreflang="' . $lang . '" href="' . $url . '">';
}

// Добавляем x-default для основного языка
if (isset($links['web'])) {
    $defaultUrl = $modx->makeUrl($links['web'], 'web', '', 'full');
    $hreflangs[] = '<link rel="alternate" hreflang="x-default" href="' . $defaultUrl . '">';
}

return implode("\n", $hreflangs);
```

### Автоматическое добавление в head

```php
<?php
// Плагин: AutoHreflang
// События: OnLoadWebDocument

switch ($modx->event->name) {
    case 'OnLoadWebDocument':
        $hreflangs = $modx->runSnippet('HreflangTags');
        if (!empty($hreflangs)) {
            $modx->regClientStartupHTMLBlock($hreflangs);
        }
        
        // Добавляем language meta-тег
        $currentLang = $modx->getOption('cultureKey', null, 'ru');
        $modx->regClientStartupHTMLBlock('<html lang="' . $currentLang . '">');
        break;
}
```

### Канонические URL для SEO

```php
<?php
// Сниппет: CanonicalUrl
$resourceId = $modx->resource->get('id');
$context = $modx->context->get('key');

// Формируем канонический URL для текущей страницы
$canonicalUrl = $modx->makeUrl($resourceId, $context, '', 'full');

// Исключаем GET-параметры, которые не влияют на контент
$excludeParams = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid'];
$urlParts = parse_url($canonicalUrl);

if (isset($urlParts['query'])) {
    parse_str($urlParts['query'], $params);
    
    foreach ($excludeParams as $exclude) {
        unset($params[$exclude]);
    }
    
    $urlParts['query'] = http_build_query($params);
    $canonicalUrl = $urlParts['scheme'] . '://' . $urlParts['host'] . 
                   $urlParts['path'] . 
                   (!empty($urlParts['query']) ? '?' . $urlParts['query'] : '');
}

return '<link rel="canonical" href="' . $canonicalUrl . '">';
```

## Мультиязычные формы

### Локализация FormIt

```php
// Словари для разных языков
// core/components/formit/lexicon/ru/default.inc.php
$_lang['formit.email_required'] = 'Email обязателен для заполнения';
$_lang['formit.phone_invalid'] = 'Неверный формат телефона';

// core/components/formit/lexicon/en/default.inc.php  
$_lang['formit.email_required'] = 'Email is required';
$_lang['formit.phone_invalid'] = 'Invalid phone format';
```

### Универсальная форма обратной связи

```html
<!-- Чанк: tpl.contact.form -->
<form class="contact-form" method="post">
    [[!FormIt?
        &hooks=`spam,email,redirect`
        &emailTpl=`tpl.contact.email`
        &emailSubject=`[[%formit.contact.subject]]`
        &emailTo=`[[++emailsender]]`
        &redirectTo=`[[*id]]`
        &validate=`name:required,email:email:required,message:required`
    ]]
    
    <div class="form-group">
        <label for="name">[[%formit.contact.name.label]] *</label>
        <input type="text" 
               id="name" 
               name="name" 
               value="[[!+fi.name]]"
               placeholder="[[%formit.contact.name.placeholder]]">
        <span class="error">[[!+fi.error.name]]</span>
    </div>
    
    <div class="form-group">
        <label for="email">[[%formit.contact.email.label]] *</label>
        <input type="email" 
               id="email" 
               name="email" 
               value="[[!+fi.email]]"
               placeholder="[[%formit.contact.email.placeholder]]">
        <span class="error">[[!+fi.error.email]]</span>
    </div>
    
    <div class="form-group">
        <label for="message">[[%formit.contact.message.label]] *</label>
        <textarea id="message" 
                  name="message" 
                  placeholder="[[%formit.contact.message.placeholder]]">[[!+fi.message]]</textarea>
        <span class="error">[[!+fi.error.message]]</span>
    </div>
    
    <div class="form-group">
        <button type="submit" class="btn-submit">
            [[%formit.contact.submit]]
        </button>
    </div>
    
    [[!+fi.successMessage:default=``:notempty=`
        <div class="alert alert-success">
            [[%formit.contact.success]]
        </div>
    `]]
</form>
```

### Словари форм

```php
// Русский словарь (core/lexicon/ru/web.inc.php)
$_lang['formit.contact.subject'] = 'Новое сообщение с сайта';
$_lang['formit.contact.name.label'] = 'Ваше имя';
$_lang['formit.contact.name.placeholder'] = 'Введите ваше имя';
$_lang['formit.contact.email.label'] = 'Email';
$_lang['formit.contact.email.placeholder'] = 'example@email.com';
$_lang['formit.contact.message.label'] = 'Сообщение';
$_lang['formit.contact.message.placeholder'] = 'Напишите ваше сообщение...';
$_lang['formit.contact.submit'] = 'Отправить сообщение';
$_lang['formit.contact.success'] = 'Сообщение отправлено! Мы скоро с вами свяжемся.';

// Английский словарь (core/lexicon/en/web.inc.php)
$_lang['formit.contact.subject'] = 'New message from website';
$_lang['formit.contact.name.label'] = 'Your name';
$_lang['formit.contact.name.placeholder'] = 'Enter your name';
$_lang['formit.contact.email.label'] = 'Email';
$_lang['formit.contact.email.placeholder'] = 'example@email.com';
$_lang['formit.contact.message.label'] = 'Message';
$_lang['formit.contact.message.placeholder'] = 'Write your message...';
$_lang['formit.contact.submit'] = 'Send Message';
$_lang['formit.contact.success'] = 'Message sent! We will contact you soon.';
```

## Автоперевод и управление переводами

### Интеграция с Google Translate API

```php
<?php
// Класс для автоперевода
class AutoTranslate {
    private $apiKey;
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    public function translateText($text, $targetLang, $sourceLang = 'ru') {
        $url = 'https://translation.googleapis.com/language/translate/v2?key=' . $this->apiKey;
        
        $data = [
            'q' => $text,
            'target' => $targetLang,
            'source' => $sourceLang,
            'format' => 'html'
        ];
        
        $response = $this->makeRequest($url, $data);
        
        if ($response && isset($response['data']['translations'][0]['translatedText'])) {
            return $response['data']['translations'][0]['translatedText'];
        }
        
        return $text; // Возвращаем оригинал если не удалось перевести
    }
    
    public function translateResource($resourceId, $targetLang) {
        global $modx;
        
        $resource = $modx->getObject('modResource', $resourceId);
        if (!$resource) return false;
        
        // Переводим основные поля
        $fields = ['pagetitle', 'longtitle', 'description', 'content'];
        $translations = [];
        
        foreach ($fields as $field) {
            $originalText = $resource->get($field);
            if (!empty($originalText)) {
                $translations[$field] = $this->translateText($originalText, $targetLang);
            }
        }
        
        return $translations;
    }
}
```

### Процессор для автоперевода

```php
<?php
// Процессор: assets/components/babel/processors/web/autotranslate.class.php

class AutoTranslateProcessor extends modObjectGetProcessor {
    public function process() {
        $resourceId = $this->getProperty('resource_id');
        $targetLang = $this->getProperty('target_lang');
        
        if (!$resourceId || !$targetLang) {
            return $this->failure('Не указаны обязательные параметры');
        }
        
        $resource = $this->modx->getObject('modResource', $resourceId);
        if (!$resource) {
            return $this->failure('Ресурс не найден');
        }
        
        // Получаем связанный перевод
        $babelLinks = $resource->getTVValue('babelLanguageLinks');
        $links = json_decode($babelLinks, true);
        
        if (!isset($links[$targetLang])) {
            return $this->failure('Перевод на указанный язык не существует');
        }
        
        $translatedResource = $this->modx->getObject('modResource', $links[$targetLang]);
        if (!$translatedResource) {
            return $this->failure('Ресурс перевода не найден');
        }
        
        // Автоперевод
        $translator = new AutoTranslate($this->modx->getOption('google_translate_api_key'));
        $translations = $translator->translateResource($resourceId, $targetLang);
        
        // Применяем переводы
        foreach ($translations as $field => $translation) {
            $translatedResource->set($field, $translation);
        }
        
        if ($translatedResource->save()) {
            return $this->success('Автоперевод выполнен');
        }
        
        return $this->failure('Ошибка сохранения перевода');
    }
}
```

## Оптимизация производительности

### Кеширование переводов

```php
<?php
// Плагин: BabelCache
switch ($modx->event->name) {
    case 'OnDocFormSave':
        $resource = $modx->event->params['resource'];
        
        // Очищаем кеш связанных переводов
        $babelLinks = $resource->getTVValue('babelLanguageLinks');
        if ($babelLinks) {
            $links = json_decode($babelLinks, true);
            
            foreach ($links as $context => $resourceId) {
                // Очищаем кеш ресурса
                $modx->cacheManager->refresh([
                    'db' => [],
                    'auto_publish' => ['contexts' => [$context]],
                    'context_settings' => ['contexts' => [$context]],
                    'resource' => ['contexts' => [$context]]
                ]);
            }
        }
        break;
}
```

### Оптимизация запросов

```php
<?php
// Сниппет: OptimizedBabelLinks
// Кешируем запросы к базе для переключателя языков

$cacheKey = 'babel_links_' . $modx->resource->get('id');
$cacheOptions = [
    xPDO::OPT_CACHE_KEY => 'babel',
    xPDO::OPT_CACHE_EXPIRES => 3600 // 1 час
];

$links = $modx->cacheManager->get($cacheKey, $cacheOptions);

if (!$links) {
    // Запрашиваем из базы только если нет в кеше
    $babelLinks = $modx->resource->getTVValue('babelLanguageLinks');
    $links = $babelLinks ? json_decode($babelLinks, true) : [];
    
    // Проверяем доступность каждого перевода одним запросом
    if (!empty($links)) {
        $resources = $modx->getCollection('modResource', [
            'id:IN' => array_values($links),
            'published' => 1,
            'deleted' => 0
        ]);
        
        $availableIds = [];
        foreach ($resources as $resource) {
            $availableIds[] = $resource->get('id');
        }
        
        // Оставляем только доступные переводы
        $links = array_filter($links, function($resourceId) use ($availableIds) {
            return in_array($resourceId, $availableIds);
        });
    }
    
    $modx->cacheManager->set($cacheKey, $links, 3600, $cacheOptions);
}

// Генерируем переключатель
return $modx->runSnippet('BabelLinks', ['links' => $links]);
```

## Заключение

Создание качественного мультиязычного сайта в MODX требует продуманного подхода к архитектуре и SEO. Ключевые принципы:

1. **Используйте контексты** — для чистого разделения языков
2. **Babel упрощает управление** — но требует правильной настройки  
3. **Не забывайте про SEO** — hreflang, canonical, правильные URL
4. **Оптимизируйте производительность** — кешируйте запросы и переводы

MODX предоставляет мощные инструменты для создания масштабируемого мультиязычного сайта. При правильной реализации система легко поддерживается и расширяется новыми языками.

---

*Связанные статьи: [Продвинутая разработка на MODX](/blog/modx-prodvinutaya-razrabotka/)*
