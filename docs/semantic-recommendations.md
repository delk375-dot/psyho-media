# Semantic Recommendations — Людський механізм

## Огляд

Система автоматично підбирає 3–6 пов'язаних матеріалів для кожної статті.
Відображається як Netflix-style grid під назвою **"Схожі механізми"**.

---

## Файли системи

| Файл | Призначення |
|------|-------------|
| `src/utils/getRelatedPosts.ts` | Scoring engine + fallback логіка |
| `src/components/SemanticRecommendations.astro` | Netflix-grid UI |
| `src/components/RandomFragment.astro` | Кнопка випадкового фрагменту |
| `src/pages/posts/[...slug]/index.astro` | Точка інтеграції (рядки ~`<SemanticRecommendations>`) |

---

## Scoring система

### Таблиця балів

| Сигнал | Бали |
|--------|------|
| Явне посилання (`relatedPosts` / `recommendedReading`) | +10 за кожен |
| Одна категорія (`category`) | +5 |
| Одна серія (`series`) | +4 |
| Спільна тема (`topics`) — за кожну | +3 |
| Одна колекція (`collection`) | +3 |
| Спільний тег (`tags`) — за кожен | +2 |
| Однаковий тип контенту (`contentType`) | +2 |
| Збіг слів у заголовку — за кожне (макс. +5) | +1 |
| Збіг ключових слів у тілі — за кожні 8 слів (макс. +3) | +1 |

### Алгоритм

1. Токенізація: текст → lowercase → очищення пунктуації → фільтр стоп-слів → унікальні токени.
2. Кожен кандидат отримує score за наведеними правилами.
3. Кандидати з `score >= minScore` (за замовчуванням `1`) йдуть у кінцевий список.
4. Сортування: `score DESC → pubDatetime DESC`.
5. Якщо менш ніж `FALLBACK_THRESHOLD = 2` кандидатів — спрацьовує fallback.

### Fallback

Коли семантичних збігів недостатньо:
1. Заповнюємо останніми статтями з **тієї ж категорії**.
2. Якщо все ще мало — **глобально найновіші** статті.
3. Поточна стаття та дублікати завжди виключаються.

---

## Як додавати нові правила

Відкрий `src/utils/getRelatedPosts.ts`, знайди блок `// Score every candidate` та додай новий сигнал:

```typescript
// Приклад: бонус за той самий автор
if (post.data.author && post.data.author === currentPost.data.author) score += 1;

// Приклад: штраф за старий контент (> 2 роки)
const twoYearsAgo = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
if (new Date(post.data.pubDatetime).getTime() < twoYearsAgo) score -= 1;
```

Правила не потребують рестарту — вони застосовуються при `pnpm build`.

### Тонке налаштування

```typescript
// Зміна кількості рекомендацій (у компоненті)
<SemanticRecommendations limit={4} />   // замість 6

// Вимкнути body similarity (швидший build)
getRelatedPosts(post, posts, 6, { useBodySimilarity: false });

// Підвищити поріг якості (менше, але точніше)
getRelatedPosts(post, posts, 6, { minScore: 3 });
```

---

## UI — "Схожі механізми"

**Компонент:** `SemanticRecommendations.astro`

Кожна картка містить:
- Cover image (або SVG-placeholder)
- Бейджі: категорія + формат
- Заголовок (3 рядки max)
- Опис (2 рядки max)
- Час читання у хвилинах

**Сітка:** `auto-fill, minmax(17rem, 1fr)` — адаптивна, від 1 до 3 колонок.

**Hover:** тінь + підйом на 2px + scale обкладинки 1.04×.

---

## Кнопка "Випадковий фрагмент"

**Компонент:** `RandomFragment.astro`

Показує кнопку тільки якщо є пости з `contentType`:
- `psychological_fragment`
- `viral_note`

При кліку:
1. Читає `data-urls` атрибут (JSON-масив URL).
2. Виключає поточну сторінку зі списку.
3. Навігує через `window.location.href` → Astro View Transitions спрацьовують автоматично (без повного перезавантаження).

### Як вимкнути Random Fragment

Видали або закоментуй рядок у `src/pages/posts/[...slug]/index.astro`:

```astro
{/* <RandomFragment posts={allPosts} /> */}
```

---

## Дебаг scoring

Використай `getScoredRelatedPosts` для перегляду балів:

```typescript
import { getScoredRelatedPosts } from "@/utils/getRelatedPosts";

const scored = getScoredRelatedPosts(currentPost, posts, 10);
console.log(scored.map(s => `${s.score} — ${s.post.data.title}`));
```

---

## Компоненти що були замінені

| Старий | Новий |
|--------|-------|
| `RelatedArticles.astro` | `SemanticRecommendations.astro` |
| `RecommendedReading.astro` | `SemanticRecommendations.astro` |

Старі компоненти **залишаються в кодовій базі** і можуть використовуватись в інших місцях. Вони також використовують `getRelatedPosts` з тими самими покращеннями.
