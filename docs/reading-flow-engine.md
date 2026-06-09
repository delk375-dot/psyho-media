# Reading Flow Engine — Людський механізм

## Мета

Збільшити глибину читання та переходи між статтями через:
- відстеження прогресу читання
- автоматичні рекомендації після дочитування
- сесійний streak
- атмосферні паузи в довгих матеріалах
- GA4 аналітику глибини читання

---

## Компоненти

| Компонент | Файл | Де підключено |
|-----------|------|---------------|
| Reading Progress Bar | `src/components/ReadingProgress.astro` | `PostLayout.astro` |
| Next Mechanism Card | `src/components/NextMechanism.astro` | `[...slug]/index.astro` |
| Reading Streak Badge | `src/components/ReadingStreak.astro` | `[...slug]/index.astro` |
| Emotional Pause | `src/components/EmotionalPause.astro` | `[...slug]/index.astro` |

---

## 1. Reading Progress Bar

**Файл:** `src/components/ReadingProgress.astro`

### Як працює

- Фіксована смуга 2px у верхній частині сторінки (акцентний колір)
- Тільки активна коли є `#article` елемент (тобто тільки на сторінках статей)
- Вимикається на головній, категоріях, пошуку
- Плавна анімація `transition: width 0.12s linear`
- Вимкнено анімацію для `prefers-reduced-motion`

### GA4 Events

Відправляє глибину читання через `window.gtag`:

```
article_read_25   — прочитано 25% статті
article_read_50   — прочитано 50%
article_read_75   — прочитано 75%
article_read_100  — прочитано до кінця
```

Кожна подія відправляється **один раз** за сторінку. При повторній навігації (View Transitions) лічильники скидаються.

### Як вимкнути

Видали `<ReadingProgress />` з `src/layouts/PostLayout.astro`.

---

## 2. "Наступний механізм" (Next Mechanism Card)

**Файл:** `src/components/NextMechanism.astro`

### Як працює

1. При завантаженні статті — семантична система вибирає **найрелевантнішу** рекомендацію (`getRelatedPosts` з limit=1)
2. `IntersectionObserver` слідкує за sentinel-елементом в кінці статті
3. Коли sentinel входить у viewport — запускається таймер на **8 секунд**
4. Через 8 секунд — floating card з`яляється (bottom-right на desktop, bottom на mobile)
5. Містить: обкладинку, заголовок, опис, час читання, CTA "Продовжити читання →"
6. Кнопка "✕" — закриває картку

### Логіка підбору

```
getRelatedPosts(currentPost, allPosts, 1, { useBodySimilarity: true })
```

Використовує повний semantic scoring: теги, теми, категорія, contentType, збіг слів у заголовку і тілі.

### GA4 Events

```
next_mechanism_open      — картка стала видимою
recommendation_click     — користувач клікнув CTA
```

### Як вимкнути

Видали `<NextMechanism currentPost={post} posts={allPosts} />` з `[...slug]/index.astro`.

### Як змінити затримку

```astro
// NextMechanism.astro, рядок: timer = setTimeout(showCard, 8000)
timer = setTimeout(showCard, 5000); // 5 секунд
```

---

## 3. Reading Streak System

**Файл:** `src/components/ReadingStreak.astro`

### Як працює

- Зберігає масив відвіданих URL у `sessionStorage["lm_session_urls"]`
- Після **3+ унікальних статей** за сесію — показує атмосферний badge (лівий низ)
- Badge автоматично зникає через **5 секунд**
- Показується **один раз** за сесію (`sessionStorage["lm_streak_shown"]`)
- При новій сесії (закритий браузер / нова вкладка) — все скидається

### Повідомлення (без цифр, без гейміфікації)

```
"Ти вже занурився в механізм."
"Схоже, ти починаєш бачити патерни."
"Механізм стає помітнішим з кожною сторінкою."
"Мозок вже шукає зв'язки."
"Так і формується нове бачення."
```

Вибір повідомлення залежить від кількості прочитаних статей.

### Як вимкнути

Видали `<ReadingStreak />` з `[...slug]/index.astro`.

### Як додати нові повідомлення

В `ReadingStreak.astro`, масив `MESSAGES`:
```javascript
const MESSAGES = [
  "Ти вже занурився в механізм.",
  // додай своє повідомлення тут
];
```

---

## 4. Emotional Pause Blocks

**Файл:** `src/components/EmotionalPause.astro`

### Як працює

- Активується тільки для `pillar_article` і `deep_analysis` (довгі матеріали)
- Клієнтський скрипт проходить по всіх `p, h2, h3, h4, blockquote` в `#article`
- Рахує слова в кожному блоці
- Кожні **1200 слів** — вставляє atmospheric separator перед наступним блоком
- Separator містить коротку атмосферну фразу з масиву

### Атмосферні фрази

```
"Іноді механізм видно тільки після втрати."
"Людина рідко помічає момент, коли починає чекати."
"Деякі звички виглядають як характер."
"Ми засвоюємо чужі страхи ще до того, як навчаємось їх називати."
...
```

### Як змінити поріг

В `EmotionalPause.astro`:
```javascript
const WORDS_PER_PAUSE = 1200; // змінити на 800 або 1500
```

### Як додати тип контенту

```javascript
const ELIGIBLE_TYPES = new Set(["pillar_article", "deep_analysis", "human_scenario"]);
```

### Як вимкнути

Видали `<EmotionalPause />` з `[...slug]/index.astro`.

---

## 5. Attention Heat Zones (Clarity)

В `[...slug]/index.astro` розставлені `data-content-zone` атрибути:

| Атрибут | Елемент | Аналізує |
|---------|---------|----------|
| `data-content-zone="hero"` | div з FormatBadge + заголовком | Читання заголовку |
| `data-content-zone="article"` | `<article>` | Де читач зупиняється |
| `data-content-zone="recommendations"` | wrapper навколо SemanticRecommendations | CTR рекомендацій |
| `data-content-zone="footer"` | `<footer>` | Дочитування до кінця |

### Як аналізувати в Clarity

1. Відкрий [clarity.microsoft.com](https://clarity.microsoft.com) → твій проєкт
2. **Heatmaps** → вибери URL статті
3. Кліки/скрол по `data-content-zone` зонах покажуть де концентрується увага

---

## 6. GA4 — повна таблиця подій

| Подія | Коли | Параметри |
|-------|------|-----------|
| `article_read_25` | 25% статті прочитано | `page_location`, `page_title` |
| `article_read_50` | 50% | — |
| `article_read_75` | 75% | — |
| `article_read_100` | 100% | — |
| `next_mechanism_open` | Floating card з'явилась | `next_url` |
| `recommendation_click` | Клік на будь-яку рекомендацію | `recommendation_url`, `source` |

### Де аналізувати

**GA4 → Reports → Events** або **Explore → Funnel exploration**

Рекомендований funnel для аналізу глибини читання:
```
page_view → article_read_25 → article_read_50 → article_read_75 → article_read_100
```

---

## Як вимкнути будь-який блок

| Блок | Що видалити |
|------|------------|
| Progress bar | `<ReadingProgress />` з `PostLayout.astro` |
| Next Mechanism | `<NextMechanism .../>` з `[...slug]/index.astro` |
| Streak badge | `<ReadingStreak />` з `[...slug]/index.astro` |
| Emotional pauses | `<EmotionalPause />` з `[...slug]/index.astro` |

Всі блоки незалежні — видалення одного не ламає інших.
