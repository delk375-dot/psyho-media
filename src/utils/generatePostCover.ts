type PostCoverInput = {
  title: string;
  category?: string;
  tags?: string[];
  contentType?: string;
  slug: string;
};

type CoverTheme = {
  label: string;
  symbol: "circle" | "crack" | "thread" | "mask" | "message" | "door" | "knot" | "shadow";
};

const THEMES: Record<string, CoverTheme> = {
  relationships: { label: "СТОСУНКИ", symbol: "thread" },
  betrayal: { label: "ЗРАДА", symbol: "crack" },
  manipulation: { label: "КОНТРОЛЬ", symbol: "thread" },
  "toxic-people": { label: "ТОКСИЧНІСТЬ", symbol: "shadow" },
  jealousy: { label: "РЕВНОЩІ", symbol: "circle" },
  "sex-attraction": { label: "ПОТЯГ", symbol: "circle" },
  "money-status": { label: "СТАТУС", symbol: "door" },
  "emotional-dependence": { label: "ЗАЛЕЖНІСТЬ", symbol: "knot" },
  conflicts: { label: "КОНФЛІКТ", symbol: "crack" },
  "self-worth": { label: "САМООЦІНКА", symbol: "mask" },
  family: { label: "РОДИНА", symbol: "door" },
  "silence-ghosting": { label: "ІГНОР", symbol: "message" },
};

const FORMAT_LABELS: Record<string, string> = {
  viral_note: "ВІРУСНА ЗАМІТКА",
  deep_analysis: "ГЛИБОКИЙ РОЗБІР",
  pillar_article: "ФУНДАМЕНТАЛЬНИЙ РОЗБІР",
  psychological_fragment: "ПСИХОЛОГІЧНИЙ ФРАГМЕНТ",
  article: "РОЗБІР",
};

const COLORS = {
  paper: "#f7efe4",
  graphite: "#211917",
  wine: "#8f1f2e",
  muted: "#cbb9aa",
  inkSoft: "#4a3934",
};

function escapeSvg(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function titleLines(title: string) {
  const words = title
    .replace(/[“”"]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 9);

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 21 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === 2) break;
  }

  if (current && lines.length < 3) lines.push(current);
  return lines.slice(0, 3);
}

function symbolMarkup(symbol: CoverTheme["symbol"], variant: number) {
  switch (symbol) {
    case "message":
      return `<rect x="710" y="142" width="306" height="176" rx="22" fill="none" stroke="${COLORS.graphite}" stroke-width="10"/><path d="M766 366 824 318" stroke="${COLORS.graphite}" stroke-width="10" stroke-linecap="round"/><circle cx="804" cy="230" r="12" fill="${COLORS.wine}"/><circle cx="864" cy="230" r="12" fill="${COLORS.wine}"/><circle cx="924" cy="230" r="12" fill="${COLORS.wine}"/>`;
    case "crack":
      return `<rect x="710" y="146" width="288" height="202" fill="none" stroke="${COLORS.graphite}" stroke-width="10"/><path d="M854 122 822 210 886 242 842 354" fill="none" stroke="${COLORS.wine}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "thread":
      return `<path d="M704 246c82-114 202-114 284 0M704 246c82 114 202 114 284 0" fill="none" stroke="${COLORS.graphite}" stroke-width="10"/><circle cx="${variant % 2 ? 704 : 988}" cy="246" r="18" fill="${COLORS.wine}"/>`;
    case "mask":
      return `<path d="M720 168h250v146c0 68-54 122-125 122s-125-54-125-122V168Z" fill="none" stroke="${COLORS.graphite}" stroke-width="10"/><path d="M774 258h76M884 258h42" stroke="${COLORS.wine}" stroke-width="10" stroke-linecap="round"/>`;
    case "door":
      return `<rect x="758" y="132" width="176" height="292" fill="none" stroke="${COLORS.graphite}" stroke-width="10"/><path d="M934 132l74 42v292l-74-42" fill="none" stroke="${COLORS.wine}" stroke-width="10" stroke-linejoin="round"/><circle cx="902" cy="286" r="10" fill="${COLORS.wine}"/>`;
    case "knot":
      return `<path d="M724 294c78-126 202-126 280 0M724 294c78 126 202 126 280 0M782 184c58 104 112 118 164 0M782 404c58-104 112-118 164 0" fill="none" stroke="${COLORS.graphite}" stroke-width="10" stroke-linecap="round"/><circle cx="864" cy="294" r="18" fill="${COLORS.wine}"/>`;
    case "shadow":
      return `<rect x="736" y="154" width="128" height="276" fill="${COLORS.graphite}"/><rect x="888" y="154" width="128" height="276" fill="${COLORS.graphite}" opacity=".22"/><path d="M876 128v328" stroke="${COLORS.wine}" stroke-width="10"/>`;
    case "circle":
    default:
      return `<circle cx="858" cy="278" r="132" fill="none" stroke="${COLORS.graphite}" stroke-width="10"/><path d="M858 146v264M726 278h264" stroke="${COLORS.wine}" stroke-width="9" stroke-linecap="round"/>`;
  }
}

export function getGeneratedPostCoverPath(slug: string) {
  return `/covers/${slug.replace(/^\/+/, "").replaceAll("/", "--")}.svg`;
}

export function generatePostCover({
  title,
  category,
  tags = [],
  contentType = "article",
  slug,
}: PostCoverInput) {
  const theme = (category ? THEMES[category] : undefined) ?? {
    label: (tags[0] ?? "ПСИХОЛОГІЯ").toUpperCase(),
    symbol: "circle" as const,
  };
  const format = FORMAT_LABELS[contentType] ?? FORMAT_LABELS.article;
  const variant = hashString(`${slug}:${category}:${contentType}`);
  const lines = titleLines(title);
  const lineMarkup = lines
    .map(
      (line, index) =>
        `<text x="92" y="${278 + index * 74}" font-family="Inter, Arial, sans-serif" font-size="62" font-weight="900" fill="${COLORS.graphite}">${escapeSvg(line)}</text>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title desc">
  <title id="title">${escapeSvg(title)}</title>
  <desc id="desc">Автоматична editorial SVG-обкладинка для матеріалу “${escapeSvg(title)}”.</desc>
  <rect width="1200" height="675" fill="${COLORS.paper}"/>
  <path d="M0 132h1200M0 356h1200M0 580h1200M188 0v675M612 0v675M1036 0v675" stroke="${COLORS.muted}" stroke-width="1" opacity=".28"/>
  <rect x="58" y="58" width="1084" height="559" fill="none" stroke="${COLORS.muted}" stroke-width="2"/>
  <path d="M92 116h130" stroke="${COLORS.wine}" stroke-width="8" stroke-linecap="round"/>
  <text x="92" y="162" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900" letter-spacing="8" fill="${COLORS.wine}">${escapeSvg(theme.label)}</text>
  <text x="92" y="210" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="5" fill="${COLORS.inkSoft}">${escapeSvg(format)}</text>
  ${lineMarkup}
  ${symbolMarkup(theme.symbol, variant)}
  <text x="92" y="558" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${COLORS.inkSoft}">Людський механізм</text>
</svg>
`;
}
