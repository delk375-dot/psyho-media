/**
 * telegramLabels.ts — shared labels/CSS maps for Telegram content types & tones.
 *
 * Single source of truth for:
 *   - RelatedTelegramSignals.astro (article after-reading block)
 *   - telegram/archive.astro       (archive cards + filters)
 *
 * New post types are added here once and propagate everywhere.
 */

/** After-reading pack types — prioritised in article blocks */
export const AFTER_READING_TYPES = new Set([
  "afterthought",
  "provocation",
  "shadow_fragment",
  "microcase",
]);

export const TYPE_LABELS: Record<string, string> = {
  signal:          "Сигнал",
  bridge:          "Міст",
  question:        "Питання",
  fragment:        "Фрагмент",
  case:            "Кейс",
  teaser:          "Анонс",
  afterthought:    "Після статті",
  provocation:     "Провокація",
  shadow_fragment: "Тіньовий фрагмент",
  microcase:       "Мікрокейс",
};

export const TONE_LABELS: Record<string, string> = {
  atmospheric: "Атмосферний",
  dark:        "Темний",
  ironic:      "Іронічний",
  analytical:  "Аналітичний",
  provocative: "Провокативний",
  calm:        "Спокійний",
};

/** CSS class per type (badge colours defined in archive.astro styles) */
export const TYPE_CSS: Record<string, string> = {
  signal:          "type-signal",
  bridge:          "type-bridge",
  question:        "type-question",
  fragment:        "type-fragment",
  case:            "type-case",
  teaser:          "type-teaser",
  afterthought:    "type-afterthought",
  provocation:     "type-provocation",
  shadow_fragment: "type-shadow",
  microcase:       "type-microcase",
};

export const TONE_CSS: Record<string, string> = {
  atmospheric: "tone-atmospheric",
  dark:        "tone-dark",
  ironic:      "tone-ironic",
  analytical:  "tone-analytical",
  provocative: "tone-provocative",
  calm:        "tone-calm",
};
