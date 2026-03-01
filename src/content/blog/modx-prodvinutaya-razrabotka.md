---
title: "Продвинутая разработка на MODX: API, кастомные компоненты, CI/CD"
description: "Глубокое погружение в продвинутую разработку на MODX Revolution: xPDO, процессоры, кастомные пакеты, Git workflow, автоматизация. Для опытных разработчиков."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-ai-news-default.webp"
tags: ["MODX", "API", "Разработка"]
draft: false
---

# Продвинутая разработка на MODX: API, кастомные компоненты, CI/CD

За 20 лет работы с MODX я прошёл путь от простой интеграции шаблонов до создания сложных веб-приложений и кастомных пакетов. MODX — это не просто CMS, а полноценный фреймворк для разработки. Сегодня поделюсь продвинутыми техниками, которые использую в серьёзных проектах.

## Честно о минусах MODX

Прежде чем погружаться в продвинутые техники, скажу прямо: MODX — не панацея.

### Ограничения платформы:

**Монолитная архитектура.** MODX сложно разложить на микросервисы. Это монолит — админка, API, фронтенд — всё в одном месте. Для больших команд (20+ человек) это проблема.

**Устаревшая админка.** ExtJS 15-летней давности. Функциональна, но выглядит архаично. И никто не переписывает — слишком большой объём работ.

**Сложности с командной разработкой.** Git workflow с MODX требует дополнительных инструментов. База данных содержит код элементов — не очень удобно для version control.

**Нишевость.** Меньше готовых решений по сравнению с WordPress или Laravel. Часто приходится писать с нуля.

### Когда MODX — неудачный выбор:

- **Команды 10+ разработчиков** — лучше Laravel/Symfony
- **Высоконагруженные проекты** — нужны специализированные решения  
- **Стартапы с быстрым MVP** — WordPress может быть быстрее
- **Проекты с нестандартной архитектурой** — проще писать с нуля

**НО!** Для малого и среднего бизнеса, команд до 3 человек, SEO-проектов MODX остаётся отличным выбором.

## xPDO: объектно-реляционное программирование

xPDO — сердце MODX. Это ORM (Object-Relational Mapping), который превращает таблицы базы данных в PHP-объекты.

### Базовые операции с xPDO

**Получение объекта:**
```php
<?php
// По ID
$resource = $modx->getObject('modResource', 5);

// По условию
$user = $modx->getObject('modUser', array('username' => 'admin'));

// С JOINами
$resource = $modx->getObject('modResource', array(
    'id' => 5,
    'published' => 1
), array(
    'select' => array(
        'modResource.*',
        'Template.templatename'
    ),
    'leftJoin' => array(
        'Template' => array(
            'class' => 'modTemplate',
            'on' => 'modResource.template = Template.id'
        )
    )
));
```

**Получение коллекции:**
```php
<?php
// Простой запрос
$resources = $modx->getCollection('modResource', array(
    'parent' => 5,
    'published' => 1
));

// Сложный запрос с условиями
$resources = $modx->getCollection('modResource', array(
    'parent:IN' => array(5, 6, 7),
    'createdon:>=' => '2024-01-01',
    'OR:pagetitle:LIKE' => '%новост%',
    'OR:content:LIKE' => '%новост%'
), array(
    'limit' => 10,
    'offset' => 20,
    'sortby' => 'createdon',
    'sortdir' => 'DESC'
));
```

**Создание и изменение объектов:**
```php
<?php
// Создание ресурса
$resource = $modx->newObject('modResource');
$resource->fromArray(array(
    'pagetitle' => 'Новая страница',
    'parent' => 5,
    'template' => 1,
    'published' => 1,
    'content' => 'Контент страницы'
));

if ($resource->save()) {
    echo 'Ресурс создан с ID: ' . $resource->get('id');
}

// Изменение существующего
$resource = $modx->getObject('modResource', 10);
if ($resource) {
    $resource->set('pagetitle', 'Новый заголовок');
    $resource->save();
}
```

### Кастомные xPDO классы

**Создание схемы базы данных:**
```xml
<!-- schema/mypackage.mysql.schema.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<model package="mypackage" baseClass="xPDOObject" platform="mysql" defaultEngine="MyISAM" version="1.0">
    
    <object class="MyItem" table="my_items" extends="xPDOSimpleObject">
        <field key="name" dbtype="varchar" precision="255" phptype="string" null="false" default="" />
        <field key="description" dbtype="text" phptype="string" null="false" default="" />
        <field key="price" dbtype="decimal" precision="10,2" phptype="float" null="false" default="0.00" />
        <field key="category_id" dbtype="int" precision="10" phptype="integer" null="false" default="0" />
        <field key="created_at" dbtype="datetime" phptype="datetime" null="false" />
        
        <composite alias="Category" class="MyCategory" local="category_id" foreign="id" cardinality="one" owner="foreign" />
        
        <index alias="category" name="category" primary="false" unique="false" type="BTREE">
            <column key="category_id" length="" collation="A" null="false" />
        </index>
    </object>
    
    <object class="MyCategory" table="my_categories" extends="xPDOSimpleObject">
        <field key="name" dbtype="varchar" precision="255" phptype="string" null="false" default="" />
        <field key="active" dbtype="tinyint" precision="1" phptype="boolean" null="false" default="1" />
        
        <aggregate alias="Items" class="MyItem" local="id" foreign="category_id" cardinality="many" owner="local" />
    </object>
    
</model>
```

**Генерация классов:**
```php
<?php
// build.schema.php
$mtime = microtime();
$mtime = explode(' ', $mtime);
$mtime = $mtime[1] + $mtime[0];
$tstart = $mtime;
set_time_limit(0);

require_once dirname(__FILE__) . '/build.config.php';

$manager = $modx->getManager();
$generator = $manager->getGenerator();

// Генерируем карту классов
$generator->parseSchema(MODX_CORE_PATH . 'components/mypackage/schema/mypackage.mysql.schema.xml', 
    MODX_CORE_PATH . 'components/mypackage/model/');

$mtime = microtime();
$mtime = explode(" ", $mtime);
$mtime = $mtime[1] + $mtime[0];
$tend = $mtime;
$totalTime = ($tend - $tstart);
$totalTime = sprintf("%2.4f s", $totalTime);

echo "\nGenerated model in {$totalTime}\n";
```

**Использование кастомных классов:**
```php
<?php
// Подключение пакета
$modx->addPackage('mypackage', MODX_CORE_PATH . 'components/mypackage/model/');

// Работа с объектами
$category = $modx->newObject('MyCategory');
$category->set('name', 'Электроника');
$category->save();

$item = $modx->newObject('MyItem');
$item->set('name', 'iPhone 15');
$item->set('price', 89990);
$item->set('category_id', $category->get('id'));
$item->save();

// Получение связанных данных
$items = $modx->getCollection('MyItem');
foreach ($items as $item) {
    $category = $item->getOne('Category');
    echo $item->get('name') . ' - ' . $category->get('name') . "\n";
}
```

## Процессоры: AJAX и автоматизация

Процессоры — это серверные скрипты для обработки AJAX-запросов и автоматизации задач.

### Структура процессора

```php
<?php
// core/components/mypackage/processors/item/create.class.php
class MyPackageItemCreateProcessor extends modObjectCreateProcessor {
    
    public $objectType = 'myitem';
    public $classKey = 'MyItem';
    public $languageTopics = array('mypackage:default');
    public $permission = 'mypackage_save';
    
    public function beforeSet() {
        $name = $this->getProperty('name');
        if (empty($name)) {
            $this->addFieldError('name', 'Название обязательно');
        }
        
        // Проверка на дубли
        $exists = $this->modx->getCount('MyItem', array('name' => $name));
        if ($exists) {
            $this->addFieldError('name', 'Товар с таким названием уже существует');
        }
        
        return parent::beforeSet();
    }
    
    public function afterSave() {
        // Логирование
        $this->modx->log(modX::LOG_LEVEL_INFO, 'Создан товар: ' . $this->object->get('name'));
        
        // Очистка кэша
        $this->modx->cacheManager->refresh(array(
            'db' => array(),
            'auto_publish' => array('contexts' => array('web'))
        ));
        
        return parent::afterSave();
    }
}

return 'MyPackageItemCreateProcessor';
```

### Фронтенд использование процессоров

```javascript
// AJAX запрос к процессору
function createItem(formData) {
    return fetch('/assets/components/mypackage/connector.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'item/create',
            name: formData.name,
            description: formData.description,
            price: formData.price,
            category_id: formData.category_id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Товар создан:', data.object);
            return data.object;
        } else {
            throw new Error(data.message || 'Ошибка создания');
        }
    });
}

// Использование
document.getElementById('create-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    try {
        const item = await createItem({
            name: formData.get('name'),
            description: formData.get('description'),
            price: formData.get('price'),
            category_id: formData.get('category_id')
        });
        
        alert('Товар создан успешно!');
        location.reload();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});
```

## Создание кастомного пакета

Полноценный пакет включает схему базы, процессоры, лексиконы, компоненты управления.

### Структура пакета

```
mypackage/
├── core/
│   └── components/
│       └── mypackage/
│           ├── docs/
│           ├── elements/
│           │   ├── snippets/
│           │   ├── chunks/
│           │   └── plugins/
│           ├── lexicon/
│           │   ├── ru/
│           │   └── en/
│           ├── model/
│           ├── processors/
│           ├── schema/
│           └── index.class.php
├── assets/
│   └── components/
│       └── mypackage/
│           ├── css/
│           ├── js/
│           ├── img/
│           └── connector.php
└── _build/
    ├── build.transport.php
    ├── build.config.php
    ├── resolvers/
    └── data/
```

### Основной класс пакета

```php
<?php
// core/components/mypackage/index.class.php
class MyPackage {
    
    public $modx;
    public $config = array();
    
    function __construct(modX &$modx, array $config = array()) {
        $this->modx =& $modx;
        
        $corePath = $this->getOption('core_path', $config, $this->modx->getOption('core_path') . 'components/mypackage/');
        $assetsUrl = $this->getOption('assets_url', $config, $this->modx->getOption('assets_url') . 'components/mypackage/');
        $assetsPath = $this->getOption('assets_path', $config, $this->modx->getOption('assets_path') . 'components/mypackage/');
        
        $this->config = array_merge(array(
            'assetsUrl' => $assetsUrl,
            'assetsPath' => $assetsPath,
            'corePath' => $corePath,
            'modelPath' => $corePath . 'model/',
            'processorsPath' => $corePath . 'processors/',
            'templatesPath' => $corePath . 'templates/',
            'chunksPath' => $corePath . 'elements/chunks/',
            'jsUrl' => $assetsUrl . 'js/',
            'cssUrl' => $assetsUrl . 'css/',
            'connectorUrl' => $assetsUrl . 'connector.php'
        ), $config);
        
        $this->modx->addPackage('mypackage', $this->config['modelPath']);
        $this->modx->lexicon->load('mypackage:default');
    }
    
    public function getOption($key, $options = array(), $default = null) {
        $option = $default;
        if (!empty($key) && is_string($key)) {
            if ($options != null && array_key_exists($key, $options)) {
                $option = $options[$key];
            } elseif (array_key_exists($key, $this->config)) {
                $option = $this->config[$key];
            } elseif (array_key_exists("mypackage.{$key}", $this->modx->config)) {
                $option = $this->modx->config["mypackage.{$key}"];
            }
        }
        return $option;
    }
    
    public function runProcessor($action, $data = array()) {
        return $this->modx->runProcessor($action, $data, array(
            'processors_path' => $this->config['processorsPath']
        ));
    }
}
```

### Transport пакет для установки

```php
<?php
// _build/build.transport.php
$mtime = microtime(); 
$mtime = explode(' ', $mtime); 
$mtime = $mtime[1] + $mtime[0]; 
$tstart = $mtime; 
set_time_limit(0);

define('PKG_NAME', 'MyPackage');
define('PKG_NAME_LOWER', strtolower(PKG_NAME));
define('PKG_VERSION', '1.0.0');
define('PKG_RELEASE', 'pl');

$root = dirname(__FILE__) . '/';
$sources = array(
    'root' => $root,
    'build' => $root,
    'data' => $root . 'data/',
    'resolvers' => $root . 'resolvers/',
    'chunks' => $root . 'data/chunks/',
    'snippets' => $root . 'data/snippets/',
    'plugins' => $root . 'data/plugins/'
);

require_once $sources['build'] . 'build.config.php';

$modx->setLogLevel(modX::LOG_LEVEL_INFO);
$modx->setLogTarget('ECHO');

$modx->loadClass('transport.modPackageBuilder', '', false, true);
$builder = new modPackageBuilder($modx);
$builder->directory = $sources['build'];
$builder->createPackage(PKG_NAME_LOWER, PKG_VERSION, PKG_RELEASE);
$builder->registerNamespace(PKG_NAME_LOWER, false, true, '{core_path}components/' . PKG_NAME_LOWER . '/', '{assets_path}components/' . PKG_NAME_LOWER . '/');

// Добавляем элементы
$modx->log(modX::LOG_LEVEL_INFO, 'Adding snippets...');
$snippets = include $sources['data'] . 'transport.snippets.php';
if (!is_array($snippets)) {
    $modx->log(modX::LOG_LEVEL_ERROR, 'Could not package in snippets.');
} else {
    $category->addMany($snippets);
    $modx->log(modX::LOG_LEVEL_INFO, 'Packaged in ' . count($snippets) . ' snippets.');
}

// Создаём пакет
$builder->pack();

$mtime = microtime();
$mtime = explode(" ", $mtime);
$mtime = $mtime[1] + $mtime[0];
$tend = $mtime;
$totalTime = ($tend - $tstart);
$totalTime = sprintf("%2.4f s", $totalTime);

$modx->log(modX::LOG_LEVEL_INFO, "\nPackage built in {$totalTime}");
exit();
```

## Git Workflow для MODX

### Gitify — синхронизация с Git

**Установка Gitify:**
```bash
curl -sS https://getcomposer.org/installer | php
php composer.phar global require modx/gitify
```

**Извлечение данных из MODX:**
```yaml
# .gitify
data_directory: _data/
backup_directory: _backup/

data:
    contexts:
        class: modContext
        primary: key
        exclude_keys:
            - mgr

    resources:
        class: modResource
        primary: id
        exclude_keys:
            - editedby
            - editedon

    templates:
        class: modTemplate
        primary: templatename
        extension: .html

    chunks:
        class: modChunk  
        primary: name
        extension: .html

    snippets:
        class: modSnippet
        primary: name
        extension: .php

    plugins:
        class: modPlugin
        primary: name
        extension: .php

    plugin_events:
        class: modPluginEvent
        primary: [pluginid, event]

    template_variables:
        class: modTemplateVar
        primary: name
```

**Команды Gitify:**
```bash
# Извлечение данных из MODX
gitify extract

# Сборка MODX из файлов
gitify build

# Установка MODX
gitify install:modx

# Установка пакетов
gitify install:package provider:package
```

### CI/CD Pipeline

**GitHub Actions для MODX:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.1'
        extensions: mbstring, zip, pdo_mysql
        
    - name: Install Gitify
      run: composer global require modx/gitify
      
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.2
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.DEPLOY_KEY }}
        script: |
          cd /var/www/html
          git pull origin main
          ~/.composer/vendor/bin/gitify build
          php artisan cache:clear
```

### Автоматизация разработки

**Gulp для сборки ассетов:**
```javascript
// gulpfile.js
const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

gulp.task('sass', function() {
    return gulp.src('assets/scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(gulp.dest('assets/css/'));
});

gulp.task('js', function() {
    return gulp.src('assets/src/js/**/*.js')
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('assets/js/'));
});

gulp.task('watch', function() {
    gulp.watch('assets/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('assets/src/js/**/*.js', gulp.series('js'));
});

gulp.task('build', gulp.parallel('sass', 'js'));
gulp.task('default', gulp.series('build', 'watch'));
```

## MODX в эпоху ИИ

Сейчас мы входим в эру, когда технологии больше не так важны. ИИ-ассистенты вроде Claude или ChatGPT стирают барьеры между разными платформами.

### Преимущества MODX в эпоху ИИ:

**1. Чистая архитектура** — ИИ легче понимает логику MODX
**2. Хорошая документация** — много материала для обучения моделей  
**3. Стабильная база** — не нужно изобретать велосипеды
**4. Готовые паттерны** — элементы, процессоры, пакеты

### Интеграция с ИИ:

```php
<?php
// Сниппет с ИИ-генерацией контента
$prompt = $modx->getOption('prompt', $scriptProperties, '');
if (empty($prompt)) return '';

$apiKey = $modx->getOption('openai_api_key');
$response = file_get_contents('https://api.openai.com/v1/chat/completions', false, 
    stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey
            ],
            'content' => json_encode([
                'model' => 'gpt-4',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ]
            ])
        ]
    ])
);

$data = json_decode($response, true);
return $data['choices'][0]['message']['content'] ?? '';
```

## Заключение

MODX — мощный инструмент для серьёзных проектов. Да, есть ограничения — монолитная архитектура, устаревшая админка, сложности с большими командами. Но для малого и среднего бизнеса это по-прежнему отличный выбор.

**Выигрывает мышление**, а не владение технологией. MODX даёт хорошую основу, а детали можно доверить ИИ-помощникам.

Главное — понимать, когда использовать MODX, а когда выбрать что-то другое. Для команд до 3 человек, SEO-проектов, корпоративных сайтов MODX идеален.

### Что дальше?

Вернитесь к основам:
- **[Разработка сайта на MODX: полное руководство](/blog/razrabotka-sajta-na-modx/)** — комплексный обзор платформы
- **[Что такое MODX Revolution](/blog/chto-takoe-modx-revolution/)** — базовые концепции

*Антон Ветров, веб-разработчик с 2006 года. 60+ проектов на MODX, от простых сайтов до сложных веб-приложений.*