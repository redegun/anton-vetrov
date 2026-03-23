---
title: "RTK — утилита, которая экономит 60-90% токенов при работе с AI-кодерами"
description: "Разбираю RTK (Rust Token Killer) — CLI-прокси на Rust, который фильтрует вывод команд перед отправкой в LLM. Как установить, как работает, реальная экономия токенов."
pubDate: 2026-03-23
category: "Утилиты"
tags: ["утилиты", "AI-кодинг", "Claude Code", "токены", "Rust", "CLI", "разработка"]
author: "Антон Ветров"
heroImage: "/images/blog/hero-rtk-token-killer.webp"
---

Если вы работаете с Claude Code, Codex или другими AI-кодерами — вы платите за каждый токен контекста. А половина этих токенов — мусор: прогресс-бары git push, 200 строк «ok» из cargo test, шапки и футеры от `ls -la`.

**RTK** (Rust Token Killer) — утилита, которая встаёт между AI-агентом и терминалом, фильтрует вывод и отдаёт только суть. Один бинарник на Rust, без зависимостей, оверхед меньше 10 мс.

Репозиторий: [github.com/rtk-ai/rtk](https://github.com/rtk-ai/rtk)

## Зачем это нужно

Когда Claude Code выполняет `git push`, он получает 15 строк вывода: подсчёт объектов, дельта-компрессия, прогресс. Из этого ему нужно одно: «пуш прошёл, ветка main». Это 10 токенов вместо 200.

Умножьте на десятки команд за сессию — и RTK экономит до 80% контекстного окна. Это не просто деньги: это место для более полезной информации в контексте модели.

**Реальные цифры из README проекта — 30-минутная сессия Claude Code:**

- `git status/log/push` (33 вызова) — экономия ~80%
- `cat/read` файлов (20 вызовов) — экономия ~70%
- `cargo test / npm test` (5 вызовов) — экономия ~90%
- **Итого: ~118 000 → ~24 000 токенов (минус 80%)**

## Как работает

RTK применяет четыре стратегии к каждой команде:

1. **Фильтрация** — убирает шум: комментарии, пустые строки, boilerplate
2. **Группировка** — объединяет похожие элементы (файлы по папкам, ошибки по типам)
3. **Обрезка** — оставляет контекст, убирает повторы
4. **Дедупликация** — схлопывает повторяющиеся строки с подсчётом

Схема простая:

```
Без RTK:   Claude → shell → git → [~2000 токенов сырого вывода] → Claude
С RTK:     Claude → RTK → git → [фильтр] → [~200 токенов чистого вывода] → Claude
```

## Установка

**Homebrew (macOS/Linux):**

```bash
brew install rtk
```

**Быстрая установка (Linux/macOS):**

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

**Cargo:**

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

Есть готовые бинарники для macOS (x86/ARM), Linux (x86/ARM) и Windows на странице [релизов](https://github.com/rtk-ai/rtk/releases).

## Настройка с Claude Code

Самый эффективный способ — автоматический хук. Он прозрачно переписывает команды перед выполнением:

```bash
rtk init --global
# Следуйте инструкциям для регистрации в ~/.claude/settings.json
```

После установки перезапустите Claude Code. Теперь каждый `git status` автоматически превращается в `rtk git status`, а Claude получает сжатый вывод, даже не зная об этом.

Для **Gemini CLI**:

```bash
rtk init -g --gemini
```

Для **OpenCode**:

```bash
rtk init -g --opencode
```

## Примеры экономии

**Листинг директории:**

```
# ls -la → 45 строк, ~800 токенов
# rtk ls → 12 строк, ~150 токенов

my-project/
+-- src/ (8 files)
|   +-- main.rs
+-- Cargo.toml
```

**Git push:**

```
# git push → 15 строк, ~200 токенов
# rtk git push → 1 строка, ~10 токенов

ok main
```

**Тесты:**

```
# cargo test → 200+ строк при ошибке
# rtk test cargo test → ~20 строк

FAILED: 2/15 tests
  test_edge_case: assertion failed
  test_overflow: panic at utils.rs:18
```

## Что ещё умеет

RTK — не только про git. Он поддерживает десятки команд:

- **Файлы:** `rtk ls`, `rtk read`, `rtk grep`, `rtk find`, `rtk diff`
- **Git/GitHub:** `rtk git status/log/diff/push`, `rtk gh pr list`
- **Тесты:** `rtk test cargo test`, `rtk pytest`, `rtk vitest run`, `rtk playwright test`
- **Сборка/линтинг:** `rtk tsc`, `rtk lint`, `rtk cargo build`, `rtk ruff check`
- **Docker/K8s:** `rtk docker ps`, `rtk kubectl pods`
- **Аналитика:** `rtk gain` — статистика экономии, `rtk gain --graph` — график за 30 дней

Отдельно стоит упомянуть **Tee-режим**: при ошибке RTK сохраняет полный вывод в лог-файл, чтобы модель могла его прочитать без повторного запуска команды.

## Аналитика экономии

```bash
rtk gain              # Общая статистика
rtk gain --graph      # ASCII-график за 30 дней
rtk gain --daily      # Посуточная разбивка
rtk discover          # Подсказки, где ещё можно сэкономить
```

## Стоит ли ставить

Если вы используете Claude Code, Codex или любого AI-агента, который выполняет shell-команды — да, однозначно. Утилита бесплатная, open-source (MIT), ставится за минуту, не ломает ничего (все команды проходят через прокси прозрачно).

80% экономии токенов — это либо экономия денег, либо возможность уместить больше контекста в окно модели. И то, и другое полезно.

**Ссылки:**
- GitHub: [rtk-ai/rtk](https://github.com/rtk-ai/rtk)
- Сайт: [rtk-ai.app](https://www.rtk-ai.app)
- Discord: [discord.gg/pvHdzAec](https://discord.gg/pvHdzAec)
