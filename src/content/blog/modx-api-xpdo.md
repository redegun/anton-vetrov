---
title: "MODX API и xPDO: работа с базой данных из сниппетов и плагинов"
description: "Углублённое изучение MODX API и xPDO ORM: работа с базой данных, создание объектов, оптимизация запросов, кастомные модели, продвинутые техники."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-api-xpdo.webp"
tags: ["MODX", "xPDO", "API", "База данных", "ORM"]
draft: false
---

# MODX API и xPDO: работа с базой данных из сниппетов и плагинов

xPDO — это ORM (Object-Relational Mapping) система, лежащая в основе MODX. Понимание xPDO критически важно для создания эффективных сниппетов, плагинов и дополнений. В этой статье разберём продвинутые техники работы с данными в MODX.

## Основы xPDO

### Что такое xPDO

xPDO — легковесная ORM система, которая:
- **Абстрагирует работу с БД** — один код для MySQL, PostgreSQL, SQLite
- **Обеспечивает безопасность** — автоматическое экранирование данных
- **Поддерживает кеширование** — встроенное кеширование результатов
- **Предоставляет события** — хуки для логики при работе с объектами

### Архитектура MODX объектов

```
modX (основной класс)
├── modResource (страницы сайта)
├── modUser (пользователи)
├── modUserGroup (группы пользователей)
├── modTemplate (шаблоны)
├── modChunk (чанки)
├── modSnippet (сниппеты)
├── modPlugin (плагины)
├── modTemplateVar (TV-параметры)
└── modCategory (категории)
```

### Основные методы xPDO

```php
// Получение объектов
$modx->getObject()         // Один объект
$modx->getCollection()     // Коллекция объектов
$modx->getCount()          // Количество записей
$modx->getIterator()       // Итератор (экономит память)

// Создание и изменение
$modx->newObject()         // Создание нового объекта
$object->save()            // Сохранение изменений
$object->remove()          // Удаление объекта

// Запросы
$modx->newQuery()          // Создание запроса
$query->where()            // WHERE условия
$query->leftJoin()         // Соединения таблиц
$query->sortby()           // Сортировка
$query->limit()            // Ограничение количества
```

## Работа с ресурсами

### Получение ресурсов

```php
<?php
// Получение одного ресурса по ID
$resource = $modx->getObject('modResource', 123);

// Получение по алиасу
$resource = $modx->getObject('modResource', ['alias' => 'about']);

// Получение с условиями
$resource = $modx->getObject('modResource', [
    'published' => 1,
    'deleted' => 0,
    'parent' => 5
]);

// Проверка существования
if ($resource) {
    echo $resource->get('pagetitle');
    echo $resource->get('content');
}
```

### Создание новых ресурсов

```php
<?php
// Создание нового ресурса
$resource = $modx->newObject('modResource');

$resource->fromArray([
    'pagetitle' => 'Новая страница',
    'alias' => 'new-page',
    'content' => '<p>Содержимое страницы</p>',
    'template' => 1,
    'parent' => 5,
    'published' => 1,
    'context_key' => 'web',
    'class_key' => 'modDocument'
]);

if ($resource->save()) {
    echo 'Ресурс создан с ID: ' . $resource->get('id');
} else {
    echo 'Ошибка создания ресурса';
}
```

### Массовые операции с ресурсами

```php
<?php
// Сниппет: BulkResourceUpdate
// Массовое обновление ресурсов

$parentId = $scriptProperties['parent'] ?? 0;
$template = $scriptProperties['template'] ?? 1;
$published = $scriptProperties['published'] ?? 1;

// Получаем ресурсы для обновления
$resources = $modx->getCollection('modResource', [
    'parent' => $parentId,
    'deleted' => 0
]);

$updated = 0;
foreach ($resources as $resource) {
    // Обновляем шаблон
    if ($template > 0) {
        $resource->set('template', $template);
    }
    
    // Изменяем статус публикации
    $resource->set('published', $published);
    
    // Обновляем дату редактирования
    $resource->set('editedon', time());
    $resource->set('editedby', $modx->user->get('id'));
    
    if ($resource->save()) {
        $updated++;
    }
}

return "Обновлено ресурсов: {$updated}";
```

## Продвинутые запросы с xPDOQuery

### Построение сложных условий

```php
<?php
// Создание query-объекта
$query = $modx->newQuery('modResource');

// Базовые условия
$query->where([
    'published' => 1,
    'deleted' => 0,
    'parent:IN' => [1, 5, 10] // Множественный выбор
]);

// OR условия
$query->where([
    'pagetitle:LIKE' => '%новость%',
    'OR:content:LIKE' => '%новость%'
]);

// Диапазоны
$query->where([
    'publishedon:>=' => strtotime('-30 days'),
    'publishedon:<=' => time()
]);

// Исключения
$query->where([
    'id:NOT IN' => [15, 25, 35]
]);

$resources = $modx->getCollection('modResource', $query);
```

### JOIN запросы

```php
<?php
// JOIN с TV-параметрами
$query = $modx->newQuery('modResource');

// Присоединяем TV
$query->leftJoin('modTemplateVar', 'TV', [
    'TV.id = ContentTv.tmplvarid'
]);
$query->leftJoin('modTemplateVarResource', 'ContentTv', [
    'modResource.id = ContentTv.contentid'
]);

// Условие по TV
$query->where([
    'TV.name' => 'price',
    'ContentTv.value:>' => 1000
]);

// Выбираем поля
$query->select([
    'modResource.*',
    'ContentTv.value as tv_price'
]);

$resources = $modx->getCollection('modResource', $query);

foreach ($resources as $resource) {
    echo $resource->get('pagetitle') . ' - ' . $resource->get('tv_price') . '<br>';
}
```

### Работа с пользователями и группами

```php
<?php
// JOIN пользователей с профилями и группами
$query = $modx->newQuery('modUser');

// Присоединяем профиль
$query->leftJoin('modUserProfile', 'Profile', [
    'modUser.id = Profile.internalKey'
]);

// Присоединяем группы пользователей
$query->leftJoin('modUserGroupMember', 'UserGroupMember', [
    'modUser.id = UserGroupMember.member'
]);
$query->leftJoin('modUserGroup', 'UserGroup', [
    'UserGroupMember.user_group = UserGroup.id'
]);

// Условия
$query->where([
    'modUser.active' => 1,
    'UserGroup.name:IN' => ['Administrators', 'Editors']
]);

// Группировка для избежания дубликатов
$query->groupby('modUser.id');

// Выборка данных
$query->select([
    'modUser.id',
    'modUser.username',
    'Profile.fullname',
    'Profile.email',
    'GROUP_CONCAT(UserGroup.name) as user_groups'
]);

$users = $modx->getCollection('modUser', $query);
```

## Оптимизация производительности

### Использование getIterator()

```php
<?php
// Для больших объёмов данных используйте getIterator()
// Он не загружает все объекты в память сразу

$query = $modx->newQuery('modResource');
$query->where(['parent' => 5]);

// Плохо - загружает все в память
$resources = $modx->getCollection('modResource', $query);
foreach ($resources as $resource) {
    // обработка
}

// Хорошо - загружает по одному
$resources = $modx->getIterator('modResource', $query);
foreach ($resources as $resource) {
    // обработка
    // память освобождается после каждой итерации
}
```

### Оптимизация JOIN-ов

```php
<?php
// Эффективная загрузка связанных данных
$query = $modx->newQuery('modResource');

// Загружаем TV одним запросом
$query->leftJoin('modTemplateVarResource', 'TvResource', [
    'modResource.id = TvResource.contentid'
]);
$query->leftJoin('modTemplateVar', 'TemplateVar', [
    'TvResource.tmplvarid = TemplateVar.id'
]);

$query->select([
    'modResource.*',
    'TemplateVar.name as tv_name',
    'TvResource.value as tv_value'
]);

$query->where([
    'modResource.parent' => 5,
    'TemplateVar.name:IN' => ['price', 'article', 'weight']
]);

$data = [];
$results = $modx->getCollection('modResource', $query);

// Группируем результаты
foreach ($results as $row) {
    $id = $row->get('id');
    
    if (!isset($data[$id])) {
        $data[$id] = [
            'id' => $id,
            'pagetitle' => $row->get('pagetitle'),
            'tvs' => []
        ];
    }
    
    $tvName = $row->get('tv_name');
    $tvValue = $row->get('tv_value');
    
    if ($tvName && $tvValue) {
        $data[$id]['tvs'][$tvName] = $tvValue;
    }
}
```

### Кеширование запросов

```php
<?php
// Сниппет с кешированием результатов
$cacheKey = 'expensive_query_' . md5(serialize($scriptProperties));
$cacheExpire = 3600; // 1 час

// Пытаемся получить из кеша
$result = $modx->cacheManager->get($cacheKey);

if ($result === null) {
    // Выполняем дорогой запрос
    $query = $modx->newQuery('modResource');
    
    // Сложный JOIN с подзапросами
    $subQuery = $modx->newQuery('modTemplateVarResource');
    $subQuery->leftJoin('modTemplateVar', 'TV', ['modTemplateVarResource.tmplvarid = TV.id']);
    $subQuery->where(['TV.name' => 'popular']);
    $subQuery->select('modTemplateVarResource.contentid');
    
    $query->where(['id:IN' => $subQuery]);
    $query->sortby('publishedon', 'DESC');
    $query->limit(10);
    
    $resources = $modx->getCollection('modResource', $query);
    
    // Обрабатываем результаты
    $result = [];
    foreach ($resources as $resource) {
        $result[] = [
            'id' => $resource->get('id'),
            'title' => $resource->get('pagetitle'),
            'url' => $modx->makeUrl($resource->get('id'))
        ];
    }
    
    // Сохраняем в кеш
    $modx->cacheManager->set($cacheKey, $result, $cacheExpire);
}

// Формируем вывод из кешированных данных
$output = '';
foreach ($result as $item) {
    $output .= '<a href="' . $item['url'] . '">' . $item['title'] . '</a><br>';
}

return $output;
```

## Создание кастомных моделей

### Определение схемы

```xml
<!-- model/schema/custom.mysql.schema.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<model package="custom" baseClass="xPDOObject" platform="mysql" 
       defaultEngine="MyISAM" version="1.0">
    
    <object class="CustomProduct" table="custom_products" extends="xPDOSimpleObject">
        <field key="name" dbtype="varchar" precision="255" phptype="string" null="false" default=""/>
        <field key="price" dbtype="decimal" precision="10,2" phptype="float" null="false" default="0.00"/>
        <field key="category_id" dbtype="int" precision="11" phptype="integer" null="false" default="0"/>
        <field key="created_at" dbtype="datetime" phptype="datetime" null="false"/>
        <field key="updated_at" dbtype="timestamp" phptype="timestamp" null="false" 
               extra="on update CURRENT_TIMESTAMP" default="CURRENT_TIMESTAMP"/>
        
        <index alias="category_id" name="category_id" primary="false" unique="false" type="BTREE">
            <column key="category_id" length="" collation="A" null="false"/>
        </index>
        
        <aggregate alias="Category" class="CustomCategory" local="category_id" foreign="id" 
                   cardinality="one" owner="foreign"/>
    </object>
    
    <object class="CustomCategory" table="custom_categories" extends="xPDOSimpleObject">
        <field key="name" dbtype="varchar" precision="255" phptype="string" null="false" default=""/>
        <field key="slug" dbtype="varchar" precision="255" phptype="string" null="false" default=""/>
        <field key="parent_id" dbtype="int" precision="11" phptype="integer" null="false" default="0"/>
        
        <composite alias="Products" class="CustomProduct" local="id" foreign="category_id" 
                   cardinality="many" owner="local"/>
    </object>
</model>
```

### Генерация классов модели

```php
<?php
// Скрипт для генерации модели: generate_model.php

require_once 'config.core.php';
require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';

$modx = new modX();
$modx->initialize('mgr');

$manager = $modx->getManager();
$generator = $manager->getGenerator();

// Генерируем классы из схемы
$generator->parseSchema(
    MODX_CORE_PATH . 'components/custom/model/schema/custom.mysql.schema.xml',
    MODX_CORE_PATH . 'components/custom/model/'
);

echo "Классы модели сгенерированы!\n";
```

### Работа с кастомной моделью

```php
<?php
// Загрузка кастомной модели
$modx->addPackage('custom', MODX_CORE_PATH . 'components/custom/model/');

// Создание новой категории
$category = $modx->newObject('CustomCategory');
$category->fromArray([
    'name' => 'Электроника',
    'slug' => 'electronics',
    'parent_id' => 0
]);

if ($category->save()) {
    echo 'Категория создана с ID: ' . $category->get('id');
}

// Создание товара
$product = $modx->newObject('CustomProduct');
$product->fromArray([
    'name' => 'iPhone 15',
    'price' => 99999.00,
    'category_id' => $category->get('id'),
    'created_at' => date('Y-m-d H:i:s')
]);

$product->save();

// Получение товаров с категориями
$query = $modx->newQuery('CustomProduct');
$query->leftJoin('CustomCategory', 'Category');
$query->select([
    'CustomProduct.*',
    'Category.name as category_name'
]);

$products = $modx->getCollection('CustomProduct', $query);

foreach ($products as $product) {
    echo $product->get('name') . ' - ' . $product->get('category_name') . '<br>';
}
```

## События и хуки xPDO

### Встроенные события объектов

```php
<?php
// Класс кастомного объекта с событиями
class CustomProduct extends xPDOSimpleObject {
    
    // Вызывается перед сохранением
    public function save($cacheFlag = null) {
        // Автоматически устанавливаем дату создания
        if ($this->isNew() && !$this->get('created_at')) {
            $this->set('created_at', date('Y-m-d H:i:s'));
        }
        
        // Обновляем дату изменения
        $this->set('updated_at', date('Y-m-d H:i:s'));
        
        // Валидация
        if (empty($this->get('name'))) {
            $this->xpdo->log(xPDO::LOG_LEVEL_ERROR, 'Имя товара не может быть пустым');
            return false;
        }
        
        return parent::save($cacheFlag);
    }
    
    // Вызывается перед удалением
    public function remove(array $ancestors = []) {
        // Логируем удаление
        $this->xpdo->log(xPDO::LOG_LEVEL_INFO, 'Удаляется товар: ' . $this->get('name'));
        
        // Удаляем связанные файлы
        $this->removeProductFiles();
        
        return parent::remove($ancestors);
    }
    
    private function removeProductFiles() {
        $uploadPath = MODX_ASSETS_PATH . 'uploads/products/' . $this->get('id') . '/';
        if (is_dir($uploadPath)) {
            $files = glob($uploadPath . '*');
            foreach ($files as $file) {
                unlink($file);
            }
            rmdir($uploadPath);
        }
    }
}
```

### Плагины для событий xPDO

```php
<?php
// Плагин: CustomProductEvents
// События: OnBeforeDocFormSave, OnDocFormSave

switch ($modx->event->name) {
    case 'OnBeforeDocFormSave':
        // Логика до сохранения
        $resource = $modx->event->params['resource'];
        $mode = $modx->event->params['mode'];
        
        // Автогенерация алиаса
        if (empty($resource->get('alias'))) {
            $alias = $modx->runSnippet('Translit', [
                'str' => $resource->get('pagetitle')
            ]);
            $resource->set('alias', $alias);
        }
        break;
        
    case 'OnDocFormSave':
        // Логика после сохранения
        $resource = $modx->event->params['resource'];
        
        // Очищаем кеш связанных объектов
        $modx->cacheManager->delete('custom_products_by_category_' . $resource->get('parent'));
        
        // Отправляем уведомление
        if ($resource->get('published') && $resource->isNew()) {
            $modx->runSnippet('NotifyAboutNewContent', [
                'resource' => $resource->get('id')
            ]);
        }
        break;
}
```

## Транзакции и обработка ошибок

### Использование транзакций

```php
<?php
// Сложная операция с несколькими объектами
$modx->getService('error','error.modError');

try {
    // Начинаем транзакцию
    $modx->startTransaction();
    
    // Создаём категорию
    $category = $modx->newObject('CustomCategory');
    $category->fromArray([
        'name' => 'Новая категория',
        'slug' => 'new-category'
    ]);
    
    if (!$category->save()) {
        throw new Exception('Ошибка сохранения категории');
    }
    
    // Создаём товары в категории
    $productData = [
        ['name' => 'Товар 1', 'price' => 100],
        ['name' => 'Товар 2', 'price' => 200],
        ['name' => 'Товар 3', 'price' => 300]
    ];
    
    foreach ($productData as $data) {
        $product = $modx->newObject('CustomProduct');
        $product->fromArray([
            'name' => $data['name'],
            'price' => $data['price'],
            'category_id' => $category->get('id'),
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        if (!$product->save()) {
            throw new Exception('Ошибка сохранения товара: ' . $data['name']);
        }
    }
    
    // Подтверждаем транзакцию
    $modx->commit();
    echo 'Категория и товары созданы успешно!';
    
} catch (Exception $e) {
    // Откатываем изменения
    $modx->rollback();
    $modx->log(xPDO::LOG_LEVEL_ERROR, 'Ошибка создания данных: ' . $e->getMessage());
    echo 'Произошла ошибка: ' . $e->getMessage();
}
```

### Обработка ошибок в сниппетах

```php
<?php
// Сниппет: SafeProductList
try {
    $categoryId = (int) $scriptProperties['category'] ?? 0;
    
    if ($categoryId <= 0) {
        throw new InvalidArgumentException('Некорректный ID категории');
    }
    
    // Проверяем существование категории
    $category = $modx->getObject('CustomCategory', $categoryId);
    if (!$category) {
        throw new Exception('Категория не найдена');
    }
    
    // Получаем товары
    $query = $modx->newQuery('CustomProduct');
    $query->where(['category_id' => $categoryId]);
    $query->sortby('name', 'ASC');
    
    $products = $modx->getCollection('CustomProduct', $query);
    
    if (empty($products)) {
        return '<p>В категории пока нет товаров.</p>';
    }
    
    $output = '<div class="product-list">';
    foreach ($products as $product) {
        $output .= '<div class="product-item">';
        $output .= '<h3>' . htmlspecialchars($product->get('name')) . '</h3>';
        $output .= '<p>Цена: ' . number_format($product->get('price'), 0, ',', ' ') . ' ₽</p>';
        $output .= '</div>';
    }
    $output .= '</div>';
    
    return $output;
    
} catch (Exception $e) {
    // Логируем ошибку
    $modx->log(xPDO::LOG_LEVEL_ERROR, 'Ошибка в сниппете SafeProductList: ' . $e->getMessage());
    
    // Возвращаем дружелюбное сообщение пользователю
    return '<p>Извините, произошла ошибка при загрузке товаров.</p>';
}
```

## Заключение

xPDO и MODX API предоставляют мощные инструменты для работы с данными. Основные принципы эффективной работы:

1. **Используйте xPDOQuery** для сложных запросов вместо прямого SQL
2. **Оптимизируйте производительность** — кеширование, getIterator(), правильные JOIN-ы
3. **Обрабатывайте ошибки** — используйте try-catch и логирование
4. **Применяйте транзакции** для сложных операций с несколькими объектами
5. **Создавайте кастомные модели** для специфичных данных приложения

MODX даёт возможность создавать сложные приложения с чистым, безопасным и производительным кодом. Правильное использование xPDO — основа профессиональной разработки на MODX.

---

*Связанные статьи: [Продвинутая разработка на MODX](/blog/modx-prodvinutaya-razrabotka/), [Написание сниппетов для MODX](/blog/modx-snippety-napisanie/)*