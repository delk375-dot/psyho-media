/**
 * editorial-audit.ts
 * ──────────────────
 * Editorial Brain Digest System — Людський механізм
 *
 * Analyzes src/content/posts/ + src/content/telegram/ and produces:
 *   docs/editorial-audit.md   — human-readable editorial report
 *   data/editorial-audit.json — structured data for tooling
 *
 * Optionally sends a short Telegram digest to a private chat.
 *
 * Usage:
 *   pnpm editorial:audit                 — full run (Telegram + files)
 *   pnpm editorial:audit -- --no-telegram  — skip Telegram send
 *   pnpm editorial:audit -- --summary      — print summary to stdout
 *   pnpm editorial:audit -- --json         — print JSON to stdout
 *
 * Env:
 *   TELEGRAM_BOT_TOKEN            (shared with publish script)
 *   EDITORIAL_TELEGRAM_CHAT_ID    (your private chat / Saved Messages id)
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// ── Paths ─────────────────────────────────────────────────────
const ROOT          = process.cwd();
const POSTS_DIR     = path.join(ROOT, "src/content/posts");
const TELEGRAM_DIR  = path.join(ROOT, "src/content/telegram");
const DOCS_DIR      = path.join(ROOT, "docs");
const DATA_DIR      = path.join(ROOT, "data");
const AUDIT_MD      = path.join(DOCS_DIR, "editorial-audit.md");
const AUDIT_JSON    = path.join(DATA_DIR, "editorial-audit.json");

// ── CLI flags ─────────────────────────────────────────────────
const args          = process.argv.slice(2);
const NO_TELEGRAM   = args.includes("--no-telegram");
const SUMMARY_MODE  = args.includes("--summary");
const JSON_MODE     = args.includes("--json");

// ── Env ───────────────────────────────────────────────────────
const BOT_TOKEN     = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID       = process.env.EDITORIAL_TELEGRAM_CHAT_ID;

// ── Types ─────────────────────────────────────────────────────

interface PostMeta {
  slug: string;
  title: string;
  category: string;
  contentType: string;
  tags: string[];
  topics: string[];
  series?: string;
  draft: boolean;
  wordCount: number;
  readingTime: number; // minutes
  relatedPosts: string[];
  hasCover: boolean;
}

interface TelegramMeta {
  slug: string;
  title: string;
  type: string;
  tone: string;
  bridgeTo: string | null;
  sourceArticle: string | null;
  isTelegramOnly: boolean;
  published: boolean;
  publishDate: Date | null;
}

type AuditReport = {
  generatedAt: string;
  stats: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalTelegramPosts: number;
    publishedTelegramPosts: number;
    afterReadingPosts: number;
    bridgePosts: number;
    telegramOnlyPosts: number;
    categories: number;
    uniqueTags: number;
    avgReadingTime: number;
  };
  strongClusters: { name: string; articles: number; signals: number; score: number }[];
  weakClusters:   { name: string; articles: number; signals: number; reason: string }[];
  articlesWithoutAfterReading: { slug: string; title: string; category: string }[];
  articlesWithoutBridge:       { slug: string; title: string; category: string }[];
  telegramGaps: {
    noSourceArticle:  { slug: string; title: string; type: string }[];
    noBridgeTo:       { slug: string; title: string; type: string }[];
    telegramOnly:     { slug: string; title: string; type: string }[];
  };
  shortDeepContent: { slug: string; title: string; contentType: string; readingTime: number }[];
  duplicates: { group: string[]; reason: string }[];
  recommendations: { topic: string; why: string; what: string }[];
  weeklyPlan: { day: string; task: string; type: string }[];
};

// ── Helpers ───────────────────────────────────────────────────

const AFTER_READING_TYPES = new Set([
  "afterthought", "provocation", "shadow_fragment", "microcase",
]);

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

function loadPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter(f => f.endsWith(".md") || f.endsWith(".mdx"))
    .filter(f => !f.startsWith("_"))
    .map(f => {
      const raw   = fs.readFileSync(path.join(POSTS_DIR, f), "utf-8");
      const { data, content } = matter(raw);
      const slug  = f.replace(/\.(md|mdx)$/, "");
      const words = countWords(content);
      return {
        slug,
        title:       String(data.title ?? slug),
        category:    String(data.category ?? ""),
        contentType: String(data.contentType ?? "article"),
        tags:        Array.isArray(data.tags) ? data.tags.map(String) : [],
        topics:      Array.isArray(data.topics) ? data.topics.map(String) : [],
        series:      data.series ? String(data.series) : undefined,
        draft:       data.draft === true,
        wordCount:   words,
        readingTime: readingMinutes(words),
        relatedPosts: Array.isArray(data.relatedPosts) ? data.relatedPosts.map(String) : [],
        hasCover:    Boolean(data.cover || data.ogImage),
      } satisfies PostMeta;
    });
}

function loadTelegram(): TelegramMeta[] {
  if (!fs.existsSync(TELEGRAM_DIR)) return [];

  return fs
    .readdirSync(TELEGRAM_DIR)
    .filter(f => f.endsWith(".md") || f.endsWith(".mdx"))
    .filter(f => !f.startsWith("_"))
    .map(f => {
      const raw  = fs.readFileSync(path.join(TELEGRAM_DIR, f), "utf-8");
      const { data } = matter(raw);
      const slug = f.replace(/\.(md|mdx)$/, "");
      return {
        slug,
        title:         String(data.title ?? slug),
        type:          String(data.type ?? "signal"),
        tone:          String(data.tone ?? "atmospheric"),
        bridgeTo:      data.bridgeTo ?? null,
        sourceArticle: data.sourceArticle ?? null,
        isTelegramOnly: data.isTelegramOnly !== false,
        published:     data.published === true,
        publishDate:   data.publishDate ? new Date(data.publishDate) : null,
      } satisfies TelegramMeta;
    });
}

// ── Simple duplicate heuristic ────────────────────────────────

function findDuplicates(posts: PostMeta[]): { group: string[]; reason: string }[] {
  const groups: { group: string[]; reason: string }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const a = posts[i]!;
      const b = posts[j]!;
      const key = [a.slug, b.slug].sort().join("|");
      if (seen.has(key)) continue;

      // Shared significant tags (≥ 3)
      const sharedTags = a.tags.filter(t => b.tags.includes(t));
      if (sharedTags.length >= 3) {
        seen.add(key);
        groups.push({
          group: [a.slug, b.slug],
          reason: `Спільні теги (${sharedTags.slice(0, 4).join(", ")})`,
        });
        continue;
      }

      // Very similar title keywords (4+ words overlap)
      const aWords = a.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const bWords = b.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const sharedWords = aWords.filter(w => bWords.includes(w));
      if (sharedWords.length >= 3) {
        seen.add(key);
        groups.push({
          group: [a.slug, b.slug],
          reason: `Схожі заголовки: «${a.title}» / «${b.title}»`,
        });
      }
    }
  }

  return groups.slice(0, 10); // cap at 10
}

// ── Recommendation engine ─────────────────────────────────────

function generateRecommendations(
  posts: PostMeta[],
  tgPosts: TelegramMeta[],
  weakClusters: { name: string }[],
): { topic: string; why: string; what: string }[] {
  const recs: { topic: string; why: string; what: string }[] = [];

  // From weak clusters
  weakClusters.slice(0, 4).forEach(c => {
    recs.push({
      topic: c.name,
      why:   "Слабкий кластер — мало статей або немає Telegram-шару",
      what:  "Написати 1 deep_analysis + after-reading pack (4 пости)",
    });
  });

  // Topics with 0 after-reading
  const tgSourceSlugs = new Set(
    tgPosts.filter(t => t.sourceArticle).map(t => t.sourceArticle!)
  );
  const noLayer = posts
    .filter(p => !p.draft && !tgSourceSlugs.has(p.slug))
    .slice(0, 3);
  noLayer.forEach(p => {
    recs.push({
      topic: p.title,
      why:   "Стаття без Telegram after-reading layer",
      what:  "Створити afterthought + provocation + shadow_fragment + microcase",
    });
  });

  // Deep-content topics based on existing tags
  const tagCounts: Record<string, number> = {};
  posts.forEach(p => p.tags.forEach(t => { tagCounts[t] = (tagCounts[t] ?? 0) + 1; }));
  const hotTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([t]) => t);

  hotTags.forEach(tag => {
    if (recs.length < 10) {
      recs.push({
        topic: `Глибоке занурення: «${tag}»`,
        why:   `Найчастіший тег (${tagCounts[tag]} статей) — є аудиторія`,
        what:  "Pillar article + серія з 3–4 коротких фрагментів у Telegram",
      });
    }
  });

  // Fairytale / humor gap
  const hasFairytale = posts.some(p => p.contentType === "psychological_fairytale");
  if (!hasFairytale && recs.length < 10) {
    recs.push({
      topic: "Психологічна казка або гумор",
      why:   "Відсутній легший формат — читач втомлюється від важкого матеріалу",
      what:  "1 psychological_fairytale або ironic fragment у Telegram",
    });
  }

  return recs.slice(0, 10);
}

// ── 7-day plan ────────────────────────────────────────────────

function generateWeeklyPlan(
  articlesWithoutAfterReading: { slug: string; title: string }[],
  weakClusters: { name: string }[],
  recs: { topic: string; what: string }[],
): { day: string; task: string; type: string }[] {
  const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const plan: { day: string; task: string; type: string }[] = [];

  const noAR = articlesWithoutAfterReading[0];
  const noAR2 = articlesWithoutAfterReading[1];
  const weak = weakClusters[0];
  const rec = recs[0];

  plan.push({
    day:  DAYS[0]!,
    task: noAR ? `After-reading pack для «${noAR.title}»` : "Аудит і планування тижня",
    type: "telegram",
  });
  plan.push({
    day:  DAYS[1]!,
    task: weak ? `Deep analysis у кластері «${weak.name}»` : "SEO-фрагмент або viral note",
    type: "site",
  });
  plan.push({
    day:  DAYS[2]!,
    task: noAR2 ? `After-reading pack для «${noAR2.title}»` : "2 Telegram-сигнали (standalone)",
    type: "telegram",
  });
  plan.push({
    day:  DAYS[3]!,
    task: rec ? rec.topic : "Psychological fairytale або ironic fragment",
    type: "site",
  });
  plan.push({
    day:  DAYS[4]!,
    task: "Shadow fragment + провокація у Telegram",
    type: "telegram",
  });
  plan.push({
    day:  DAYS[5]!,
    task: "Мікрокейс із bridgeTo до нової статті",
    type: "telegram",
  });
  plan.push({
    day:  DAYS[6]!,
    task: "Читання, редакторський огляд, коригування плану на наступний тиждень",
    type: "review",
  });

  return plan;
}

// ── Main audit ────────────────────────────────────────────────

function buildReport(): AuditReport {
  const posts    = loadPosts();
  const tgPosts  = loadTelegram();

  const published    = posts.filter(p => !p.draft);
  const drafts       = posts.filter(p => p.draft);
  const tgPublished  = tgPosts.filter(t => t.published);
  const afterReading = tgPosts.filter(t => AFTER_READING_TYPES.has(t.type));
  const bridges      = tgPosts.filter(t => t.bridgeTo && t.bridgeTo !== "null");
  const tgOnly       = tgPosts.filter(t => t.isTelegramOnly);

  const allTags  = [...new Set(posts.flatMap(p => p.tags))];
  const avgRT    = published.length
    ? Math.round(published.reduce((s, p) => s + p.readingTime, 0) / published.length)
    : 0;

  // ── Cluster analysis ──────────────────────────────────────
  const categoryMap: Record<string, PostMeta[]> = {};
  published.forEach(p => {
    if (!p.category) return;
    (categoryMap[p.category] ??= []).push(p);
  });

  const tgByArticle: Record<string, TelegramMeta[]> = {};
  tgPosts.forEach(t => {
    if (t.sourceArticle) (tgByArticle[t.sourceArticle] ??= []).push(t);
  });

  const clusterStats = Object.entries(categoryMap).map(([cat, arts]) => {
    const signals = arts.reduce((s, a) => s + (tgByArticle[a.slug]?.length ?? 0), 0);
    return { name: cat, articles: arts.length, signals, score: arts.length * 2 + signals };
  });

  const strongClusters = clusterStats
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const weakClusters = clusterStats
    .filter(c => c.articles <= 2 || c.signals === 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(c => ({
      ...c,
      reason: c.articles <= 2
        ? `Лише ${c.articles} ${c.articles === 1 ? "стаття" : "статті"}`
        : "Немає Telegram-шару",
    }));

  // ── Articles without after-reading ────────────────────────
  const arSlugs = new Set(
    tgPosts.filter(t => AFTER_READING_TYPES.has(t.type) && t.sourceArticle)
           .map(t => t.sourceArticle!)
  );
  const articlesWithoutAfterReading = published
    .filter(p => !arSlugs.has(p.slug))
    .map(p => ({ slug: p.slug, title: p.title, category: p.category }));

  // ── Articles without bridge ────────────────────────────────
  const bridgeSlugs = new Set(
    tgPosts.filter(t => t.bridgeTo && t.bridgeTo !== "null" && t.sourceArticle)
           .map(t => t.sourceArticle!)
  );
  const articlesWithoutBridge = published
    .filter(p => !bridgeSlugs.has(p.slug))
    .map(p => ({ slug: p.slug, title: p.title, category: p.category }));

  // ── Telegram gaps ──────────────────────────────────────────
  const telegramGaps = {
    noSourceArticle: tgPosts
      .filter(t => !t.sourceArticle || t.sourceArticle === "null")
      .map(t => ({ slug: t.slug, title: t.title, type: t.type })),
    noBridgeTo: tgPosts
      .filter(t => !t.bridgeTo || t.bridgeTo === "null")
      .filter(t => !t.isTelegramOnly) // only non-telegram-only posts should have bridgeTo
      .map(t => ({ slug: t.slug, title: t.title, type: t.type })),
    telegramOnly: tgOnly
      .map(t => ({ slug: t.slug, title: t.title, type: t.type })),
  };

  // ── Short deep content ─────────────────────────────────────
  const shortDeepContent = published
    .filter(p => ["pillar_article", "deep_analysis"].includes(p.contentType))
    .filter(p => p.readingTime < 6)
    .map(p => ({
      slug:        p.slug,
      title:       p.title,
      contentType: p.contentType,
      readingTime: p.readingTime,
    }));

  // ── Duplicates ─────────────────────────────────────────────
  const duplicates = findDuplicates(published);

  // ── Recommendations ────────────────────────────────────────
  const recommendations = generateRecommendations(published, tgPosts, weakClusters);

  // ── Weekly plan ────────────────────────────────────────────
  const weeklyPlan = generateWeeklyPlan(
    articlesWithoutAfterReading,
    weakClusters,
    recommendations,
  );

  return {
    generatedAt: new Date().toISOString(),
    stats: {
      totalPosts:           posts.length,
      publishedPosts:       published.length,
      draftPosts:           drafts.length,
      totalTelegramPosts:   tgPosts.length,
      publishedTelegramPosts: tgPublished.length,
      afterReadingPosts:    afterReading.length,
      bridgePosts:          bridges.length,
      telegramOnlyPosts:    tgOnly.length,
      categories:           Object.keys(categoryMap).length,
      uniqueTags:           allTags.length,
      avgReadingTime:       avgRT,
    },
    strongClusters,
    weakClusters,
    articlesWithoutAfterReading,
    articlesWithoutBridge,
    telegramGaps,
    shortDeepContent,
    duplicates,
    recommendations,
    weeklyPlan,
  };
}

// ── Markdown report ───────────────────────────────────────────

function buildMarkdown(r: AuditReport): string {
  const d = new Date(r.generatedAt);
  const dateStr = d.toLocaleDateString("uk-UA", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const lines: string[] = [];

  lines.push(`# Editorial Brain Report`);
  lines.push(`\n> Згенеровано: ${dateStr}\n`);

  // 1. Stats
  lines.push(`## 1. Загальна статистика\n`);
  lines.push(`| Показник | Значення |`);
  lines.push(`|----------|----------|`);
  lines.push(`| Статей (всього) | ${r.stats.totalPosts} |`);
  lines.push(`| Опубліковано | ${r.stats.publishedPosts} |`);
  lines.push(`| Чорновики | ${r.stats.draftPosts} |`);
  lines.push(`| Telegram-постів (всього) | ${r.stats.totalTelegramPosts} |`);
  lines.push(`| Опубліковано в Telegram | ${r.stats.publishedTelegramPosts} |`);
  lines.push(`| After-reading постів | ${r.stats.afterReadingPosts} |`);
  lines.push(`| Bridge-постів | ${r.stats.bridgePosts} |`);
  lines.push(`| Telegram-only | ${r.stats.telegramOnlyPosts} |`);
  lines.push(`| Категорій | ${r.stats.categories} |`);
  lines.push(`| Унікальних тегів | ${r.stats.uniqueTags} |`);
  lines.push(`| Середній reading time | ${r.stats.avgReadingTime} хв |`);

  // 2. Strong clusters
  lines.push(`\n## 2. Сильні кластери\n`);
  if (r.strongClusters.length === 0) {
    lines.push(`_Немає даних._`);
  } else {
    lines.push(`| Категорія | Статей | Telegram-сигналів | Score |`);
    lines.push(`|-----------|--------|-------------------|-------|`);
    r.strongClusters.forEach(c => {
      lines.push(`| \`${c.name}\` | ${c.articles} | ${c.signals} | ${c.score} |`);
    });
  }

  // 3. Weak clusters
  lines.push(`\n## 3. Слабкі кластери\n`);
  if (r.weakClusters.length === 0) {
    lines.push(`_Всі кластери виглядають збалансовано._`);
  } else {
    lines.push(`| Категорія | Статей | Сигналів | Причина |`);
    lines.push(`|-----------|--------|----------|---------|`);
    r.weakClusters.forEach(c => {
      lines.push(`| \`${c.name}\` | ${c.articles} | ${c.signals} | ${c.reason} |`);
    });
  }

  // 4. Without after-reading
  lines.push(`\n## 4. Статті без after-reading layer\n`);
  if (r.articlesWithoutAfterReading.length === 0) {
    lines.push(`✅ Усі статті мають after-reading pack.`);
  } else {
    lines.push(`${r.articlesWithoutAfterReading.length} статей без \`afterthought\` / \`provocation\` / \`shadow_fragment\` / \`microcase\`:\n`);
    r.articlesWithoutAfterReading.slice(0, 15).forEach(a => {
      lines.push(`- \`${a.slug}\` — ${a.title} _(${a.category || "без категорії"})_`);
    });
    if (r.articlesWithoutAfterReading.length > 15) {
      lines.push(`- _…та ще ${r.articlesWithoutAfterReading.length - 15} статей_`);
    }
  }

  // 5. Without bridge
  lines.push(`\n## 5. Статті без bridge-постів\n`);
  if (r.articlesWithoutBridge.length === 0) {
    lines.push(`✅ Усі статті мають bridge-пост у Telegram.`);
  } else {
    lines.push(`${r.articlesWithoutBridge.length} статей без microcase / bridge:\n`);
    r.articlesWithoutBridge.slice(0, 10).forEach(a => {
      lines.push(`- \`${a.slug}\` — ${a.title}`);
    });
    if (r.articlesWithoutBridge.length > 10) {
      lines.push(`- _…та ще ${r.articlesWithoutBridge.length - 10}_`);
    }
  }

  // 6. Telegram gaps
  lines.push(`\n## 6. Telegram gaps\n`);
  lines.push(`**Без sourceArticle:** ${r.telegramGaps.noSourceArticle.length} постів`);
  if (r.telegramGaps.noSourceArticle.length > 0) {
    r.telegramGaps.noSourceArticle.slice(0, 5).forEach(t => {
      lines.push(`  - \`${t.slug}\` (${t.type})`);
    });
  }
  lines.push(`\n**Без bridgeTo (non-telegram-only):** ${r.telegramGaps.noBridgeTo.length} постів`);
  lines.push(`\n**Telegram-only сигналів:** ${r.telegramGaps.telegramOnly.length}`);

  // 7. Short deep content
  lines.push(`\n## 7. Короткі pillar/deep статті\n`);
  if (r.shortDeepContent.length === 0) {
    lines.push(`✅ Немає підозріло коротких pillar/deep_analysis статей.`);
  } else {
    lines.push(`| Slug | Тип | Reading time |`);
    lines.push(`|------|-----|-------------|`);
    r.shortDeepContent.forEach(a => {
      lines.push(`| \`${a.slug}\` | \`${a.contentType}\` | ${a.readingTime} хв |`);
    });
  }

  // 8. Duplicates
  lines.push(`\n## 8. Можливі дублювання\n`);
  if (r.duplicates.length === 0) {
    lines.push(`✅ Явних дублювань не знайдено.`);
  } else {
    r.duplicates.forEach(d => {
      lines.push(`- \`${d.group[0]}\` / \`${d.group[1]}\``);
      lines.push(`  _${d.reason}_`);
    });
  }

  // 9. Recommendations
  lines.push(`\n## 9. Рекомендовані теми\n`);
  lines.push(`| Тема | Чому | Що створити |`);
  lines.push(`|------|------|-------------|`);
  r.recommendations.forEach(rec => {
    lines.push(`| ${rec.topic} | ${rec.why} | ${rec.what} |`);
  });

  // 10. Weekly plan
  lines.push(`\n## 10. План на 7 днів\n`);
  lines.push(`| День | Завдання | Тип |`);
  lines.push(`|------|----------|-----|`);
  r.weeklyPlan.forEach(p => {
    const typeEmoji = p.type === "site" ? "📄" : p.type === "telegram" ? "✈️" : "🔍";
    lines.push(`| **${p.day}** | ${p.task} | ${typeEmoji} ${p.type} |`);
  });

  lines.push(`\n---\n_Editorial Brain — Людський механізм_`);

  return lines.join("\n");
}

// ── Telegram digest message ───────────────────────────────────

function buildDigestMessage(r: AuditReport): string {
  const s = r.stats;

  const strong = r.strongClusters.slice(0, 3)
    .map(c => `• <b>${c.name}</b> — ${c.articles} ст. / ${c.signals} сигналів`)
    .join("\n");

  const weak = r.weakClusters.slice(0, 3)
    .map(c => `• <b>${c.name}</b> — ${c.reason}`)
    .join("\n") || "• Слабких кластерів не знайдено";

  const topRec = r.recommendations[0];
  const recLine = topRec
    ? `<b>${topRec.topic}</b>\n${topRec.what}`
    : "Продовжити наповнення слабких кластерів";

  const tgGapTotal = r.telegramGaps.noSourceArticle.length;
  const planLines = r.weeklyPlan.slice(0, 4)
    .map(p => `• ${p.day}: ${p.task}`)
    .join("\n");

  return [
    `🧠 <b>Editorial Brain Report</b>`,
    ``,
    `📊 <b>Статистика:</b>`,
    `Статей: ${s.publishedPosts} · Telegram: ${s.totalTelegramPosts} · After-reading: ${s.afterReadingPosts}`,
    ``,
    `💪 <b>Сильні кластери:</b>`,
    strong || "• Немає даних",
    ``,
    `⚠️ <b>Слабкі кластери:</b>`,
    weak,
    ``,
    `📭 <b>Без after-reading layer:</b> ${r.articlesWithoutAfterReading.length} статей`,
    ``,
    `🔍 <b>Telegram gaps:</b>`,
    `• Без sourceArticle: ${tgGapTotal}`,
    `• Без bridgeTo: ${r.telegramGaps.noBridgeTo.length}`,
    ``,
    `💡 <b>Рекомендація тижня:</b>`,
    recLine,
    ``,
    `📅 <b>План на тиждень:</b>`,
    planLines,
    ``,
    `📄 Повний звіт: <code>docs/editorial-audit.md</code>`,
  ].join("\n");
}

// ── Telegram send ─────────────────────────────────────────────

async function sendDigest(message: string): Promise<void> {
  if (!BOT_TOKEN) {
    console.warn("⚠️  TELEGRAM_BOT_TOKEN not set — skipping Telegram digest.");
    return;
  }
  if (!CHAT_ID) {
    console.warn("⚠️  EDITORIAL_TELEGRAM_CHAT_ID not set — skipping Telegram digest.");
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const json = await res.json() as { ok: boolean; description?: string };

    if (!json.ok) {
      console.warn(`⚠️  Telegram API error: ${json.description ?? "unknown"}`);
    } else {
      console.log("✅  Editorial digest sent to Telegram.");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`⚠️  Failed to send Telegram digest: ${msg}`);
  }
}

// ── Entry point ───────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\n🧠  Editorial Brain Audit — Людський механізм");
  console.log(`    Posts dir  : ${POSTS_DIR}`);
  console.log(`    TG dir     : ${TELEGRAM_DIR}`);
  console.log(`    Time       : ${new Date().toISOString()}\n`);

  const report = buildReport();

  // ── JSON mode: print and exit ──────────────────────────────
  if (JSON_MODE) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // ── Summary mode ───────────────────────────────────────────
  if (SUMMARY_MODE) {
    const s = report.stats;
    console.log(`📊 Stats:`);
    console.log(`   Posts       : ${s.publishedPosts} published, ${s.draftPosts} drafts`);
    console.log(`   Telegram    : ${s.totalTelegramPosts} total, ${s.publishedTelegramPosts} published`);
    console.log(`   After-read  : ${s.afterReadingPosts}`);
    console.log(`   Bridges     : ${s.bridgePosts}`);
    console.log(`   Tags        : ${s.uniqueTags}, avg RT: ${s.avgReadingTime} min`);
    console.log(`\n📭 Without after-reading: ${report.articlesWithoutAfterReading.length}`);
    console.log(`🔍 TG gaps (no source)  : ${report.telegramGaps.noSourceArticle.length}`);
    console.log(`⚠️  Duplicates           : ${report.duplicates.length}`);
  }

  // ── Write files ────────────────────────────────────────────
  [DOCS_DIR, DATA_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const markdown = buildMarkdown(report);
  fs.writeFileSync(AUDIT_MD,   markdown,                     "utf-8");
  fs.writeFileSync(AUDIT_JSON, JSON.stringify(report, null, 2), "utf-8");

  console.log(`📄  Markdown report : ${AUDIT_MD}`);
  console.log(`🗂️  JSON report     : ${AUDIT_JSON}`);

  // ── Telegram digest ────────────────────────────────────────
  if (!NO_TELEGRAM) {
    const digest = buildDigestMessage(report);
    await sendDigest(digest);
  } else {
    console.log("ℹ️   --no-telegram flag set — skipping Telegram send.");
  }

  console.log("\n✅  Editorial audit complete.\n");
}

main().catch(err => {
  console.error("\n💥  Unexpected error:", err);
  process.exit(1);
});
