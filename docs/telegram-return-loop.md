# Telegram Return Loop — Людський механізм

## Мета

Перетворити читачів сайту на підписників Telegram-каналу через ненав'язливі, атмосферні CTA.

---

## Компоненти

| Компонент | Файл | Де підключено |
|-----------|------|---------------|
| TelegramSticky | `src/components/TelegramSticky.astro` | `PostLayout.astro` (тільки статті) |
| ExitIntent | `src/components/ExitIntent.astro` | `Layout.astro` (всі сторінки) |
| Footer link | `src/components/Footer.astro` | Глобально |

---

## Де змінюється Telegram URL

Telegram URL є окремою константою в кожному компоненті. При зміні каналу — оновити в двох місцях:

**`src/components/TelegramSticky.astro`** (рядок 11):
```astro
const TELEGRAM_URL = "https://t.me/psyho_media";
```

**`src/components/ExitIntent.astro`** (рядок 13):
```astro
const TELEGRAM_URL = "https://t.me/psyho_media";
```

**`src/components/Footer.astro`**:
```astro
href="https://t.me/psyho_media"
```

---

## TelegramSticky — як працює

### Умови показу
1. Тільки на **article pages** (перевіряє наявність `#article` елемента)
2. Через **45 секунд** на сторінці, АБО через **60% скролу** — залежно від того, що раніше
3. Не показується якщо є активний **7-денний cooldown** (localStorage)

### Вигляд
- **Desktop:** floating card bottom-left (19rem шириною)
- **Mobile:** slim bar внизу екрану (3rem висота)

### LocalStorage cooldown

Ключ: `lm_tg_dismissed`  
Значення: timestamp у мілісекундах

```javascript
localStorage.setItem("lm_tg_dismissed", String(Date.now()));
```

Cooldown: **7 днів** (604800000 мс).

Щоб скинути cooldown вручну (для тестування):
```javascript
localStorage.removeItem("lm_tg_dismissed");
```

### Як змінити затримки

```javascript
// TelegramSticky.astro
const SHOW_AFTER_MS = 45_000;       // 45 секунд → 60_000 для 1 хвилини
const SCROLL_THRESHOLD = 0.60;      // 60% → 0.75 для 75%
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;  // 7 днів → 3 * 24... для 3 днів
```

---

## ExitIntent — як працює

### Умови показу
1. **Desktop only** (`window.innerWidth > 768px`)
2. Тільки після **30 секунд** на сторінці
3. **Один раз за сесію** (`sessionStorage["lm_exit_shown"]`)
4. Не показується якщо TelegramSticky cooldown ще активний (7 днів)
5. Не показується на **виключених сторінках**: `/search`

### Тригер
`mouseleave` з `clientY <= 10px` — користувач веде мишу до адресного рядку або вкладок.

### Закриття
- Кнопка "Залишитись"
- Кнопка ✕
- Клік на backdrop (поза картою)
- Клавіша `ESC`

### Як скинути для тестування
```javascript
sessionStorage.removeItem("lm_exit_shown");
```

### Як додати виключену сторінку
```javascript
// ExitIntent.astro
const EXCLUDED_PATHS = ["/search", "/my-new-page"];
```

---

## GA4 Events

| Подія | Компонент | Коли |
|-------|-----------|------|
| `telegram_cta_show` | TelegramSticky | Card/bar став видимим |
| `telegram_cta_click` | TelegramSticky | Клік на CTA кнопку |
| `telegram_cta_close` | TelegramSticky | Закрито × |
| `exit_intent_show` | ExitIntent | Модал відкрився |
| `exit_intent_telegram_click` | ExitIntent | Клік "Перейти в Telegram" |
| `exit_intent_close` | ExitIntent | Закрито (будь-яким способом) |

### Де аналізувати в GA4

**GA4 → Reports → Events** → фільтр по `telegram_*` або `exit_intent_*`

**Ключові метрики:**
- CTR = `telegram_cta_click` / `telegram_cta_show`
- Exit intent conversion = `exit_intent_telegram_click` / `exit_intent_show`

---

## Як вимкнути компоненти

| Що вимкнути | Що видалити |
|-------------|-------------|
| TelegramSticky | `<TelegramSticky />` з `PostLayout.astro` |
| ExitIntent | `<ExitIntent />` з `Layout.astro` |
| Footer link | рядки з `t.me/psyho_media` в `Footer.astro` |

Всі компоненти незалежні.

---

## Footer link

Посилання на Telegram додано до `Footer.astro` поруч з посиланням на пошук:

```astro
<a href="https://t.me/psyho_media" target="_blank" rel="noopener noreferrer">
  ✈ Telegram
</a>
```
