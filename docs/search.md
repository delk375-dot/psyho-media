# Search — Людський механізм

## Як працює пошук

Сайт використовує **Pagefind** — статичний пошуковий рушій, який:
- Будується разом із сайтом (`pnpm build`)
- Зберігає індекс у `dist/pagefind/`
- Завантажується клієнтом лише на сторінці `/search` (не впливає на продуктивність інших сторінок)
- Шукає без звернення до сервера — чисто клієнтська логіка
- Підтримує підсвічування знайдених слів у excerpt

---

## Як Pagefind індексує сторінки

Pagefind індексує тільки DOM-елементи з атрибутом `data-pagefind-body`.

У проєкті це поставлено в `src/pages/posts/[...slug]/index.astro`:
```html
<main id="main-content" ... data-pagefind-body>
```

**Що індексується:**
- Всі опубліковані статті (`draft: false`, `pubDatetime` ≤ дати build)
- Заголовок, опис, повне тіло статті

**Що НЕ індексується:**
- `draft: true` — не генерують HTML-сторінку взагалі
- `pubDatetime` в майбутньому — `postFilter` виключає їх із build
- Сторінка `/search` сама по собі (там немає `data-pagefind-body`)
- Сторінки без `data-pagefind-body` (категорії, теги, глосарій і т.д.)

---

## Як перевірити індекс

### Перегляд файлів індексу
```bash
ls dist/pagefind/
# fragment/  index/  pagefind.js  pagefind-ui.js  ...
ls dist/pagefind/index/
# Шматки індексу у форматі .pf_index
```

### Перевірка кількості проіндексованих сторінок
При `pnpm build` в логах з'являється:
```
[Building search indexes]
Indexed 31 pages
Indexed 3713 words
```

### Тест вручну
```bash
pnpm build && pnpm preview
# Відкрий http://localhost:4321/search
# Введи слово: "ревнощі" або "маніпуляція"
```

---

## Чому `/search` має `noindex`

Сторінка пошуку — це **інструмент навігації**, а не контент. Причини:

1. **Немає унікального контенту** — результати генеруються динамічно, Google не може їх побачити
2. **Дублікатний ризик** — `?q=ревнощі` і `?q=manipulyatsiya` генерують різні URL без канонічних variants
3. **SEO-стандарт** — всі великі сайти (Google, YouTube, Amazon) ставлять `noindex` на сторінки пошуку

Реалізація в `src/layouts/Layout.astro`:
```astro
<meta name="robots" content={noindex ? "noindex, follow" : "index, follow"} />
```

В `src/pages/search.astro`:
```astro
<Layout noindex={true} ...>
```

`follow` (не `nofollow`) залишається — робот може йти за посиланнями зі сторінки пошуку.

---

## Де підключений Pagefind JS

**Тільки на `/search`** — через `@pagefind/default-ui`:
```astro
import "@pagefind/default-ui/css/ui.css";
// ...
const { PagefindUI } = await import("@pagefind/default-ui");
```

Динамічний `import()` + `requestIdleCallback` = завантажується лише коли браузер вільний і тільки якщо ми на `/search`.

На всіх інших сторінках — Pagefind JS **не завантажується**.

---

## Як додати нові Search Suggestions

Відкрий `src/pages/search.astro`, знайди масив `SUGGESTIONS`:

```typescript
const SUGGESTIONS = [
  "ігнор",
  "ревнощі",
  "емоційна залежність",
  // ... додай сюди нову підказку
  "нарцисизм",
];
```

Кожен елемент автоматично рендериться як кнопка-чіп. При кліку запускає пошук.

---

## Файлова структура

| Файл | Призначення |
|------|-------------|
| `src/pages/search.astro` | Сторінка пошуку, UI, suggestions, скрипти |
| `dist/pagefind/` | Згенерований індекс (не комітити, це build output) |
| `src/layouts/Layout.astro` | Prop `noindex?: boolean` для керування robots meta |
| `src/i18n/lang/uk.ts` | Переклади: `searchTitle`, `searchDesc`, `nav.search` |
| `src/components/Header.astro` | Іконка пошуку (desktop) + текст "Пошук" (mobile) |
| `src/components/Footer.astro` | Посилання "🔍 Пошук" внизу сторінки |

---

## SEO конфігурація `/search`

```
Title:       Пошук по людських механізмах | Людський механізм
Description: Пошук по психологічному медіа про стосунки, маніпуляції, ревнощі, гроші, секс і приховані мотиви.
Robots:      noindex, follow
Canonical:   https://psyho-media.pp.ua/search
```

---

## Обмеження Pagefind

- **Немає стемінгу для української мови** — "ревнощів" і "ревнощі" — різні слова для індексу.
  Вирішення: використовуй базові форми слів у контенті.
- **Тільки статичний контент** — динамічно додані тексти не індексуються.
- **Потрібен build** — у dev-режимі пошук не працює без попереднього `pnpm build`.
