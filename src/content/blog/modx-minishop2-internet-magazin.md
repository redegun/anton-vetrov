---
title: "miniShop2: создание интернет-магазина на MODX"
description: "Полное руководство по созданию интернет-магазина на MODX с помощью miniShop2. Установка, настройка, товары, заказы, платежи и доставка."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-minishop2-internet-magazin.webp"
tags: ["MODX", "miniShop2", "E-commerce", "Интернет-магазин"]
draft: false
---

# miniShop2: создание интернет-магазина на MODX

miniShop2 — это самое популярное и мощное решение для создания интернет-магазинов на MODX Revolution. Разработанное специально для российского рынка, оно включает все необходимые функции для полноценной электронной коммерции: каталог товаров, корзину, оформление заказов, интеграцию с платежными системами и службами доставки.

## Почему miniShop2 — лучший выбор для MODX

### Преимущества miniShop2

- **Бесплатность** — основная функциональность доступна без ограничений
- **Гибкость** — подходит для любых типов товаров и услуг
- **Производительность** — основан на pdoTools, быстро работает с большими каталогами
- **Расширяемость** — сотни бесплатных и платных дополнений
- **Локализация** — создан с учетом особенностей российского рынка

### Что включает miniShop2

- Система управления товарами и категориями
- Корзина и оформление заказов
- Управление клиентами и их заказами  
- Интеграция с платежными системами
- Система доставки
- Отзывы и рейтинги товаров
- Поиск и фильтрация товаров

## Установка и первоначальная настройка

### Установка через менеджер пакетов

1. Зайдите в **Управление → Установщики пакетов**
2. Найдите "miniShop2" в официальном репозитории  
3. Нажмите "Загрузить" и затем "Установить"
4. Следуйте инструкциям мастера установки

### Системные требования

- MODX Revolution 2.6.0+
- PHP 7.0+
- MySQL 5.6+ или MariaDB
- pdoTools (устанавливается автоматически)

### Первоначальная настройка

После установки выполните следующие шаги:

#### 1. Настройка менеджера товаров

Перейдите в **Дополнения → Каталог товаров**. Здесь располагается весь функционал управления магазином.

#### 2. Создание корневой категории

```
Название: Каталог товаров
Псевдоним: catalog  
Шаблон: CategoryTemplate
Тип содержимого: text/html
```

#### 3. Настройка системных параметров

В **Система → Настройки системы** найдите пространство имен "minishop2":

```
ms2_cart_context = web
ms2_category_grid_fields = id,pagetitle,article,price,thumb,new,popular,favorite
ms2_category_show_nested = Yes
ms2_price_format = [2, '.', ' ']
ms2_weight_format = [2, '.', ' ']
```

## Структура каталога товаров

### Создание категорий

Категории в miniShop2 — это обычные ресурсы MODX со специальным шаблоном:

```
Создайте ресурс:
- Название: Мобильные телефоны
- Псевдоним: mobile-phones
- Родитель: Каталог товаров  
- Шаблон: CategoryTemplate
- Тип содержимого: text/html
```

### Шаблон категории

**CategoryTemplate:**
```html
[[*content]]

[[!msProducts?
    &parents=`[[*id]]`
    &tpl=`tpl.msProducts.row`
    &limit=`12`
    &where=`{"published": 1, "deleted": 0}`
]]

[[!+page.nav]]
```

### Создание товаров

Товары создаются как дочерние ресурсы категорий:

1. В менеджере зайдите в **Дополнения → Каталог товаров**
2. Выберите категорию
3. Нажмите **Создать товар**
4. Заполните основные поля:
   - Название товара
   - Артикул
   - Цена
   - Краткое описание
   - Полное описание

### Характеристики товаров

miniShop2 поддерживает различные типы характеристик:

```
Базовые поля:
- article (артикул)
- price (цена)  
- old_price (старая цена)
- weight (вес)
- color (цвет)
- size (размер)
- vendor (производитель)

Логические поля:
- new (новинка)
- popular (популярный)
- favorite (рекомендуемый)
```

## Вывод товаров на сайте

### Сниппет msProducts

Основной сниппет для вывода товаров:

```
[[!msProducts?
    &parents=`5`
    &limit=`12`
    &tpl=`tpl.msProducts.row`
    &sortby=`{"price": "ASC"}`
    &where=`{"new": 1}`
]]
```

### Шаблон товара в списке

**tpl.msProducts.row:**
```html
<div class="ms2_product">
    <div class="ms2_product_image">
        [[+thumb:default=`/assets/images/no-photo.jpg`]]
    </div>
    
    <div class="ms2_product_info">
        <h3 class="ms2_product_title">
            <a href="[[+uri]]">[[+pagetitle]]</a>
        </h3>
        
        <div class="ms2_product_price">
            [[+old_price:gt=`0`:then=`
                <span class="ms2_old_price">[[+old_price]] ₽</span>
            `]]
            <span class="ms2_price">[[+price]] ₽</span>
        </div>
        
        <div class="ms2_product_actions">
            [[!msProductButtons?
                &tpl=`tpl.msProductButtons`
                &product=`[[+id]]`
            ]]
        </div>
    </div>
</div>
```

### Кнопки товара

**tpl.msProductButtons:**
```html
<form class="ms2_form" method="post">
    <input type="hidden" name="id" value="[[+id]]" />
    <button type="submit" name="ms2_action" value="cart/add" 
            class="btn btn-primary">
        В корзину
    </button>
</form>
```

## Страница товара

### Шаблон товара

**ProductTemplate:**
```html
<article class="ms2_product">
    <div class="row">
        <div class="col-md-6">
            [[!msGallery? &product=`[[*id]]`]]
        </div>
        
        <div class="col-md-6">
            <h1>[[*pagetitle]]</h1>
            
            [[*article:notempty=`
                <p><strong>Артикул:</strong> [[*article]]</p>
            `]]
            
            <div class="ms2_product_price">
                [[*old_price:gt=`0`:then=`
                    <span class="ms2_old_price">[[*old_price]] ₽</span>
                `]]
                <span class="ms2_price">[[*price]] ₽</span>
            </div>
            
            <div class="ms2_product_options">
                [[!msProductOptions? &product=`[[*id]]`]]
            </div>
            
            [[!msProductButtons?
                &tpl=`tpl.msProductButtons.detail`
                &product=`[[*id]]`
            ]]
            
            [[*content]]
        </div>
    </div>
</article>
```

### Галерея товара

```
[[!msGallery?
    &product=`[[*id]]`
    &tpl=`tpl.msGallery.row`
    &limit=`10`
]]
```

**tpl.msGallery.row:**
```html
<div class="ms2_gallery">
    <div class="ms2_main_image">
        <img src="[[+image]]" alt="[[+name]]" />
    </div>
    
    <div class="ms2_thumbnails">
        [[+thumbnails]]
    </div>
</div>
```

## Корзина и оформление заказа

### Корзина

Создайте отдельную страницу для корзины:

```
Название: Корзина
Псевдоним: cart
Шаблон: CartTemplate
Содержимое:
[[!msCart]]
[[!msOrder]]
```

### Шаблон корзины

**tpl.msCart:**
```html
<div id="msCart">
    [[+products]]
    
    <div class="ms2_cart_total">
        <table>
            <tr>
                <td>Количество товаров:</td>
                <td>[[+total_count]]</td>
            </tr>
            <tr>
                <td>Общая стоимость:</td>
                <td>[[+total_cost]] ₽</td>
            </tr>
        </table>
    </div>
</div>
```

### Форма заказа

**tpl.msOrder:**
```html
<form class="ms2_form" id="msOrder" method="post">
    <div class="row">
        <div class="col-md-6">
            <h3>Контактные данные</h3>
            
            <div class="form-group">
                <label>ФИО *</label>
                <input type="text" name="receiver" value="[[+fi.receiver]]" 
                       class="form-control" required />
            </div>
            
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" value="[[+fi.email]]" 
                       class="form-control" required />
            </div>
            
            <div class="form-group">
                <label>Телефон *</label>
                <input type="tel" name="phone" value="[[+fi.phone]]" 
                       class="form-control" required />
            </div>
        </div>
        
        <div class="col-md-6">
            <h3>Доставка</h3>
            [[+delivery]]
            
            <h3>Оплата</h3>
            [[+payment]]
        </div>
    </div>
    
    <div class="form-group">
        <label>Комментарий к заказу</label>
        <textarea name="comment" class="form-control">[[+fi.comment]]</textarea>
    </div>
    
    <button type="submit" name="ms2_action" value="order/submit" 
            class="btn btn-success">
        Оформить заказ
    </button>
</form>
```

## Управление заказами

### Статусы заказов

miniShop2 поддерживает гибкую систему статусов:

- **Новый** — заказ только что оформлен
- **Принят** — заказ обработан менеджером
- **Оплачен** — получена оплата
- **Отправлен** — товар передан в доставку
- **Получен** — заказ доставлен клиенту
- **Отменен** — заказ отменен

### Уведомления

Настройте автоматические уведомления в **Система → Email шаблоны**:

**msOrderNew.tpl** (новый заказ):
```html
Здравствуйте, [[+order.receiver]]!

Ваш заказ №[[+order.num]] успешно оформлен.

Товары в заказе:
[[+products]]

Общая сумма: [[+order.cost]] ₽

Спасибо за покупку!
```

## Платежные системы

### Подключение ЮKassa

1. Установите дополнение "msPaymentYookassa"
2. Получите ключи в личном кабинете ЮKassa
3. Настройте в **Дополнения → Каталог товаров → Настройки**:

```
Идентификатор магазина: 123456
Секретный ключ: live_***
Тестовый режим: Нет
```

### Подключение РобоKassa

```php
// Настройки RobоKassa
$shop_id = 'demo';
$password1 = 'password_1';
$password2 = 'password_2';
$test_mode = true;
```

## Доставка товаров

### СДЭК

1. Установите "msDeliveryСDEK"
2. Получите API ключи в кабинете СДЭК
3. Настройте тарифы доставки

### Почта России

```
Установка: msDeliveryRussianPost
Настройка:
- Логин API
- Пароль API  
- Тариф по умолчанию
```

## Поиск и фильтрация

### mSearch2

Для полнотекстового поиска установите mSearch2:

```
[[!mSearch2?
    &class=`msProduct`
    &parents=`5`
    &returnIds=`1`
    &showLog=`0`
]]

[[!msProducts?
    &resources=`[[+mSearch2.ids]]`
    &parents=`0`
    &tpl=`tpl.msProducts.row`
]]
```

### mFilter2

Для фильтрации по характеристикам:

```
[[!mFilter2?
    &parents=`5`
    &filters=`
        ms|price:number,
        ms|color:checkbox,
        ms|vendor:select
    `
    &aliases=`
        ms|price==Цена,
        ms|color==Цвет,
        ms|vendor==Производитель
    `
]]
```

### Шаблон фильтра

**tpl.mFilter2.outer:**
```html
<form class="filters" id="mse2_filters">
    <div class="row">
        [[+filters]]
    </div>
    
    <div class="mse2_controls">
        <button type="submit" class="btn btn-primary">Применить</button>
        <button type="reset" class="btn btn-secondary">Сбросить</button>
    </div>
</form>

<div id="mse2_results">
    [[!msProducts?
        &parents=`[[*id]]`
        &tpl=`tpl.msProducts.row`
        &limit=`12`
    ]]
</div>
```

## Интеграция с CRM-системами

### amoCRM

```
Установка: msAmoCrm
Настройка:
- Домен в amoCRM
- API ключ
- Пользователь
- Настройка полей
```

### Битрикс24

```php
// Webhook для отправки заказов в Битрикс24
$webhook_url = 'https://your-domain.bitrix24.ru/rest/1/webhook_key/';

// Отправка данных заказа
$order_data = array(
    'TITLE' => 'Заказ №' . $order['num'],
    'NAME' => $order['receiver'],
    'PHONE' => $order['phone'],
    'EMAIL' => $order['email']
);
```

## SEO-оптимизация каталога

Подробнее об SEO для каталогов товаров читайте в статье [Каталог товаров на MODX](/blog/modx-katalog-tovarov/).

### URL-адреса товаров

```
Настройте friendly URLs:
/catalog/mobile-phones/iphone-14-pro/
/catalog/computers/macbook-air-m2/
```

### Метатеги

```html
<!-- В шаблоне товара -->
<title>[[*pagetitle]] - купить в интернет-магазине</title>
<meta name="description" content="[[*introtext:default=`[[*pagetitle]] - описание, характеристики, цена [[*price]] руб. Доставка по всей России.`]]">

<!-- Микроразметка Schema.org -->
<script type="application/ld+json">
{
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "[[*pagetitle]]",
    "image": "[[*image]]",
    "description": "[[*introtext]]",
    "sku": "[[*article]]",
    "offers": {
        "@type": "Offer",
        "url": "[[~[[*id]]]]",
        "priceCurrency": "RUB",
        "price": "[[*price]]",
        "availability": "https://schema.org/InStock"
    }
}
</script>
```

### Генерация sitemap

```
[[!pdoSitemap?
    &parents=`5`
    &depth=`10`
    &class=`msProduct`
    &tpl=`@INLINE <url><loc>[[+url]]</loc><lastmod>[[+createdon:strtotime:date=`%Y-%m-%d`]]</lastmod></url>`
]]
```

## Производительность и оптимизация

### Кеширование

```
<!-- Кеширование списков товаров -->
[[msProducts?
    &cache=`1`
    &cacheTime=`3600`
    &parents=`5`
]]

<!-- Кеширование корзины отключить -->
[[!msCart]]
```

### Оптимизация базы данных

```sql
-- Индексы для быстрого поиска
ALTER TABLE `modx_ms2_products` 
ADD INDEX `published_deleted` (`published`, `deleted`);

ALTER TABLE `modx_ms2_products` 
ADD INDEX `price` (`price`);

-- Очистка логов
DELETE FROM modx_ms2_order_logs WHERE createdon < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

### Настройка хостинга

Для стабильной работы интернет-магазина рекомендуется использовать качественный хостинг. Отличным выбором станет [Timeweb](https://timeweb.cloud/?i=33633) — быстрые SSD-диски, современные версии PHP и круглосуточная поддержка обеспечат стабильную работу вашего магазина.

## Безопасность магазина

### Защита от ботов

```
<!-- reCAPTCHA в форме заказа -->
[[!FormItRetriever? &redirectToOnNotFound=`[[*id]]`]]
[[!FormIt?
    &submitVar=`order-submit`
    &successMessage=`Заказ успешно оформлен!`
    &validate=`receiver:required,email:required:email,recaptcha:required`
    &hooks=`recaptcha,msOrderProcessor`
]]
```

### SSL-сертификат

Обязательно используйте HTTPS для страниц оформления заказа и оплаты:

```apache
# В .htaccess
RewriteCond %{HTTPS} off
RewriteCond %{REQUEST_URI} ^/(cart|checkout|payment)
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

## Популярные дополнения для miniShop2

Расширьте функциональность магазина с помощью дополнений. Больше информации о дополнениях MODX в статье [Топ дополнений MODX](/blog/modx-dopolneniya-top/).

### Обязательные дополнения

- **msPromoCode** — промокоды и скидки
- **msImportExport** — импорт/экспорт товаров  
- **msMultiCurrency** — мультивалютность
- **msOptionsPrice2** — опции товаров с влиянием на цену

### Полезные дополнения

- **msStat** — статистика продаж
- **msDiscount** — система скидок
- **msGallery** — расширенная галерея товаров
- **msOneClick** — покупка в один клик

## Мобильная версия

### Адаптивная верстка

```css
/* Адаптация каталога товаров */
.ms2_products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

@media (max-width: 768px) {
    .ms2_products {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
    }
    
    .ms2_product_image img {
        width: 100%;
        height: auto;
    }
}
```

### PWA для магазина

```html
<!-- manifest.json -->
{
    "name": "Интернет-магазин",
    "short_name": "Shop",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#000000",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

## Заключение

miniShop2 — это мощная платформа для создания интернет-магазинов любой сложности на MODX Revolution. Благодаря модульной архитектуре, rich функциональности из коробки и огромному сообществу разработчиков, вы сможете создать магазин, который будет расти вместе с вашим бизнесом.

Основные этапы создания магазина:

1. **Установка и настройка** miniShop2
2. **Создание структуры каталога** с категориями и товарами
3. **Настройка оформления заказов** с доставкой и оплатой  
4. **Интеграция с внешними сервисами** (CRM, аналитика)
5. **SEO-оптимизация** и настройка производительности
6. **Тестирование и запуск**

miniShop2 дает все инструменты для создания успешного интернет-магазина — остается только правильно их использовать.