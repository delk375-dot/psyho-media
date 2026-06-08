# Cover system

Система обкладинок для "Людського механізму" працює на легких локальних SVG.

Вона потрібна для:

- карток статей на головній і в списках;
- OpenGraph preview для соцмереж і месенджерів;
- стабільного візуального стилю без remote assets;
- швидкого завантаження на Cloudflare Pages.

## Де знаходиться генератор

Центральна утиліта:

```ts
src/utils/generatePostCover.ts
```

Вона створює детерміновану SVG-обкладинку на основі:

- `title`;
- `category`;
- `tags`;
- `contentType`;
- `slug`.

Для однакового slug результат завжди однаковий.

## Де лежать обкладинки

Згенеровані файли зберігаються у:

```text
public/covers/
```

Патерн імені:

```text
/covers/{slug}.svg
```

Приклад:

```text
/covers/chomu-lyudy-znykayut-bez-poyasnennya.svg
```

## Як підключити обкладинку у frontmatter

Для статті можна вказати:

```yaml
cover: "/covers/chomu-lyudy-znykayut-bez-poyasnennya.svg"
```

Повний приклад:

```yaml
---
title: "Чому люди зникають без пояснення"
description: "Психологічний розбір мовчання, ігнору і зникнення без пояснення."
pubDatetime: 2026-06-07T19:00:00+03:00
category: "silence-ghosting"
contentType: "pillar_article"
tags:
  - "ігнор"
  - "мовчання"
  - "емоційна залежність"
cover: "/covers/chomu-lyudy-znykayut-bez-poyasnennya.svg"
---
```

## Fallback logic

Картки і сторінки статей використовують таку логіку:

1. `cover` з frontmatter.
2. `ogImage`, якщо `cover` не заданий.
3. автоматичний шлях `/covers/{slug}.svg`.
4. глобальний `public/default-og.svg` для базових сторінок і випадків без article image.

Для нових статей бажано одразу генерувати SVG і вказувати `cover`, щоб не було missing asset errors.

## Visual rules

Обкладинки мають залишатися в стилі "Людського механізму":

- теплий бежевий фон;
- темний графітовий текст;
- винний / burgundy акцент;
- мінімальна editorial-композиція;
- короткий читабельний заголовок;
- один абстрактний символ.

Дозволені мотиви:

- коло;
- тріщина;
- нитка;
- маска;
- повідомлення;
- двері;
- вузол;
- тінь.

Не використовувати:

- stock photos;
- neon;
- cyberpunk;
- wellness-естетику;
- base64 assets;
- remote images.

## Manual override

Якщо для статті потрібна ручна обкладинка, створи SVG у `public/covers/` і вкажи його у `cover`.

Не потрібно змінювати компоненти карток або layout. Візуальна логіка вже читає `cover` автоматично.

