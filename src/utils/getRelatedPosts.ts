import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";

const normalize = (value: string | undefined) =>
  value ? slugifyStr(value).toLowerCase() : "";

const normalizeList = (values: string[] = []) => values.map(normalize);

const getIdSlug = (id: string) => {
  const segments = id.split("/");
  return segments[segments.length - 1];
};

export function getRelatedPosts(
  currentPost: CollectionEntry<"posts">,
  posts: CollectionEntry<"posts">[],
  limit = 4
) {
  const currentTags = normalizeList(currentPost.data.tags);
  const currentTopics = normalizeList(currentPost.data.topics);
  const explicit = normalizeList([
    ...currentPost.data.relatedPosts,
    ...currentPost.data.recommendedReading,
  ]);

  return posts
    .filter(post => post.id !== currentPost.id && !post.data.draft)
    .map(post => {
      const tags = normalizeList(post.data.tags);
      const topics = normalizeList(post.data.topics);
      const slug = normalize(getIdSlug(post.id));

      let score = 0;
      if (post.data.category && post.data.category === currentPost.data.category) score += 5;
      if (post.data.series && post.data.series === currentPost.data.series) score += 4;
      if (post.data.collection && post.data.collection === currentPost.data.collection) score += 3;
      score += tags.filter(tag => currentTags.includes(tag)).length * 2;
      score += topics.filter(topic => currentTopics.includes(topic)).length * 3;
      if (explicit.includes(slug)) score += 10;

      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}
