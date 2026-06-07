import type { CollectionEntry } from "astro:content";

/**
 * Determines whether a post is eligible to be listed/rendered.
 *
 * - Excludes drafts always
 * - Excludes scheduled posts until `pubDatetime` is reached at build/deploy time
 */
export function postFilter({ data }: CollectionEntry<"posts">) {
  if (data.draft) return false;

  return new Date(data.pubDatetime).getTime() <= Date.now();
}
