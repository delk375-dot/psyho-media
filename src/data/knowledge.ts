import type { CategorySlug } from "./categories";

type TopicHubDefinition = {
  slug: string;
  title: string;
  ukrainianTitle: string;
  description: string;
  categories: CategorySlug[];
  featured: boolean;
  starterQuestions: string[];
};

export const TOPIC_HUBS = [
  {
    slug: "psychology-of-power",
    title: "Психологія влади",
    ukrainianTitle: "Психологія влади",
    description:
      "Як влада змінює мислення, комунікацію, страх, межі і відповідальність керівників.",
    categories: ["leadership", "status-and-power", "manipulation", "organizational-psychology"],
    featured: true,
    starterQuestions: [
      "Чому сильних керівників бояться?",
      "Як влада змінює етику рішення?",
      "Де межа між авторитетом і тиском?",
    ],
  },
  {
    slug: "social-elevators",
    title: "Соціальні ліфти",
    ukrainianTitle: "Соціальні ліфти",
    description:
      "Механізми статусного руху: кар'єра, доступ, репутація, закриті клуби і символічний капітал.",
    categories: ["social-systems", "social-elevators", "status-and-power"],
    featured: true,
    starterQuestions: [
      "Хто вирішує, кого піднімати?",
      "Чому компетентність не завжди стає статусом?",
      "Як системи блокують нових гравців?",
    ],
  },
  {
    slug: "negotiation-anatomy",
    title: "Анатомія переговорів",
    ukrainianTitle: "Анатомія переговорів",
    description:
      "Розбір переговорів як системи влади, інтересів, страхів, меж і прихованих ставок.",
    categories: ["negotiations", "conflicts", "communication", "leadership"],
    featured: true,
    starterQuestions: [
      "Що сторона насправді захищає?",
      "Де позиція маскує страх?",
      "Яка ціна поганої домовленості?",
    ],
  },
  {
    slug: "toxic-politeness",
    title: "Токсична ввічливість",
    ukrainianTitle: "Токсична ввічливість",
    description:
      "Коли чемність стає інструментом уникання, пасивної агресії і легального саботажу.",
    categories: ["toxic-politeness", "communication", "organizational-psychology", "manipulation"],
    featured: true,
    starterQuestions: [
      "Коли ввічливість стає брехнею?",
      "Як пасивна агресія виживає в офіційній мові?",
      "Чому команди плутають комфорт із довірою?",
    ],
  },
  {
    slug: "legal-psychology",
    title: "Правова психологія",
    ukrainianTitle: "Правова психологія",
    description:
      "Поведінка людей у юридичних конфліктах: свідчення, тиск, відповідальність, довіра і ризик.",
    categories: ["legal-psychology", "conflicts", "manipulation", "communication"],
    featured: true,
    starterQuestions: [
      "Як люди поводяться під юридичним ризиком?",
      "Чому свідчення змінюються під тиском?",
      "Як психологія впливає на правову позицію?",
    ],
  },
] satisfies ReadonlyArray<TopicHubDefinition>;

export type TopicHubSlug = (typeof TOPIC_HUBS)[number]["slug"];

export const COLLECTIONS = [
  {
    slug: "executive-psychology",
    title: "Психологія керівника",
    description:
      "Pillar-матеріали про владу, переговори, статус, конфлікти і поведінку соціальних систем для керівників.",
    hubs: ["psychology-of-power", "negotiation-anatomy"],
  },
  {
    slug: "executive-power-field-guide",
    title: "Польовий гід із влади для керівників",
    description:
      "Практичні матеріали для керівників про владу, межі, комунікацію і системний тиск.",
    hubs: ["psychology-of-power", "negotiation-anatomy"],
  },
  {
    slug: "systems-and-status",
    title: "Системи і статус",
    description:
      "Колекція про соціальні системи, статус, ліфти, блокування і репутаційні механізми.",
    hubs: ["social-elevators", "psychology-of-power"],
  },
] as const;

export const GLOSSARY_TERMS = [
  {
    slug: "symbolic-power",
    title: "Символічна влада",
    description:
      "Здатність задавати рамку реальності так, щоб інші сприймали її як природну.",
    categories: ["status-and-power", "social-systems"],
  },
  {
    slug: "passive-aggression",
    title: "Пасивна агресія",
    description:
      "Прихований опір, який формально виглядає ввічливо або нейтрально.",
    categories: ["toxic-politeness", "communication"],
  },
  {
    slug: "status-anxiety",
    title: "Статусна тривога",
    description:
      "Страх втрати рангу, доступу або визнання в групі чи організації.",
    categories: ["status-and-power", "social-elevators"],
  },
  {
    slug: "conflict-escalation",
    title: "Ескалація конфлікту",
    description:
      "Перехід від проблеми до боротьби за контроль, образ, статус або безпеку.",
    categories: ["conflicts", "negotiations"],
  },
] satisfies ReadonlyArray<{
  slug: string;
  title: string;
  description: string;
  categories: CategorySlug[];
}>;

export const EXECUTIVE_CASES = [
  {
    slug: "founder-board-pressure",
    title: "Засновник під тиском ради",
    description:
      "Кейс для розбору влади, статусу, переговорів і меж відповідальності.",
    categories: ["leadership", "negotiations", "status-and-power"],
  },
  {
    slug: "polite-team-sabotage",
    title: "Команда, яка саботує ввічливо",
    description:
      "Кейс про токсичну ввічливість, пасивну агресію і управлінську діагностику.",
    categories: ["toxic-politeness", "organizational-psychology", "communication"],
  },
] satisfies ReadonlyArray<{
  slug: string;
  title: string;
  description: string;
  categories: CategorySlug[];
}>;

export const SERVICE_CTA = [
  {
    slug: "executive-coaching",
    title: "Коучинг для керівників",
    description:
      "Індивідуальна робота з владою, рішеннями, межами, комунікацією і тиском ролі.",
  },
  {
    slug: "communication-audit",
    title: "Аудит комунікації",
    description:
      "Аудит управлінської комунікації, точок тертя, пасивної агресії і втрати довіри.",
  },
  {
    slug: "legal-consulting",
    title: "Правова консультація",
    description:
      "Консультаційна рамка для правових конфліктів, ризиків, свідчень і переговорної позиції.",
  },
  {
    slug: "conflict-diagnostics",
    title: "Діагностика конфлікту",
    description:
      "Діагностика прихованих інтересів, ескалації, ролей, меж і системних вигод конфлікту.",
  },
] as const;

export const getTopicHubBySlug = (slug: string | undefined) =>
  TOPIC_HUBS.find(topic => topic.slug === slug);

export const getCollectionBySlug = (slug: string | undefined) =>
  COLLECTIONS.find(collection => collection.slug === slug);

export const getServiceCtaBySlug = (slug: string | undefined) =>
  SERVICE_CTA.find(service => service.slug === slug);