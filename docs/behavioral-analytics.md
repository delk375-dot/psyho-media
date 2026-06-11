# Behavioral Analytics — Людський механізм

> GA4 рахує скільки. Clarity показує як. Разом — відповідь на "чому".

---

## Архітектура

```
src/utils/analytics.ts          ← єдиний центр логіки
  ↳ trackEvent()                ← GA4 event
  ↳ setClarityTag()             ← Clarity session tag
  ↳ trackTelegramClick()
  ↳ trackRelatedSignalClick()
  ↳ trackAfterReadingOpen()
  ↳ trackSearchUsed()
  ↳ trackArticleDepth()

Компоненти імпортують з analytics.ts і не дублюють логіку.
```

---

## Events

### GA4 Custom Events

| Event | Де | Параметри | Що означає |
|---|---|---|---|
| `article_depth_25` | ReadingProgress | `depth_pct` | Читач дійшов до 25% |
| `article_depth_50` | ReadingProgress | `depth_pct` | Читач дійшов до 50% |
| `article_depth_75` | ReadingProgress | `depth_pct` | Стаття "залипальна" — читач дочитав ¾ |
| `article_depth_100` | ReadingProgress | `depth_pct` | Стаття прочитана повністю |
| `after_reading_open` | RelatedTelegramSignals | `post_slug` | Блок "Післясмак" потрапив у viewport |
| `related_signal_click` | RelatedTelegramSignals | `signal_type`, `signal_tone`, `has_bridge` | Клік по картці після статті |
| `search_used` | search.astro | `search_term`, `result_count` | Пошук використано |
| `telegram_click` | TelegramSticky + компоненти | `source` | Будь-який клік на Telegram |

### Clean naming strategy — одна дія, один primary event

Подвійний облік (legacy + нові імена паралельно) **знятий** 2026-06-11.
Кожна дія тепер шле рівно один event. Якщо у старих GA4 explorations
використовувались legacy-імена — мігруй звіти за цією таблицею:

| Legacy (більше НЕ шлеться) | Замінено на |
|---|---|
| `article_read_25/50/75/100` | `article_depth_25/50/75/100` |
| `telegram_related_signal_click` | `related_signal_click` |
| `telegram_cta_click` | `telegram_click` `source=sticky` |
| `footer_telegram_click` | `telegram_click` `source=footer` |
| `telegram_home_cta_click` | `telegram_click` `source=home` |
| `exit_intent_telegram_click` | `telegram_click` `source=exit_intent` |
| `telegram_signal_click` | `telegram_click` `source=telegram_page` / `source=archive` |

Усі переходи в Telegram = один event `telegram_click`, сегментація через
параметр `source`. Звіт "всі Telegram-кліки" — один фільтр, не сума 5 імен.

Події, що лишилися унікальними (не кліки в Telegram):
`telegram_cta_show/close`, `exit_intent_show/close`, `telegram_landing_view`,
`telegram_archive_view`, `telegram_archive_filter`, `telegram_bridge_click`
(внутрішній перехід архів → стаття), `next_mechanism_open`,
`recommendation_click`.

### Microsoft Clarity Custom Tags

| Tag key | Value | Що означає |
|---|---|---|
| `article_depth` | `"75"` або `"100"` | Сесія з глибоким читанням |
| `after_reading_seen` | `"true"` | Читач бачив "Післясмак" блок |
| `telegram_source` | `"sticky"` / `"footer"` / … | Звідки перейшли в Telegram |
| `search_used` | `"true"` | Сесія з пошуком |

---

## Dashboard — що дивитись щодня

### 1. Залипальні статті

**GA4:** `Explore → Freeform`
```
Dimension: Page path
Metrics: article_depth_75 count, article_depth_100 count
Filter: event_name = "article_depth_75" OR "article_depth_100"
```

Стаття "залипальна" якщо:
- `depth_75 / page_views > 40%` — читають більше ніж до половини
- `depth_100 / depth_75 > 60%` — хто дійшов до 75%, дочитує до кінця

**Clarity:** Sessions → filter `article_depth = 100` → дивись heatmaps на цих статтях.

---

### 2. Ефективність after-reading пакеток

**GA4:** `Explore → Freeform`
```
Dimension: Page path
Metrics:
  - after_reading_open count   (скільки разів блок потрапив у viewport)
  - related_signal_click count (скільки кліків по картках)
```

Слабкий пак якщо:
- `after_reading_open` є, але `related_signal_click = 0` — блок бачать, але не клікають
- CTR нижче 5% (`clicks / opens < 0.05`) — контент не резонує

Рішення для слабкого паку:
1. Провокація — замінити afterthought на більш гостру
2. Мікрокейс — додати сцену ближчу до статті
3. bridgeTo — перевірити, що microcase веде на правильну статтю

---

### 3. Telegram funnel

**GA4:** `Explore → Path exploration`
```
Start: page_view
Step 1: after_reading_open
Step 2: related_signal_click OR telegram_click
```

Або простіше — `Freeform`:
```
Dimensions: event_name, source (custom param)
Filter: event_name IN (telegram_click, telegram_cta_click, footer_telegram_click)
Group by source
```

Хороший Telegram funnel: `telegram_click / article_depth_75 > 8%`

---

### 4. Пошук — що шукають

**GA4:** `Explore → Freeform`
```
Dimension: search_term (custom parameter)
Metric: search_used count
Sort: desc
```

Якщо термін часто шукають але статті з ним немає → пріоритет для нового матеріалу.

---

### 5. Щоденний quick-check (5 хвилин)

1. **GA4 Real-Time** → активні користувачі, топ-сторінки прямо зараз
2. **GA4 Reports → Engagement → Events** → `article_depth_75/100` за вчора
3. **Clarity → Recordings → filter `after_reading_seen = true`** → дивись як поводяться читачі після статті

---

## Як визначати "залипальні" статті

| Метрика | Норма | Добре | Відмінно |
|---|---|---|---|
| `depth_75 / sessions` | > 25% | > 40% | > 60% |
| `depth_100 / depth_75` | > 40% | > 60% | > 75% |
| Avg. engagement time | > 90s | > 3 min | > 5 min |

Статті з `depth_100 / sessions > 25%` — основа контентної стратегії.
Вони визначають: які теми резонують, який формат тримає увагу.

---

## Як визначати слабкі after-reading паки

| Метрика | Проблема | Дія |
|---|---|---|
| `after_reading_open = 0` на статті з пакою | Стаття не отримує трафіку | SEO / просування |
| `open > 0`, `click = 0` | Контент паки не резонує | Замінити провокацію, додати shadow_fragment |
| `click > 0`, `has_bridge = false` усі кліки | Пак веде лише в Telegram, немає мостів | Додати microcase з bridgeTo |
| `click > 0`, `related_signal_click` росте | Пак працює — розширити на нові типи | ✅ |

---

## Файли

| Файл | Роль |
|---|---|
| `src/utils/analytics.ts` | Єдиний центр event логіки |
| `src/components/ReadingProgress.astro` | `article_depth_*` + `article_read_*` |
| `src/components/RelatedTelegramSignals.astro` | `after_reading_open` + `related_signal_click` |
| `src/components/TelegramSticky.astro` | `telegram_click` source=sticky |
| `src/pages/search.astro` | `search_used` |
| `src/components/GoogleAnalytics.astro` | GA4 loader + page_view |
| `src/components/MicrosoftClarity.astro` | Clarity loader |

---

## UTM strategy — Telegram return loop

Всі bridge-лінки, які `publish-telegram.ts` публікує в канал, автоматично
отримують UTM-мітки:

```
?utm_source=telegram
&utm_medium=after_reading
&utm_campaign=mechanism_loop
&utm_content={post_type}     ← afterthought / provocation / microcase / …
```

Навіщо: без міток повернення з Telegram розчинялись у direct traffic —
єдина сліпа пляма воронки. Тепер у GA4:

```
Reports → Acquisition → Traffic acquisition
Filter: session source = telegram, medium = after_reading
Breakdown: utm_content → який тип after-reading поста повертає людей
```

UTM додаються тільки до лінків, що публікуються В Telegram. Внутрішні
лінки сайту (RelatedTelegramSignals, archive) UTM не отримують —
self-referral мітки ламали б атрибуцію сесій.

---

## Noindex strategy

| Сторінка | Стан | Чому |
|---|---|---|
| `/search` | `noindex, follow` | UI-сторінка без власного контенту |
| `/telegram/archive` | `noindex, follow` + поза sitemap | Повні тексти after-reading постів дублюються на сторінках статей; архів — внутрішній інструмент, не SEO-актив |
| `/telegram` | індексується | Лендінг каналу — самостійна сторінка-пояснення |
| Статті, категорії, теги | індексуються | Основна карта механізмів |

`robots.txt` (`public/robots.txt`): allow all, `Disallow: /search`,
явна `Sitemap:` директива.

---

## Налаштування GA4 Custom Reports

### Зареєструвати custom параметри

`GA4 → Admin → Custom definitions → Custom dimensions`:

| Name | Scope | Parameter |
|---|---|---|
| Depth percent | Event | `depth_pct` |
| Signal type | Event | `signal_type` |
| Search term | Event | `search_term` |
| Result count | Event | `result_count` |
| Post slug | Event | `post_slug` |
| Telegram source | Event | `source` |

Без реєстрації параметри з'являться в `DebugView`, але не в звітах.
