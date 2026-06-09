# Telegram Content Loop — Людський механізм

## Мета

Перетворити Telegram з «зовнішнього посилання» на редакційне продовження сайту.
Логіка: сайт → `/telegram` landing (прогрів) → `t.me/psyho_media` (підписка).

---

## Архітектура

```
/telegram              → Landing-сторінка (пояснює навіщо канал)
/telegram/archive      → Архів Telegram-постів (картки з типами)
src/content/telegram/  → Markdown-файли з постами
```

### Точки входу в /telegram

| Компонент | Файл |
|-----------|------|
| Footer CTA block | `src/components/Footer.astro` |
| TelegramSticky card/bar | `src/components/TelegramSticky.astro` |
| ExitIntent modal | `src/components/ExitIntent.astro` |
| Homepage block | `src/pages/index.astro` |

---

## Як додавати Telegram-пости

### Формат файлу

Створи новий `.md` файл у `src/content/telegram/`:

```md
---
title: "Назва фрагменту"
date: 2026-03-05T10:00:00.000+03:00
type: psycho_glitch
body: "Текст фрагменту — одна-дві думки. Не більше 200 слів."
---
```

### Типи (`type`)

| Тип | Значення |
|-----|----------|
| `psycho_glitch` | Психо-глюк — спостереження про когнітивні пастки |
| `short_fragment` | Короткий фрагмент — думка без контексту |
| `dark_observation` | Темне спостереження — про людську природу |
| `article_teaser` | Анонс нової статті |

### Іменування файлів

Рекомендований формат: `NN-slug-nazvy.md`, де `NN` — порядковий номер.

```
src/content/telegram/
  01-lyudy-ridko-znykayut-odrazu.md
  02-movchannya-yak-vlada.md
  ...
```

### Поле `body`

Поле `body` у frontmatter — це коротке резюме або повний текст посту.
На сторінці `/telegram/archive` він відображається в картці.

> ⚠️ Поле `body` — в frontmatter (рядок тексту), не в markdown-тілі файлу.

---

## Як змінити Telegram URL

Реальний URL каналу задається в одному місці:

**`src/pages/telegram.astro`** (рядок 4):
```astro
const TELEGRAM_URL = "https://t.me/psyho_media";
```

**`src/pages/telegram/archive.astro`** (рядок 4):
```astro
const TELEGRAM_URL = "https://t.me/psyho_media";
```

> Всі інші компоненти (`Footer`, `TelegramSticky`, `ExitIntent`) тепер ведуть на `/telegram` landing, а не напряму на Telegram.

---

## Як працює landing `/telegram`

### Структура сторінки

1. **Hero** — заголовок "Механізм продовжується в Telegram" + CTA "Перейти в Telegram"
2. **Що буде в Telegram** — 5 карток із типами контенту
3. **Фінальний CTA** — "Там продовжується те, що починається тут"

### Посилання на архів

На landing є посилання "Архів фрагментів →" → веде на `/telegram/archive`.

---

## Як працює архів `/telegram/archive`

- Завантажує всі файли з `src/content/telegram/`
- Сортує від нових до старих (`date` descending)
- Відображає картки з типом, датою, текстом і CTA "Читати в Telegram →"

---

## GA4 Events

| Подія | Де | Коли |
|-------|----|------|
| `telegram_landing_view` | `/telegram` | Сторінка завантажилась |
| `telegram_landing_click` | `/telegram`, `/telegram/archive` | Клік на будь-який CTA → Telegram |
| `telegram_archive_view` | `/telegram/archive` | Сторінка архіву завантажилась |
| `telegram_home_cta_click` | `index.astro` | Клік на "Дивитись Telegram-стрічку" |
| `footer_telegram_click` | `Footer.astro` | Клік на Footer CTA block |
| `telegram_cta_show` | `TelegramSticky.astro` | Sticky card/bar показався |
| `telegram_cta_click` | `TelegramSticky.astro` | Клік на Sticky CTA |
| `exit_intent_telegram_click` | `ExitIntent.astro` | Клік в Exit Intent modal |

### Аналіз в GA4

**GA4 → Reports → Events** → фільтр по `telegram_*`.

**Funnel:**
1. `telegram_home_cta_click` або `telegram_cta_click` — потрапили на landing
2. `telegram_landing_view` — переглянули landing
3. `telegram_landing_click` — перейшли в Telegram

---

## Homepage block

Додано між секцією "Впізнаєш себе?" і "Іноді потрібен живий розбір":

```astro
<section id="telegram-cta" class="...">
  <div class="tg-home-block">
    <h2>Не всі механізми стають статтями</h2>
    <p>Короткі фрагменти, психо-глюки й спостереження виходять у Telegram.</p>
    <a href="/telegram">Дивитись Telegram-стрічку →</a>
  </div>
</section>
```

Стилі inline в `index.astro` у `<style>` блоці.

---

## Вимкнення компонентів

| Що вимкнути | Що зробити |
|-------------|-----------|
| Homepage block | Видали секцію `id="telegram-cta"` з `index.astro` |
| `/telegram` landing | Видали `src/pages/telegram.astro` |
| `/telegram/archive` | Видали `src/pages/telegram/archive.astro` |
| Вміст архіву | Видали файли з `src/content/telegram/` |
