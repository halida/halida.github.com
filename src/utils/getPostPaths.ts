import { getRelativeLocaleUrl } from "astro:i18n";
import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";
import config from "@/config";

/**
 * Route prefix for post pages.
 *
 * The legacy Octopress site served articles under /blog/<slug>/, so the
 * prefix must stay "blog" to keep every existing URL alive.
 */
export const BLOG_PREFIX = "blog";

/** Route prefix for category listing pages (legacy: /blog/categories/<slug>/). */
export const CATEGORY_PREFIX = "blog/categories";

function getPostPathSegments(filePath: string | undefined): string[] {
  return (
    filePath
      ?.replace(BLOG_PATH, "")
      .split("/")
      .filter(path => path !== "")
      .filter(path => !path.startsWith("_"))
      .slice(0, -1)
      .map(segment => slugifyStr(segment)) ?? []
  );
}

function getIdSlug(id: string): string {
  const postId = id.split("/");
  return postId.length > 0 ? String(postId[postId.length - 1]) : id;
}

/**
 * Path of a post relative to the site root, without a leading slash.
 *
 * `slug` (from front matter) wins when present: it preserves the original
 * capitalisation of legacy slugs such as "C-RAII" or "why-I-use-linux",
 * which `slugifyStr` would otherwise lowercase.
 */
function getPostSlugPath(
  id: string,
  filePath: string | undefined,
  slug?: string
): string {
  if (slug) return slug;

  const pathSegments = getPostPathSegments(filePath);
  const fallback = getIdSlug(id);
  return pathSegments.length > 0
    ? [...pathSegments, fallback].join("/")
    : String(fallback);
}

/**
 * Returns the slug-only path for use as a route param in `getStaticPaths`.
 * No base prefix, no locale — Astro handles those at a higher level.
 * e.g. `/examples/my-post`
 */
export function getPostSlug(
  id: string,
  filePath: string | undefined,
  slug?: string
): string {
  return `/${getPostSlugPath(id, filePath, slug)}`;
}

/**
 * Returns a fully navigable URL for use in `<a href>` and RSS links.
 * Applies both locale routing and the configured Astro base via
 * `getRelativeLocaleUrl`.
 * e.g. `/blog/my-post`
 */
export function getPostUrl(
  id: string,
  filePath: string | undefined,
  locale: string | undefined = config.site.lang,
  slug?: string
): string {
  return getRelativeLocaleUrl(
    locale,
    `${BLOG_PREFIX}/${getPostSlugPath(id, filePath, slug)}`
  );
}

/** Absolute URL for a post, used by RSS feeds and social cards. */
export function getPostAbsoluteUrl(
  id: string,
  filePath: string | undefined,
  slug?: string
): string {
  return new URL(
    getPostUrl(id, filePath, config.site.lang, slug),
    config.site.url
  ).href;
}
