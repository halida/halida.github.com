/* eslint-disable no-console */
/**
 * List the Disqus threads of this blog.
 *
 * Disqus' public API needs the forum's API key, which is only visible to the
 * forum owner (Disqus dashboard -> Settings -> API -> Public Key). With it we
 * can list every thread, how many comments it holds and when it was last
 * active — i.e. which articles still have a discussion, and whether the old
 * comments survived.
 *
 * Usage:
 *   DISQUS_API_KEY=<public key> node scripts/disqus-threads.mjs [--limit 100]
 *
 * The forum short name is taken from astro-paper.config.ts.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
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

const apiKey = process.env.DISQUS_API_KEY;
if (!apiKey) {
  console.error(
    "DISQUS_API_KEY is not set.\n" +
      "Find it in the Disqus dashboard: Settings -> API -> Public Key."
  );
  process.exit(1);
}

const limitArg = process.argv.indexOf("--limit");
const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : 100;

// The short name lives in the site config; keep the two in sync by hand.
const configSource = await readFile(
  path.join(projectRoot, "astro-paper.config.ts"),
  "utf8"
);
const shortName = configSource.match(/shortName:\s*"([^"]+)"/)?.[1];
if (!shortName) {
  console.error("Could not find the Disqus short name in astro-paper.config.ts");
  process.exit(1);
}

const threads = [];
let cursor;

try {
  do {
    const url = new URL("https://disqus.com/api/3.0/threads/list.json");
    url.searchParams.set("forum", shortName);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("api_key", apiKey);
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `Disqus API error ${response.status}: ${await response.text()}`
      );
      process.exit(1);
    }

    const data = await response.json();
    threads.push(...data.response);
    cursor = data.has_next ? data.cursor : null;
  } while (cursor);
} catch (error) {
  reportError(error);
}

const rows = threads
  .map(thread => ({
    comments: thread.posts ?? 0,
    created: (thread.createdAt || "").slice(0, 10),
    lastActivity: (thread.lastActivity || "").slice(0, 10),
    link: thread.link,
    title: thread.title,
  }))
  .sort((a, b) => b.comments - a.comments);

console.log(`forum: ${shortName}   threads: ${rows.length}\n`);
for (const row of rows) {
  console.log(
    `${String(row.comments).padStart(4)} comments   ` +
      `${row.created} → ${row.lastActivity}   ${row.title}`
  );
  console.log(`            ${row.link}`);
}
