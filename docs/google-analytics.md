# Google Analytics 4 — Людський механізм

## Де знаходиться компонент

```
src/components/GoogleAnalytics.astro
```

Підключений глобально в `src/layouts/Layout.astro` — одна строчка в `<head>`:

```astro
<GoogleAnalytics />
```

---

## Де змінити Measurement ID

**Варіант 1 — в компоненті (поточний)**

Відкрий `src/components/GoogleAnalytics.astro` і знайди рядок:

```astro
const { id = "G-2BCRHKD0WJ" } = Astro.props;
```

Заміни `G-2BCRHKD0WJ` на свій новий ID.

**Варіант 2 — через props (для різних ID на різних сторінках)**

```astro
<GoogleAnalytics id="G-XXXXXXXXXX" />
```

---

## Як перевірити Real Time Analytics

1. Відкрий [analytics.google.com](https://analytics.google.com)
2. Перейди: **Reports → Real Time**
3. В іншій вкладці відкрий production-сайт і покористуйся ним
4. Через 30-60 секунд побачиш активних користувачів у Real Time

> ⚠️ GA4 **не працює в `pnpm dev`** — лише в production build.
> Щоб протестувати локально: `pnpm build && pnpm preview`

---

## Як вимкнути аналітику

**Тимчасово (не деплоїти зміни):**
Нічого не потрібно — у dev-режимі аналітика вже вимкнена.

**Вимкнути в production повністю:**

Відкрий `src/components/GoogleAnalytics.astro` і заміни:

```astro
const isProd = import.meta.env.PROD;
```

на:

```astro
const isProd = false;
```

**Видалити повністю:**

1. Видали `src/components/GoogleAnalytics.astro`
2. В `src/layouts/Layout.astro` видали два рядки:
   ```astro
   import GoogleAnalytics from "@/components/GoogleAnalytics.astro";
   ```
   ```astro
   <GoogleAnalytics />
   ```

---

## Технічні деталі

- Скрипти завантажуються через `is:inline` — Astro не бандлить їх
- `send_page_view: false` + ручний `page_view` через `astro:page-load` — коректно трекає SPA-навігацію через Astro ClientRouter (View Transitions)
- Перший `page_view` надсилається одразу при завантаженні
- Кожен наступний перехід по сайту також надсилає окремий `page_view`
