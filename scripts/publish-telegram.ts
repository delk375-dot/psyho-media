/**
 * publish-telegram.ts
 * ───────────────────
 * Publishes unpublished Telegram posts from src/content/telegram/ to a Telegram channel.
 *
 * Usage:
 *   pnpm telegram:publish
 *
 * Required env variables:
 *   TELEGRAM_BOT_TOKEN   — bot token from @BotFather
 *   TELEGRAM_CHANNEL_ID  — channel id or @username (e.g. @psyho_media)
 *
 * After a successful publish the script updates the markdown file:
 *   published: true
 *   publishedAt: <ISO timestamp>
 *   telegramMessageId: <message_id from Telegram API>
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// ── Config ────────────────────────────────────────────────────
const SITE_URL = "https://psyho-media.pp.ua";
const TELEGRAM_LANDING_PATH = "/telegram";
const CONTENT_DIR = path.resolve(process.cwd(), "src/content/telegram");

// ── Env validation ────────────────────────────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

if (!BOT_TOKEN) {
  console.error(
    "\n❌  TELEGRAM_BOT_TOKEN is not set.\n" +
    "    Add it to your .env file or export it before running:\n\n" +
    "    export TELEGRAM_BOT_TOKEN=your_token_here\n"
  );
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error(
    "\n❌  TELEGRAM_CHANNEL_ID is not set.\n" +
    "    Add it to your .env file or export it before running:\n\n" +
    "    export TELEGRAM_CHANNEL_ID=@psyho_media\n"
  );
  process.exit(1);
}

// ── Types ─────────────────────────────────────────────────────
interface TelegramPost {
  filePath: string;
  title: string;
  body: string;
  type: string;
  date: Date;
  published: boolean;
  publishedAt: Date | null;
  telegramMessageId: number | null;
}

interface TelegramApiResponse {
  ok: boolean;
  result?: {
    message_id: number;
    [key: string]: unknown;
  };
  description?: string;
}

// ── Helpers ───────────────────────────────────────────────────

/** Read all .md files from content dir, return unpublished ones sorted by date asc */
function loadUnpublishedPosts(): TelegramPost[] {
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

    // Skip already published
    if (data.published === true) continue;

    posts.push({
      filePath,
      title: String(data.title ?? ""),
      body: String(data.body ?? ""),
      type: String(data.type ?? ""),
      date: data.date ? new Date(data.date) : new Date(),
      published: false,
      publishedAt: null,
      telegramMessageId: null,
    });
  }

  // Oldest first — publish in chronological order
  return posts.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Build the message text for Telegram (MarkdownV2 format) */
function buildMessageText(post: TelegramPost): string {
  const readMoreUrl = `${SITE_URL}${TELEGRAM_LANDING_PATH}`;

  // Escape characters that are special in Telegram MarkdownV2
  const escape = (s: string): string =>
    s.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");

  const titleEscaped = escape(post.title);
  const bodyEscaped = post.body ? escape(post.body) : "";
  const urlEscaped = escape(readMoreUrl);

  const parts: string[] = [];
  parts.push(`*${titleEscaped}*`);
  if (bodyEscaped) parts.push(`\n${bodyEscaped}`);
  parts.push(`\n\n[Читати більше](${urlEscaped})`);

  return parts.join("\n");
}

/** Call Telegram Bot API sendMessage */
async function sendToTelegram(text: string): Promise<number> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: false,
    }),
  });

  const json = (await response.json()) as TelegramApiResponse;

  if (!json.ok || !json.result) {
    throw new Error(
      `Telegram API error: ${json.description ?? "unknown error"} (HTTP ${response.status})`
    );
  }

  return json.result.message_id;
}

/** Rewrite the frontmatter of a published file */
function markAsPublished(
  filePath: string,
  messageId: number,
  publishedAt: Date
): void {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);

  parsed.data.published = true;
  parsed.data.publishedAt = publishedAt.toISOString();
  parsed.data.telegramMessageId = messageId;

  // Rebuild file: stringify produces "---\n...\n---\n" + original content
  const updated = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(filePath, updated, "utf-8");
}

/** Delay between posts to respect Telegram rate limits (1 msg/sec safe) */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main ──────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log("\n🤖  Telegram Autopublisher — Людський механізм");
  console.log(`    Channel : ${CHANNEL_ID}`);
  console.log(`    Dir     : ${CONTENT_DIR}\n`);

  // Optional --limit N CLI argument
  const limitArg = process.argv.find(a => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1]!, 10) : Infinity;

  let posts = loadUnpublishedPosts();

  if (isFinite(limit) && limit > 0) {
    posts = posts.slice(0, limit);
    console.log(`ℹ️   Limit: publishing only ${limit} post(s).\n`);
  }

  if (posts.length === 0) {
    console.log("✅  Nothing to publish — all posts are already published.\n");
    return;
  }

  console.log(`📋  Found ${posts.length} unpublished post(s):\n`);
  posts.forEach((p, i) =>
    console.log(`    ${i + 1}. ${path.basename(p.filePath)} — "${p.title}"`)
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

      // Pause 1.2s between messages to avoid hitting Telegram rate limits
      if (posts.indexOf(post) < posts.length - 1) {
        await sleep(1200);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`❌  FAILED — ${message}`);
      console.log(`    File: ${fileName}`);
      failed++;
    }
  }

  console.log(
    `\n📊  Done: ${published} published, ${failed} failed.\n`
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("\n💥  Unexpected error:", err);
  process.exit(1);
});
