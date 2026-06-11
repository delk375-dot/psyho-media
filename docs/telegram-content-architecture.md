# Telegram Content Architecture — Людський механізм

## Концепція

> **Telegram — after-reading layer. Сайт — deep mechanism layer.**

Telegram — це не "новини сайту" і не анонси. Це **післясмак статті**: інсайти,
провокації, тіньові фрагменти й мікрокейси, які з'являються після того, як
людина прочитала механізм. Стаття дає розуміння. Telegram залишає осад.

| Шар | Telegram | Сайт |
|-----|----------|------|
| Роль | After-reading layer — короткі думки, що залишаються після статті | Deep mechanism layer — структурований розбір |
| Формат | 2–8 речень, без вступів | Лонгрід із логікою, прикладами, висновками |
| Час появи | Після або між статтями | Коли механізм повністю розкрито |
| Зв'язок | `sourceArticle` + `bridgeTo` для microcase | ← приймає трафік з microcase |

---

## After-Reading Pack

Для кожної нової статті рекомендується створювати **4 Telegram-пости** (pack):

### A. `afterthought` — Afterthought
- Короткий інсайт після статті
- 2–5 рядків, без переказу
- `tone: calm` або `analytical`
- `isTelegramOnly: true`
- Мета: дати читачу момент тиші після прочитання

### B. `provocation` — Провокація
- Питання, яке змушує думати про себе
- Незручне. Без відповіді.
- `tone: provocative`
- `isTelegramOnly: true`
- Мета: зруйнувати комфортну позицію спостерігача

### C. `shadow_fragment` — Тіньовий фрагмент
- Темніший, гостріший кут зору
- Те, що не завжди доречно у великій статті
- `tone: dark`
- `isTelegramOnly: true`
- Мета: сказати те, що не скажеш у лонгриді

### D. `microcase` — Мікрокейс
- Коротка сцена з життя (3–6 речень)
- Конкретна, без імен, без моралі
- `tone: atmospheric`
- `bridgeTo: /posts/slug/` (обов'язково)
- `isTelegramOnly: false`
- Мета: вхідна точка для нових читачів через сцену

---

## Усі типи контенту (`type`)

| Тип | Призначення | Pack? |
|-----|-------------|-------|
| `signal` | Короткий сигнал — standalone спостереження | — |
| `bridge` | Міст — пост із посиланням на статтю | — |
| `question` | Питання в темряві — відкрите, без відповіді | — |
| `fragment` | Фрагмент — одна думка, без контексту | — |
| `case` | Кейс — поведінковий приклад | — |
| `teaser` | Анонс нової статті | — |
| `afterthought` | Інсайт після статті | ✅ Pack A |
| `provocation` | Провокативне питання про себе | ✅ Pack B |
| `shadow_fragment` | Темніший фрагмент із тіньової зони | ✅ Pack C |
| `microcase` | Коротка сцена з `bridgeTo` | ✅ Pack D |

## Тони (`tone`)

| Тон | Атмосфера |
|-----|-----------|
| `atmospheric` | Туманний, метафоричний |
| `dark` | Важкий, без прикрас |
| `ironic` | Іронічний, зі зміщенням |
| `analytical` | Холодний, структурований |
| `provocative` | Провокативний, незручний |
| `calm` | Спокійний, без тиску |

---

## Структура markdown-файлу (after-reading pack)

```yaml
---
title: "Заголовок"
date: 2026-03-05T07:00:00.000Z
type: afterthought              # або provocation / shadow_fragment / microcase
tone: calm                      # відповідно до типу

# Для afterthought / provocation / shadow_fragment:
bridgeTo: null
sourceArticle: slug-statti
isTelegramOnly: true
contentLayer: signal

# Для microcase:
bridgeTo: /posts/slug-statti/
sourceArticle: slug-statti
isTelegramOnly: false
contentLayer: bridge

body: >-
  Текст посту.

published: false
publishDate: 2026-03-05T07:00:00.000Z
publishedAt: null
telegramMessageId: null
---
```

---

## Bridge система (оновлено)

Якщо `bridgeTo` виставлений, скрипт додає в кінці повідомлення:

```
Повний механізм:
https://psyho-media.pp.ua/posts/slug-statti/?utm_source=telegram&utm_medium=after_reading&utm_campaign=mechanism_loop&utm_content={type}
```

### UTM strategy (Telegram return loop)

Кожен bridge-лінк автоматично отримує UTM-мітки (`withUtm()` у
`publish-telegram.ts`):

- `utm_source=telegram` · `utm_medium=after_reading` ·
  `utm_campaign=mechanism_loop` · `utm_content={post_type}`
- існуючі query-параметри зберігаються, utm ніколи не дублюються
- мітки додаються ТІЛЬКИ до лінків, що публікуються в Telegram —
  внутрішні лінки сайту лишаються чистими

Це робить видимим зворотний шлях Telegram → сайт у GA4 (раніше він
розчинявся в direct traffic) і дозволяє порівнювати, який тип
after-reading поста повертає читачів.

---

## Компонент RelatedTelegramSignals (оновлено)

Назва блоку: **"Післясмак механізму"**
Subtitle: *"Короткі думки, які залишаються після прочитання."*

Показує до 4 постів. After-reading типи (`afterthought`, `provocation`,
`shadow_fragment`, `microcase`) завжди йдуть першими, потім інші сигнали.

Підключення в шаблоні статті:
```astro
<RelatedTelegramSignals postSlug={getPostSlug(post.id, post.filePath)} />
```

---

## Архів `/telegram/archive`

Фільтри за типом включають нові after-reading типи:
- Afterthought
- Провокація
- Тіньовий фрагмент
- Мікрокейс

---

## Додавання нового after-reading pack

1. Прочитати статтю й знайти 4 кути:
   - Що залишається після прочитання? → `afterthought`
   - Яке питання змушує думати про себе? → `provocation`
   - Що було б занадто жорстко у лонгриді? → `shadow_fragment`
   - Яка сцена з життя відкриває тему? → `microcase`

2. Створити файли `NN-slug-afterthought.md`, `NN-slug-provocation.md` тощо

3. Виставити:
   - `sourceArticle: slug-statti` у всіх 4
   - `bridgeTo: /posts/slug-statti/` тільки в microcase
   - `publishDate` — найближчі вільні слоти (через 1–2 дні між постами)

4. Публікуються автоматично через GitHub Actions

---

## Файлова структура

```
src/
  content/
    telegram/
      08-pislya-znyknennya-afterthought.md   ← Pack для статті про зникнення
      09-pislya-znyknennya-provocation.md
      10-pislya-znyknennya-shadow.md
      11-pislya-znyknennya-microcase.md
      ...
  components/
    RelatedTelegramSignals.astro   ← "Післясмак механізму"
  pages/
    telegram/
      archive.astro                ← фільтри з новими типами
scripts/
  publish-telegram.ts              ← "Повний механізм:" замість "Механізм:"
docs/
  telegram-content-architecture.md
```

---

## GA4 події

Clean naming: одна дія → один primary event (mapping legacy-імен —
у `docs/behavioral-analytics.md`).

| Подія | Де | Коли |
|-------|----|------|
| `related_signal_click` | Стаття | Клік у блоці "Післясмак механізму" (+`signal_type`/`signal_tone`/`has_bridge`) |
| `after_reading_open` | Стаття | Блок "Післясмак" увійшов у viewport |
| `telegram_bridge_click` | Архів | Клік "Повний механізм →" (внутрішній перехід на статтю) |
| `telegram_archive_filter` | Архів | Вибір фільтра (тип або тон) |
| `telegram_click` | Скрізь | Будь-який перехід у Telegram; джерело в параметрі `source` (sticky / footer / home / exit_intent / telegram_page / archive) |

---

## SEO / індексація Telegram-шару

- `/telegram` — індексується (лендінг каналу)
- `/telegram/archive` — **noindex + поза sitemap**: повні тексти
  after-reading постів дублюються на сторінках статей; архів живе
  для людей всередині екосистеми, не для пошуку
- Telegram markdown-файли НЕ генерують окремих сторінок сайту
- Лейбли типів/тонів — спільний модуль `src/utils/telegramLabels.ts`
