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
    slug: "relationship-dramas",
    title: "Relationship dramas",
    ukrainianTitle: "Драми стосунків",
    description:
      "Близькість, зникнення, холод, ревнощі, зради і прихована боротьба за любов та увагу.",
    categories: ["relationships", "betrayal", "jealousy", "conflicts"],
    featured: true,
    starterQuestions: [
      "Чому люди зникають без пояснення?",
      "Чому після близькості стає холодно?",
      "Чому сварка майже ніколи не про те, з чого почалась?",
    ],
  },
  {
    slug: "manipulation-and-control",
    title: "Manipulation and control",
    ukrainianTitle: "Маніпуляції і контроль",
    description:
      "Газлайтинг, мовчання, провина, сором, непрямі вимоги і токсичні способи тримати владу над іншими.",
    categories: ["manipulation", "toxic-people", "silence-ghosting", "conflicts"],
    featured: true,
    starterQuestions: [
      "Як зрозуміти маніпулятора?",
      "Чому люди рідко говорять прямо?",
      "Коли мовчання стає покаранням?",
    ],
  },
  {
    slug: "attachment-and-distance",
    title: "Attachment and distance",
    ukrainianTitle: "Прив'язаність і дистанція",
    description:
      "Емоційна залежність, страх втрати, тривожна близькість, холодність і болюче утримання людини поряд.",
    categories: ["emotional-dependence", "relationships", "silence-ghosting", "betrayal"],
    featured: true,
    starterQuestions: [
      "Чому ми тримаємось за тих, хто нас ранить?",
      "Чому хороших людей часто не хочуть?",
      "Чому ігнор так сильно чіпляє?",
    ],
  },
  {
    slug: "sex-desire-status",
    title: "Sex, desire and status",
    ukrainianTitle: "Секс, потяг і статус",
    description:
      "Потяг, охолодження, сексуальна влада, сором, фантазії і статусні сигнали в бажанні.",
    categories: ["sex-attraction", "relationships", "jealousy", "money-status"],
    featured: true,
    starterQuestions: [
      "Чому потяг рідко буває випадковим?",
      "Чому після близькості люди віддаляються?",
      "Як статус впливає на бажання?",
    ],
  },
  {
    slug: "money-shame-status",
    title: "Money, shame and status",
    ukrainianTitle: "Гроші, сором і статус",
    description:
      "Грошова тривога, сором бідності, демонстрація успіху і відчуття власної цінності через гроші.",
    categories: ["money-status", "self-worth", "relationships"],
    featured: true,
    starterQuestions: [
      "Чому гроші викликають сором?",
      "Чому бідність здається моральною поразкою?",
      "Чому статус так легко плутають із цінністю людини?",
    ],
  },
  {
    slug: "conflict-lab",
    title: "Conflict lab",
    ukrainianTitle: "Лабораторія конфлікту",
    description:
      "Сварки, образи, пасивна агресія, мовчазні війни і справжні ставки повсякденних протистоянь.",
    categories: ["conflicts", "manipulation", "toxic-people", "family"],
    featured: true,
    starterQuestions: [
      "Про що люди насправді сваряться?",
      "Чому дрібниця запускає велику війну?",
      "Як образа перетворюється на контроль?",
    ],
  },
  {
    slug: "self-worth-lab",
    title: "Self-worth lab",
    ukrainianTitle: "Самооцінка і сором",
    description:
      "Невпевненість, страх бути непотрібним, залежність від чужої оцінки і внутрішня ціна любові.",
    categories: ["self-worth", "emotional-dependence", "money-status", "family"],
    featured: true,
    starterQuestions: [
      "Чому чужа холодність здається вироком?",
      "Чому сором сильніший за логіку?",
      "Як самооцінка стає залежною від відповіді в месенджері?",
    ],
  },
  {
    slug: "family-scripts",
    title: "Family scripts",
    ukrainianTitle: "Родинні сценарії",
    description:
      "Батьківський контроль, провина, старі образи і сценарії, які повторюються у дорослих стосунках.",
    categories: ["family", "self-worth", "conflicts", "emotional-dependence"],
    featured: true,
    starterQuestions: [
      "Чому дорослі люди досі бояться батьківської оцінки?",
      "Як родинна провина живе у стосунках?",
      "Чому старі образи повертаються в нових конфліктах?",
    ],
  },
] satisfies ReadonlyArray<TopicHubDefinition>;

export type TopicHubSlug = (typeof TOPIC_HUBS)[number]["slug"];

export const COLLECTIONS = [
  {
    slug: "relationship-psychology",
    title: "Психологія стосунків",
    description:
      "Фундаментальні матеріали про близькість, дистанцію, ревнощі, зради, мовчання і залежність.",
    hubs: ["relationship-dramas", "attachment-and-distance"],
  },
  {
    slug: "manipulation-field-notes",
    title: "Польові нотатки про маніпуляції",
    description:
      "Розбори прихованого контролю, токсичної поведінки, мовчання, провини і непрямих вимог.",
    hubs: ["manipulation-and-control", "conflict-lab"],
  },
  {
    slug: "money-sex-status",
    title: "Гроші, секс і статус",
    description:
      "Колекція про сором, бажання, демонстрацію успіху, потяг і статусні сигнали.",
    hubs: ["money-shame-status", "sex-desire-status"],
  },
] as const;

export const GLOSSARY_TERMS = [
  {
    slug: "ghosting",
    title: "Гостинг",
    description:
      "Раптове зникнення без пояснення, яке залишає іншу людину в невизначеності і самозвинуваченні.",
    categories: ["silence-ghosting", "relationships"],
  },
  {
    slug: "gaslighting",
    title: "Газлайтинг",
    description:
      "Маніпуляція, у якій людину змушують сумніватися у власному сприйнятті, пам'яті або адекватності.",
    categories: ["manipulation", "toxic-people"],
  },
  {
    slug: "attachment-anxiety",
    title: "Тривога прив'язаності",
    description:
      "Страх втрати близькості, через який мовчання, пауза або холодність здаються катастрофою.",
    categories: ["emotional-dependence", "relationships"],
  },
  {
    slug: "money-shame",
    title: "Грошовий сором",
    description:
      "Відчуття, що нестача грошей робить людину гіршою, слабшою або менш вартою любові й поваги.",
    categories: ["money-status", "self-worth"],
  },
] satisfies ReadonlyArray<{
  slug: string;
  title: string;
  description: string;
  categories: CategorySlug[];
}>;

export const CASE_STUDIES = [
  {
    slug: "ignored-after-intimacy",
    title: "Після близькості стало холодно",
    description:
      "Кейс для розбору дистанції, сорому, страху близькості і втрати контролю.",
    categories: ["relationships", "sex-attraction", "silence-ghosting"],
  },
  {
    slug: "jealousy-as-control",
    title: "Ревнощі як контроль",
    description:
      "Кейс про страх втрати, власність, порівняння і приховану боротьбу за владу в парі.",
    categories: ["jealousy", "relationships", "manipulation"],
  },
] satisfies ReadonlyArray<{
  slug: string;
  title: string;
  description: string;
  categories: CategorySlug[];
}>;

export const SERVICE_CTA = [
  {
    slug: "individual-consultation",
    title: "Індивідуальна консультація",
    description:
      "Спокійний розбір ситуації, у якій багато емоцій, але мало ясності.",
  },
  {
    slug: "relationship-review",
    title: "Розбір стосунків",
    description:
      "Структурований погляд на динаміку пари: дистанцію, образи, залежність, контроль і повторювані сценарії.",
  },
  {
    slug: "communication-audit",
    title: "Комунікаційний аудит",
    description:
      "Аналіз переписок, пауз, непрямих сигналів, маніпуляцій і місць, де розмова зламалась.",
  },
  {
    slug: "conflict-diagnostics",
    title: "Діагностика конфлікту",
    description:
      "Пошук справжньої ставки конфлікту: страху, статусу, образи, контролю або невизнаної потреби.",
  },
  {
    slug: "breakup-coaching",
    title: "Коучинг після розриву",
    description:
      "Робота з нав'язливими думками, поверненням до себе і виходом із емоційної петлі після розриву.",
  },
  {
    slug: "money-anxiety-work",
    title: "Робота з грошовою тривогою",
    description:
      "Розбір сорому, страху, статусних порівнянь і сценаріїв, через які гроші стають психологічною загрозою.",
  },
] as const;

export const SHADOW_MAP_CROSS_LINK = {
  title: "Глибший системний аналіз",
  description:
    "Глибший системний аналіз влади, статусу і переговорів - у проєкті «Тіньова карта».",
  href: "https://github.com/delk375-dot/leader-blog",
};

export const getTopicHubBySlug = (slug: string | undefined) =>
  TOPIC_HUBS.find(topic => topic.slug === slug);

export const getCollectionBySlug = (slug: string | undefined) =>
  COLLECTIONS.find(collection => collection.slug === slug);

export const getServiceCtaBySlug = (slug: string | undefined) =>
  SERVICE_CTA.find(service => service.slug === slug);
