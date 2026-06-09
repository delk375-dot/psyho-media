/**
 * publish-telegram.ts
 * ───────────────────
 * Publishes scheduled Telegram posts from src/content/telegram/.
 *
 * Eligibility:
 *   1. published: false
 *   2. publishDate <= now  (falls back to date if publishDate absent)
 *
 * Bridge logic:
 *   - if bridgeTo is set → appends "Механізм:\n{SITE_URL}{bridgeTo}"
 *   - if sourceArticle is set but bridgeTo is absent → warning in logs
 *   - if neither → no footer link
 *
 * Format: Telegram HTML (parse_mode: HTML) — avoids MarkdownV2 escaping issues.
 *
 * Usage:
 *   pnpm telegram:publish           — local, reads .env
 *   pnpm telegram:publish:txt       — local Windows, reads .env.txt
 *   pnpm telegram:publish:ci        — CI, env from environment
 *   pnpm telegram:publish -- --limit=1
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// ── Config ────────────────────────────────────────────────────
const SITE_URL = "https://psyho-media.pp.ua";
const CONTENT_DIR = path.resolve(process.cwd(), "src/content/telegram");

// ── Env validation ────────────────────────────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

if (!BOT_TOKEN) {
  console.error(
    "\n❌  TELEGRAM_BOT_TOKEN is not set.\n" +
    "    Local:  export TELEGRAM_BOT_TOKEN=your_token_here\n" +
    "    CI:     add secret TELEGRAM_BOT_TOKEN to repo Settings → Secrets\n"
  );
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error(
    "\n❌  TELEGRAM_CHANNEL_ID is not set.\n" +
    "    Local:  export TELEGRAM_CHANNEL_ID=@psyho_media\n" +
    "    CI:     add secret TELEGRAM_CHANNEL_ID to repo Settings → Secrets\n"
  );
  process.exit(1);
}

// ── Types ─────────────────────────────────────────────────────
interface TelegramPost {
  filePath: string;
  title: string;
  body: string;
  type: string;
  tone: string;
  date: Date;
  publishDate: Date;
  bridgeTo: string | null;
  sourceArticle: string | null;
  isTelegramOnly: boolean;
}

interface TelegramApiResponse {
  ok: boolean;
  result?: { message_id: number; [key: string]: unknown };
  description?: string;
}

// ── Helpers ───────────────────────────────────────────────────

/** Escape HTML special chars for Telegram HTML parse mode */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build Telegram message in HTML format.
 * Format (signal style):
 *   <b>Title</b>\n\nBody\n\nМеханізм:\n{url}
 */
function buildMessageText(post: TelegramPost): string {
  const parts: string[] = [];

  parts.push(`<b>${escapeHtml(post.title)}</b>`);

  if (post.body.trim()) {
    parts.push(`\n${escapeHtml(post.body.trim())}`);
  }

  if (post.bridgeTo) {
    const url = `${SITE_URL}${post.bridgeTo}`;
    parts.push(`\nМеханізм:\n${url}`);
  }

  return parts.join("\n");
}

/**
 * Load eligible posts: published === false AND publishDate <= now.
 * Warns if sourceArticle set but bridgeTo missing.
 */
function loadEligiblePosts(now: Date): TelegramPost[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`\n❌  Content directory not found: ${CONTENT_DIR}\n`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith(".md") && !f.startsWith("_"))
    .map(f => path.join(CONTENT_DIR, f));

  const posts: TelegramPost[] = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    if (data.published === true) continue;

    const date: Date = data.date ? new Date(data.date) : new Date();
    const publishDate: Date = data.publishDate ? new Date(data.publishDate) : date;

    if (publishDate > now) {
      console.log(
        `  ⏳ Skipping "${data.title}" — scheduled for ${publishDate.toISOString()}`
      );
      continue;
    }

    const bridgeTo: string | null = data.bridgeTo ?? null;
    const sourceArticle: string | null = data.sourceArticle ?? null;

    if (sourceArticle && !bridgeTo) {
      console.warn(
        `  ⚠️  "${data.title}" has sourceArticle="${sourceArticle}" but no bridgeTo. ` +
        `No link will be appended.`
      );
    }

    posts.push({
      filePath,
      title: String(data.title ?? ""),
      body: String(data.body ?? ""),
      type: String(data.type ?? "signal"),
      tone: String(data.tone ?? "atmospheric"),
      date,
      publishDate,
      bridgeTo,
      sourceArticle,
      isTelegramOnly: data.isTelegramOnly !== false,
    });
  }

  return posts.sort((a, b) => a.publishDate.getTime() - b.publishDate.getTime());
}

/** POST to Telegram Bot API */
async function sendToTelegram(text: string): Promise<number> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
      link_preview_options: { is_disabled: false },
    }),
  });

  const json = (await response.json()) as TelegramApiResponse;

  if (!json.ok || !json.result) {
    throw new Error(
      `Telegram API error: ${json.description ?? "unknown"} (HTTP ${response.status})`
    );
  }

  return json.result.message_id;
}

/** Update frontmatter after successful publish */
function markAsPublished(filePath: string, messageId: number, publishedAt: Date): void {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);

  parsed.data.published = true;
  parsed.data.publishedAt = publishedAt.toISOString();
  parsed.data.telegramMessageId = messageId;

  fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data), "utf-8");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main ──────────────────────────────────────────────────────
async function main(): Promise<void> {
  const now = new Date();

  console.log("\n🤖  Telegram Autopublisher — Людський механізм");
  console.log(`    Channel : ${CHANNEL_ID}`);
  console.log(`    Dir     : ${CONTENT_DIR}`);
  console.log(`    Now     : ${now.toISOString()}\n`);

  const limitArg = process.argv.find(a => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1]!, 10) : Infinity;

  let posts = loadEligiblePosts(now);

  if (isFinite(limit) && limit > 0) {
    posts = posts.slice(0, limit);
    console.log(`ℹ️   Limit: publishing only ${limit} post(s).\n`);
  }

  if (posts.length === 0) {
    console.log("✅  Nothing to publish — no eligible posts at this time.\n");
    process.exit(0);
  }

  console.log(`📋  Found ${posts.length} eligible post(s):\n`);
  posts.forEach((p, i) =>
    console.log(
      `    ${i + 1}. ${path.basename(p.filePath)} — "${p.title}"` +
      (p.bridgeTo ? ` [bridge → ${p.bridgeTo}]` : "") +
      (p.sourceArticle && !p.bridgeTo ? ` [⚠️ sourceArticle without bridgeTo]` : "")
    )
  );
  console.log();

  let published = 0;
  let failed = 0;

  for (const post of posts) {
    const fileName = path.basename(post.filePath);
    process.stdout.write(`  → Publishing "${post.title}" ... `);

    try {
      const text = buildMessageText(post);
      const messageId = await sendToTelegram(text);
      const publishedAt = new Date();

      markAsPublished(post.filePath, messageId, publishedAt);
      console.log(`✅  message_id: ${messageId}`);
      published++;

      if (posts.indexOf(post) < posts.length - 1) {
        await sleep(1200);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌  FAILED — ${message}`);
      console.error(`    File: ${fileName}`);
      failed++;
    }
  }

  console.log(`\n📊  Done: ${published} published, ${failed} failed.\n`);

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error("\n💥  Unexpected error:", err);
  process.exit(1);
});
