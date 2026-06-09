import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";
import { CATEGORY_SLUGS } from "@/data/categories";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      metaTitle: z.string().optional(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      category: z.enum(CATEGORY_SLUGS).optional(),
      tags: z.array(z.string()).default(["others"]),
      topics: z.array(z.string()).default([]),
      series: z.string().optional(),
      collection: z.string().optional(),
      contentType: z
        .enum([
          "article",
          "viral_note",
          "deep_analysis",
          "pillar_article",
          "psychological_fragment",
          "case",
          "glossary",
          "framework",
          "psychological_fairytale",
          "social_bug",
          "human_scenario",
          "dark_mechanism",
          "behavior_lab",
        ])
        .default("article"),
      relatedPosts: z.array(z.string()).default([]),
      recommendedReading: z.array(z.string()).default([]),
      cta: z
        .enum([
          "individual-consultation",
          "relationship-review",
          "communication-audit",
          "conflict-diagnostics",
          "breakup-coaching",
          "money-anxiety-work",
        ])
        .optional(),
      cover: z.string().optional(),
      ogImage: z.string().or(image()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

const telegram = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/telegram" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),

    /** Content type — what kind of signal this is */
    type: z.enum([
      "signal",
      "bridge",
      "question",
      "fragment",
      "case",
      "teaser",
    ]).default("signal"),

    /** Tone of the post */
    tone: z.enum([
      "atmospheric",
      "dark",
      "ironic",
      "analytical",
      "provocative",
      "calm",
    ]).default("atmospheric"),

    /** Optional path to a site article this post leads to, e.g. /posts/some-slug/ */
    bridgeTo: z.string().optional().nullable(),

    /** Slug or path of the site article this signal was born from */
    sourceArticle: z.string().optional().nullable(),

    /** True = Telegram-only content, not a site article */
    isTelegramOnly: z.boolean().default(true),

    /** Content layer classification */
    contentLayer: z.enum([
      "signal",
      "bridge",
      "archive",
      "teaser",
    ]).default("signal"),

    /** Main text body of the post */
    body: z.string().optional(),

    published: z.boolean().default(false),
    publishDate: z.coerce.date().optional().nullable(),
    publishedAt: z.coerce.date().optional().nullable(),
    telegramMessageId: z.union([z.number(), z.string()]).optional().nullable(),
  }),
});

export const collections = { posts, pages, telegram };
