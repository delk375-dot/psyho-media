import { getCollection, type CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";

const byPublicationDateDesc = (
  a: CollectionEntry<"posts">,
  b: CollectionEntry<"posts">
) =>
  Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
  Math.floor(new Date(a.data.pubDatetime).getTime() / 1000);

/**
 * Central source for public post lists/routes.
 *
 * A post is public only when:
 * - `draft !== true`
 * - `pubDatetime` is not in the future at build/deploy time
 */
export async function getPublishedPosts() {
  const posts = await getCollection("posts");
  return posts.filter(postFilter).sort(byPublicationDateDesc);
}
