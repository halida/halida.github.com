/* eslint-disable no-console */
/**
 * Migrate legacy Octopress posts into AstroPaper content collections.
 *
 * Source: ../source/_posts/*.markdown  (Octopress / Jekyll)
 * Target: src/content/posts/*.md       (Astro content collection)
 *
 * URL contract: the legacy site served articles at /blog/<slug>/ where <slug>
 * is the post filename minus its date prefix, with the original
 * capitalisation preserved (e.g. "C-RAII"). That slug is copied verbatim into
 * the `slug` front matter field so the new site keeps the same URLs.
 *
 * Usage: node scripts/migrate-from-octopress.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const targetDir = path.resolve(projectRoot, "src/content/posts");

// The legacy Markdown lives on a branch of this repository, not in the
// working tree: the source branch is the Astro project itself.
const SOURCE_BRANCH = process.env.SOURCE_BRANCH || "origin/octopress-legacy";
const SOURCE_PREFIX = "source/_posts";

async function listLegacyFiles() {
  const { stdout } = await exec(
    "git",
    ["ls-tree", "-r", "--name-only", SOURCE_BRANCH, SOURCE_PREFIX],
    { cwd: projectRoot }
  );
  return stdout
    .split("\n")
    .filter(line => line.endsWith(".markdown"))
    .map(line => path.basename(line));
}

async function readLegacyFile(name) {
  const { stdout } = await exec(
    "git",
    ["show", `${SOURCE_BRANCH}:${SOURCE_PREFIX}/${name}`],
    { cwd: projectRoot, maxBuffer: 8 * 1024 * 1024 }
  );
  return stdout;
}

/** Legacy Chinese category label -> frozen URL slug. */
const CATEGORY_SLUGS = {
  编程: "bian-cheng",
  机器学习: "ji-qi-xue-xi",
  技术: "ji-zhu",
  开发: "kai-fa",
  装修: "zhuang-xiu",
};

/** Parse the flat YAML front matter used by the legacy posts. */
function parseFrontMatter(raw) {
  // A few legacy files start with a Python coding cookie before the front
  // matter, so the block is located rather than assumed to be at offset 0.
  const match = /(?:^|\n)---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    data[key] = value.replace(/^["']|["']$/g, "");
  }
  return { data, body: raw.slice(match.index + match[0].length) };
}

/** Legacy date strings -> ISO 8601 with the legacy +08:00 offset. */
function toIsoDate(value) {
  if (!value) return new Date().toISOString();
  const trimmed = value.trim();

  const full = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})\s*([+-]\d{2}):?(\d{2})$/.exec(
    trimmed
  );
  if (full) {
    const [, y, mo, d, h, mi, s, sign, off] = full;
    return `${y}-${mo}-${d}T${h}:${mi}:${s}${sign}:${off}`;
  }

  const short = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(trimmed);
  if (short) {
    const [, y, mo, d, h, mi] = short;
    return `${y}-${mo}-${d}T${h}:${mi}:00+08:00`;
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnly) {
    const [, y, mo, d] = dateOnly;
    return `${y}-${mo}-${d}T00:00:00+08:00`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  throw new Error(`Unrecognised date: ${value}`);
}

/** Legacy categories string -> array of frozen URL slugs. */
function toCategorySlugs(value) {
  if (!value) return [];
  // Jekyll splits categories on commas *and* whitespace, e.g. "ruby 开发"
  // yields two categories: "ruby" and "开发".
  return value
    .split(/[,\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => CATEGORY_SLUGS[item] ?? item);
}

/** Octopress image tag -> plain Markdown image. */
function convertBody(body) {
  return body
    .replace(/\{%\s*img\s+(\S+?)\s*%\}/g, (_match, src) => `![](${src})`)
    // A few legacy links omit the scheme ("[x](example.com/page)"), which
    // browsers resolve as a site-relative path and 404.
    .replace(
      /\]\(([a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[^)\s]*)?)\)/gi,
      "](https://$1)"
    );
}

/** First meaningful paragraph of the body, used as the meta description. */
function extractDescription(body) {
  const text = body
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .find(block => {
      if (!block) return false;
      if (block.startsWith("```")) return false;
      if (block.startsWith("<")) return false;
      if (block.startsWith("![")) return false;
      return true;
    });

  if (!text) return "";

  const plain = text
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_>#`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > 120 ? `${plain.slice(0, 120)}…` : plain;
}

/** YAML double-quoted scalar. */
function yamlString(value) {
  return JSON.stringify(value);
}

async function main() {
  await mkdir(targetDir, { recursive: true });

  const files = (await listLegacyFiles()).sort();

  const manifest = [];
  let convertedImages = 0;

  for (const file of files) {
    const raw = await readLegacyFile(file);
    const { data, body } = parseFrontMatter(raw);

    const slug = file.replace(/\.markdown$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
    if (!slug) throw new Error(`Cannot derive slug from ${file}`);

    const converted = convertBody(body);
    const imageCount = (body.match(/\{%\s*img\s/g) || []).length;
    convertedImages += imageCount;

    const categories = toCategorySlugs(data.categories);
    const description = extractDescription(converted);
    const title = data.title ?? slug;

    const frontMatter = [
      "---",
      `title: ${yamlString(title)}`,
      `slug: ${yamlString(slug)}`,
      `pubDatetime: ${yamlString(toIsoDate(data.date))}`,
      `description: ${yamlString(description)}`,
      `tags: [${categories.map(item => yamlString(item)).join(", ")}]`,
      "---",
      "",
    ].join("\n");

    await writeFile(path.join(targetDir, `${slug}.md`), frontMatter + converted);

    manifest.push({ slug, title, categories, date: data.date });
  }

  console.log(`Migrated ${files.length} posts into ${targetDir}`);
  console.log(`Converted ${convertedImages} Octopress {% img %} tags`);
  await writeFile(
    path.resolve(projectRoot, "scripts/migration-manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
