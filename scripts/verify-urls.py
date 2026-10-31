#!/usr/bin/env python3
"""Verify that the rebuilt site exposes exactly the legacy URL set.

Compares the HTML pages of the legacy Octopress output (git branch `master`
of the old repository) with the pages produced by `astro build` in `dist/`.

Any URL present in the legacy site but missing from the new build is a
regression: inbound links, bookmarks and search-engine rankings for those
paths would break.

Usage:
    python3 scripts/verify-urls.py [legacy-repo-root]
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIST = PROJECT_ROOT / "dist"

# Branch holding the rendered output of the previous site.
BASELINE_BRANCH = os.environ.get("BASELINE_BRANCH", "origin/pages-legacy")


def normalise(path: str) -> str:
    """Turn a file path into the URL a browser would request."""
    path = path.strip("/")
    if path.endswith("/index.html"):
        return "/" + path[: -len("index.html")]
    if path == "index.html":
        return "/"
    return "/" + path


def legacy_urls(repo_root: Path) -> set[str]:
    result = subprocess.run(
        ["git", "ls-tree", "-r", BASELINE_BRANCH, "--name-only"],
        cwd=repo_root,
        capture_output=True,
        text=True,
        check=True,
    )
    return {
        normalise(line)
        for line in result.stdout.splitlines()
        if line.endswith(".html")
    }


def new_urls() -> set[str]:
    return {
        normalise(str(path.relative_to(DIST)))
        for path in DIST.rglob("*.html")
    }


def main() -> int:
    repo_root = Path(sys.argv[1]) if len(sys.argv) > 1 else PROJECT_ROOT
    if not DIST.exists():
        print(f"dist/ not found — run `astro build` first ({DIST})")
        return 2

    old = legacy_urls(repo_root)
    new = new_urls()

    missing = sorted(old - new)
    added = sorted(new - old)

    print(f"legacy pages : {len(old)}")
    print(f"new pages    : {len(new)}")
    print(f"missing      : {len(missing)}")
    print(f"added        : {len(added)}")

    if missing:
        print("\n--- MISSING (legacy URLs that no longer exist) ---")
        for url in missing:
            print(url)

    if added:
        print("\n--- ADDED (new URLs, safe but worth reviewing) ---")
        for url in added:
            print(url)

    if missing:
        print("\nFAIL: legacy URLs are not preserved.")
        return 1

    print("\nOK: every legacy URL is preserved.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
