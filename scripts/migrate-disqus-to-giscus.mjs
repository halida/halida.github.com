/* eslint-disable no-console */
/**
 * Copy the Disqus threads of this blog into GitHub Discussions (Giscus).
 *
 * Every post maps to one Discussion whose title is the post path
 * ("/blog/<slug>/"), which is what Giscus matches on with
 * `data-mapping="pathname"`.
 *
 * Disqus keeps the comment author in its own database, while GitHub
 * attributes every API-created comment to the token owner. The original
 * author is therefore kept in the comment body.
 *
 * Usage:
 *   DISQUS_API_KEY=<disqus public key> \
 *   GITHUB_TOKEN=<github token with repo scope> \
 *   node scripts/migrate-disqus-to-giscus.mjs [--dry-run]
 *
 * The script is resumable: migrated discussions are recorded in
 * scripts/.disqus-migration-state.json.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Load .env (git-ignored) so secrets do not have to be passed inline.
// Values already present in the environment win over the file.
const envPath = path.join(projectRoot, ".env");
if (existsSync(envPath)) {
  const preset = { ...process.env };
  try {
    process.loadEnvFile(envPath);
  } catch {
    // older Node without loadEnvFile
  }
  Object.assign(process.env, preset);
}

const stateFile = path.join(__dirname, ".disqus-migration-state.json");


/**
 * Re-runs the script with Node's built-in proxy support when HTTPS_PROXY is
 * set but NODE_USE_ENV_PROXY is not — the latter can only be read at startup.
 */
if (
  process.env.HTTPS_PROXY &&
  !process.env.NODE_USE_ENV_PROXY &&
  !process.env.__DSH_PROXY_RETRY
) {
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync(process.execPath, [process.argv[1], ...process.argv.slice(2)], {
    env: { ...process.env, NODE_USE_ENV_PROXY: "1", __DSH_PROXY_RETRY: "1" },
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

/** Turns a raw network failure into an actionable message. */
function reportError(error) {
  const message = String(error?.message ?? error);
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|timeout/i.test(message)) {
    console.error(
      `Network error: ${message}\n` +
        "Disqus and the GitHub API are not reachable from here. " +
        "If you are behind a firewall, export the proxy first:\n" +
        "  export HTTPS_PROXY=http://127.0.0.1:8080\n" +
        "  NODE_USE_ENV_PROXY=1 node scripts/<this script>"
    );
  } else {
    console.error(message);
  }
  process.exit(1);
}

const disqusKey = process.env.DISQUS_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const dryRun = process.argv.includes("--dry-run");

if (!disqusKey) {
  console.error("DISQUS_API_KEY is not set.");
  process.exit(1);
}
if (!githubToken && !dryRun) {
  console.error("GITHUB_TOKEN is not set.");
  process.exit(1);
}

// --- configuration ---------------------------------------------------------

const configSource = await readFile(
  path.join(projectRoot, "astro-paper.config.ts"),
  "utf8"
);
const shortName = configSource.match(/shortName:\s*"([^"]+)"/)?.[1];
const categoryId = configSource.match(/categoryId:\s*"([^"]+)"/)?.[1];
const repo = configSource.match(/repo:\s*"([^"]+)"/)?.[1];

if (!shortName || !categoryId || !repo) {
  console.error("Could not read the Disqus/Giscus settings from astro-paper.config.ts");
  process.exit(1);
}

// --- helpers ---------------------------------------------------------------

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Very small HTML → Markdown conversion; Disqus messages are simple. */
function htmlToMarkdown(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis, "[$2]($1)")
    .replace(/<(strong|b)>/gi, "**")
    .replace(/<\/(strong|b)>/gi, "**")
    .replace(/<(em|i)>/gi, "*")
    .replace(/<\/(em|i)>/gi, "*")
    .replace(/<blockquote>/gi, "> ")
    .replace(/<\/blockquote>/gi, "\n")
    .replace(/<code[^>]*>(.*?)<\/code>/gis, "`$1`")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, m => ENTITIES[m])
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Calls the Disqus API and follows the cursor until every page is read. */
async function disqusApiAll(endpoint, params) {
  const items = [];
  let cursor = null;

  do {
    const url = new URL(`https://disqus.com/api/3.0/${endpoint}`);
    url.searchParams.set("api_key", disqusKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Disqus API ${response.status} on ${endpoint}`);
    }

    const data = await response.json();
    items.push(...data.response);
    cursor = data.cursor?.has_next ? data.cursor.next : null;
  } while (cursor);

  return items;
}

async function githubGraphQL(query, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${githubToken}`,
      "Content-Type": "application/json",
      "User-Agent": "disqus-to-giscus-migration",
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await response.json();
  if (data.errors) {
    throw new Error(
      `GitHub GraphQL error: ${data.errors.map(e => e.message).join(", ")}`
    );
  }
  return data.data;
}

/** Disqus identifier "http://host/blog/slug/" → "/blog/slug/". */
function identifierToPathname(identifier) {
  try {
    return new URL(identifier).pathname;
  } catch {
    return identifier;
  }
}

const CREATE_DISCUSSION = `
  mutation($title: String!, $body: String!, $categoryId: ID!) {
    createDiscussion(
      input: { title: $title, body: $body, categoryId: $categoryId }
    ) {
      discussion { id number url }
    }
  }
`;

const ADD_COMMENT = `
  mutation($discussionId: ID!, $body: String!) {
    addDiscussionComment(
      input: { discussionId: $discussionId, body: $body }
    ) {
      comment { url }
    }
  }
`;

// --- main ------------------------------------------------------------------

const state = await readFile(stateFile, "utf8")
  .then(text => JSON.parse(text))
  .catch(() => ({ done: {} }));

let threads;
try {
  threads = await disqusApiAll("threads/list.json", {
    forum: shortName,
    limit: 100,
  });
} catch (error) {
  reportError(error);
}
const withComments = threads.filter(thread => (thread.posts ?? 0) > 0);

console.log(
  `Disqus threads: ${threads.length}   with comments: ${withComments.length}\n`
);

for (const thread of withComments) {
  const pathname = identifierToPathname(thread.identifier);
  if (state.done[pathname]) {
    console.log(`  = ${pathname} (already migrated)`);
    continue;
  }

  const posts = await disqusApiAll("posts/list.json", {
    forum: shortName,
    thread: thread.id,
    limit: 100,
  });

  console.log(
    `  + ${pathname}  (${posts.length} comments, title: ${thread.title})`
  );

  if (dryRun) {
    for (const post of posts.slice(0, 3)) {
      const preview = htmlToMarkdown(post.message).replace(/\s+/g, " ").slice(0, 70);
      console.log(`      - ${post.author?.name ?? "Anonymous"}: ${preview}…`);
    }
    if (posts.length > 3) console.log(`      … ${posts.length - 3} more`);
    continue;
  }

  const body = [
    `本文原 Disqus 评论区共 ${posts.length} 条评论，迁移自 ${thread.identifier}。`,
    "",
    "以下评论保留原作者署名，发布身份为迁移者。",
  ].join("\n");

  const { createDiscussion } = await githubGraphQL(CREATE_DISCUSSION, {
    title: pathname,
    body,
    categoryId,
  });
  const discussionId = createDiscussion.discussion.id;
  console.log(`      discussion #${createDiscussion.discussion.number}`);

  for (const post of posts) {
    const author = post.author?.name ?? post.author?.username ?? "Anonymous";
    const date = (post.createdAt || "").slice(0, 10);
    const commentBody = [
      `**${author}** · ${date} · 原 Disqus 评论`,
      "",
      htmlToMarkdown(post.message),
    ].join("\n");

    await githubGraphQL(ADD_COMMENT, { discussionId, body: commentBody });
  }

  state.done[pathname] = {
    discussion: createDiscussion.discussion.url,
    comments: posts.length,
  };
  await writeFile(stateFile, JSON.stringify(state, null, 2));
}

console.log(
  dryRun
    ? "\nDry run — nothing was written."
    : `\nDone. State written to ${stateFile}`
);
