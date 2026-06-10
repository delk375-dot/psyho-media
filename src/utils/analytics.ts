/**
 * analytics.ts — unified behavioral event tracking
 *
 * Sends events to:
 *   1. Google Analytics 4 (via window.gtag)
 *   2. Microsoft Clarity custom tags (via window.clarity)
 *
 * Import only in browser contexts (Astro <script> blocks).
 * All functions are no-ops if the trackers are not loaded.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    clarity?: (method: string, ...args: any[]) => void;
  }
}

export interface EventParams {
  page_location?: string;
  page_title?: string;
  [key: string]: unknown;
}

// ── Core ──────────────────────────────────────────────────────

/**
 * Fire a GA4 event with automatic page context.
 * Silently no-ops if gtag is not loaded (dev / blocked).
 */
export function trackEvent(name: string, params: EventParams = {}): void {
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, {
        page_location: window.location.href,
        page_title: document.title,
        ...params,
      });
    }
  } catch { /* gtag not loaded */ }
}

/**
 * Set a custom Clarity tag on the current session.
 * Used for session-level segmentation in heatmaps/recordings.
 * Silently no-ops if Clarity is not loaded.
 *
 * @see https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api
 */
export function setClarityTag(key: string, value: string): void {
  try {
    if (typeof window.clarity === "function") {
      window.clarity("set", key, value);
    }
  } catch { /* clarity not loaded */ }
}

// ── Named event helpers ───────────────────────────────────────

/**
 * User clicked any Telegram channel link.
 * @param source  — component origin: "sticky" | "footer" | "exit_intent" |
 *                  "index" | "telegram_page" | "archive" | string
 */
export function trackTelegramClick(source: string): void {
  trackEvent("telegram_click", { source });
  setClarityTag("telegram_source", source);
}

/**
 * User clicked a card in the RelatedTelegramSignals / Післясмак section.
 */
export function trackRelatedSignalClick(params: {
  signal_type?: string;
  signal_tone?: string;
  has_bridge?: boolean;
}): void {
  trackEvent("related_signal_click", params);
}

/**
 * The "Післясмак механізму" section entered the viewport — user saw it.
 */
export function trackAfterReadingOpen(post_slug: string): void {
  trackEvent("after_reading_open", { post_slug });
  setClarityTag("after_reading_seen", "true");
}

/**
 * User entered a search query (min 2 chars).
 * @param query         — sanitised search term
 * @param result_count  — number of results shown (-1 if unknown)
 */
export function trackSearchUsed(query: string, result_count = -1): void {
  trackEvent("search_used", {
    search_term: query.substring(0, 100), // cap length before sending
    result_count,
  });
  setClarityTag("search_used", "true");
}

/**
 * Article scroll depth milestone reached.
 * Fires article_depth_25 / 50 / 75 / 100.
 * Also sets a Clarity session tag for depths ≥ 75 (high-value signal).
 */
export function trackArticleDepth(depth: 25 | 50 | 75 | 100): void {
  trackEvent(`article_depth_${depth}`, { depth_pct: depth });
  if (depth >= 75) {
    setClarityTag("article_depth", String(depth));
  }
}
