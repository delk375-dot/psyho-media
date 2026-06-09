/**
 * getRelatedPosts — Semantic Recommendation Engine
 * ─────────────────────────────────────────────────
 * Scores candidate posts against a current post using multiple signals:
 *   explicit references, category, series, topics, tags, contentType,
 *   title keyword overlap, and optional body keyword overlap.
 *
 * Falls back to recent same-category (or global) posts when no strong
 * semantic match is found.
 *
 * SCORING TABLE
 * ─────────────────────────────────────────────────────────────
 *  Signal                                        Points
 *  ─────────────────────────────────────────     ──────
 *  Explicit relatedPosts / recommendedReading    +10 each
 *  Same category                                 +5
 *  Same series                                   +4
 *  Shared topics (per topic)                     +3
 *  Same collection                               +3
 *  Shared tags (per tag)                         +2
 *  Same contentType                              +2
 *  Title keyword overlap (per word, max +5)      +1
 *  Body keyword overlap (per 8 words, max +3)    +1
 * ─────────────────────────────────────────────────────────────
 */
import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";

// ─── Stop words ─────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "і", "та", "або", "але", "що", "як", "це", "не", "на", "в", "у",
  "до", "з", "за", "по", "від", "під", "над", "між", "про", "при",
  "він", "вона", "воно", "вони", "ми", "ви", "я", "ти", "свій",
  "свою", "його", "її", "їх", "нас", "вас", "мене", "тебе",
  "коли", "де", "куди", "звідки", "хто", "чому", "навіщо",
  "той", "ті", "цей", "ця", "ці", "цьому",
  "так", "ні", "же", "ж", "би", "б", "лише", "тільки", "навіть",
  "вже", "ще", "теж", "також", "потім", "тому", "тоді",
  "дуже", "більш", "менш", "зовсім", "майже", "просто",
  "можна", "треба", "буде", "були", "була", "бути", "має",
  "нема", "немає", "якщо", "хоча", "після", "перед",
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "of",
  "is", "it", "its", "this", "that", "was", "are", "be", "been",
]);

// ─── Tokenizer ───────────────────────────────────────────────────────────────

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[«»""''.,!?;:()\[\]{}\-—–_\/\\|@#$%^&*+=<>~`\d]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
  );
}

// ─── Similarity helpers ──────────────────────────────────────────────────────

const MAX_TITLE_BONUS = 5;

function titleKeywordOverlap(a: string, b: string): number {
  const tokA = tokenize(a);
  const tokB = tokenize(b);
  let count = 0;
  for (const t of tokA) {
    if (tokB.has(t)) count++;
  }
  return Math.min(count, MAX_TITLE_BONUS);
}

const MAX_BODY_BONUS = 3;

function bodyKeywordOverlap(bodyA: string, bodyB: string): number {
  if (!bodyA || !bodyB) return 0;
  const tokA = tokenize(bodyA);
  const tokB = tokenize(bodyB);
  let count = 0;
  for (const t of tokA) {
    if (tokB.has(t)) count++;
  }
  return Math.min(MAX_BODY_BONUS, Math.floor(count / 8));
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

const normalize = (value: string | undefined) =>
  value ? slugifyStr(value).toLowerCase() : "";

const normalizeList = (values: string[] = []) => values.map(normalize);

const getIdSlug = (id: string) => {
  const segments = id.split("/");
  return segments[segments.length - 1];
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScoredPost {
  post: CollectionEntry<"posts">;
  score: number;
}

export interface GetRelatedPostsOptions {
  /** Include body keyword similarity. @default true */
  useBodySimilarity?: boolean;
  /** Min score before fallback kicks in. @default 1 */
  minScore?: number;
}

const FALLBACK_THRESHOLD = 2;

// ─── Main export ─────────────────────────────────────────────────────────────

export function getRelatedPosts(
  currentPost: CollectionEntry<"posts">,
  posts: CollectionEntry<"posts">[],
  limit = 4,
  options: GetRelatedPostsOptions = {}
): CollectionEntry<"posts">[] {
  const { useBodySimilarity = true, minScore = 1 } = options;

  const currentTags = normalizeList(currentPost.data.tags);
  const currentTopics = normalizeList(currentPost.data.topics);
  const explicit = normalizeList([
    ...currentPost.data.relatedPosts,
    ...currentPost.data.recommendedReading,
  ]);

  const candidates = posts.filter(
    post => post.id !== currentPost.id && !post.data.draft
  );

  const scored: ScoredPost[] = candidates.map(post => {
    const tags = normalizeList(post.data.tags);
    const topics = normalizeList(post.data.topics);
    const slug = normalize(getIdSlug(post.id));

    let score = 0;

    if (explicit.includes(slug)) score += 10;
    if (post.data.category && post.data.category === currentPost.data.category) score += 5;
    if (post.data.series && post.data.series === currentPost.data.series) score += 4;
    if (post.data.collection && post.data.collection === currentPost.data.collection) score += 3;
    score += tags.filter(t => currentTags.includes(t)).length * 2;
    score += topics.filter(t => currentTopics.includes(t)).length * 3;
    if (post.data.contentType && post.data.contentType === currentPost.data.contentType) score += 2;
    score += titleKeywordOverlap(post.data.title, currentPost.data.title);
    if (useBodySimilarity) {
      score += bodyKeywordOverlap(post.body ?? "", currentPost.body ?? "");
    }

    return { post, score };
  });

  const qualified = scored
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);

  // Fallback: not enough strong matches — pad with recent same-category, then global
  if (qualified.length < Math.min(limit, FALLBACK_THRESHOLD)) {
    const usedIds = new Set([currentPost.id, ...qualified.map(p => p.id)]);

    const sameCat = candidates
      .filter(p => !usedIds.has(p.id) && p.data.category === currentPost.data.category)
      .slice(0, limit - qualified.length);

    sameCat.forEach(p => usedIds.add(p.id));

    const stillNeed = limit - qualified.length - sameCat.length;
    const global = stillNeed > 0
      ? candidates.filter(p => !usedIds.has(p.id)).slice(0, stillNeed)
      : [];

    return [...qualified, ...sameCat, ...global];
  }

  return qualified;
}

/** Return posts with their scores attached — useful for debugging. */
export function getScoredRelatedPosts(
  currentPost: CollectionEntry<"posts">,
  posts: CollectionEntry<"posts">[],
  limit = 6,
  options: GetRelatedPostsOptions = {}
): ScoredPost[] {
  const { useBodySimilarity = true, minScore = 1 } = options;

  const currentTags = normalizeList(currentPost.data.tags);
  const currentTopics = normalizeList(currentPost.data.topics);
  const explicit = normalizeList([
    ...currentPost.data.relatedPosts,
    ...currentPost.data.recommendedReading,
  ]);

  const candidates = posts.filter(
    post => post.id !== currentPost.id && !post.data.draft
  );

  return candidates
    .map(post => {
      const tags = normalizeList(post.data.tags);
      const topics = normalizeList(post.data.topics);
      const slug = normalize(getIdSlug(post.id));

      let score = 0;
      if (explicit.includes(slug)) score += 10;
      if (post.data.category === currentPost.data.category) score += 5;
      if (post.data.series && post.data.series === currentPost.data.series) score += 4;
      if (post.data.collection && post.data.collection === currentPost.data.collection) score += 3;
      score += tags.filter(t => currentTags.includes(t)).length * 2;
      score += topics.filter(t => currentTopics.includes(t)).length * 3;
      if (post.data.contentType === currentPost.data.contentType) score += 2;
      score += titleKeywordOverlap(post.data.title, currentPost.data.title);
      if (useBodySimilarity) {
        score += bodyKeywordOverlap(post.body ?? "", currentPost.body ?? "");
      }
      return { post, score };
    })
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
