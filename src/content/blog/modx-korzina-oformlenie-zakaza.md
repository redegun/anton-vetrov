---
title: "Корзина и оформление заказа на MODX: miniShop2 + кастомизация"
description: "Создание удобной корзины и процесса оформления заказа в интернет-магазине на MODX: настройка miniShop2, кастомизация шаблонов, многоэтапное оформление."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-korzina-oformlenie-zakaza.webp"
tags: ["MODX", "miniShop2", "Корзина", "Оформление заказа", "E-commerce"]
draft: false
---


Корзина и процесс оформления заказа — критически важные элементы интернет-магазина. По статистике, 70% пользователей бросают покупку на этапе оформления из-за сложного или неудобного интерфейса. В MODX с miniShop2 можно создать максимально удобный и конверсионный процесс покупки.

## Архитектура корзины в miniShop2

### Как работает корзина

miniShop2 использует сессии для хранения данных корзины неавторизованных пользователей и базу данных для зарегистрированных. Это обеспечивает:

- **Быстрое добавление** товаров без перезагрузки
- **Сохранность корзины** при закрытии браузера (для авторизованных)
- **Синхронизацию** между устройствами одного пользователя
- **Восстановление брошенных корзин** для email-маркетинга

### Основные компоненты

```php
// Структура корзины в базе/сессии
$cart = [
    'products' => [
        [
            'id' => 123,                    // ID товара
            'key' => 'abc123',              // Уникальный ключ позиции
            'price' => 1500.00,             // Цена за единицу
            'count' => 2,                   // Количество
            'options' => ['color' => 'red'], // Выбранные опции
            'weight' => 0.5                 // Вес для расчёта доставки
        ]
    ],
    'total' => [
        'cart_count' => 2,      // Общее количество позиций
        'cart_weight' => 1.0,   // Общий вес
        'cart_cost' => 3000.00  // Сумма товаров
    ]
];
```

## Базовая настройка корзины

### Системные настройки miniShop2

```php
// Основные параметры корзины
'ms2_cart_context' => 'web'           // Контекст корзины
'ms2_cart_max_count' => 1000          // Максимальное количество одного товара
'ms2_price_snippet' => ''             // Сниппет для расчёта цен
'ms2_weight_precision' => 3           // Точность веса
'ms2_price_precision' => 2            // Точность цены

// Поведение корзины
'ms2_cart_remove_empty' => true       // Удалять позиции с количеством 0
'ms2_cart_js_class_name' => 'miniShop2' // CSS класс для JS
```

### Подключение на странице товара

```html
<!-- Кнопка добавления в корзину -->
<form class="ms2_form" method="post">
    <input type="hidden" name="id" value="[[*id]]">
    
    <!-- Опции товара -->
    [[msOptions? &product=`[[*id]]` &tpl=`tpl.msOptions.row`]]
    
    <div class="product-quantity">
        <label>Количество:</label>
        <div class="quantity-controls">
            <button type="button" class="qty-minus">−</button>
            <input type="number" name="count" value="1" min="1" max="[[+count]]" class="qty-input">
            <button type="button" class="qty-plus">+</button>
        </div>
    </div>
    
    <div class="product-actions">
        <button type="submit" name="ms2_action" value="cart/add" class="btn-cart">
            <span class="btn-text">В корзину</span>
            <span class="btn-price">[[*price]] ₽</span>
        </button>
        
        <button type="button" class="btn-favorite" data-id="[[*id]]">
            ♡ В избранное
        </button>
        
        <button type="button" class="btn-compare" data-id="[[*id]]">
            ⚖ Сравнить
        </button>
    </div>
</form>
```

### Мини-корзина в шапке сайта

```html
<!-- Чанк: tpl.msCart.mini -->
<div class="mini-cart" id="msCart">
    [[!msCart?
        &tpl=`tpl.msCart.mini.row`
        &tplOuter=`tpl.msCart.mini.outer`
        &tplEmpty=`tpl.msCart.mini.empty`
    ]]
</div>
```

**Внешний шаблон (tpl.msCart.mini.outer):**
```html
<div class="cart-toggle" onclick="toggleCart()">
    <span class="cart-icon">🛒</span>
    <span class="cart-count">[[+total.cart_count]]</span>
    <span class="cart-total">[[+total.cart_cost]] ₽</span>
</div>

<div class="cart-dropdown" id="cartDropdown">
    <div class="cart-header">
        <h3>Корзина ([[+total.cart_count]])</h3>
        <button class="cart-close" onclick="toggleCart()">×</button>
    </div>
    
    <div class="cart-items">
        [[+rows]]
    </div>
    
    <div class="cart-footer">
        <div class="cart-total-line">
            <strong>Итого: [[+total.cart_cost]] ₽</strong>
        </div>
        
        <div class="cart-actions">
            <a href="[[~[[++ms2_cart_id]]]]" class="btn-cart-full">Корзина</a>
            <a href="[[~[[++ms2_order_id]]]]" class="btn-checkout">Оформить</a>
        </div>
    </div>
</div>
```

**Строка товара (tpl.msCart.mini.row):**
```html
<div class="cart-item" data-key="[[+key]]">
    <div class="item-image">
        [[msGallery? &id=`[[+id]]` &limit=`1` &tpl=`@INLINE <img src="[[+small]]" alt="[[+name]]">`]]
    </div>
    
    <div class="item-details">
        <div class="item-name">[[+name]]</div>
        <div class="item-options">
            [[+options:notempty=`<small>[[+options]]</small>`]]
        </div>
        <div class="item-quantity">[[+count]] × [[+price]] ₽</div>
    </div>
    
    <button class="item-remove" onclick="msCart.remove('[[+key]]')">×</button>
</div>
```

## Полная страница корзины

### Детальный вид корзины

```html
<!-- Шаблон страницы корзины -->
<div class="cart-page">
    <h1>Корзина</h1>
    
    [[!msCart?
        &tpl=`tpl.msCart.row`
        &tplOuter=`tpl.msCart.outer`
        &tplEmpty=`tpl.msCart.empty`
    ]]
</div>
```

**Внешний шаблон (tpl.msCart.outer):**
```html
<div class="cart-table-wrapper">
    <form class="cart-form">
        <table class="cart-table">
            <thead>
                <tr>
                    <th class="col-product">Товар</th>
                    <th class="col-price">Цена</th>
                    <th class="col-quantity">Количество</th>
                    <th class="col-total">Сумма</th>
                    <th class="col-remove"></th>
                </tr>
            </thead>
            <tbody>
                [[+rows]]
            </tbody>
        </table>
        
        <div class="cart-summary">
            <div class="cart-actions">
                <button type="button" class="btn-continue-shopping">
                    ← Продолжить покупки
                </button>
                
                <button type="button" class="btn-clear-cart" onclick="msCart.clean()">
                    Очистить корзину
                </button>
            </div>
            
            <div class="cart-totals">
                <div class="total-line">
                    <span>Товары ([[+total.cart_count]]):</span>
                    <span>[[+total.cart_cost]] ₽</span>
                </div>
                
                [[+total.cart_weight:gt=`0`:then=`
                    <div class="total-line">
                        <span>Общий вес:</span>
                        <span>[[+total.cart_weight]] кг</span>
                    </div>
                `]]
                
                <div class="total-line total-final">
                    <strong>
                        <span>Итого:</span>
                        <span>[[+total.cart_cost]] ₽</span>
                    </strong>
                </div>
                
                <div class="checkout-actions">
                    <a href="[[~[[++ms2_order_id]]]]" class="btn-checkout btn-large">
                        Перейти к оформлению
                    </a>
                </div>
            </div>
        </div>
    </form>
</div>

<!-- Рекомендации -->
<div class="recommended-products">
    <h2>С этими товарами покупают</h2>
    [[msProducts?
        &parents=`[[*parent]]`
        &limit=`4`
        &exclude=`[[msCart.get_ids]]`
        &sortby=`RAND()`
        &tpl=`tpl.msProducts.row.small`
    ]]
</div>
```

**Строка корзины (tpl.msCart.row):**
```html
<tr class="cart-row" data-key="[[+key]]">
    <td class="col-product">
        <div class="product-info">
            <div class="product-image">
                <a href="[[+uri]]">
                    [[msGallery? &id=`[[+id]]` &limit=`1` &tpl=`@INLINE <img src="[[+medium]]" alt="[[+pagetitle]]">`]]
                </a>
            </div>
            
            <div class="product-details">
                <h3 class="product-name">
                    <a href="[[+uri]]">[[+pagetitle]]</a>
                </h3>
                
                <div class="product-options">
                    [[+options:notempty=`[[+options]]`]]
                </div>
                
                <div class="product-article">
                    Артикул: [[+article]]
                </div>
            </div>
        </div>
    </td>
    
    <td class="col-price">
        <span class="price">[[+price]] ₽</span>
        [[+old_price:gt=`[[+price]]`:then=`
            <span class="old-price">[[+old_price]] ₽</span>
        `]]
    </td>
    
    <td class="col-quantity">
        <div class="quantity-controls">
            <button type="button" class="qty-btn qty-minus" onclick="msCart.change('[[+key]]', [[+count]] - 1)">−</button>
            <input type="number" 
                   value="[[+count]]" 
                   min="1" 
                   max="[[+count_max:default=`999`]]"
                   class="qty-input" 
                   onchange="msCart.change('[[+key]]', this.value)">
            <button type="button" class="qty-btn qty-plus" onclick="msCart.change('[[+key]]', [[+count]] + 1)">+</button>
        </div>
    </td>
    
    <td class="col-total">
        <strong class="item-total">[[+cost]] ₽</strong>
    </td>
    
    <td class="col-remove">
        <button type="button" 
                class="btn-remove" 
                onclick="msCart.remove('[[+key]]')"
                title="Удалить">
            🗑
        </button>
    </td>
</tr>
```

## Многоэтапное оформление заказа

### Структура процесса

1. **Корзина** — просмотр и редактирование товаров
2. **Контактные данные** — ввод информации о покупателе  
3. **Доставка** — выбор способа доставки и адреса
4. **Оплата** — выбор способа оплаты
5. **Подтверждение** — финальная проверка заказа

### Основной шаблон оформления

```html
<!-- Шаблон страницы заказа -->
<div class="checkout-page">
    <div class="checkout-progress">
        <div class="step active" data-step="1">
            <span class="step-number">1</span>
            <span class="step-title">Контакты</span>
        </div>
        <div class="step" data-step="2">
            <span class="step-number">2</span>
            <span class="step-title">Доставка</span>
        </div>
        <div class="step" data-step="3">
            <span class="step-number">3</span>
            <span class="step-title">Оплата</span>
        </div>
        <div class="step" data-step="4">
            <span class="step-number">4</span>
            <span class="step-title">Подтверждение</span>
        </div>
    </div>
    
    <div class="checkout-content">
        <div class="checkout-main">
            [[!msOrder?
                &tplOuter=`tpl.msOrder.outer`
                &tplContactInfo=`tpl.msOrder.contact`
                &tplDelivery=`tpl.msOrder.delivery`
                &tplPayment=`tpl.msOrder.payment`
                &tplCart=`tpl.msOrder.cart`
            ]]
        </div>
        
        <div class="checkout-sidebar">
            <div class="order-summary">
                <h3>Ваш заказ</h3>
                [[!msCart?
                    &tpl=`tpl.msCart.order.row`
                    &tplOuter=`tpl.msCart.order.outer`
                ]]
            </div>
        </div>
    </div>
</div>
```

### Шаг 1: Контактные данные

```html
<!-- Чанк: tpl.msOrder.contact -->
<div class="checkout-step" id="step-contact">
    <h2>Контактная информация</h2>
    
    [[!+fi.validation_error_message:notempty=`
        <div class="alert alert-error">[[+fi.validation_error_message]]</div>
    `]]
    
    <!-- Быстрая авторизация -->
    [[!+modx.user.id:is=``:then=`
        <div class="auth-options">
            <div class="auth-tabs">
                <button type="button" class="tab-btn active" onclick="showAuthTab('guest')">
                    Гость
                </button>
                <button type="button" class="tab-btn" onclick="showAuthTab('login')">
                    Вход
                </button>
                <button type="button" class="tab-btn" onclick="showAuthTab('register')">
                    Регистрация
                </button>
            </div>
            
            <div class="auth-content">
                <div id="guest-form" class="auth-form active">
                    <!-- Форма для гостей -->
                </div>
                
                <div id="login-form" class="auth-form">
                    [[!Login? &tpl=`tpl.login.checkout`]]
                </div>
                
                <div id="register-form" class="auth-form">
                    [[!Register? &tpl=`tpl.register.checkout`]]
                </div>
            </div>
        </div>
    `:else=`
        <div class="user-info">
            <p>Заказ оформляется на: <strong>[[!+modx.user.fullname]]</strong></p>
            <p><a href="[[~[[++logout_id]]]]">Выйти</a></p>
        </div>
    `]]
    
    <div class="contact-form">
        <div class="form-row">
            <div class="form-group">
                <label for="receiver">Имя получателя *</label>
                <input type="text" 
                       name="receiver" 
                       id="receiver"
                       value="[[!+fi.receiver]]" 
                       required>
                <span class="error">[[!+fi.error.receiver]]</span>
            </div>
            
            <div class="form-group">
                <label for="phone">Телефон *</label>
                <input type="tel" 
                       name="phone" 
                       id="phone"
                       value="[[!+fi.phone]]" 
                       placeholder="+7 (999) 123-45-67"
                       required>
                <span class="error">[[!+fi.error.phone]]</span>
            </div>
        </div>
        
        <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" 
                   name="email" 
                   id="email"
                   value="[[!+fi.email]]" 
                   placeholder="example@mail.ru"
                   required>
            <span class="error">[[!+fi.error.email]]</span>
            <small>На этот email придёт подтверждение заказа</small>
        </div>
        
        <div class="form-group">
            <label for="comment">Комментарий к заказу</label>
            <textarea name="comment" 
                      id="comment" 
                      placeholder="Особые пожелания к заказу">[[!+fi.comment]]</textarea>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn-next" onclick="nextStep(2)">
                Выбрать доставку →
            </button>
        </div>
    </div>
</div>
```

### Шаг 2: Доставка

```html
<!-- Чанк: tpl.msOrder.delivery -->
<div class="checkout-step" id="step-delivery" style="display: none;">
    <h2>Способ доставки</h2>
    
    <div class="delivery-methods">
        [[!msDelivery?
            &tpl=`tpl.msDelivery.row`
            &tplOuter=`tpl.msDelivery.outer`
        ]]
    </div>
    
    <!-- Адрес доставки -->
    <div class="delivery-address" id="delivery-address">
        <h3>Адрес доставки</h3>
        
        <div class="form-row">
            <div class="form-group">
                <label for="city">Город *</label>
                <input type="text" name="city" id="city" value="[[!+fi.city]]" required>
                <div class="city-suggestions"></div>
            </div>
            
            <div class="form-group">
                <label for="metro">Станция метро</label>
                <input type="text" name="metro" id="metro" value="[[!+fi.metro]]">
            </div>
        </div>
        
        <div class="form-group">
            <label for="street">Улица *</label>
            <input type="text" name="street" id="street" value="[[!+fi.street]]" required>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="building">Дом *</label>
                <input type="text" name="building" id="building" value="[[!+fi.building]]" required>
            </div>
            
            <div class="form-group">
                <label for="apartment">Квартира</label>
                <input type="text" name="apartment" id="apartment" value="[[!+fi.apartment]]">
            </div>
        </div>
        
        <div class="form-group">
            <label for="index">Индекс</label>
            <input type="text" name="index" id="index" value="[[!+fi.index]]" placeholder="123456">
        </div>
    </div>
    
    <!-- Карта для курьерской доставки -->
    <div class="delivery-map" id="delivery-map" style="display: none;">
        <div id="map" style="height: 400px;"></div>
        <div class="map-controls">
            <button type="button" onclick="detectLocation()">Определить моё местоположение</button>
        </div>
    </div>
    
    <div class="form-actions">
        <button type="button" class="btn-prev" onclick="prevStep(1)">
            ← Назад
        </button>
        <button type="button" class="btn-next" onclick="nextStep(3)">
            Выбрать оплату →
        </button>
    </div>
</div>
```

### Шаг 3: Оплата

```html
<!-- Чанк: tpl.msOrder.payment -->
<div class="checkout-step" id="step-payment" style="display: none;">
    <h2>Способ оплаты</h2>
    
    <div class="payment-methods">
        [[!msPayment?
            &tpl=`tpl.msPayment.row`
            &tplOuter=`tpl.msPayment.outer`
        ]]
    </div>
    
    <!-- Дополнительные поля для банковской карты -->
    <div class="payment-details" id="card-details" style="display: none;">
        <h3>Данные банковской карты</h3>
        <div class="card-form">
            <div class="form-group">
                <label for="card-number">Номер карты *</label>
                <input type="text" 
                       id="card-number" 
                       placeholder="1234 5678 9012 3456" 
                       maxlength="19">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="card-expiry">Срок действия *</label>
                    <input type="text" 
                           id="card-expiry" 
                           placeholder="ММ/ГГ" 
                           maxlength="5">
                </div>
                
                <div class="form-group">
                    <label for="card-cvv">CVV *</label>
                    <input type="text" 
                           id="card-cvv" 
                           placeholder="123" 
                           maxlength="3">
                </div>
            </div>
            
            <div class="form-group">
                <label for="card-holder">Имя владельца *</label>
                <input type="text" 
                       id="card-holder" 
                       placeholder="IVAN PETROV">
            </div>
        </div>
    </div>
    
    <div class="form-actions">
        <button type="button" class="btn-prev" onclick="prevStep(2)">
            ← Назад
        </button>
        <button type="button" class="btn-next" onclick="nextStep(4)">
            Проверить заказ →
        </button>
    </div>
</div>
```

### Шаг 4: Подтверждение

```html
<!-- Чанк: tpl.msOrder.confirm -->
<div class="checkout-step" id="step-confirm" style="display: none;">
    <h2>Подтверждение заказа</h2>
    
    <div class="order-review">
        <div class="review-section">
            <h3>Контактные данные</h3>
            <div class="review-data" id="review-contact"></div>
            <button type="button" class="btn-edit" onclick="goToStep(1)">Изменить</button>
        </div>
        
        <div class="review-section">
            <h3>Доставка</h3>
            <div class="review-data" id="review-delivery"></div>
            <button type="button" class="btn-edit" onclick="goToStep(2)">Изменить</button>
        </div>
        
        <div class="review-section">
            <h3>Оплата</h3>
            <div class="review-data" id="review-payment"></div>
            <button type="button" class="btn-edit" onclick="goToStep(3)">Изменить</button>
        </div>
    </div>
    
    <div class="agreement-section">
        <label class="agreement-checkbox">
            <input type="checkbox" name="agreement" required>
            <span>Я согласен с <a href="/agreement/" target="_blank">условиями публичной оферты</a> и <a href="/privacy/" target="_blank">политикой конфиденциальности</a></span>
        </label>
        
        <label class="newsletter-checkbox">
            <input type="checkbox" name="newsletter" checked>
            <span>Получать информацию о скидках и новинках</span>
        </label>
    </div>
    
    <div class="form-actions">
        <button type="button" class="btn-prev" onclick="prevStep(3)">
            ← Назад
        </button>
        <button type="submit" name="ms2_action" value="order/submit" class="btn-submit">
            Подтвердить заказ
        </button>
    </div>
</div>
```

## JavaScript для многошагового оформления

```javascript
// Управление шагами оформления
var CheckoutSteps = {
    currentStep: 1,
    totalSteps: 4,
    
    init: function() {
        this.bindEvents();
        this.loadStep(1);
    },
    
    bindEvents: function() {
        // Валидация при переходе между шагами
        $(document).on('click', '.btn-next', function(e) {
            e.preventDefault();
            var nextStep = parseInt($(this).data('next'));
            if (CheckoutSteps.validateStep(CheckoutSteps.currentStep)) {
                CheckoutSteps.nextStep(nextStep);
            }
        });
        
        // Автозаполнение адреса по индексу
        $(document).on('input', '#index', CheckoutSteps.debounce(function() {
            var index = $(this).val();
            if (index.length === 6) {
                CheckoutSteps.fillAddressByIndex(index);
            }
        }, 500));
        
        // Показ/скрытие полей в зависимости от выбранного способа
        $(document).on('change', 'input[name="delivery"]', function() {
            CheckoutSteps.handleDeliveryChange($(this).val());
        });
        
        $(document).on('change', 'input[name="payment"]', function() {
            CheckoutSteps.handlePaymentChange($(this).val());
        });
        
        // Отправка заказа
        $(document).on('submit', '.checkout-form', function(e) {
            e.preventDefault();
            if (CheckoutSteps.validateStep(4)) {
                CheckoutSteps.submitOrder();
            }
        });
    },
    
    nextStep: function(step) {
        this.hideStep(this.currentStep);
        this.showStep(step);
        this.updateProgress(step);
        this.currentStep = step;
    },
    
    prevStep: function(step) {
        this.hideStep(this.currentStep);
        this.showStep(step);
        this.updateProgress(step);
        this.currentStep = step;
    },
    
    goToStep: function(step) {
        this.hideStep(this.currentStep);
        this.showStep(step);
        this.updateProgress(step);
        this.currentStep = step;
    },
    
    showStep: function(step) {
        $('#step-' + this.getStepName(step)).fadeIn(300);
    },
    
    hideStep: function(step) {
        $('#step-' + this.getStepName(step)).hide();
    },
    
    updateProgress: function(step) {
        $('.checkout-progress .step').removeClass('active completed');
        
        for (var i = 1; i < step; i++) {
            $('.checkout-progress .step[data-step="' + i + '"]').addClass('completed');
        }
        
        $('.checkout-progress .step[data-step="' + step + '"]').addClass('active');
    },
    
    getStepName: function(step) {
        var names = ['', 'contact', 'delivery', 'payment', 'confirm'];
        return names[step];
    },
    
    validateStep: function(step) {
        var isValid = true;
        var $form = $('#step-' + this.getStepName(step));
        
        // Очищаем предыдущие ошибки
        $form.find('.error').text('');
        $form.find('.form-group').removeClass('has-error');
        
        // Проверяем обязательные поля
        $form.find('[required]').each(function() {
            var $field = $(this);
            var value = $field.val().trim();
            
            if (!value) {
                isValid = false;
                $field.closest('.form-group').addClass('has-error');
                $field.siblings('.error').text('Обязательное поле');
            }
        });
        
        // Специфичная валидация для каждого шага
        switch(step) {
            case 1:
                isValid = isValid && this.validateContact();
                break;
            case 2:
                isValid = isValid && this.validateDelivery();
                break;
            case 3:
                isValid = isValid && this.validatePayment();
                break;
            case 4:
                isValid = isValid && this.validateAgreement();
                break;
        }
        
        return isValid;
    },
    
    validateContact: function() {
        var email = $('#email').val();
        var phone = $('#phone').val();
        
        // Проверка email
        if (email && !this.isValidEmail(email)) {
            $('#email').closest('.form-group').addClass('has-error');
            $('#email').siblings('.error').text('Неверный формат email');
            return false;
        }
        
        // Проверка телефона
        if (phone && !this.isValidPhone(phone)) {
            $('#phone').closest('.form-group').addClass('has-error');
            $('#phone').siblings('.error').text('Неверный формат телефона');
            return false;
        }
        
        return true;
    },
    
    validateDelivery: function() {
        var delivery = $('input[name="delivery"]:checked').val();
        
        if (!delivery) {
            alert('Выберите способ доставки');
            return false;
        }
        
        // Для курьерской доставки проверяем адрес
        if (delivery === 'courier') {
            var requiredFields = ['city', 'street', 'building'];
            for (var i = 0; i < requiredFields.length; i++) {
                var field = requiredFields[i];
                if (!$('#' + field).val().trim()) {
                    alert('Заполните адрес доставки');
                    return false;
                }
            }
        }
        
        return true;
    },
    
    validatePayment: function() {
        var payment = $('input[name="payment"]:checked').val();
        
        if (!payment) {
            alert('Выберите способ оплаты');
            return false;
        }
        
        return true;
    },
    
    validateAgreement: function() {
        if (!$('input[name="agreement"]').is(':checked')) {
            alert('Необходимо согласие с условиями оферты');
            return false;
        }
        
        return true;
    },
    
    // Вспомогательные функции
    isValidEmail: function(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    isValidPhone: function(phone) {
        var cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    },
    
    debounce: function(func, wait) {
        var timeout;
        return function() {
            var later = function() {
                clearTimeout(timeout);
                func.apply(this, arguments);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

$(document).ready(function() {
    CheckoutSteps.init();
});
```

## Улучшения UX

### Восстановление брошенных корзин

```php
<?php
// Плагин: AbandonedCartReminder
switch ($modx->event->name) {
    case 'OnWebPageInit':
        // Сохраняем email если пользователь начал оформление
        if ($_POST['ms2_action'] === 'order/submit' && !empty($_POST['email'])) {
            $email = $_POST['email'];
            $cartData = $modx->getService('minishop2')->cart->get();
            
            if (!empty($cartData['products'])) {
                $abandoned = $modx->newObject('AbandonedCart');
                $abandoned->set('email', $email);
                $abandoned->set('cart_data', json_encode($cartData));
                $abandoned->set('created_at', time());
                $abandoned->save();
            }
        }
        break;
}
```

### Автосохранение данных формы

```javascript
// Автосохранение в localStorage
var FormAutosave = {
    storageKey: 'checkout_form_data',
    
    save: function() {
        var data = {};
        
        $('.checkout-form input, .checkout-form textarea, .checkout-form select').each(function() {
            var $field = $(this);
            var name = $field.attr('name');
            
            if (name && $field.attr('type') !== 'password') {
                if ($field.is(':checkbox') || $field.is(':radio')) {
                    if ($field.is(':checked')) {
                        data[name] = $field.val();
                    }
                } else {
                    data[name] = $field.val();
                }
            }
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    },
    
    restore: function() {
        var data = localStorage.getItem(this.storageKey);
        if (!data) return;
        
        try {
            data = JSON.parse(data);
            
            Object.keys(data).forEach(function(name) {
                var $field = $('[name="' + name + '"]');
                if ($field.length) {
                    if ($field.is(':checkbox') || $field.is(':radio')) {
                        $field.filter('[value="' + data[name] + '"]').prop('checked', true);
                    } else {
                        $field.val(data[name]);
                    }
                }
            });
        } catch(e) {
            console.error('Ошибка восстановления данных формы:', e);
        }
    },
    
    clear: function() {
        localStorage.removeItem(this.storageKey);
    }
};

// Автосохранение каждые 10 секунд
setInterval(FormAutosave.save, 10000);

// Сохранение при изменении полей
$(document).on('input change', '.checkout-form input, .checkout-form textarea, .checkout-form select', 
    FormAutosave.debounce(FormAutosave.save, 1000));

// Восстановление при загрузке
$(document).ready(function() {
    FormAutosave.restore();
});

// Очистка после успешного заказа
$(document).on('orderSuccess', function() {
    FormAutosave.clear();
});
```

## Заключение

Удобная корзина и процесс оформления заказа критически важны для конверсии интернет-магазина. miniShop2 предоставляет все необходимые инструменты, но успех зависит от правильной кастомизации под потребности пользователей.

Ключевые принципы:
1. **Минимизируйте количество шагов** — чем меньше, тем лучше
2. **Показывайте прогресс** — пользователь должен понимать, сколько ещё осталось
3. **Предотвращайте ошибки** — валидация на лету, подсказки, автозаполнение
4. **Сохраняйте данные** — ничто не раздражает больше, чем потеря введённой информации

Правильно настроенный процесс оформления может повысить конверсию на 30-50% по сравнению со стандартными решениями.

---

*Связанные статьи: [Создание каталога товаров на MODX](/blog/modx-katalog-tovarov/), [Интернет-магазин на miniShop2](/blog/modx-minishop2-internet-magazin/)*
