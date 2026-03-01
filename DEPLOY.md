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

### overflow-x: hidden на контейнерах
НЕ ставить `overflow-x: hidden` на внутренние контейнеры — это создаёт implicit `overflow-y: auto` и вызывает скроллбар (белую полосу справа на мобильных).
Разрешено только на `html`, `body`, `main`.

### Scoped стили в Astro
Astro scoped стили (`<style>` в `.astro` файлах) компилируются с уникальными `data-astro-cid-*` атрибутами. Они инлайнятся в HTML, а не в глобальный CSS бандл.

## Рабочая копия

- **Единственная:** `/root/projects/anton-vetrov/`
- **НЕ использовать:** `/tmp/anton-vetrov-fresh/` (удалена)
- **Репо:** `https://github.com/redegun/anton-vetrov.git`
