---
title: "FormIt в MODX: формы обратной связи, заявки, валидация"
description: "Полное руководство по созданию форм в MODX с помощью FormIt. Обратная связь, заявки, валидация, защита от спама и интеграция с почтой."
pubDate: 2026-03-01
category: "Разработка"
heroImage: "/images/blog/hero-modx-formit-formy.webp"
tags: ["MODX", "FormIt", "Формы", "Валидация"]
draft: false
---


FormIt — это мощный компонент MODX Revolution для создания и обработки форм любой сложности. От простой формы обратной связи до сложных многошаговых анкет — FormIt справится со всеми задачами благодаря гибкой системе валидации, хуков обработки и защиты от спама.

## Что такое FormIt и зачем он нужен

FormIt — это процессор форм, который обрабатывает данные на серверной стороне, проводит валидацию и выполняет различные действия с полученными данными: отправка email, сохранение в базе данных, интеграция с внешними API.

### Ключевые возможности

- **Валидация данных** — проверка email, номеров телефонов, обязательных полей
- **Защита от спама** — встроенная поддержка reCAPTCHA и других методов
- **Хуки обработки** — отправка email, сохранение в БД, интеграция с CRM
- **Многошаговые формы** — создание сложных процессов заполнения
- **Файловые загрузки** — прикрепление документов и изображений

### Преимущества FormIt

- Безопасность из коробки
- Гибкая настройка валидации  
- Простота интеграции с шаблонами MODX
- Большое количество готовых хуков
- Активное сообщество и документация

## Установка и базовая настройка

### Установка через менеджер пакетов

1. Зайдите в **Управление → Установщики пакетов**
2. Найдите "FormIt" в официальном репозитории
3. Нажмите "Загрузить" и затем "Установить"

### Системные настройки

После установки настройте основные параметры в **Система → Настройки системы**:

```
formit.email_transport = mail
formit.email_transport_host = smtp.gmail.com
formit.email_transport_port = 587
formit.email_transport_username = your-email@gmail.com
formit.email_transport_password = your-password
```

### Проверка работоспособности

Создайте тестовую страницу с простой формой:

```
[[!FormIt?
    &submitVar=`submit-contact`
    &successMessage=`Спасибо! Ваше сообщение отправлено.`
    &validate=`name:required,email:required:email,message:required`
    &hooks=`email`
    &emailTo=`admin@yoursite.com`
    &emailSubject=`Новое сообщение с сайта`
]]

<form action="" method="post">
    <label>Имя: <input type="text" name="name" value="[[+fi.name]]" /></label>
    <label>Email: <input type="email" name="email" value="[[+fi.email]]" /></label>
    <label>Сообщение: <textarea name="message">[[+fi.message]]</textarea></label>
    <input type="submit" name="submit-contact" value="Отправить" />
    [[+fi.validation_error_message]]
</form>
```

## Базовое использование FormIt

### Простая форма обратной связи

```
[[!FormIt?
    &submitVar=`submit-contact`
    &successMessage=`Ваше сообщение успешно отправлено!`
    &errorMessage=`Пожалуйста, исправьте ошибки в форме.`
    &validate=`name:required:minLength=^2^,
               email:required:email,
               message:required:minLength=^10^`
    &hooks=`email,redirect`
    &emailTo=`info@example.com`
    &emailFrom=`noreply@example.com`
    &emailSubject=`Новое сообщение с сайта`
    &emailTpl=`ContactEmailTpl`
    &redirectTo=`thanks`
]]
```

### HTML-форма

```html
<form class="contact-form" action="" method="post">
    <div class="form-group">
        <label for="name">Имя *</label>
        <input type="text" id="name" name="name" value="[[+fi.name]]" 
               class="form-control [[+fi.error.name:notempty=`error`]]" required>
        <span class="error">[[+fi.error.name]]</span>
    </div>
    
    <div class="form-group">
        <label for="email">Email *</label>
        <input type="email" id="email" name="email" value="[[+fi.email]]"
               class="form-control [[+fi.error.email:notempty=`error`]]" required>
        <span class="error">[[+fi.error.email]]</span>
    </div>
    
    <div class="form-group">
        <label for="phone">Телефон</label>
        <input type="tel" id="phone" name="phone" value="[[+fi.phone]]"
               class="form-control [[+fi.error.phone:notempty=`error`]]">
        <span class="error">[[+fi.error.phone]]</span>
    </div>
    
    <div class="form-group">
        <label for="subject">Тема</label>
        <select id="subject" name="subject" class="form-control">
            <option value="">Выберите тему</option>
            <option value="general" [[+fi.subject:FormItIsSelected=`general`]]>
                Общий вопрос
            </option>
            <option value="support" [[+fi.subject:FormItIsSelected=`support`]]>
                Техническая поддержка
            </option>
            <option value="sales" [[+fi.subject:FormItIsSelected=`sales`]]>
                Отдел продаж
            </option>
        </select>
        <span class="error">[[+fi.error.subject]]</span>
    </div>
    
    <div class="form-group">
        <label for="message">Сообщение *</label>
        <textarea id="message" name="message" rows="5"
                  class="form-control [[+fi.error.message:notempty=`error`]]" 
                  required>[[+fi.message]]</textarea>
        <span class="error">[[+fi.error.message]]</span>
    </div>
    
    <div class="form-group">
        <label>
            <input type="checkbox" name="agree" value="1" 
                   [[+fi.agree:FormItIsChecked]] required>
            Согласие на обработку персональных данных *
        </label>
        <span class="error">[[+fi.error.agree]]</span>
    </div>
    
    <div class="form-actions">
        <input type="submit" name="submit-contact" value="Отправить" 
               class="btn btn-primary">
    </div>
    
    <div class="form-messages">
        [[+fi.validation_error_message:notempty=`
            <div class="alert alert-danger">[[+fi.validation_error_message]]</div>
        `]]
        [[+fi.successMessage:notempty=`
            <div class="alert alert-success">[[+fi.successMessage]]</div>
        `]]
    </div>
</form>
```

## Валидация данных

### Основные правила валидации

```
Обязательное поле:
&validate=`name:required`

Email:
&validate=`email:required:email`

Минимальная длина:
&validate=`password:required:minLength=^8^`

Максимальная длина:
&validate=`message:required:maxLength=^500^`

Числовые значения:
&validate=`age:required:isNumber:minValue=^18^:maxValue=^100^`

Регулярные выражения:
&validate=`phone:required:regex=^/^[+]?[0-9\s\-\(\)]+$/^`

Подтверждение пароля:
&validate=`password:required:minLength=^8^,
           password_confirm:required:confirmValue=^password^`
```

### Кастомные сообщения об ошибках

```
&customValidators=`phone:phone_validator`
&validationErrorMessage=`Пожалуйста, исправьте следующие ошибки:`
&errTpl=`<span class="error">[[+error]]</span>`

Кастомные сообщения:
&validate=`email:required:email`
&validate.email.required=`Email обязательно к заполнению`
&validate.email.email=`Укажите корректный email адрес`
```

### Валидация телефонов

```php
// Создайте сниппет phone_validator
$value = trim($value);
if (empty($value)) return true; // не обязательное поле

// Российские номера
$pattern = '/^(\+7|7|8)?[\s\-]?\(?([489][0-9]{2})\)?[\s\-]?([0-9]{3})[\s\-]?([0-9]{2})[\s\-]?([0-9]{2})$/';
if (!preg_match($pattern, $value)) {
    $validator->addError($key, 'Укажите корректный номер телефона');
    return false;
}
return true;
```

## Email уведомления

### Настройка отправки email

```
[[!FormIt?
    &hooks=`email`
    &emailTo=`manager@example.com`
    &emailFrom=`noreply@example.com`
    &emailFromName=`Сайт Example.com`
    &emailSubject=`Новое сообщение: [[+subject:default=`Общий вопрос`]]`
    &emailTpl=`ContactEmailTpl`
    &emailReplyTo=`[[+email]]`
    &emailReplyToName=`[[+name]]`
]]
```

### Шаблон email сообщения

**ContactEmailTpl:**
```html
<h2>Новое сообщение с сайта</h2>

<p><strong>Время:</strong> [[+formit.now:strtotime:date=`%d.%m.%Y в %H:%M`]]</p>
<p><strong>Имя:</strong> [[+name]]</p>
<p><strong>Email:</strong> [[+email]]</p>
<p><strong>Телефон:</strong> [[+phone:default=`не указан`]]</p>
<p><strong>Тема:</strong> [[+subject:default=`Общий вопрос`]]</p>

<h3>Сообщение:</h3>
<p>[[+message:nl2br]]</p>

<hr>
<p><small>IP адрес: [[+formit.ip]]<br>
User Agent: [[+formit.user_agent]]</small></p>
```

### Автоответ клиенту

```
[[!FormIt?
    &hooks=`email,autoresponder`
    &emailTo=`admin@example.com`
    &emailTpl=`AdminEmailTpl`
    
    &autoresponderTo=`[[+email]]`
    &autoresponderFrom=`noreply@example.com`
    &autoresponderFromName=`Служба поддержки`
    &autoresponderSubject=`Ваше сообщение получено`
    &autoresponderTpl=`AutoresponderTpl`
]]
```

**AutoresponderTpl:**
```html
<p>Здравствуйте, [[+name]]!</p>

<p>Спасибо за ваше обращение. Мы получили ваше сообщение и постараемся ответить в течение 24 часов.</p>

<p><strong>Ваше сообщение:</strong></p>
<blockquote>[[+message:nl2br]]</blockquote>

<p>Если у вас возникли срочные вопросы, звоните по телефону: +7 (495) 123-45-67</p>

<p>С уважением,<br>
Команда поддержки Example.com</p>
```

## Защита от спама

### reCAPTCHA v2

1. Получите ключи на https://www.google.com/recaptcha/
2. Установите дополнение "ReCaptcha"
3. Настройте в системных параметрах:

```
recaptcha.public_key = 6Lc...
recaptcha.private_key = 6Lc...
```

4. Добавьте в форму:

```
&validate=`name:required,email:required:email,recaptcha:required`
&customValidators=`recaptcha:recaptcha.recaptcha_v2`

<!-- В HTML форме -->
<div class="g-recaptcha" data-sitekey="6Lc..."></div>
<script src="https://www.google.com/recaptcha/api.js"></script>
```

### Math CAPTCHA

```
&validate=`mathcaptcha:required`
&customValidators=`mathcaptcha:mathcaptcha`

<!-- В форме -->
<label>[[+formit.mathcaptcha.question]] = ?</label>
<input type="text" name="mathcaptcha" value="[[+fi.mathcaptcha]]" required>
```

### Honeypot (скрытое поле)

```html
<!-- Скрытое поле для ботов -->
<div style="display:none;">
    <label>Не заполнять это поле:</label>
    <input type="text" name="nospam" value="[[+fi.nospam]]">
</div>

<!-- Проверка в хуке -->
&hooks=`spam,email`
```

**Сниппет spam:**
```php
$nospam = $hook->getValue('nospam');
if (!empty($nospam)) {
    $hook->addError('nospam', 'Обнаружен спам');
    return false;
}
return true;
```

## Многошаговые формы

### Настройка FormItWizard

```
[[!FormItWizard?
    &submitVar=`wizard-submit`
    &prevVar=`wizard-prev` 
    &nextVar=`wizard-next`
    &successMessage=`Регистрация завершена!`
    
    &steps=`1||2||3`
    &numSteps=`3`
    &validate.step1=`name:required,email:required:email`
    &validate.step2=`phone:required,company:required`
    &validate.step3=`agree:required`
    
    &hooks.step3=`email,FormItSaveForm`
    &emailTo=`admin@example.com`
    &emailTpl=`WizardEmailTpl`
]]
```

### Шаблоны шагов

**Шаг 1 - Личные данные:**
```html
[[+formit.wizard_step:is=`1`:then=`
<div class="wizard-step step-1">
    <h3>Шаг 1 из 3: Личные данные</h3>
    
    <div class="form-group">
        <label>Имя *</label>
        <input type="text" name="name" value="[[+fi.name]]" required>
        <span class="error">[[+fi.error.name]]</span>
    </div>
    
    <div class="form-group">
        <label>Email *</label>
        <input type="email" name="email" value="[[+fi.email]]" required>
        <span class="error">[[+fi.error.email]]</span>
    </div>
    
    <button type="submit" name="wizard-next" value="1">Далее →</button>
</div>
`:else=``]]
```

## Загрузка файлов

### Настройка загрузки

```
[[!FormIt?
    &hooks=`attachment,email`
    &attachmentFileTypes=`jpg,jpeg,png,gif,pdf,doc,docx`
    &attachmentMaxSize=`5242880` // 5MB
    &attachmentPath=`assets/uploads/attachments/`
    &attachmentAllowOverwrite=`0`
    
    &emailTo=`admin@example.com`
    &emailAttachments=`1`
]]
```

### HTML для загрузки файлов

```html
<form action="" method="post" enctype="multipart/form-data">
    <div class="form-group">
        <label>Прикрепить резюме (PDF, DOC, DOCX)</label>
        <input type="file" name="resume" 
               accept=".pdf,.doc,.docx"
               class="form-control">
        <span class="error">[[+fi.error.resume]]</span>
        <small>Максимальный размер файла: 5MB</small>
    </div>
    
    <div class="form-group">
        <label>Портфолио (изображения)</label>
        <input type="file" name="portfolio[]" 
               accept="image/*"
               multiple
               class="form-control">
        <span class="error">[[+fi.error.portfolio]]</span>
    </div>
    
    <input type="submit" name="submit-resume" value="Отправить">
</form>
```

## Сохранение данных в базу

### FormItSaveForm

```
[[!FormIt?
    &hooks=`FormItSaveForm,email`
    &formName=`ContactForm`
    &formFields=`name,email,phone,message,createdon`
    &fieldNames=`name==Имя,email==Email,phone==Телефон,message==Сообщение`
]]
```

### Просмотр сохраненных форм

```
[[!FormItRetriever?
    &form=`ContactForm`
    &limit=`20`
    &sort=`createdon`
    &dir=`DESC`
    &tpl=`FormRetrieveTpl`
    &where=`{"published": 1}`
]]
```

**FormRetrieveTpl:**
```html
<div class="form-entry">
    <h4>Заявка от [[+createdon:date=`%d.%m.%Y в %H:%M`]]</h4>
    <p><strong>Имя:</strong> [[+name]]</p>
    <p><strong>Email:</strong> [[+email]]</p>
    <p><strong>Телефон:</strong> [[+phone]]</p>
    <p><strong>Сообщение:</strong></p>
    <blockquote>[[+message:nl2br]]</blockquote>
    <hr>
</div>
```

## Интеграция с CRM-системами

### amoCRM

```php
// Хук для отправки в amoCRM
$name = $hook->getValue('name');
$email = $hook->getValue('email');
$phone = $hook->getValue('phone');

$amocrm_api = 'https://domain.amocrm.ru/api/v4/';
$access_token = 'your_access_token';

$contact_data = [
    'name' => $name,
    'custom_fields_values' => [
        [
            'field_code' => 'EMAIL',
            'values' => [['value' => $email, 'enum_code' => 'WORK']]
        ],
        [
            'field_code' => 'PHONE',
            'values' => [['value' => $phone, 'enum_code' => 'WORK']]
        ]
    ]
];

// Отправка данных в amoCRM
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $amocrm_api . 'contacts');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $access_token,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([$contact_data]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

return true;
```

### Bitrix24

```php
// Webhook для Bitrix24
$webhook = 'https://domain.bitrix24.ru/rest/1/webhook_key/crm.lead.add';

$lead_data = [
    'TITLE' => 'Заявка с сайта от ' . $hook->getValue('name'),
    'NAME' => $hook->getValue('name'),
    'EMAIL' => [['VALUE' => $hook->getValue('email'), 'VALUE_TYPE' => 'WORK']],
    'PHONE' => [['VALUE' => $hook->getValue('phone'), 'VALUE_TYPE' => 'WORK']],
    'COMMENTS' => $hook->getValue('message'),
    'SOURCE_ID' => 'WEB'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $webhook);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['fields' => $lead_data]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
```

## Продвинутые техники

### Условная логика в формах

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
    const subjectSelect = document.getElementById('subject');
    const companyField = document.getElementById('company-field');
    
    subjectSelect.addEventListener('change', function() {
        if (this.value === 'b2b') {
            companyField.style.display = 'block';
            companyField.querySelector('input').required = true;
        } else {
            companyField.style.display = 'none';
            companyField.querySelector('input').required = false;
        }
    });
});
</script>

<div class="form-group">
    <label>Тип обращения</label>
    <select id="subject" name="subject">
        <option value="general">Общий вопрос</option>
        <option value="b2b">Корпоративное сотрудничество</option>
    </select>
</div>

<div id="company-field" class="form-group" style="display:none;">
    <label>Название компании</label>
    <input type="text" name="company" value="[[+fi.company]]">
</div>
```

### AJAX отправка форм

```html
<script>
document.getElementById('ajax-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const submitBtn = this.querySelector('input[type="submit"]');
    
    submitBtn.disabled = true;
    submitBtn.value = 'Отправка...';
    
    fetch(window.location.href, {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(html => {
        // Парсим ответ и обновляем форму
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newForm = doc.querySelector('#ajax-form');
        
        this.parentNode.replaceChild(newForm, this);
    })
    .catch(error => {
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.value = 'Отправить';
    });
});
</script>
```

### Автосохранение черновиков

```javascript
// Автосохранение данных формы в localStorage
function saveFormDraft() {
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    localStorage.setItem('contact-form-draft', JSON.stringify(data));
}

// Восстановление из черновика
function loadFormDraft() {
    const draft = localStorage.getItem('contact-form-draft');
    if (draft) {
        const data = JSON.parse(draft);
        Object.keys(data).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field && field.type !== 'submit') {
                field.value = data[key];
            }
        });
    }
}

// Автосохранение каждые 30 секунд
setInterval(saveFormDraft, 30000);

// Загрузка при открытии страницы
document.addEventListener('DOMContentLoaded', loadFormDraft);

// Очистка черновика после успешной отправки
if (document.querySelector('.alert-success')) {
    localStorage.removeItem('contact-form-draft');
}
```

## Оптимизация и безопасность

### Защита от злоупотреблений

```
&validate=`email:required:email`
&customValidators=`email:email_whitelist,formit:rate_limit`

// Сниппет rate_limit
$ip = $_SERVER['REMOTE_ADDR'];
$cacheKey = 'formit_' . md5($ip);
$submissions = $modx->cacheManager->get($cacheKey);

if ($submissions >= 5) {
    $hook->addError('formit', 'Превышен лимит отправок. Попробуйте позже.');
    return false;
}

$modx->cacheManager->set($cacheKey, $submissions + 1, 3600); // 1 час
return true;
```

### Логирование отправок

```php
// Хук для логирования
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT'],
    'form_data' => $hook->getValues()
];

$logFile = MODX_CORE_PATH . 'cache/logs/formit.log';
file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND | LOCK_EX);

return true;
```

## Типовые формы

Больше информации о различных типах дополнений для MODX можно найти в статье [Топ дополнений MODX](/blog/modx-dopolneniya-top/).

### Форма записи на консультацию

```html
<form class="consultation-form" action="" method="post">
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label>Имя *</label>
                <input type="text" name="name" value="[[+fi.name]]" required>
                <span class="error">[[+fi.error.name]]</span>
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label>Телефон *</label>
                <input type="tel" name="phone" value="[[+fi.phone]]" required>
                <span class="error">[[+fi.error.phone]]</span>
            </div>
        </div>
    </div>
    
    <div class="form-group">
        <label>Удобное время для звонка</label>
        <select name="call_time">
            <option value="">Любое время</option>
            <option value="morning">Утром (9:00-12:00)</option>
            <option value="afternoon">Днем (12:00-17:00)</option>
            <option value="evening">Вечером (17:00-20:00)</option>
        </select>
    </div>
    
    <div class="form-group">
        <label>
            <input type="checkbox" name="agree" value="1" required>
            Согласен на обработку персональных данных *
        </label>
    </div>
    
    <button type="submit" name="submit-consultation" 
            class="btn btn-primary btn-lg">
        Записаться на консультацию
    </button>
</form>
```

### Форма скачивания прайс-листа

```
[[!FormIt?
    &submitVar=`download-price`
    &validate=`email:required:email,phone:required,company:required`
    &hooks=`email,redirect`
    &emailTpl=`PriceDownloadTpl`
    &redirectTo=`price-download`
    &store=`1`
]]
```

## Аналитика и отслеживание

### Интеграция с Google Analytics

```html
<script>
// Отслеживание успешной отправки формы
[[+fi.successMessage:notempty=`
gtag('event', 'form_submit', {
    'event_category': 'engagement',
    'event_label': 'contact_form'
});
`]]
</script>
```

### Яндекс.Метрика

```html
<script>
[[+fi.successMessage:notempty=`
ym(123456789, 'reachGoal', 'contact_form_send');
`]]
</script>
```

## Заключение

FormIt — это мощный и гибкий инструмент для создания форм в MODX Revolution. Он покрывает практически все потребности по сбору и обработке данных от пользователей:

**Основные возможности:**
- Валидация любой сложности
- Защита от спама и ботов
- Email-уведомления и автоответы
- Сохранение данных в базу
- Интеграция с CRM-системами
- Многошаговые формы
- Загрузка файлов

**Лучшие практики:**
1. **Всегда используйте валидацию** на стороне сервера
2. **Защищайтесь от спама** с помощью CAPTCHA и скрытых полей
3. **Настройте автоответы** для улучшения пользовательского опыта
4. **Логируйте отправки** для анализа и безопасности
5. **Тестируйте формы** перед публикацией

FormIt превращает создание форм из сложной задачи в простой процесс, позволяя сосредоточиться на дизайне и пользовательском опыте, а не на технических аспектах обработки данных.
