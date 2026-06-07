import type { CollectionEntry } from "astro:content";
import config from "@/config";

/**
 * Determines whether a post is eligible to be listed/rendered.
 *
 * - Excludes drafts always
 * - Featured and pillar articles are canonical knowledge-base assets and should
 *   be visible immediately once committed
 * - In production, excludes scheduled ordinary posts until `pubDatetime`
 *   minus the configured margin
 * - In dev, always shows non-draft posts to make authoring easier
 */
export function postFilter({ data }: CollectionEntry<"posts">) {
  if (data.draft) return false;
  if (data.featured || data.contentType === "pillar_article") return true;

  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - config.posts.scheduledPostMargin;
  return import.meta.env.DEV || isPublishTimePassed;
}
