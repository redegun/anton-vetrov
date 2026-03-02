---
title: "Сниппеты в MODX: написание, примеры, отладка"
description: "Полное руководство по созданию сниппетов в MODX Revolution. PHP-код, параметры, отладка, лучшие практики. Опыт разработчика с 60+ проектами на MODX."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-snippety-napisanie.webp"
tags: ["MODX", "Сниппеты", "PHP", "Программирование"]
draft: false
---


Сниппеты — это сердце любого проекта на MODX. Они содержат PHP-логику, обрабатывают данные и генерируют динамический контент. За 18 лет работы с MODX я написал сотни сниппетов — от простых до сложных интеграций с API. В этой статье поделюсь практическим опытом создания надёжных и эффективных сниппетов.

## Что такое сниппеты в MODX

### Определение и назначение

Сниппет — это PHP-код, который выполняется на сервере и возвращает готовый HTML. Это логический слой между данными и представлением.

**Принципы работы:**
- Получает данные (из базы, API, файлов)
- Обрабатывает данные по бизнес-логике
- Форматирует результат через чанки
- Возвращает готовый HTML

### Синтаксис вызова

```html
[[snippet]]                     <!-- Кэшируемый вызов -->
[[!snippet]]                    <!-- Некэшируемый вызов -->
[[snippet? &param=`value`]]     <!-- С параметрами -->
```

### Структура сниппета

```php
<?php
// Получаем параметры
$limit = $scriptProperties['limit'] ?? 10;
$template = $scriptProperties['tpl'] ?? 'default';

// Обрабатываем данные
$results = [];
// ... логика ...

// Возвращаем результат
return implode("\n", $results);
```

## Базовые примеры сниппетов

### Пример 1: Список последних статей

**Сниппет `LatestNews`:**
```php
<?php
// Получаем параметры
$parent = $scriptProperties['parent'] ?? 1;
$limit = (int)($scriptProperties['limit'] ?? 5);
$tpl = $scriptProperties['tpl'] ?? 'news-item';
$sortBy = $scriptProperties['sortBy'] ?? 'publishedon';
$sortDir = $scriptProperties['sortDir'] ?? 'DESC';

// Получаем статьи
$criteria = $modx->newQuery('modResource');
$criteria->where([
    'parent' => $parent,
    'published' => 1,
    'deleted' => 0,
]);

$criteria->sortby($sortBy, $sortDir);
$criteria->limit($limit);

$articles = $modx->getCollection('modResource', $criteria);

$output = [];
foreach ($articles as $article) {
    // Подготавливаем данные для чанка
    $data = $article->toArray();
    $data['url'] = $modx->makeUrl($article->get('id'));
    $data['date_formatted'] = date('d.m.Y', strtotime($data['publishedon']));
    
    // Рендерим чанк
    $output[] = $modx->getChunk($tpl, $data);
}

return implode("\n", $output);
?>
```

**Использование:**
```html
[[!LatestNews? 
    &parent=`5`
    &limit=`3`
    &tpl=`news-item`
]]
```

### Пример 2: Форма обратной связи

**Сниппет `ContactForm`:**
```php
<?php
// Проверяем отправку формы
if ($_POST) {
    $errors = [];
    
    // Валидация
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');
    
    if (empty($name)) {
        $errors['name'] = 'Укажите имя';
    }
    
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Укажите корректный email';
    }
    
    if (empty($message)) {
        $errors['message'] = 'Введите сообщение';
    }
    
    // Если ошибок нет - отправляем
    if (empty($errors)) {
        $emailBody = "
            Новое сообщение с сайта:\n
            Имя: {$name}\n
            Email: {$email}\n
            Сообщение: {$message}\n
        ";
        
        $sent = mail(
            $modx->getOption('emailsender'),
            'Новое сообщение с сайта',
            $emailBody,
            "From: {$email}\r\nReply-To: {$email}"
        );
        
        if ($sent) {
            return '<div class="alert alert-success">Сообщение отправлено!</div>';
        } else {
            $errors['general'] = 'Ошибка отправки. Попробуйте позже.';
        }
    }
    
    // Устанавливаем ошибки в плейсхолдеры
    foreach ($errors as $field => $error) {
        $modx->setPlaceholder("error.{$field}", $error);
    }
    
    // Сохраняем введённые данные
    $modx->setPlaceholder('form.name', htmlspecialchars($name));
    $modx->setPlaceholder('form.email', htmlspecialchars($email));
    $modx->setPlaceholder('form.message', htmlspecialchars($message));
}

// Возвращаем форму
return $modx->getChunk($scriptProperties['tpl'] ?? 'contact-form');
?>
```

### Пример 3: Счётчик просмотров

**Сниппет `ViewCounter`:**
```php
<?php
$resourceId = $scriptProperties['id'] ?? $modx->resource->get('id');
$showViews = (bool)($scriptProperties['showViews'] ?? true);

// Получаем текущее количество просмотров
$viewsTV = $modx->getObject('modTemplateVar', ['name' => 'views']);
if (!$viewsTV) {
    // Создаём TV-поле если не существует
    $viewsTV = $modx->newObject('modTemplateVar');
    $viewsTV->set('name', 'views');
    $viewsTV->set('caption', 'Количество просмотров');
    $viewsTV->set('type', 'number');
    $viewsTV->set('default_text', '0');
    $viewsTV->save();
}

$currentViews = $viewsTV->getValue($resourceId) ?: 0;

// Увеличиваем счётчик (только для уникальных посещений)
$sessionKey = "viewed_resource_{$resourceId}";
if (!isset($_SESSION[$sessionKey])) {
    $newViews = (int)$currentViews + 1;
    $viewsTV->setValue($resourceId, $newViews);
    $_SESSION[$sessionKey] = true;
    $currentViews = $newViews;
}

// Возвращаем количество просмотров
if ($showViews) {
    $plural = $modx->runSnippet('declension', [
        'count' => $currentViews,
        'forms' => 'просмотр,просмотра,просмотров'
    ]);
    return "{$currentViews} {$plural}";
}

return '';
?>
```

## Работа с базой данных

### Простые запросы

```php
<?php
// Получение одного ресурса
$resource = $modx->getObject('modResource', 123);
if ($resource) {
    echo $resource->get('pagetitle');
}

// Получение нескольких ресурсов
$resources = $modx->getCollection('modResource', [
    'parent' => 5,
    'published' => 1
]);

foreach ($resources as $resource) {
    echo $resource->get('pagetitle') . "\n";
}
?>
```

### Сложные запросы с xPDO

```php
<?php
// Создаём запрос
$query = $modx->newQuery('modResource');

// Условия WHERE
$query->where([
    'published' => 1,
    'deleted' => 0,
    'parent:IN' => [5, 10, 15]
]);

// JOIN с TV-полями
$query->leftJoin('modTemplateVarResource', 'TV', [
    'TV.contentid = modResource.id',
    'TV.tmplvarid' => 5  // ID TV-поля
]);

// Сортировка
$query->sortby('publishedon', 'DESC');
$query->sortby('menuindex', 'ASC');

// LIMIT и OFFSET
$query->limit(10, 0);

// Выбираем поля
$query->select([
    'modResource.*',
    'TV.value as tv_value'
]);

// Выполняем запрос
$resources = $modx->getCollection('modResource', $query);
?>
```

### Работа с пользователями

```php
<?php
// Получение текущего пользователя
$user = $modx->getUser();
if ($user && !$user->hasSessionContext('web')) {
    return 'Пользователь не авторизован';
}

// Проверка принадлежности к группе
if ($user->isMember('Administrators')) {
    echo 'Администратор';
}

// Получение профиля пользователя
$profile = $user->getOne('Profile');
$fullname = $profile->get('fullname');
$email = $profile->get('email');

// Расширенные поля профиля
$extended = $profile->get('extended');
$phone = $extended['phone'] ?? '';
?>
```

## Продвинутые техники

### Кэширование в сниппетах

```php
<?php
$cacheKey = 'expensive_operation_' . md5(serialize($scriptProperties));
$cacheExpire = 3600; // 1 час

// Пробуем получить из кэша
$cached = $modx->cacheManager->get($cacheKey);
if ($cached !== null) {
    return $cached;
}

// Выполняем дорогую операцию
$result = performExpensiveOperation();

// Сохраняем в кэш
$modx->cacheManager->set($cacheKey, $result, $cacheExpire);

return $result;

function performExpensiveOperation() {
    // Имитация тяжёлых вычислений
    sleep(2);
    return 'Результат сложной операции';
}
?>
```

### Работа с файлами и изображениями

```php
<?php
// Обработка загруженного изображения
if ($_FILES['image']) {
    $uploadDir = MODX_ASSETS_PATH . 'images/uploads/';
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    $file = $_FILES['image'];
    
    // Проверяем тип файла
    if (!in_array($file['type'], $allowedTypes)) {
        return 'Недопустимый тип файла';
    }
    
    // Генерируем уникальное имя
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    // Перемещаем файл
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Создаём миниатюру
        $modx->loadClass('modPhpThumb', MODX_CORE_PATH . 'model/phpthumb/', true, true);
        
        $phpthumb = new modPhpThumb($modx);
        $phpthumb->config = array_merge($phpthumb->config, [
            'allow_src_above_docroot' => true,
            'zc' => 1,
            'w' => 300,
            'h' => 300
        ]);
        
        $thumb_path = $uploadDir . 'thumb_' . $filename;
        $phpthumb->generateThumbnail($filepath, $thumb_path);
        
        return 'Файл загружен: ' . $filename;
    }
}
?>
```

### Интеграция с API

```php
<?php
// Получаем данные о погоде
function getWeather($city) {
    $apiKey = 'your_api_key';
    $url = "http://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&units=metric&lang=ru";
    
    // Кэшируем на 30 минут
    $cacheKey = 'weather_' . md5($city);
    $cached = $modx->cacheManager->get($cacheKey);
    
    if ($cached !== null) {
        return $cached;
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        $result = [
            'temperature' => round($data['main']['temp']),
            'description' => $data['weather'][0]['description'],
            'humidity' => $data['main']['humidity'],
            'icon' => $data['weather'][0]['icon']
        ];
        
        // Кэшируем на 30 минут
        $modx->cacheManager->set($cacheKey, $result, 1800);
        return $result;
    }
    
    return ['error' => 'Ошибка получения данных о погоде'];
}

// Использование
$city = $scriptProperties['city'] ?? 'Moscow';
$weather = getWeather($city);

if (isset($weather['error'])) {
    return $weather['error'];
}

return $modx->getChunk($scriptProperties['tpl'] ?? 'weather', $weather);
?>
```

## Обработка параметров

### Валидация и очистка параметров

```php
<?php
// Функция для безопасной обработки параметров
function getParam($props, $key, $default = '', $type = 'string') {
    $value = $props[$key] ?? $default;
    
    switch ($type) {
        case 'int':
            return (int)$value;
            
        case 'bool':
            return in_array(strtolower($value), ['1', 'true', 'yes', 'on']);
            
        case 'array':
            if (is_string($value)) {
                return array_map('trim', explode(',', $value));
            }
            return is_array($value) ? $value : [];
            
        case 'email':
            return filter_var($value, FILTER_VALIDATE_EMAIL) ?: $default;
            
        case 'url':
            return filter_var($value, FILTER_VALIDATE_URL) ?: $default;
            
        case 'string':
        default:
            return is_string($value) ? trim($value) : $default;
    }
}

// Использование
$limit = getParam($scriptProperties, 'limit', 10, 'int');
$parents = getParam($scriptProperties, 'parents', [], 'array');
$showImages = getParam($scriptProperties, 'showImages', false, 'bool');
$template = getParam($scriptProperties, 'tpl', 'default');
?>
```

### Конфигурация по умолчанию

```php
<?php
// Настройки по умолчанию
$defaultConfig = [
    'limit' => 10,
    'offset' => 0,
    'parents' => [],
    'templates' => [],
    'sortBy' => 'publishedon',
    'sortDir' => 'DESC',
    'includeContent' => false,
    'processTVs' => true,
    'tpl' => 'item',
    'wrapperTpl' => '',
    'emptyTpl' => 'empty',
    'debug' => false
];

// Объединяем с переданными параметрами
$config = array_merge($defaultConfig, $scriptProperties);

// Дополнительная обработка
$config['limit'] = max(1, min(100, (int)$config['limit'])); // от 1 до 100
$config['parents'] = is_array($config['parents']) ? $config['parents'] : explode(',', $config['parents']);
$config['templates'] = is_array($config['templates']) ? $config['templates'] : explode(',', $config['templates']);
?>
```

## Отладка сниппетов

### Логирование

```php
<?php
// Функция для отладочных сообщений
function debugLog($message, $level = 'INFO') {
    global $modx;
    
    if ($modx->getOption('log_level') == xPDO::LOG_LEVEL_DEBUG) {
        $modx->log($level, '[MySnippet] ' . $message);
    }
}

// Использование
debugLog('Сниппет запущен с параметрами: ' . print_r($scriptProperties, true));

try {
    $result = doSomething();
    debugLog('Операция выполнена успешно');
    return $result;
} catch (Exception $e) {
    debugLog('Ошибка: ' . $e->getMessage(), 'ERROR');
    return 'Произошла ошибка';
}
?>
```

### Режим отладки

```php
<?php
$debug = $scriptProperties['debug'] ?? $modx->getOption('debug', null, false);

if ($debug) {
    $startTime = microtime(true);
    $startMemory = memory_get_usage();
}

// Основная логика сниппета
$result = performWork();

if ($debug) {
    $endTime = microtime(true);
    $endMemory = memory_get_usage();
    
    $debugInfo = [
        'Время выполнения: ' . round(($endTime - $startTime) * 1000, 2) . ' мс',
        'Потребление памяти: ' . round(($endMemory - $startMemory) / 1024, 2) . ' КБ',
        'Параметры: ' . print_r($scriptProperties, true)
    ];
    
    $result .= '<div class="debug-info"><pre>' . implode("\n", $debugInfo) . '</pre></div>';
}

return $result;
?>
```

### Обработка ошибок

```php
<?php
function handleError($message, $showToUser = false) {
    global $modx;
    
    // Логируем ошибку
    $modx->log(modX::LOG_LEVEL_ERROR, "[MySnippet] {$message}");
    
    if ($showToUser && $modx->getOption('debug')) {
        return "<div class='error'>Ошибка: {$message}</div>";
    }
    
    return ''; // В продакшене не показываем ошибки пользователям
}

// Обёртка для безопасного выполнения
try {
    // Проверяем обязательные параметры
    if (empty($scriptProperties['required_param'])) {
        throw new Exception('Не указан обязательный параметр required_param');
    }
    
    // Выполняем основную логику
    $result = mainLogic();
    
    return $result;
    
} catch (Exception $e) {
    return handleError($e->getMessage(), true);
}
?>
```

## Оптимизация производительности

### Ленивая загрузка

```php
<?php
class LazySnippet {
    private $modx;
    private $config;
    private $cache = [];
    
    public function __construct($modx, $config) {
        $this->modx = $modx;
        $this->config = $config;
    }
    
    // Ленивое получение ресурсов
    public function getResources() {
        if (!isset($this->cache['resources'])) {
            $query = $this->modx->newQuery('modResource');
            // ... настройка запроса
            $this->cache['resources'] = $this->modx->getCollection('modResource', $query);
        }
        
        return $this->cache['resources'];
    }
    
    // Ленивое получение TV-полей
    public function getTVs($resourceId) {
        $key = "tvs_{$resourceId}";
        
        if (!isset($this->cache[$key])) {
            $this->cache[$key] = $this->modx->getObject('modResource', $resourceId)->getTemplateVars();
        }
        
        return $this->cache[$key];
    }
}

// Использование
$snippet = new LazySnippet($modx, $config);
$resources = $snippet->getResources();
?>
```

### Пакетная обработка

```php
<?php
// Получаем все необходимые ID одним запросом
$resourceIds = [1, 2, 3, 4, 5];

// ❌ Неэффективно - много запросов
/*
foreach ($resourceIds as $id) {
    $resource = $modx->getObject('modResource', $id);
    // обработка
}
*/

// ✅ Эффективно - один запрос
$resources = $modx->getCollection('modResource', ['id:IN' => $resourceIds]);

// Индексируем по ID для быстрого доступа
$resourcesById = [];
foreach ($resources as $resource) {
    $resourcesById[$resource->get('id')] = $resource;
}

// Теперь можем быстро получать ресурсы по ID
foreach ($resourceIds as $id) {
    if (isset($resourcesById[$id])) {
        $resource = $resourcesById[$id];
        // обработка
    }
}
?>
```

## Распространённые паттерны

### Паттерн "Фабрика чанков"

```php
<?php
class ChunkFactory {
    private $modx;
    
    public function __construct($modx) {
        $this->modx = $modx;
    }
    
    public function render($template, $data, $prefix = '') {
        // Добавляем префикс к ключам
        if ($prefix) {
            $prefixedData = [];
            foreach ($data as $key => $value) {
                $prefixedData[$prefix . '.' . $key] = $value;
            }
            $data = $prefixedData;
        }
        
        return $this->modx->getChunk($template, $data);
    }
    
    public function renderList($items, $template, $wrapper = '', $empty = '') {
        if (empty($items)) {
            return $wrapper ? $this->modx->getChunk($wrapper, ['items' => $empty]) : $empty;
        }
        
        $output = [];
        foreach ($items as $item) {
            $output[] = $this->render($template, $item);
        }
        
        $result = implode("\n", $output);
        
        return $wrapper ? $this->modx->getChunk($wrapper, ['items' => $result]) : $result;
    }
}

// Использование
$factory = new ChunkFactory($modx);
return $factory->renderList($articles, 'news-item', 'news-wrapper', 'Новостей нет');
?>
```

### Паттерн "Строитель запросов"

```php
<?php
class QueryBuilder {
    private $modx;
    private $query;
    
    public function __construct($modx, $class = 'modResource') {
        $this->modx = $modx;
        $this->query = $modx->newQuery($class);
    }
    
    public function where($conditions) {
        $this->query->where($conditions);
        return $this;
    }
    
    public function sort($field, $direction = 'ASC') {
        $this->query->sortby($field, $direction);
        return $this;
    }
    
    public function limit($limit, $offset = 0) {
        $this->query->limit($limit, $offset);
        return $this;
    }
    
    public function joinTV($tvName, $alias = null) {
        $alias = $alias ?: $tvName;
        
        $this->query->leftJoin('modTemplateVarResource', $alias, [
            "{$alias}.contentid = modResource.id"
        ]);
        
        $this->query->leftJoin('modTemplateVar', "{$alias}TV", [
            "{$alias}TV.id = {$alias}.tmplvarid",
            "{$alias}TV.name" => $tvName
        ]);
        
        return $this;
    }
    
    public function get() {
        return $this->modx->getCollection('modResource', $this->query);
    }
}

// Использование
$builder = new QueryBuilder($modx);
$resources = $builder
    ->where(['published' => 1])
    ->joinTV('price')
    ->sort('publishedon', 'DESC')
    ->limit(10)
    ->get();
?>
```

## Заключение

Сниппеты — мощный инструмент для создания динамического функционала в MODX. Основные принципы написания качественных сниппетов:

1. **Разделяйте логику и представление** — PHP в сниппетах, HTML в чанках
2. **Валидируйте входные данные** — никогда не доверяйте пользовательскому вводу
3. **Используйте кэширование** для дорогих операций
4. **Обрабатывайте ошибки** корректно
5. **Оптимизируйте запросы** к базе данных
6. **Документируйте код** и параметры
7. **Тестируйте** в разных условиях

Правильно написанные сниппеты делают MODX мощной платформой для любых задач — от простых сайтов до сложных веб-приложений.

---

*Изучаете элементы MODX? Читайте обзор «[Элементы MODX: шаблоны, чанки, сниппеты](/blog/modx-elementy-shablony-chanki-snippety/)» — полное руководство по архитектуре системы.*

## Полезные ресурсы

- [Документация по сниппетам](https://docs.modx.com/revolution/2.x/making-sites-with-modx/structuring-your-site/snippets)
- [xPDO документация](https://docs.modx.com/xpdo/2.x)
- [API MODX](https://api.modx.com/)

## Чек-лист качественного сниппета

- [ ] Валидация всех входных параметров
- [ ] Обработка ошибок и исключений
- [ ] Оптимизированные запросы к БД
- [ ] Кэширование дорогих операций
- [ ] Отладочная информация в dev-режиме
- [ ] Документация по параметрам
- [ ] Безопасность (защита от XSS, SQL-инъекций)
- [ ] Совместимость с кэшированием MODX
