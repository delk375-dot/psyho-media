import type { CategorySlug } from "./categories";

export type ContentFormatSlug =
  | "viral_note"
  | "deep_analysis"
  | "pillar_article"
  | "psychological_fragment"
  | "psychological_fairytale"
  | "social_bug"
  | "human_scenario"
  | "dark_mechanism"
  | "behavior_lab";

export const CONTENT_FORMATS: Record<
  ContentFormatSlug,
  {
    label: string;
    shortLabel: string;
    description: string;
    range: string;
  }
> = {
  viral_note: {
    label: "Психологічна замітка",
    shortLabel: "Замітка",
    description: "Коротка психологічна замітка, яка чіпляє одну болючу ситуацію.",
    range: "2 000-5 000 знаків",
  },
  deep_analysis: {
    label: "Глибокий розбір",
    shortLabel: "Розбір",
    description: "Середній розбір механізму поведінки, конфлікту або стосунків.",
    range: "7 000-12 000 знаків",
  },
  pillar_article: {
    label: "Фундаментальний розбір",
    shortLabel: "Фундамент",
    description: "Фундаментальний матеріал для SEO, AI search і topic clusters.",
    range: "15 000-40 000+ знаків",
  },
  psychological_fragment: {
    label: "Психологічний фрагмент",
    shortLabel: "Фрагмент",
    description: "Короткий сильний психологічний фрагмент або парадокс.",
    range: "300-1 200 знаків",
  },
  psychological_fairytale: {
    label: "Психологічна казка",
    shortLabel: "Казка",
    description: "Метафорична притча. Мудрість через сюжет, архетипи і образи.",
    range: "3 000-8 000 знаків",
  },
  social_bug: {
    label: "Соціальний баг",
    shortLabel: "Баг",
    description: "Іронічний розбір людського глюку. Сміх + впізнавання.",
    range: "2 000-5 000 знаків",
  },
  human_scenario: {
    label: "Людський сценарій",
    shortLabel: "Сценарій",
    description: "Психологія через сюжет. Реальні ситуації з емоційною напругою.",
    range: "4 000-10 000 знаків",
  },
  dark_mechanism: {
    label: "Темний механізм",
    shortLabel: "Механізм",
    description: "Прихований контроль, емоційний жах і темні патерни поведінки.",
    range: "4 000-10 000 знаків",
  },
  behavior_lab: {
    label: "Лабораторія поведінки",
    shortLabel: "Лаб",
    description: "Реальні дослідження і поведінкова наука без академічної сухості.",
    range: "5 000-12 000 знаків",
  },
};

export const SEARCH_QUERIES: ReadonlyArray<{
  question: string;
  href: string;
  category: CategorySlug;
}> = [
  {
    question: "Чому люди зникають?",
    href: "/categories/silence-ghosting/",
    category: "silence-ghosting",
  },
  {
    question: "Чому мене ігнорують?",
    href: "/categories/silence-ghosting/",
    category: "silence-ghosting",
  },
  {
    question: "Чому хороших не хочуть?",
    href: "/categories/relationships/",
    category: "relationships",
  },
  {
    question: "Чому після близькості стає холодно?",
    href: "/categories/sex-attraction/",
    category: "sex-attraction",
  },
  {
    question: "Чому люди ревнують?",
    href: "/categories/jealousy/",
    category: "jealousy",
  },
  {
    question: "Чому токсичні люди здаються сильними?",
    href: "/categories/toxic-people/",
    category: "toxic-people",
  },
  {
    question: "Чому люди маніпулюють мовчанням?",
    href: "/topics/manipulation-and-control/",
    category: "manipulation",
  },
  {
    question: "Чому гроші викликають сором?",
    href: "/categories/money-status/",
    category: "money-status",
  },
  {
    question: "Чому люди повертаються після розриву?",
    href: "/topics/attachment-and-distance/",
    category: "emotional-dependence",
  },
  {
    question: "Чому люди бояться конфліктів?",
    href: "/categories/conflicts/",
    category: "conflicts",
  },
];

export const TOPIC_CLUSTERS: ReadonlyArray<{
  title: string;
  description: string;
  categories: CategorySlug[];
  href: string;
}> = [
  {
    title: "Стосунки і дистанція",
    description: "Зникнення, холод, близькість, розриви і страх бути непотрібним.",
    categories: ["relationships", "silence-ghosting", "emotional-dependence"],
    href: "/topics/attachment-and-distance/",
  },
  {
    title: "Маніпуляції і мовчання",
    description: "Газлайтинг, провина, тиск, ігнор і контроль без прямої вимоги.",
    categories: ["manipulation", "toxic-people", "silence-ghosting"],
    href: "/topics/manipulation-and-control/",
  },
  {
    title: "Ревнощі і страх втрати",
    description: "Порівняння, власність, тривога і бажання контролювати любов.",
    categories: ["jealousy", "relationships", "emotional-dependence"],
    href: "/categories/jealousy/",
  },
  {
    title: "Гроші, сором і статус",
    description: "Чому гроші стають доказом цінності, безпеки або поразки.",
    categories: ["money-status", "self-worth", "sex-attraction"],
    href: "/topics/money-shame-status/",
  },
];

export const getFormatMeta = (contentType: string | undefined) =>
  CONTENT_FORMATS[contentType as ContentFormatSlug];

export const getClustersForCategory = (category: string | undefined) =>
  TOPIC_CLUSTERS.filter(cluster =>
    cluster.categories.includes(category as CategorySlug)
  );
