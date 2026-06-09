# Microsoft Clarity — Людський механізм

## Що таке Microsoft Clarity

Microsoft Clarity — безкоштовний інструмент поведінкової аналітики:
- **Session recordings** — записи сесій користувачів
- **Heatmaps** — теплові карти кліків і скролу
- **Click maps** — де клікають найчастіше
- **Scroll depth** — як далеко читають статті
- **Rage clicks, dead clicks** — де користувачі розчаровані

Clarity **не дублює GA4** — GA4 рахує конверсії і трафік, Clarity показує *як* поводиться користувач.

---

## Файли інтеграції

| Файл | Призначення |
|------|-------------|
| `src/components/MicrosoftClarity.astro` | Clarity snippet, тільки production |
| `src/layouts/Layout.astro` | Підключення `<MicrosoftClarity />` в `<head>` |
| `astro.config.ts` | Оголошення `PUBLIC_CLARITY_PROJECT_ID` в env schema |
| `.env.example` | Шаблон для локального `.env` файлу |

---

## Як створити Clarity Project

1. Відкрий [clarity.microsoft.com](https://clarity.microsoft.com)
2. Увійди через Microsoft акаунт (можна через Google/GitHub)
3. Натисни **"New project"**
4. Вкажи:
   - **Name:** Людський механізм
   - **Website URL:** `https://psyho-media.pp.ua`
5. Натисни **"Create"**
6. У наступному вікні побачиш **Project ID** — рядок із ~10 символів

---

## Де взяти Project ID

`Settings → Projects → [Твій проєкт] → Setup`

Або прямо в snippet, який показує Clarity:
```javascript
clarity("set", "PROJECT_ID_HERE", ...)
//                ↑ ось він
```

---

## Як додати env змінну

### Локально (для тестування build)

Створи файл `.env` у корені проєкту (якщо немає):
```bash
PUBLIC_CLARITY_PROJECT_ID=ab1cd2ef3g
```

> `.env` вже в `.gitignore` — не потрапить у репозиторій.

### Cloudflare Pages (production)

1. Відкрий **Cloudflare Dashboard → Workers & Pages → psyho-media**
2. **Settings → Environment variables**
3. Натисни **"Add variable"**:
   - Variable name: `PUBLIC_CLARITY_PROJECT_ID`
   - Value: `ab1cd2ef3g` (твій реальний Project ID)
4. **Production** (не Preview, якщо не потрібно)
5. Натисни **"Save"**
6. Запусти новий деплой (або push у `main`)

---

## Як перевірити що Clarity працює

### Через DevTools (після деплою)
```
Відкрий https://psyho-media.pp.ua → DevTools → Network
Фільтр: clarity
Має бути запит до https://www.clarity.ms/tag/YOUR_ID
```

### Через Clarity Dashboard
1. Відкрий [clarity.microsoft.com](https://clarity.microsoft.com)
2. Обери свій проєкт
3. **"Getting started"** → перший запис з'явиться через ~2 хвилини після першого відвідування
4. **Recordings** — список сесій
5. **Heatmaps** — теплові карти по URL

> Перший запис може з'явитися через 5–15 хвилин після деплою.

---

## Як тимчасово вимкнути Clarity

### Варіант 1 — видалити env змінну

В Cloudflare Pages → Environment variables → видалити `PUBLIC_CLARITY_PROJECT_ID` → редеплой.

Компонент `MicrosoftClarity.astro` нічого не рендерить якщо змінна відсутня.

### Варіант 2 — закоментувати в Layout

`src/layouts/Layout.astro`:
```astro
<!-- <MicrosoftClarity /> -->
```

---

## Чому Clarity не вантажиться в dev

Компонент перевіряє `import.meta.env.PROD`:

```astro
{isProd && projectId && (
  <script is:inline ...>...</script>
)}
```

У dev-режимі (`pnpm dev`) `PROD = false` → snippet не рендериться → Clarity не завантажується.

---

## Clarity + GA4 — різні ролі

| | GA4 | Clarity |
|---|---|---|
| Трафік і джерела | ✅ | ❌ |
| Конверсії | ✅ | ❌ |
| Session recordings | ❌ | ✅ |
| Heatmaps | ❌ | ✅ |
| Rage clicks | ❌ | ✅ |
| Scroll depth | обмежено | ✅ |
| Коштує | безкоштовно | безкоштовно |

Обидва інструменти мирно співіснують — немає конфліктів.
