import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://delk375-dot.github.io/leader-blog/",
    title: "Тіньова карта",
    description:
      "Інтелектуальна платформа про переговори, владу, соціальні механіки, статус, конфлікти та прихований вплив.",
    author: "Тіньова карта Editorial",
    profile: "https://github.com/delk375-dot/leader-blog",
    ogImage: "default-og.jpg",
    lang: "uk",
    timezone: "Europe/Kyiv",
    dir: "ltr",
  },
  posts: {
    perPage: 6,
    perIndex: 6,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/delk375-dot/leader-blog/edit/main/",
    },
    search: "pagefind",
  },
  socials: [],
  shareLinks: [
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "linkedin", url: "https://www.linkedin.com/shareArticle?mini=true&url=" },
    { name: "mail", url: "mailto:?subject=%D0%A2%D1%96%D0%BD%D1%8C%D0%BE%D0%B2%D0%B0%20%D0%BA%D0%B0%D1%80%D1%82%D0%B0&body=" },
  ],
});