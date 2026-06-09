/**
 * Calculates estimated reading time and word count from raw markdown/text.
 * Ukrainian text: ~200 words per minute.
 */

export function getWordCount(body: string): number {
  return body.trim().split(/\s+/).filter(Boolean).length;
}

export function getReadingTime(body: string): number {
  const words = getWordCount(body);
  return Math.max(1, Math.ceil(words / 200));
}
