# Scheduled Telegram Publishing — Людський механізм

## Огляд

GitHub Actions workflow автоматично публікує Telegram-пости кожні 30 хвилин.
Публікується пост тільки якщо виконуються обидві умови:

1. `published: false`
2. `publishDate <= now` (або `date`, якщо `publishDate` відсутнє)

Після публікації workflow автоматично комітить оновлений markdown файл назад у `main`.

---

## Файли

| Файл | Призначення |
|------|------------|
| `.github/workflows/telegram-publish.yml` | GitHub Actions workflow |
| `scripts/publish-telegram.ts` | Скрипт публікації |
| `src/content/telegram/*.md` | Контент для публікації |

---

## Налаштування GitHub Secrets

Перед першим запуском потрібно додати два секрети у репозиторій:

**GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Значення |
|--------|---------|
| `TELEGRAM_BOT_TOKEN` | Токен бота від @BotFather |
| `TELEGRAM_CHANNEL_ID` | `@psyho_media` |

> ⚠️ Бот має бути адміністратором каналу з правом **публікувати повідомлення**.

---

## Розклад

Workflow запускається:
- **Автоматично** — кожні 30 хвилин (`cron: "*/30 * * * *"`)
- **Вручну** — через GitHub Actions → Telegram Scheduled Publishing → Run workflow

### Manual dispatch з лімітом

При ручному запуску можна вказати `limit` — кількість постів для публікації за один раз:

```
GitHub Actions → Run workflow → limit: 1
```

---

## Як запланувати пост

Додай у frontmatter поле `publishDate`:

```md
---
title: "Назва"
date: 2026-03-10T10:00:00.000+03:00
type: psycho_glitch
body: "Текст поста."
published: false
publishDate: 2026-03-15T09:00:00.000+03:00   # ← коли опублікувати
publishedAt: null
telegramMessageId: null
---
```

Workflow перевірить `publishDate` при наступному запуску і опублікує пост якщо час настав.

**Якщо `publishDate` не вказано** — пост публікується одразу (використовується поле `date`).

---

## Поведінка при різних сценаріях

| Сценарій | Результат |
|----------|-----------|
| Немає eligible постів | Graceful exit, workflow green ✅ |
| Telegram API error | Workflow fail ❌, step виходить з кодом 1 |
| Частково опублікувалось | Оновлені файли комітяться, workflow fail ❌ |
| Всі успішно | Комміт в main, workflow green ✅ |
| Немає змін у файлах | "Nothing to commit", без зайвого коміту |

---

## [skip ci] у commit message

Коміт після публікації містить `[skip ci]`:

```
chore: mark Telegram posts as published [skip ci]
```

Це запобігає рекурсивному тригеру інших workflows (CI build тощо).

---

## Локальний запуск

```bash
# З .env файлом (Linux/Mac)
pnpm telegram:publish

# З .env.txt (Windows)
pnpm telegram:publish:txt

# CI-режим (без --env-file, env з середовища)
pnpm telegram:publish:ci

# З лімітом
pnpm telegram:publish -- --limit=1
```

---

## Права доступу workflow

Workflow використовує `permissions: contents: write` для коміту оновлених markdown файлів.
Стандартний `GITHUB_TOKEN` достатній — додатковий PAT не потрібен.

---

## Моніторинг

**GitHub → Actions → Telegram Scheduled Publishing** — тут видно всі запуски, лог публікацій і помилки.

Кожен рядок логу показує:
```
→ Publishing "Назва поста" ... ✅  message_id: 42
```

або при помилці:
```
→ Publishing "Назва поста" ... ❌  FAILED — Telegram API error: ...
```
