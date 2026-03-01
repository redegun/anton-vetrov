# Деплой antonvetrov.ru — инструкция

## Сборка и деплой

```bash
cd /root/projects/anton-vetrov
rm -rf dist
npm run build
```

### Деплой на FTP (ВАЖНО!)

`lftp mirror` НЕ перезаписывает файлы одинакового размера, даже с `--ignore-time`.
При каждом билде Astro генерирует CSS с новым хэшем. HTML ссылается на этот хэш.
Если HTML и CSS загрузятся от разных билдов — стили пропадут (CSS 404).

**Правильный деплой — в два шага:**

```bash
# 1. Залить всё через mirror (новые файлы, удаление старых)
cd /root/projects/anton-vetrov
lftp -u redegun_openclo,99smbHmB 185.114.245.107 -e "
mirror -R --delete --verbose=0 dist/ /antonvetrov/public_html/
quit"

# 2. ОБЯЗАТЕЛЬНО: форсировать перезапись всех HTML (put игнорирует размер)
find dist -name 'index.html' | while read f; do
  remote="/antonvetrov/public_html/${f#dist/}"
  echo "put -O $(dirname "$remote") $f"
done | lftp -u redegun_openclo,99smbHmB 185.114.245.107
```

### Проверка после деплоя

```bash
# Убедиться что CSS хэш в HTML совпадает с файлом на сервере
CSS_HASH=$(curl -s https://antonvetrov.ru/ | grep -oP '/_astro/[^"]+\.css')
curl -sI "https://antonvetrov.ru$CSS_HASH" | head -3
# Должно быть HTTP/2 200
```

## Известные проблемы

### CSS 404 после деплоя (стили пропадают)
**Причина:** HTML от одного билда, CSS от другого — хэши не совпадают.
**Решение:** Всегда деплоить из одной директории. Удалить `/tmp/anton-vetrov-fresh/` если существует.
Только `/root/projects/anton-vetrov/` — единственная рабочая копия.

### Scoped `.section` обнуляет боковые padding контейнера
**Причина:** `padding: var(--space-16) 0` в scoped стилях перебивает `.container { padding: 0 var(--space-8) }`, потому что scoped селектор `[data-astro-cid-*]` более специфичный.
**Решение:** Всегда использовать `padding-top` / `padding-bottom` отдельно, НЕ shorthand `padding: X 0`.
**Правило:** Никогда не ставить `padding: X 0` на элемент с классом `.container`.

### overflow-x: hidden на контейнерах
НЕ ставить `overflow-x: hidden` на внутренние контейнеры — это создаёт implicit `overflow-y: auto` и вызывает скроллбар (белую полосу справа на мобильных).
Разрешено только на `html`, `body`, `main`.

### Scoped стили в Astro
Astro scoped стили (`<style>` в `.astro` файлах) компилируются с уникальными `data-astro-cid-*` атрибутами. Они инлайнятся в HTML, а не в глобальный CSS бандл.

## Рабочая копия

- **Единственная:** `/root/projects/anton-vetrov/`
- **НЕ использовать:** `/tmp/anton-vetrov-fresh/` (удалена, НЕ СОЗДАВАТЬ ЗАНОВО)
- **Репо:** `https://github.com/redegun/anton-vetrov.git`

## Инструкция для SEO-бота

**ВАЖНО:** SEO-бот ОБЯЗАН:
1. Работать ТОЛЬКО в `/root/projects/anton-vetrov/`
2. Перед работой: `git pull origin main`
3. После изменений: `git add -A && git commit && git push`
4. При деплое — следовать процедуре выше (mirror + put HTML)
5. НЕ создавать копии в `/tmp/`
6. НЕ использовать shorthand `padding: X 0` на `.container` элементах
7. НЕ ставить `overflow-x: hidden` на внутренние контейнеры

**База знаний:** `/root/projects/anton-vetrov/knowledge/` — использовать при написании статей для уникального контента.

**Перед любой работой — проверь известные ошибки в Supabase:**
```bash
sshpass -p 'qQvE46,Y-PSwgz' ssh -o StrictHostKeyChecking=no root@147.45.213.2 \
  "docker exec supabase-db psql -U postgres -d postgres -c \"SELECT technology, problem, solution FROM dev_lessons WHERE project='antonvetrov' ORDER BY created_at DESC;\""
```
Если столкнулся с новой ошибкой — запиши туда:
```bash
sshpass -p 'qQvE46,Y-PSwgz' ssh -o StrictHostKeyChecking=no root@147.45.213.2 \
  "docker exec supabase-db psql -U postgres -d postgres -c \"INSERT INTO dev_lessons (project, technology, problem, solution, category) VALUES ('antonvetrov', 'TECH', 'PROBLEM', 'SOLUTION', 'CATEGORY');\""
```
