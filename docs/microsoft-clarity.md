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

## Project ID

```
x4a1lywf6f
```

Проєкт: **Людський механізм** (`psyho-media.pp.ua`)
Панель: [clarity.microsoft.com](https://clarity.microsoft.com)

---

## Офіційний snippet

```html
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "x4a1lywf6f");
</script>
```

Підключається через `src/components/MicrosoftClarity.astro` — **тільки в production**.
У dev-режимі (`pnpm dev`) snippet не рендериться.

---

## Файли інтеграції

| Файл | Призначення |
|------|-------------|
| `src/components/MicrosoftClarity.astro` | Clarity snippet, тільки production |
| `src/layouts/Layout.astro` | Підключення `<MicrosoftClarity />` в `<head>` |
| `astro.config.ts` | Оголошення `PUBLIC_CLARITY_PROJECT_ID` в env schema |
| `.env.example` | Шаблон з реальним Project ID |

---

## Env змінна

```bash
PUBLIC_CLARITY_PROJECT_ID=x4a1lywf6f
```

### Локально (`.env` у корені проєкту)

```bash
echo "PUBLIC_CLARITY_PROJECT_ID=x4a1lywf6f" >> .env
```

> `.env` в `.gitignore` — не потрапить у репозиторій.

### Cloudflare Pages (production)

1. **Cloudflare Dashboard → Workers & Pages → psyho-media**
2. **Settings → Environment variables → Add variable**
3. Variable name: `PUBLIC_CLARITY_PROJECT_ID`
4. Value: `x4a1lywf6f`
5. Environment: **Production**
6. **Save** → запустити новий деплой (або push у `main`)

---

## Як перевірити що Clarity підключено

### Через view-source

Відкрий `view-source:https://psyho-media.pp.ua` і знайди рядок:

```
clarity.ms/tag/x4a1lywf6f
```

Якщо рядок є — Clarity підключено правильно.

### Через DevTools → Network

```
Відкрий https://psyho-media.pp.ua
DevTools → Network → фільтр: clarity
Має бути запит: https://www.clarity.ms/tag/x4a1lywf6f
```

### Через Clarity Dashboard

1. [clarity.microsoft.com](https://clarity.microsoft.com) → обери проєкт
2. **"Getting started"** — статус підключення
3. **Recordings** → перші записи з'являються через **до 2 годин** після першого відвідування

> Дані в Clarity можуть з'являтися до 2 годин після початку трафіку.

---

## Чому Clarity не вантажиться в dev

Компонент перевіряє `import.meta.env.PROD`:

```astro
{isProd && projectId && (
  <script is:inline define:vars={{ clarityId: projectId }}>
    (function(c,l,a,r,i,t,y){ ... })(window, document, "clarity", "script", clarityId);
  </script>
)}
```

У dev-режимі `PROD = false` → snippet не рендериться → Clarity не завантажується.

---

## Як тимчасово вимкнути Clarity

**Варіант 1 — видалити env змінну**

Cloudflare Pages → Environment variables → видалити `PUBLIC_CLARITY_PROJECT_ID` → редеплой.
Компонент нічого не рендерить якщо змінна відсутня.

**Варіант 2 — закоментувати в Layout**

`src/layouts/Layout.astro`:
```astro
<!-- <MicrosoftClarity /> -->
```

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
| Ціна | безкоштовно | безкоштовно |

Обидва інструменти сумісні — конфліктів немає.
