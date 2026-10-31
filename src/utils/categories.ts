/**
 * Legacy category mapping.
 *
 * The old Octopress site exposed categories under pinyin slugs
 * (e.g. /blog/categories/bian-cheng/) while displaying Chinese names.
 * These slugs are frozen: changing them would break existing inbound links.
 */
export const CATEGORY_NAMES: Record<string, string> = {
  "bian-cheng": "编程",
  "ji-qi-xue-xi": "机器学习",
  "ji-zhu": "技术",
  "kai-fa": "开发",
  "zhuang-xiu": "装修",
  development: "development",
  english: "english",
  frontend: "frontend",
  game: "game",
  games: "games",
  life: "life",
  linux: "linux",
  rails: "rails",
  resolution: "resolution",
  ruby: "ruby",
  "ruby-sucks": "ruby-sucks",
  smarthome: "smarthome",
};

/** Chinese category labels as they appear in the legacy front matter. */
export const CATEGORY_LABELS: Record<string, string> = {
  编程: "bian-cheng",
  机器学习: "ji-qi-xue-xi",
  技术: "ji-zhu",
  开发: "kai-fa",
  装修: "zhuang-xiu",
};

/** Display name for a category slug. Falls back to the slug itself. */
export function getCategoryName(slug: string): string {
  return CATEGORY_NAMES[slug] ?? slug;
}

/** URL slug for a legacy category label. Falls back to the label itself. */
export function getCategorySlug(label: string): string {
  const trimmed = label.trim();
  return CATEGORY_LABELS[trimmed] ?? trimmed;
}
