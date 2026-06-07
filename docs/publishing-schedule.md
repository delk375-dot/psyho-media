# Publishing schedule

`Людський механізм` supports scheduled publishing through `pubDatetime`.

Public post lists and post routes are controlled by:

```txt
src/utils/getPublishedPosts.ts
```

A post is public only when:

```txt
draft !== true
pubDatetime <= current build/deploy time
```

Future-dated posts are excluded from homepage sections, post lists, category pages, topic pages, tags, series, collections, related/recommended blocks, RSS, and generated post routes. Because future post routes are not generated, they are also absent from the sitemap.

## Standard daily schedule

Use these publishing slots by default:

- `09:00` - first article
- `14:00` - second article
- `19:00` - third article

## Frontmatter example

Use an ISO date-time value with a timezone offset:

```yaml
---
title: "Приклад запланованої публікації"
description: "SEO description for the scheduled article."
pubDatetime: 2026-06-15T09:00:00+03:00
category: relationships
tags:
  - "стосунки"
  - "ігнор"
  - "емоційна залежність"
topics:
  - attachment-and-distance
contentType: deep_analysis
draft: false
ogImage: /covers/good-people-cover.svg
---
```

## How publishing works on Cloudflare Pages

The schedule is evaluated at build/deploy time.

If an article has:

```yaml
pubDatetime: 2026-06-15T14:00:00+03:00
```

it will not appear before that time. On Cloudflare Pages, it appears only after the next build/deploy that happens after `2026-06-15T14:00:00+03:00`.

This means a future article may need a manual deploy, a scheduled deploy trigger, or another repository update after the planned publication time.

## How to prepare three articles for one day

Create three post files with these `pubDatetime` values:

```yaml
pubDatetime: 2026-06-15T09:00:00+03:00
```

```yaml
pubDatetime: 2026-06-15T14:00:00+03:00
```

```yaml
pubDatetime: 2026-06-15T19:00:00+03:00
```

Set `draft: false` when the article is ready for scheduled publishing. Keep `draft: true` while the article should never be public.

## How to verify before publication

1. Create a test article with `pubDatetime` in the future and `draft: false`.
2. Run a build.
3. Confirm the article is absent from:
   - homepage
   - `/posts`
   - category and topic pages
   - related/recommended blocks
   - `/rss.xml`
   - generated sitemap

## How to verify after publication

1. Change `pubDatetime` to a time in the past, or wait until the scheduled time passes.
2. Run a new build/deploy.
3. Confirm the article appears in public lists and has a generated post route.

## Drafts

`draft: true` always wins. A draft stays hidden even if `pubDatetime` is in the past.
