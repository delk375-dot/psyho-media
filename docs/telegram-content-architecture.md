# Telegram Content Architecture — Людський механізм

## Концепція

> **Telegram — це поле. Сайт — це карта.**

Telegram-канал і сайт — це два шари одного контенту, пов'язані між собою.

| Шар | Telegram | Сайт |
|-----|----------|------|
| Формат | Короткий сигнал (1–5 речень) | Розгорнутий механізм (лонгрід) |
| Роль | Поле — сирий спостережний матеріал | Карта — структурований аналіз |
| Зв'язок | `bridgeTo` вказує на статтю | `sourceArticle` — зворотний посилання |

---

## Типи контенту (`type`)

| Тип | Призначення |
|-----|-------------|
| `signal` | Короткий сигнал — спостереження, яке ще не стало статтею |
| `bridge` | Міст — пост, що посилається на статтю через `bridgeTo` |
| `question` | Питання в темряві — без відповіді, з відкритим кінцем |
| `fragment` | Фрагмент — думка без контексту, standalone |
| `case` | Кейс — конкретний поведінковий приклад |
| `teaser` | Анонс нової статті на сайті |

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

## Структура markdown-файлу

```yaml
---
title: "Заголовок сигналу"
date: 2026-01-15T07:00:00.000Z      # дата контенту
type: signal                         # тип (обов'язково)
tone: dark                           # тон (обов'язково)

# Зв'язок зі статтею (обидва або жоден)
bridgeTo: /posts/slug-statti/        # URL статті на сайті
sourceArticle: slug-statti           # slug статті (без /posts/)

isTelegramOnly: true                 # false якщо є bridgeTo
contentLayer: signal                 # signal | bridge | archive | teaser

body: >-
  Текст сигналу. Без вступів і висновків — тільки суть.

# Автоматично заповнюється скриптом
published: false
publishDate: 2026-01-15T07:00:00.000Z
publishedAt: null
telegramMessageId: null
---
```

---

## Bridge система

Якщо `bridgeTo` виставлений, скрипт автоматично додає в Telegram-повідомлення:

```
Механізм:
https://psyho-media.pp.ua/posts/slug-statti/
```

Це з'єднує короткий сигнал з повним розбором на сайті.

**Правило:** якщо `sourceArticle` є, але `bridgeTo` відсутній — скрипт виведе попередження в логах.

---

## Компонент RelatedTelegramSignals

Підключається в шаблоні статті (`src/layouts/PostLayout.astro` або аналогічний):

```astro
---
import RelatedTelegramSignals from "@/components/RelatedTelegramSignals.astro";
---

<!-- В кінці статті, після основного тіла -->
<RelatedTelegramSignals postSlug={post.slug} />
```

**Логіка збігу (OR):**
1. `sourceArticle === postSlug`
2. `bridgeTo` містить `postSlug`

Показує до 3 опублікованих сигналів, відсортованих за датою (найновіші першими).

---

## Архів `/telegram/archive`

- Показує всі пости з колекції `telegram`
- Клієнтські фільтри: за `type` та `tone`
- Бейджі: тип (кольоровий), тон, `Є механізм` (якщо `isTelegramOnly: false`)
- CTA: `Читати механізм →` (якщо `bridgeTo`) або `Читати в Telegram →`

---

## GA4 події

| Подія | Де | Коли |
|-------|----|------|
| `telegram_landing_view` | `/telegram` | Page load |
| `telegram_signal_click` | `/telegram`, `/telegram/archive`, sticky, footer | Клік на CTA в Telegram |
| `telegram_archive_view` | `/telegram/archive` | Page load |
| `telegram_archive_filter` | `/telegram/archive` | Вибір фільтра (тип або тон) |
| `telegram_bridge_click` | `/telegram/archive` | Клік `Читати механізм →` |
| `telegram_related_signal_click` | Стаття | Клік на сигнал у RelatedTelegramSignals |
| `telegram_home_cta_click` | `index.astro` | Клік на блок у головній |
| `footer_telegram_click` | `Footer.astro` | Клік на Footer CTA |
| `telegram_cta_show` | TelegramSticky | Показ sticky |
| `telegram_cta_click` | TelegramSticky | Клік на sticky |
| `exit_intent_telegram_click` | ExitIntent | Клік "Увійти в поле" |

---

## Додавання нового сигналу

1. Створити файл `src/content/telegram/NN-slug.md`
2. Заповнити frontmatter відповідно до схеми вище
3. Виставити `publishDate` — дата публікації
4. Якщо є стаття-пара: виставити `bridgeTo` та `sourceArticle`, `isTelegramOnly: false`
5. Запустити `pnpm telegram:publish` для ручної публікації або чекати на GitHub Actions

---

## Файлова структура

```
src/
  content/
    telegram/          ← markdown-файли сигналів
      01-*.md
      02-*.md
      ...
  components/
    RelatedTelegramSignals.astro   ← блок на сторінці статті
    TelegramSticky.astro           ← floating CTA
    Footer.astro                   ← footer CTA
    ExitIntent.astro               ← exit intent modal
  pages/
    telegram.astro                 ← лендінг /telegram
    telegram/
      archive.astro                ← архів /telegram/archive
scripts/
  publish-telegram.ts              ← автопублікація
docs/
  telegram-content-architecture.md  ← цей файл
  telegram-autopublishing.md
  scheduled-publishing.md
  telegram-content-loop.md
```
