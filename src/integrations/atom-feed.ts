import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

const ARTICLE_RE = /<article id="article"[^>]*>([\s\S]*?)<\/article>/;
const TITLE_RE = /<h1[^>]*>([\s\S]*?)<\/h1>/;
const TIME_RE = /<time[^>]*datetime="([^"]+)"/;
const CATEGORY_RE = /\/blog\/categories\/([A-Za-z0-9_-]+)\//g;

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** ISO 8601 shaped like the legacy Octopress feed. */
function xmlTimestamp(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

type Entry = {
  slug: string;
  title: string;
  url: string;
  updated: Date;
  content: string;
  categories: string[];
};

type FeedOptions = {
  title: string;
  author: string;
  siteUrl: string;
  feedUrl: string;
  entries: Entry[];
  extraLinks?: { href: string; rel?: string }[];
  /** Maximum number of entries to publish. */
  limit?: number;
};

function renderFeed(options: FeedOptions): string {
  const links = [
    `  <link href="${escapeXml(options.feedUrl)}" rel="self"/>`,
    `  <link href="${escapeXml(options.siteUrl)}"/>`,
    ...(options.extraLinks ?? []).map(
      link =>
        `  <link href="${escapeXml(link.href)}"${
          link.rel ? ` rel="${link.rel}"` : ""
        }/>`
    ),
  ];

  const entries = options.entries.slice(0, options.limit ?? options.entries.length).map(entry => {
    const url = new URL(`/blog/${entry.slug}/`, options.siteUrl).href;
    return [
      "  <entry>",
      `    <title type="html">${cdata(entry.title)}</title>`,
      `    <link href="${escapeXml(url)}"/>`,
      `    <updated>${xmlTimestamp(entry.updated)}</updated>`,
      `    <id>${escapeXml(url.replace(/\/$/, ""))}</id>`,
      `    <content type="html">${cdata(entry.content)}</content>`,
      "  </entry>",
    ].join("\n");
  });

  const updated = options.entries[0]
    ? xmlTimestamp(options.entries[0].updated)
    : xmlTimestamp(new Date());

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    "",
    `  <title>${cdata(options.title)}</title>`,
    ...links,
    `  <updated>${updated}</updated>`,
    `  <id>${escapeXml(options.siteUrl)}</id>`,
    "  <author>",
    `    <name>${cdata(options.author)}</name>`,
    "  </author>",
    '  <generator uri="https://astro.build/">Astro</generator>',
    "",
    ...entries,
    "</feed>",
    "",
  ].join("\n");
}

/**
 * Generates Atom 1.0 feeds from the rendered pages.
 *
 * The legacy Octopress site published /atom.xml as Atom with the full
 * article body inside <content>, plus one feed per category. Reproducing it
 * from the rendered HTML keeps every existing subscriber working.
 */
export function atomFeed(options: {
  siteUrl: string;
  siteTitle: string;
  author: string;
  /** Maximum number of entries in the site-wide feed. */
  limit?: number;
  /** Maximum number of entries per category feed. */
  categoryLimit?: number;
}): AstroIntegration {
  return {
    name: "atom-feed",
    hooks: {
      "astro:build:done": async ({ dir, pages, logger }) => {
        const outDir = fileURLToPath(dir);
        const entries: Entry[] = [];

        for (const page of pages) {
          // Astro reports route paths without a leading slash, e.g.
          // "blog/C-RAII/".
          const pathname = page.pathname.replace(/^\/+|\/+$/g, "");
          if (!pathname.startsWith("blog/")) continue;
          if (pathname.startsWith("blog/page/")) continue;
          if (pathname.startsWith("blog/categories")) continue;
          if (pathname === "blog" || pathname === "blog/archives") continue;

          const slug = pathname.slice("blog/".length);
          const file = path.join(outDir, "blog", slug, "index.html");

          let markup: string;
          try {
            markup = await readFile(file, "utf8");
          } catch {
            continue;
          }

          const content = ARTICLE_RE.exec(markup)?.[1];
          const title = TITLE_RE.exec(markup)?.[1];
          const datetime = TIME_RE.exec(markup)?.[1];
          if (!content || !title || !datetime) continue;

          const categories = new Set<string>();
          for (const match of markup.matchAll(CATEGORY_RE)) {
            categories.add(match[1]);
          }

          entries.push({
            slug,
            title,
            url: new URL(`/blog/${slug}/`, options.siteUrl).href,
            updated: new Date(datetime),
            content,
            categories: [...categories],
          });
        }

        entries.sort((a, b) => b.updated.getTime() - a.updated.getTime());

        const feed = renderFeed({
          title: options.siteTitle,
          author: options.author,
          siteUrl: options.siteUrl,
          feedUrl: new URL("/atom.xml", options.siteUrl).href,
          entries,
          limit: options.limit,
        });
        await writeFile(path.join(outDir, "atom.xml"), feed, "utf8");

        const categories = new Set(entries.flatMap(entry => entry.categories));
        for (const category of categories) {
          const categoryEntries = entries.filter(entry =>
            entry.categories.includes(category)
          );
          const categoryFeed = renderFeed({
            title: `${options.siteTitle} - ${category}`,
            author: options.author,
            siteUrl: options.siteUrl,
            feedUrl: new URL(
              `/blog/categories/${category}/atom.xml`,
              options.siteUrl
            ).href,
            entries: categoryEntries,
            limit: options.categoryLimit,
            extraLinks: [
              {
                href: new URL(
                  `/blog/categories/${category}/`,
                  options.siteUrl
                ).href,
                rel: "alternate",
              },
            ],
          });
          await writeFile(
            path.join(outDir, "blog", "categories", category, "atom.xml"),
            categoryFeed,
            "utf8"
          );
        }

        logger.info(
          `atom-feed: wrote /atom.xml (${entries.length} entries) and ${categories.size} category feeds`
        );
      },
    },
  };
}
