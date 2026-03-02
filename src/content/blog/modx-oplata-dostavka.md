---
title: "Подключение оплаты и доставки в MODX: ЮKassa, СДЭК, Почта"
description: "Настройка платёжных систем и служб доставки в интернет-магазине на MODX: интеграция с ЮKassa, СДЭК, Почта России, расчёт стоимости доставки."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-oplata-dostavka.webp"
tags: ["MODX", "Оплата", "Доставка", "ЮKassa", "СДЭК", "Интеграция"]
draft: false
---


Интеграция платёжных систем и служб доставки — финальный этап создания интернет-магазина. От правильности настройки зависят успешные продажи и удобство клиентов. В MODX с miniShop2 можно подключить любые популярные сервисы через готовые дополнения или создать кастомные интеграции.

## Архитектура платежей и доставки в miniShop2

### Как работают платежи

miniShop2 использует модульную систему для обработки платежей:

1. **Заказ создаётся** в статусе «Новый»
2. **Выбирается способ оплаты** — определяет обработчик платежа
3. **Генерируется платёж** — создаётся запись в таблице ms2_payments
4. **Перенаправление на платёжную систему** или обработка на сайте
5. **Получение уведомления** о результате оплаты
6. **Обновление статуса** заказа и платежа

### Структура доставки

Система доставки включает:
- **Способы доставки** — самовывоз, курьер, почта
- **Расчёт стоимости** — фиксированная, по весу/расстоянию
- **Интеграция с API** служб доставки для получения тарифов
- **Отслеживание** посылок

## Настройка ЮKassa (бывшая Яндекс.Касса)

### Установка дополнения

```bash
# Через менеджер пакетов MODX устанавливаем:
# - yandexmoney2 (дополнение для ЮKassa)
```

### Получение ключей в ЮKassa

1. Регистрируемся на [yookassa.ru](https://yookassa.ru/)
2. Создаём магазин в личном кабинете  
3. Получаем ключи в разделе «Интеграция»:
   - **shopId** — идентификатор магазина
   - **secretKey** — секретный ключ для API

### Основные настройки

```php
// Системные настройки miniShop2 для ЮKassa
'ms2_payment_yandexmoney_shop_id' => '123456'
'ms2_payment_yandexmoney_secret_key' => 'test_ABC123...'
'ms2_payment_yandexmoney_test_mode' => true  // false для продакшена

// Настройки уведомлений
'ms2_payment_yandexmoney_success_url' => '[[~success-page]]'  
'ms2_payment_yandexmoney_fail_url' => '[[~fail-page]]'
'ms2_payment_yandexmoney_cancel_url' => '[[~cart-page]]'
```

### Создание способа оплаты

В админке MODX создаём способ оплаты:

```php
// miniShop2 > Настройки > Способы оплаты
Название: "Банковская карта"
Класс: "YandexMoneyPayment"  
Активен: Да
Ранг: 1

// Дополнительные свойства
Логотип: "/assets/img/payment-cards.png"
Описание: "Visa, MasterCard, Мир"
```

### Кастомизация шаблона оплаты

```html
<!-- Чанк: tpl.msPayment.YandexMoney -->
<div class="payment-method" data-payment="[[+id]]">
    <label class="payment-option">
        <input type="radio" name="payment" value="[[+id]]" [[+checked]]>
        
        <div class="payment-info">
            <div class="payment-title">
                [[+logo:notempty=`<img src="[[+logo]]" alt="[[+name]]" class="payment-logo">`]]
                <span>[[+name]]</span>
            </div>
            
            <div class="payment-description">
                [[+description]]
            </div>
            
            <div class="payment-features">
                <span class="feature">🔒 Безопасная оплата</span>
                <span class="feature">💳 Без комиссии</span>
                <span class="feature">⚡ Мгновенное зачисление</span>
            </div>
        </div>
    </label>
</div>
```

### Обработка уведомлений

```php
<?php
// Обработчик webhook от ЮKassa
// Файл: assets/components/minishop2/payment/yandexmoney.php

class YandexMoneyPayment extends msPaymentHandler {
    
    public function send(msOrder $order) {
        $payment = $this->ms2->loadClass('payment.YandexMoneyPayment');
        
        // Создаём платёж в ЮKassa
        $amount = [
            'value' => $order->get('cost'),
            'currency' => 'RUB'
        ];
        
        $confirmation = [
            'type' => 'redirect',
            'return_url' => $this->config['success_url']
        ];
        
        $data = [
            'amount' => $amount,
            'confirmation' => $confirmation,
            'capture' => true,
            'description' => 'Заказ #' . $order->get('num')
        ];
        
        $response = $payment->createPayment($data);
        
        if ($response && !empty($response['confirmation']['confirmation_url'])) {
            return $this->success('', $response['confirmation']['confirmation_url']);
        }
        
        return $this->error('Ошибка создания платежа');
    }
    
    public function receive(msOrder $order) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($input['event'] === 'payment.succeeded') {
            $paymentId = $input['object']['id'];
            $status = $input['object']['status'];
            
            if ($status === 'succeeded') {
                $order->set('status', 2); // Статус "Оплачен"
                $order->save();
                
                // Отправляем уведомление клиенту
                $this->sendSuccessEmail($order);
                
                return $this->success();
            }
        }
        
        return $this->error('Неизвестное уведомление');
    }
}
```

## Настройка СДЭК

### Установка дополнения

```bash
# Устанавливаем дополнение sdek для miniShop2
```

### Регистрация в СДЭК

1. Заключаем договор с [СДЭК](https://cdek.ru/)
2. Получаем данные для интеграции:
   - **account** — логин
   - **secure** — пароль
   - **test_account/test_secure** — тестовые данные

### Настройка системных параметров

```php
// Системные настройки СДЭК
'ms2_delivery_cdek_account' => 'test_account'
'ms2_delivery_cdek_secure' => 'test_password'  
'ms2_delivery_cdek_test_mode' => true
'ms2_delivery_cdek_city_from' => 'Москва'
'ms2_delivery_cdek_days' => '1-3'

// Габариты по умолчанию (если не указаны у товара)
'ms2_delivery_cdek_default_length' => 10
'ms2_delivery_cdek_default_width' => 10  
'ms2_delivery_cdek_default_height' => 10
```

### Создание способов доставки СДЭК

```php
// Доставка до пункта выдачи
Название: "СДЭК до пункта выдачи"
Класс: "CdekDelivery"
Код: "cdek_pickup"

// Курьерская доставка СДЭК
Название: "СДЭК курьерская доставка"  
Класс: "CdekDelivery"
Код: "cdek_courier"
```

### Интеграция карты пунктов выдачи

```html
<!-- Виджет выбора ПВЗ СДЭК -->
<div class="cdek-pvz-selector">
    <div id="cdek-map" style="height: 500px;"></div>
    <div class="selected-pvz" id="selected-pvz" style="display: none;">
        <h4>Выбранный пункт выдачи:</h4>
        <div class="pvz-info" id="pvz-info"></div>
    </div>
</div>

<script>
var CDEKWidget = {
    map: null,
    selectedPvz: null,
    
    init: function() {
        // Инициализация карты СДЭК
        this.map = new CdekWidget({
            from: 'Москва',
            root: 'cdek-map',
            apikey: '[[++ms2_delivery_cdek_api_key]]',
            servicepath: '/assets/components/ms2/connector.php',
            defaultLocation: 'Москва',
            choose: true,
            onChoose: this.onPvzSelect.bind(this)
        });
    },
    
    onPvzSelect: function(type, tariff, address, addressString) {
        this.selectedPvz = {
            type: type,
            code: address.code,
            name: addressString,
            address: address.address,
            phone: address.phone,
            schedule: address.WorkTime
        };
        
        // Показываем информацию о выбранном ПВЗ
        this.displaySelectedPvz();
        
        // Сохраняем выбор
        $('input[name="cdek_pvz_code"]').val(address.code);
        
        // Пересчитываем стоимость доставки
        this.calculateDelivery();
    },
    
    displaySelectedPvz: function() {
        if (!this.selectedPvz) return;
        
        var html = '<div class="pvz-details">';
        html += '<strong>' + this.selectedPvz.name + '</strong><br>';
        html += this.selectedPvz.address + '<br>';
        
        if (this.selectedPvz.phone) {
            html += 'Тел: ' + this.selectedPvz.phone + '<br>';
        }
        
        html += 'Режим работы: ' + this.selectedPvz.schedule;
        html += '</div>';
        
        $('#pvz-info').html(html);
        $('#selected-pvz').show();
    },
    
    calculateDelivery: function() {
        var data = {
            action: 'delivery/calculate',
            delivery: 'cdek_pickup',
            city: $('input[name="city"]').val(),
            pvz_code: this.selectedPvz.code,
            products: msCart.products
        };
        
        $.post('/assets/connectors/minishop2/connector.php', data)
            .done(function(response) {
                if (response.success) {
                    $('.delivery-cost').text(response.data.cost + ' ₽');
                    $('.delivery-time').text(response.data.days + ' дн.');
                }
            });
    }
};

$(document).ready(function() {
    if ($('#cdek-map').length) {
        CDEKWidget.init();
    }
});
</script>
```

### Расчёт стоимости доставки

```php
<?php
// Класс для работы с API СДЭК
class CdekApi {
    private $account;
    private $secure;
    private $testMode;
    
    public function __construct($config) {
        $this->account = $config['account'];
        $this->secure = $config['secure'];
        $this->testMode = $config['test_mode'];
    }
    
    public function calculateDelivery($params) {
        $url = $this->testMode ? 
            'https://integration.edu.cdek.ru/calculator/calculate_price_by_json.php' :
            'https://integration.cdek.ru/calculator/calculate_price_by_json.php';
        
        // Получаем код города получателя
        $cityCode = $this->getCityCode($params['city']);
        if (!$cityCode) {
            return ['error' => 'Город не найден'];
        }
        
        $data = [
            'version' => '1.0',
            'dateExecute' => date('Y-m-d'),
            'authLogin' => $this->account,
            'secure' => md5(date('Y-m-d') . '&' . $this->secure),
            'senderCityId' => 44, // Москва
            'receiverCityId' => $cityCode,
            'tariffId' => $params['tariff_id'],
            'goods' => []
        ];
        
        // Добавляем товары
        foreach ($params['products'] as $product) {
            $data['goods'][] = [
                'weight' => $product['weight'] ?: 0.5,
                'length' => $product['length'] ?: 10,
                'width' => $product['width'] ?: 10,
                'height' => $product['height'] ?: 10
            ];
        }
        
        $response = $this->makeRequest($url, json_encode($data));
        
        if ($response && !isset($response['error'])) {
            return [
                'cost' => $response['result']['price'],
                'days' => $response['result']['deliveryPeriodMin'] . '-' . 
                         $response['result']['deliveryPeriodMax'],
                'currency' => 'RUB'
            ];
        }
        
        return ['error' => $response['error'] ?? 'Ошибка расчёта'];
    }
    
    public function createOrder($order) {
        $url = $this->testMode ?
            'https://integration.edu.cdek.ru/new_orders.php' :
            'https://integration.cdek.ru/new_orders.php';
        
        $data = [
            'Number' => $order->get('num'),
            'SendCityCode' => 44,
            'RecCityCode' => $this->getCityCode($order->get('city')),
            'TariffTypeCode' => $order->get('cdek_tariff'),
            'DeliveryRecipientCost' => $order->get('delivery_cost'),
            'RecipientName' => $order->get('receiver'),
            'RecipientEmail' => $order->get('email'),
            'Phone' => $order->get('phone'),
            'Package' => []
        ];
        
        // Если доставка до ПВЗ
        if ($order->get('cdek_pvz_code')) {
            $data['PvzCode'] = $order->get('cdek_pvz_code');
        } else {
            // Курьерская доставка
            $data['Address'] = [
                'Street' => $order->get('street'),
                'House' => $order->get('building'),
                'Flat' => $order->get('apartment')
            ];
        }
        
        // Добавляем товары
        $package = [
            'Number' => $order->get('num') . '-1',
            'BarCode' => $order->get('num'),
            'Weight' => $order->get('cart_weight') * 1000, // в граммах
            'Item' => []
        ];
        
        $products = $order->getMany('Products');
        foreach ($products as $product) {
            $package['Item'][] = [
                'WareKey' => $product->get('article'),
                'Cost' => $product->get('price'),
                'Payment' => 0, // предоплата
                'Weight' => $product->get('weight') * 1000,
                'Amount' => $product->get('count'),
                'Comment' => $product->get('name')
            ];
        }
        
        $data['Package'][] = $package;
        
        return $this->makeRequest($url, json_encode($data));
    }
}
```

## Настройка Почты России

### Интеграция через API

```php
<?php
// Класс для работы с API Почты России
class RussianPostApi {
    private $login;
    private $password;  
    private $token;
    
    public function __construct($config) {
        $this->login = $config['login'];
        $this->password = $config['password'];
        $this->token = $config['token'];
    }
    
    public function calculateDelivery($params) {
        // Нормализация адреса
        $address = $this->normalizeAddress($params['address']);
        
        if (!$address['postal_code']) {
            return ['error' => 'Не удалось определить почтовый индекс'];
        }
        
        // Расчёт стоимости
        $url = 'https://otpravka-api.pochta.ru/1.0/tariff';
        
        $data = [
            'index-from' => '101000', // Индекс отправления (Москва)
            'index-to' => $address['postal_code'],
            'mail-category' => 'ORDINARY',
            'mail-type' => 'PARCEL_CLASS_1',
            'mass' => $params['weight'] * 1000, // в граммах
            'fragile' => false,
            'with-order-of-notice' => false,
            'with-simple-notice' => false,
            'with-declared-value' => true,
            'declared-value' => $params['declared_value']
        ];
        
        $headers = [
            'Authorization: AccessToken ' . $this->token,
            'X-User-Authorization: Basic ' . base64_encode($this->login . ':' . $this->password),
            'Content-Type: application/json'
        ];
        
        $response = $this->makeRequest($url, json_encode($data), $headers);
        
        if ($response && isset($response['total-rate'])) {
            return [
                'cost' => $response['total-rate'] / 100, // из копеек в рубли
                'days' => $response['delivery-time']['min-days'] . '-' . 
                         $response['delivery-time']['max-days'],
                'currency' => 'RUB'
            ];
        }
        
        return ['error' => 'Ошибка расчёта доставки'];
    }
    
    public function trackPackage($barcode) {
        $url = 'https://otpravka-api.pochta.ru/1.0/rtm/' . $barcode;
        
        $headers = [
            'Authorization: AccessToken ' . $this->token,
            'X-User-Authorization: Basic ' . base64_encode($this->login . ':' . $this->password)
        ];
        
        $response = $this->makeRequest($url, null, $headers);
        
        if ($response && isset($response['data'])) {
            return $response['data'];
        }
        
        return null;
    }
}
```

### Создание способа доставки

```php
// В админке создаём способ доставки:
Название: "Почта России"
Класс: "RussianPostDelivery"
Описание: "Доставка почтой по всей России"
Стоимость: "0" // Расчётная
```

## Комбинированный калькулятор доставки

### Универсальный сниппет

```php
<?php
// Сниппет: DeliveryCalculator
// Расчёт стоимости доставки всеми способами

$city = $scriptProperties['city'] ?? '';
$weight = $scriptProperties['weight'] ?? 1;
$amount = $scriptProperties['amount'] ?? 0;

if (empty($city)) {
    return 'Укажите город доставки';
}

$deliveryOptions = [];

// СДЭК до ПВЗ
$cdek = new CdekApi($modx->getOption('cdek'));
$cdekPvz = $cdek->calculateDelivery([
    'city' => $city,
    'weight' => $weight,
    'tariff_id' => 136 // ПВЗ
]);

if (!isset($cdekPvz['error'])) {
    $deliveryOptions['cdek_pvz'] = [
        'name' => 'СДЭК до пункта выдачи',
        'cost' => $cdekPvz['cost'],
        'days' => $cdekPvz['days'],
        'type' => 'pickup'
    ];
}

// СДЭК курьерская
$cdekCourier = $cdek->calculateDelivery([
    'city' => $city,
    'weight' => $weight, 
    'tariff_id' => 137 // Курьер
]);

if (!isset($cdekCourier['error'])) {
    $deliveryOptions['cdek_courier'] = [
        'name' => 'СДЭК курьерская доставка',
        'cost' => $cdekCourier['cost'],
        'days' => $cdekCourier['days'],
        'type' => 'courier'
    ];
}

// Почта России
$russianPost = new RussianPostApi($modx->getOption('russian_post'));
$postDelivery = $russianPost->calculateDelivery([
    'address' => $city,
    'weight' => $weight,
    'declared_value' => $amount
]);

if (!isset($postDelivery['error'])) {
    $deliveryOptions['russian_post'] = [
        'name' => 'Почта России',
        'cost' => $postDelivery['cost'],
        'days' => $postDelivery['days'],
        'type' => 'post'
    ];
}

// Бесплатная доставка при сумме свыше порога
$freeDeliveryThreshold = $modx->getOption('ms2_free_delivery_threshold', null, 5000);
if ($amount >= $freeDeliveryThreshold) {
    $deliveryOptions['free'] = [
        'name' => 'Бесплатная доставка',
        'cost' => 0,
        'days' => '3-5',
        'type' => 'free'
    ];
}

// Формируем вывод
$output = '';
foreach ($deliveryOptions as $key => $option) {
    $output .= $modx->getChunk('tpl.delivery.option', [
        'key' => $key,
        'name' => $option['name'],
        'cost' => $option['cost'],
        'days' => $option['days'],
        'type' => $option['type']
    ]);
}

return $output;
```

### Шаблон опции доставки

```html
<!-- Чанк: tpl.delivery.option -->
<div class="delivery-option" data-delivery="[[+key]]">
    <label class="delivery-choice">
        <input type="radio" name="delivery" value="[[+key]]" data-cost="[[+cost]]">
        
        <div class="delivery-info">
            <div class="delivery-name">[[+name]]</div>
            
            <div class="delivery-details">
                <span class="delivery-cost">
                    [[+cost:gt=`0`:then=`[[+cost]] ₽`:else=`Бесплатно`]]
                </span>
                <span class="delivery-time">[[+days]] дн.</span>
            </div>
            
            [[+type:is=`pickup`:then=`
                <div class="delivery-features">
                    <span class="feature">📍 Выбор пункта выдачи</span>
                </div>
            `]]
            
            [[+type:is=`courier`:then=`
                <div class="delivery-features">
                    <span class="feature">🚗 До двери</span>
                    <span class="feature">📞 Звонок курьера</span>
                </div>
            `]]
        </div>
    </label>
</div>
```

## Автоматизация и уведомления

### Уведомления о статусе заказа

```php
<?php
// Плагин: OrderStatusNotifications
switch ($modx->event->name) {
    case 'msOnChangeOrderStatus':
        $order = $modx->event->params['order'];
        $oldStatus = $modx->event->params['oldStatus'];
        $newStatus = $modx->event->params['status'];
        
        // Отправляем SMS/Email при изменении статуса
        switch ($newStatus) {
            case 2: // Оплачен
                $this->sendOrderPaid($order);
                break;
                
            case 3: // Отправлен
                $this->sendOrderShipped($order);
                break;
                
            case 4: // Доставлен
                $this->sendOrderDelivered($order);
                break;
        }
        break;
}

private function sendOrderShipped($order) {
    $trackNumber = $order->get('track_number');
    
    if ($trackNumber) {
        // Email уведомление
        $modx->getService('mail', 'mail.modPHPMailer');
        $modx->mail->set(modMail::MAIL_SUBJECT, 'Ваш заказ отправлен');
        $modx->mail->set(modMail::MAIL_BODY, 
            "Заказ #{$order->get('num')} отправлен. Трек-номер: {$trackNumber}"
        );
        $modx->mail->address('to', $order->get('email'));
        $modx->mail->send();
        
        // SMS уведомление через SMS.ru
        $this->sendSMS($order->get('phone'), 
            "Заказ #{$order->get('num')} отправлен. Трек: {$trackNumber}"
        );
    }
}
```

### Автообновление статусов доставки

```php
<?php
// Консольный скрипт: update_tracking.php
// Запускается по cron каждый час

require_once 'config.core.php';
require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';

$modx = new modX();
$modx->initialize('web');

// Находим заказы со статусом "Отправлен" и трек-номером
$orders = $modx->getCollection('msOrder', [
    'status' => 3, // Отправлен
    'track_number:!=' => ''
]);

foreach ($orders as $order) {
    $trackNumber = $order->get('track_number');
    $delivery = $order->get('delivery');
    
    // Проверяем статус в зависимости от службы доставки
    switch ($delivery) {
        case 'cdek_pickup':
        case 'cdek_courier':
            $status = $this->checkCdekStatus($trackNumber);
            break;
            
        case 'russian_post':
            $status = $this->checkRussianPostStatus($trackNumber);
            break;
            
        default:
            continue 2;
    }
    
    // Обновляем статус если доставлено
    if ($status === 'delivered') {
        $order->set('status', 4); // Доставлен
        $order->save();
        
        // Отправляем уведомление
        $this->notifyDelivered($order);
    }
}

private function checkCdekStatus($trackNumber) {
    $cdek = new CdekApi($modx->getOption('cdek'));
    $status = $cdek->getOrderStatus($trackNumber);
    
    return ($status['status'] === 'delivered') ? 'delivered' : 'in_transit';
}
```

## Заключение

Правильная настройка платежей и доставки критически важна для успешной работы интернет-магазина. Основные принципы:

1. **Предлагайте выбор** — разные способы оплаты и доставки для разных клиентов
2. **Автоматизируйте процессы** — уведомления, статусы, отслеживание
3. **Тестируйте интеграции** — используйте тестовые режимы перед запуском
4. **Мониторьте ошибки** — логируйте проблемы для быстрого решения

MODX с miniShop2 позволяет создать гибкую систему, которая легко адаптируется под требования любого бизнеса. Правильная интеграция повышает конверсию и снижает количество брошенных корзин.

---

*Связанные статьи: [Создание каталога товаров на MODX](/blog/modx-katalog-tovarov/)*
