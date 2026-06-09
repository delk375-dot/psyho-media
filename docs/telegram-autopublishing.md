# Telegram Autopublishing — Людський механізм

## Що це

Скрипт `scripts/publish-telegram.ts` автоматично публікує нові Telegram-пости з `src/content/telegram/` у канал `@psyho_media`.

Після успішної публікації скрипт оновлює frontmatter файлу:
- `published: true`
- `publishedAt: <ISO timestamp>`
- `telegramMessageId: <id повідомлення>`

---

## Налаштування

### 1. Створи бота

1. Відкрий [@BotFather](https://t.me/BotFather) у Telegram
2. Напиши `/newbot` і дотримуйся інструкцій
3. Збережи токен

### 2. Додай бота як адміністратора каналу

1. Відкрий канал → Налаштування → Адміністратори
2. Додай бота
3. Надай права: **Публікувати повідомлення**

### 3. Налаштуй env змінні

Скопіюй `.env.example` у `.env` і заповни:

```env
TELEGRAM_BOT_TOKEN=123456789:AAFabc...xyz
TELEGRAM_CHANNEL_ID=@psyho_media
```

> ⚠️ `.env` не комітити в git. Він вже є в `.gitignore`.

---

## Запуск

```bash
pnpm telegram:publish
```

або з тимчасовими змінними без `.env`:

```bash
TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHANNEL_ID=@psyho_media pnpm telegram:publish
```

### Що відбувається при запуску

1. Скрипт знаходить усі файли в `src/content/telegram/` з `published: false`
2. Сортує від найстаришого до найновішого (за полем `date`)
3. Для кожного поста формує текст і надсилає через Telegram Bot API
4. Після успішного надсилання оновлює frontmatter файлу
5. Між повідомленнями пауза 1.2с (захист від rate limit)

### Приклад виводу

```
🤖  Telegram Autopublisher — Людський механізм
    Channel : @psyho_media
    Dir     : /project/src/content/telegram

📋  Found 3 unpublished post(s):

    1. 01-lyudy-ridko-znykayut-odrazu.md — "Люди рідко зникають одразу"
    2. 02-movchannya-yak-vlada.md — "Іноді мовчання — це не пауза, а влада"
    3. 03-toy-khto-ne-daye-vidpovidi.md — "Той, хто не дає відповіді..."

  → Publishing "Люди рідко зникають одразу" ... ✅  message_id: 42
  → Publishing "Іноді мовчання — це не пауза, а влада" ... ✅  message_id: 43
  → Publishing "Той, хто не дає відповіді..." ... ✅  message_id: 44

📊  Done: 3 published, 0 failed.
```

---

## Як додати новий пост

Створи файл у `src/content/telegram/`:

```md
---
title: "Назва"
date: 2026-03-10T10:00:00.000+03:00
type: psycho_glitch
body: "Текст поста."
published: false
publishedAt: null
telegramMessageId: null
---
```

**Типи (`type`):**

| Тип | Значення |
|-----|----------|
| `psycho_glitch` | Психо-глюк |
| `short_fragment` | Короткий фрагмент |
| `dark_observation` | Темне спостереження |
| `article_teaser` | Анонс статті |

---

## Формат повідомлення в Telegram

```
**Назва поста**

Текст поста.

[Читати більше](https://psyho-media.pp.ua/telegram)
```

Використовується `MarkdownV2` — Telegram-формат з жирним текстом і посиланнями.

---

## Як змінити Telegram URL / канал

| Що змінити | Де |
|------------|----|
| URL сайту в посиланні | `scripts/publish-telegram.ts` → `SITE_URL` |
| Шлях `/telegram` | `scripts/publish-telegram.ts` → `TELEGRAM_LANDING_PATH` |
| Канал | env змінна `TELEGRAM_CHANNEL_ID` |
| Бот | env змінна `TELEGRAM_BOT_TOKEN` |

---

## Поведінка при відсутності env

Якщо `TELEGRAM_BOT_TOKEN` або `TELEGRAM_CHANNEL_ID` не задані — скрипт завершується з зрозумілою помилкою і кодом `1`:

```
❌  TELEGRAM_BOT_TOKEN is not set.
    Add it to your .env file or export it before running:

    export TELEGRAM_BOT_TOKEN=your_token_here
```

---

## CI/CD інтеграція

Якщо потрібно публікувати автоматично через GitHub Actions:

```yaml
- name: Publish Telegram posts
  run: pnpm telegram:publish
  env:
    TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    TELEGRAM_CHANNEL_ID: ${{ secrets.TELEGRAM_CHANNEL_ID }}
```

Додай секрети у: GitHub → Settings → Secrets and variables → Actions.

---

## Залежності

| Пакет | Призначення |
|-------|------------|
| `tsx` | Запуск TypeScript без компіляції |
| `gray-matter` | Читання і запис YAML frontmatter |
| `fetch` (Node 18+) | HTTP запити до Telegram API (вбудований) |
