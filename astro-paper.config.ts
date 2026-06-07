import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://psyho-media.pages.dev/",
    title: "Людський механізм",
    description:
      "Масове психологічне медіа про стосунки, ревнощі, зради, маніпуляції, токсичних людей, гроші, секс, конфлікти і приховані мотиви поведінки.",
    author: "Людський механізм Editorial",
    profile: "https://github.com/delk375-dot/psyho-media",
    ogImage: "default-og.svg",
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
      url: "https://github.com/delk375-dot/psyho-media/edit/main/",
    },
    search: "pagefind",
  },
  socials: [],
  shareLinks: [
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "linkedin", url: "https://www.linkedin.com/shareArticle?mini=true&url=" },
    { name: "mail", url: "mailto:?subject=%D0%9B%D1%8E%D0%B4%D1%81%D1%8C%D0%BA%D0%B8%D0%B9%20%D0%BC%D0%B5%D1%85%D0%B0%D0%BD%D1%96%D0%B7%D0%BC&body=" },
  ],
});
