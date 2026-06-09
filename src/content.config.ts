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
    type: z.enum([
      "psycho_glitch",
      "short_fragment",
      "dark_observation",
      "article_teaser",
    ]),
    body: z.string().optional(),
    published: z.boolean().default(false),
    publishDate: z.coerce.date().optional().nullable(),
    publishedAt: z.coerce.date().optional().nullable(),
    telegramMessageId: z.number().optional().nullable(),
  }),
});

export const collections = { posts, pages, telegram };
