# Editorial Brain — редакторський радар

> Telegram = after-reading atmosphere.
> Site = deep mechanism archive.
> Editorial Brain = редакторський радар між ними.

Editorial Brain — це **не генератор постів**. Це щотижневий аудит сайту і Telegram,
який показує: що сильне, що слабке, де бракує шару, які теми розвивати.

---

## Як запустити вручну

```bash
# Повний запуск (генерує файли + надсилає в Telegram)
pnpm editorial:audit

# Без Telegram (тільки файли)
pnpm editorial:audit -- --no-telegram

# Короткий summary в консоль
pnpm editorial:audit -- --summary --no-telegram

# JSON в stdout
pnpm editorial:audit -- --json --no-telegram
```

Для локального запуску з Telegram-доставкою потрібні env-змінні:

```bash
# .env або експорт у shell
TELEGRAM_BOT_TOKEN=your_bot_token
EDITORIAL_TELEGRAM_CHAT_ID=your_private_chat_id
```

---

## Де дивитись звіти

| Файл | Вміст |
|------|-------|
| `docs/editorial-audit.md` | Читабельний markdown-звіт |
| `data/editorial-audit.json` | Структуровані дані для інструментів |

Обидва файли автоматично оновлюються щонеділі через GitHub Actions і
commitаються в `main` з повідомленням `chore: update editorial brain report [skip ci]`.

---

## GitHub Actions

Workflow: `.github/workflows/editorial-brain.yml`

Запуск:
- **Щонеділі 09:00 Europe/Kyiv** (06:00 UTC)
- **Вручну** через GitHub → Actions → Editorial Brain Weekly Digest → Run workflow

Secrets, які потрібні в GitHub:
- `TELEGRAM_BOT_TOKEN` — той самий бот, що публікує канал
- `EDITORIAL_TELEGRAM_CHAT_ID` — твій приватний чат або Saved Messages

---

## Як отримати EDITORIAL_TELEGRAM_CHAT_ID

**Варіант 1 — Saved Messages (найпростіше):**
1. Напиши `/start` своєму боту в Telegram
2. Відкрий `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
3. Знайди `"chat": {"id": ...}` у відповіді — це твій chat_id
4. Для Saved Messages використовуй свій особистий user_id (той самий числовий id)

**Варіант 2 — приватний канал:**
1. Додай бота як адміна в приватний канал
2. Напиши повідомлення в канал
3. Відкрий `getUpdates` — в `channel_post.chat.id` буде id каналу (від'ємне число)

---

## Як читати рекомендації

Рекомендації в розділі 9 генеруються за трьома критеріями:

1. **Слабкі кластери** — категорії з малою кількістю статей або без Telegram-шару
2. **Статті без after-reading** — найпріоритетніше завдання
3. **Гарячі теги** — теги з найбільшою кількістю статей, де є аудиторія

Кожна рекомендація містить:
- **Тему** — що саме
- **Чому** — стратегічне обґрунтування
- **Що створити** — конкретний тип контенту

---

## Що аналізує система

- `src/content/posts/` — всі опубліковані статті
- `src/content/telegram/` — всі Telegram-пости
- `category`, `contentType`, `tags`, `topics`
- `bridgeTo`, `sourceArticle` — зв'язки між статтями і Telegram
- `publishDate`, `published` — стан публікації
- Кількість слів → приблизний reading time (200 слів/хв)

---

## Як не перетворити систему на SEO-ферму

Ця система навмисно **не** рекомендує:
- писати більше заради кількості
- заповнювати всі теги однотипним контентом
- дублювати механізм у Telegram

Правило редактора:
> Якщо після статті нема що сказати в Telegram — не треба нічого казати.
> After-reading pack має бути наслідком думки, а не розкладом.

Система показує **де є прогалина** — рішення завжди за редактором.

---

## Формат Telegram-дайджесту

```
🧠 Editorial Brain Report

📊 Статистика:
Статей: X · Telegram: Y · After-reading: Z

💪 Сильні кластери:
• ...

⚠️ Слабкі кластери:
• ...

📭 Без after-reading layer: N статей

🔍 Telegram gaps:
• Без sourceArticle: N
• Без bridgeTo: N

💡 Рекомендація тижня:
...

📅 План на тиждень:
• Пн: ...
...

📄 Повний звіт: docs/editorial-audit.md
```

Читається за 20–40 секунд. Не стіна тексту — радар.
