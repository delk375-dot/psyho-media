# SEO Architecture — Людський механізм

## Огляд

Сайт використовує комплексний підхід до SEO через structured data (Schema.org JSON-LD), технічні мета-теги та Open Graph.

---

## Structured Data (JSON-LD)

### 1. WebSite schema — `src/components/SchemaWebsite.astro`

Додається на **кожну сторінку** через `Layout.astro`.

```json
{
  "@type": "WebSite",
  "name": "Людський механізм",
  "url": "https://psyho-media.pp.ua",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://psyho-media.pp.ua/search?q={search_term_string}"
  }
}
```

### 2. Organization schema — `src/components/SchemaWebsite.astro`

Додається разом з WebSite.

```json
{
  "@type": "Organization",
  "name": "Людський механізм",
  "logo": { "@type": "ImageObject", "url": ".../favicon.svg" }
}
```

### 3. Article schema — `src/layouts/PostLayout.astro`

Додається на **кожну статтю**.

Поля:
- `headline` — заголовок
- `image` — обкладинка (1200×630)
- `datePublished` / `dateModified`
- `author` — `Person` з посиланням
- `publisher` — `Organization` з логотипом
- `description`
- `inLanguage: "uk"`
- `wordCount` — кількість слів (з `src/utils/readingTime.ts`)
- `keywords` — теги через кому
- `mainEntityOfPage` — canonical URL

### 4. BreadcrumbList schema — `src/layouts/PostLayout.astro`

```
Головна → Категорія → Стаття
```

Якщо категорія відсутня:
```
Головна → Стаття
```

---

## Мета-теги

### Primary meta (Layout.astro)
- `title`, `description`, `author`, `robots: index, follow`
- `link rel="sitemap"` → `sitemap-index.xml`
- `link rel="canonical"`

### Open Graph (Layout.astro)
- `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`
- `og:image` (1200×630), `og:image:width`, `og:image:height`
- `og:locale: uk_UA`

### Twitter / X Cards (Layout.astro)
- `twitter:card: summary_large_image`
- `twitter:title`, `twitter:description`, `twitter:image`

### Article meta (PostLayout.astro)
- `article:published_time`
- `article:modified_time`
- `article:tag` — по одному тегу на мета-тег

---

## Технічні SEO-файли

| Файл | Опис |
|------|------|
| `sitemap-index.xml` | Генерується `@astrojs/sitemap` при build |
| `sitemap-0.xml` | Всі публічні URL |
| `robots.txt` | `Allow: /` + посилання на sitemap |
| `googleedd539ce435915e4.html` | Google Search Console verification |

---

## Утиліти

### `src/utils/readingTime.ts`

```ts
getWordCount(body: string): number  // кількість слів
getReadingTime(body: string): number // хвилини читання (~200 слів/хв)
```

Використовується в `src/pages/posts/[...slug]/index.astro` для підрахунку `wordCount`.

---

## Потік даних для статті

```
post.body
  → getWordCount()  → wordCount → Article schema
  → getReadingTime() → readingTime (для майбутнього UI)

post.data.tags[]
  → article:tag meta tags
  → Article schema keywords

post.data.category
  → getCategoryBySlug()
  → BreadcrumbList (Категорія рівень)
  → categoryName, categorySlug → PostLayout props
```

---

## Google Analytics 4

Файл: `src/components/GoogleAnalytics.astro`
- Measurement ID: `G-2BCRHKD0WJ`
- Тільки в production (`import.meta.env.PROD`)
- Підтримка Astro View Transitions через `astro:page-load`

Документація: `docs/google-analytics.md`
