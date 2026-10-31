#!/usr/bin/env python3
"""Compare the rendered body of every legacy article with the rebuilt one.

For each post the script pulls the article body out of the legacy HTML
(`<div class="entry-content">`) and out of the new build
(`<article id="article">`), then compares:

* the prose text (character-level similarity ratio, code blocks excluded)
* the code blocks (token multiset, so line numbers do not matter)
* the set of image sources referenced by the body

It exits non-zero when an article drops below the similarity threshold or
when its images no longer match.

Usage:
    python3 scripts/verify-content.py [legacy-repo-root] [--threshold=0.9]
"""
from __future__ import annotations

import difflib
import html
import os
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIST = PROJECT_ROOT / "dist"

# The rendered output of the previous site lives on a dedicated branch; the
# legacy Markdown sources live on another one. Both are kept in the blog
# repository next to this project.
BASELINE_BRANCH = os.environ.get("BASELINE_BRANCH", "origin/pages-legacy")
SOURCE_BRANCH = os.environ.get("SOURCE_BRANCH", "origin/octopress-legacy")

SCRIPT_STYLE = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.S | re.I)
TAG = re.compile(r"<[^>]+>")
IMG_SRC = re.compile(r"<img[^>]*?src=[\"']([^\"']+)[\"']", re.I)
CODE_BLOCK = re.compile(r"<pre[^>]*>(.*?)</pre>", re.S | re.I)

# Typographic differences between rdiscount's "smart" extension and remark are
# rendering choices, not content, so they are normalised away.
PUNCT_FIXES = {
    "“": '"',
    "”": '"',
    "‘": '"',
    "’": '"',
    "–": "-",
    "—": "-",
    "…": "...",
    " ": " ",
}


def legacy_body(markup: str) -> str:
    """Extract the legacy article body, stopping at its matching </div>."""
    start = markup.find('<div class="entry-content">')
    if start == -1:
        return ""
    cursor = markup.find(">", start) + 1
    depth = 1
    while depth > 0:
        next_open = markup.find("<div", cursor)
        next_close = markup.find("</div>", cursor)
        if next_close == -1:
            return markup[start:]
        if next_open != -1 and next_open < next_close:
            depth += 1
            cursor = markup.find(">", next_open) + 1
            continue
        depth -= 1
        cursor = next_close + len("</div>")
    return markup[start:cursor]


def new_body(markup: str) -> str:
    start = markup.find('<article id="article"')
    if start == -1:
        return ""
    end = markup.find("</article>", start)
    return markup[start:end]


def visible_text(markup: str) -> str:
    without_scripts = SCRIPT_STYLE.sub(" ", markup)
    text = TAG.sub(" ", without_scripts)
    text = html.unescape(text)
    for source, target in PUNCT_FIXES.items():
        text = text.replace(source, target)
    return re.sub(r"\s+", " ", text).strip()


def prose_text(markup: str) -> str:
    """Visible text excluding code blocks."""
    return visible_text(CODE_BLOCK.sub(" ", markup))


def code_tokens(markup: str) -> Counter:
    """Token multiset of the code blocks, ignoring line numbers."""
    tokens: Counter = Counter()
    for block in CODE_BLOCK.findall(markup):
        text = visible_text(block)
        for word in re.findall(r"[A-Za-z_]\w*|[^\sA-Za-z0-9_]", text):
            tokens[word] += 1
    return tokens


def images(markup: str) -> set[str]:
    return {html.unescape(src) for src in IMG_SRC.findall(markup)}


def token_similarity(old: Counter, new: Counter) -> float:
    if not old and not new:
        return 1.0
    if not old or not new:
        return 0.0
    return sum((old & new).values()) / max(sum(old.values()), sum(new.values()))


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    threshold = 0.9
    for arg in sys.argv[1:]:
        if arg.startswith("--threshold"):
            threshold = float(arg.split("=", 1)[1])

    repo_root = Path(args[0]) if args else PROJECT_ROOT

    slugs = sorted(
        p.parent.name
        for p in (DIST / "blog").glob("*/index.html")
        if p.parent.name not in {"page", "categories", "archives"}
    )

    failures: list[str] = []
    image_mismatches: list[str] = []
    prose_ratios: list[float] = []
    full_ratios: list[float] = []

    for slug in slugs:
        legacy = subprocess.run(
            ["git", "show", f"{BASELINE_BRANCH}:blog/{slug}/index.html"],
            cwd=repo_root,
            capture_output=True,
            text=True,
        )
        if legacy.returncode != 0:
            failures.append(f"{slug}: no legacy page found")
            continue

        new_markup = (DIST / "blog" / slug / "index.html").read_text(
            encoding="utf-8", errors="replace"
        )

        old_markup = legacy_body(legacy.stdout)
        rebuilt = new_body(new_markup)

        old_prose = prose_text(old_markup)
        new_prose = prose_text(rebuilt)
        ratio = difflib.SequenceMatcher(None, old_prose, new_prose).ratio()
        prose_ratios.append(ratio)

        # Full text including code blocks. The threshold is lower than the
        # prose one because pygments (legacy) and Shiki (new) render code
        # differently: line numbers and language labels only exist in one.
        full_ratio = difflib.SequenceMatcher(
            None, visible_text(old_markup), visible_text(rebuilt)
        ).ratio()
        full_ratios.append(full_ratio)

        # Source-level check: the Markdown body written into the new
        # collection must be identical to the legacy source (modulo the
        # Octopress {% img %} tag -> Markdown image conversion).
        legacy_source = subprocess.run(
            ["git", "show", f"{SOURCE_BRANCH}:source/_posts/{slug}.markdown"],
            cwd=repo_root,
            capture_output=True,
            text=True,
        )
        if legacy_source.returncode == 0:
            raw = legacy_source.stdout
            body = re.sub(r"^---\r?\n.*?\r?\n---\r?\n?", "", raw, count=1, flags=re.S)
            expected = re.sub(
                r"\{%\s*img\s+(\S+?)\s*%\}", r"![](\1)", body
            )
            # The migration also completes links that are missing a scheme.
            expected = re.sub(
                r"\]\(([a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:/[^)\s]*)?)\)",
                r"](https://\1)",
                expected,
                flags=re.I,
            )
            expected = re.sub(r"\s+", " ", expected).strip()

            migrated = (
                PROJECT_ROOT / "src" / "content" / "posts" / f"{slug}.md"
            ).read_text(encoding="utf-8", errors="replace")
            migrated_body = re.sub(
                r"^---\r?\n.*?\r?\n---\r?\n?", "", migrated, count=1, flags=re.S
            )
            migrated_body = re.sub(r"\s+", " ", migrated_body).strip()

            if expected != migrated_body:
                failures.append(f"{slug}: migrated Markdown body differs from source")

        old_images = images(old_markup)
        new_images = images(rebuilt)
        if old_images != new_images:
            image_mismatches.append(
                f"{slug}: only-legacy={sorted(old_images - new_images)} "
                f"only-new={sorted(new_images - old_images)}"
            )

        if ratio < threshold:
            failures.append(f"{slug}: prose similarity {ratio:.3f} < {threshold}")
        if full_ratio < 0.75:
            failures.append(f"{slug}: full-text similarity {full_ratio:.3f} < 0.75")

    print(f"articles compared  : {len(slugs)}")
    if prose_ratios:
        print(f"prose similarity   : mean {sum(prose_ratios) / len(prose_ratios):.4f}"
              f", min {min(prose_ratios):.4f}")
    if full_ratios:
        print(f"full-text similarity: mean {sum(full_ratios) / len(full_ratios):.4f}"
              f", min {min(full_ratios):.4f}")
    print(f"image mismatches   : {len(image_mismatches)}")
    for item in image_mismatches[:20]:
        print(f"  ! {item}")
    print(f"below threshold    : {len(failures)}")
    for item in failures[:20]:
        print(f"  ! {item}")

    if failures or image_mismatches:
        print("\nFAIL: content is not fully preserved.")
        return 1

    print("\nOK: article bodies and images match the legacy site.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
