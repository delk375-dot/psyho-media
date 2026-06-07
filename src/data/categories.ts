const CATEGORY_SLUG_VALUES = [
  "relationships",
  "betrayal",
  "manipulation",
  "toxic-people",
  "jealousy",
  "sex-attraction",
  "money-status",
  "emotional-dependence",
  "conflicts",
  "self-worth",
  "family",
  "silence-ghosting",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUG_VALUES)[number];

export const CATEGORY_SLUGS = [...CATEGORY_SLUG_VALUES] as [
  CategorySlug,
  ...CategorySlug[],
];

export const CATEGORIES = [
  {
    slug: "relationships",
    title: "Стосунки",
    description:
      "Любов, близькість, дистанція, розриви, мовчання і прихована боротьба за увагу.",
    intent: "relationship-psychology",
    keywords: ["стосунки", "близькість", "розриви", "увага"],
    hubs: ["relationship-dramas", "attachment-and-distance"],
  },
  {
    slug: "betrayal",
    title: "Зради",
    description:
      "Чому люди зраджують, приховують, повертаються і руйнують довіру.",
    intent: "betrayal-patterns",
    keywords: ["зрада", "довіра", "брехня", "повернення"],
    hubs: ["relationship-dramas", "attachment-and-distance"],
  },
  {
    slug: "manipulation",
    title: "Маніпуляції",
    description:
      "Газлайтинг, емоційний тиск, провина, сором, мовчання і прихований контроль.",
    intent: "manipulation-detection",
    keywords: ["маніпуляція", "газлайтинг", "провина", "контроль"],
    hubs: ["manipulation-and-control", "conflict-lab"],
  },
  {
    slug: "toxic-people",
    title: "Токсичні люди",
    description:
      "Нарцисичність, пасивна агресія, знецінення, холодність і соціальна жорстокість.",
    intent: "toxic-patterns",
    keywords: ["токсичні люди", "нарцисичність", "знецінення", "холодність"],
    hubs: ["manipulation-and-control", "conflict-lab"],
  },
  {
    slug: "jealousy",
    title: "Ревнощі",
    description:
      "Страх втрати, контроль, порівняння, власність і тривога у стосунках.",
    intent: "jealousy-control",
    keywords: ["ревнощі", "контроль", "страх втрати", "порівняння"],
    hubs: ["relationship-dramas", "attachment-and-distance"],
  },
  {
    slug: "sex-attraction",
    title: "Секс і потяг",
    description:
      "Бажання, охолодження, сексуальна влада, сором, фантазії і втрата інтересу.",
    intent: "desire-psychology",
    keywords: ["секс", "потяг", "бажання", "охолодження"],
    hubs: ["sex-desire-status", "attachment-and-distance"],
  },
  {
    slug: "money-status",
    title: "Гроші і статус",
    description:
      "Грошова тривога, сором бідності, демонстрація успіху і статусна конкуренція.",
    intent: "money-anxiety",
    keywords: ["гроші", "статус", "сором бідності", "тривога"],
    hubs: ["money-shame-status", "self-worth-lab"],
  },
  {
    slug: "emotional-dependence",
    title: "Емоційна залежність",
    description:
      "Чому люди тримаються за тих, хто їх ранить, і бояться втратити навіть погані стосунки.",
    intent: "attachment-dependence",
    keywords: ["емоційна залежність", "прив'язаність", "страх втрати", "болючі стосунки"],
    hubs: ["attachment-and-distance", "self-worth-lab"],
  },
  {
    slug: "conflicts",
    title: "Конфлікти",
    description:
      "Сварки, мовчазні війни, образи, ескалація і приховані причини протистояння.",
    intent: "everyday-conflicts",
    keywords: ["конфлікти", "сварки", "образи", "ескалація"],
    hubs: ["conflict-lab", "relationship-dramas"],
  },
  {
    slug: "self-worth",
    title: "Самооцінка",
    description:
      "Сором, невпевненість, страх бути непотрібним і залежність від чужої оцінки.",
    intent: "self-worth-patterns",
    keywords: ["самооцінка", "сором", "невпевненість", "оцінка"],
    hubs: ["self-worth-lab", "money-shame-status"],
  },
  {
    slug: "family",
    title: "Родина",
    description:
      "Батьки, діти, родинні сценарії, провина, контроль і старі образи.",
    intent: "family-scripts",
    keywords: ["родина", "батьки", "провина", "контроль"],
    hubs: ["family-scripts", "self-worth-lab"],
  },
  {
    slug: "silence-ghosting",
    title: "Мовчання й ігнор",
    description:
      "Чому люди зникають, не відповідають, карають тишею і залишають інших у невизначеності.",
    intent: "silence-and-ghosting",
    keywords: ["ігнор", "мовчання", "ghosting", "невизначеність"],
    hubs: ["attachment-and-distance", "manipulation-and-control"],
  },
] satisfies ReadonlyArray<{
  slug: CategorySlug;
  title: string;
  description: string;
  intent: string;
  keywords: string[];
  hubs: string[];
}>;

export const getCategoryBySlug = (slug: string | undefined) =>
  CATEGORIES.find(category => category.slug === slug);
