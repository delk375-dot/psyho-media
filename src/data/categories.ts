const CATEGORY_SLUG_VALUES = [
  "leadership",
  "social-systems",
  "negotiations",
  "manipulation",
  "legal-psychology",
  "conflicts",
  "communication",
  "status-and-power",
  "organizational-psychology",
  "toxic-politeness",
  "social-elevators",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUG_VALUES)[number];

export const CATEGORY_SLUGS = [...CATEGORY_SLUG_VALUES] as [
  CategorySlug,
  ...CategorySlug[],
];

export const CATEGORIES = [
  {
    slug: "leadership",
    title: "Лідерство",
    description:
      "Рішення, відповідальність, влада і поведінка керівника під тиском.",
    intent: "executive-leadership",
    keywords: ["лідерство", "керівники", "управління", "відповідальність"],
    hubs: ["psychology-of-power", "negotiation-anatomy"],
  },
  {
    slug: "social-systems",
    title: "Соціальні системи",
    description:
      "Інституції, групова динаміка, ієрархії, норми та суспільна довіра.",
    intent: "systems-thinking",
    keywords: ["соціальні системи", "ієрархії", "норми", "інституції"],
    hubs: ["social-elevators", "psychology-of-power"],
  },
  {
    slug: "negotiations",
    title: "Переговори",
    description:
      "Стратегії впливу, позиційні конфлікти, рамки домовленостей і межі.",
    intent: "negotiation-strategy",
    keywords: ["переговори", "вплив", "інтереси", "домовленості"],
    hubs: ["negotiation-anatomy"],
  },
  {
    slug: "manipulation",
    title: "Маніпуляції",
    description:
      "Розбір прихованого тиску, пропаганди, газлайтингу та захисту автономії.",
    intent: "influence-defense",
    keywords: ["маніпуляції", "газлайтинг", "тиск", "пропаганда"],
    hubs: ["psychology-of-power", "toxic-politeness"],
  },
  {
    slug: "legal-psychology",
    title: "Правова психологія",
    description:
      "Поведінка людей у правових конфліктах, доказах, свідченнях і відповідальності.",
    intent: "legal-behavior",
    keywords: ["правова психологія", "конфлікти", "докази", "відповідальність"],
    hubs: ["legal-psychology"],
  },
  {
    slug: "conflicts",
    title: "Конфлікти",
    description:
      "Діагностика ескалації, інтересів, ролей, меж і прихованих вигод сторін.",
    intent: "conflict-diagnostics",
    keywords: ["конфлікти", "ескалація", "межі", "діагностика"],
    hubs: ["negotiation-anatomy", "legal-psychology"],
  },
  {
    slug: "communication",
    title: "Комунікація",
    description:
      "Мова влади, точність повідомлень, управлінські розмови і довіра.",
    intent: "executive-communication",
    keywords: ["комунікація", "довіра", "розмови", "управління"],
    hubs: ["toxic-politeness", "negotiation-anatomy"],
  },
  {
    slug: "status-and-power",
    title: "Статус і влада",
    description:
      "Невидимі ранги, символічний капітал, страх, контроль і легітимність.",
    intent: "power-analysis",
    keywords: ["статус", "влада", "ранги", "легітимність"],
    hubs: ["psychology-of-power", "social-elevators"],
  },
  {
    slug: "organizational-psychology",
    title: "Організаційна психологія",
    description:
      "Поведінка команд, культура, саботаж, лояльність, мотивація і структура рішень.",
    intent: "organizational-behavior",
    keywords: ["організаційна психологія", "команди", "культура", "саботаж"],
    hubs: ["psychology-of-power", "toxic-politeness"],
  },
  {
    slug: "toxic-politeness",
    title: "Токсична ввічливість",
    description:
      "Коли ввічливість маскує страх, уникання, пасивну агресію і системний саботаж.",
    intent: "communication-risk",
    keywords: ["токсична ввічливість", "пасивна агресія", "уникання", "страх"],
    hubs: ["toxic-politeness"],
  },
  {
    slug: "social-elevators",
    title: "Соціальні ліфти",
    description:
      "Як люди, групи і статусні механізми піднімають або блокують рух у системі.",
    intent: "mobility-systems",
    keywords: ["соціальні ліфти", "кар'єра", "статус", "меритократія"],
    hubs: ["social-elevators"],
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
