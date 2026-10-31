#!/usr/bin/env bash
#
# Build the site and publish it to the GitHub Pages branch (master).
#
# The repository has two branches:
#   source -> this Astro project (the working tree you are in)
#   master -> the built site, served by GitHub Pages
#
# The pages branch is checked out into a temporary git worktree, so the
# source tree is never touched by the deployment.
#
# Usage: scripts/publish.sh [--no-push]
#
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PAGES_BRANCH="${PAGES_BRANCH:-master}"
PUSH=1

for arg in "$@"; do
  case "$arg" in
    --no-push) PUSH=0 ;;
    *) echo "unknown argument: $arg" >&2; exit 1 ;;
  esac
done

# Git over SSH fails when the system-wide ssh_config is unreadable; skipping
# it (-F /dev/null) keeps the usual key-based auth working.
export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -F /dev/null -o StrictHostKeyChecking=no}"

echo "==> building"
cd "$PROJECT_DIR"
npm run build

if [ ! -d "$PROJECT_DIR/dist" ]; then
  echo "build produced no dist/" >&2
  exit 1
fi

echo "==> preparing a $PAGES_BRANCH worktree"
WORKTREE="$(mktemp -d)"
rmdir "$WORKTREE"
cleanup() {
  git -C "$PROJECT_DIR" worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true
  rm -rf "$WORKTREE" >/dev/null 2>&1 || true
}
trap cleanup EXIT

git -C "$PROJECT_DIR" worktree add --force "$WORKTREE" "$PAGES_BRANCH"

cd "$WORKTREE"

# Drop the previously published files. In a worktree .git is a file, so it
# has to be skipped explicitly.
find . -path ./.git -prune -o -type f -print0 | xargs -0 rm -f
find . -path ./.git -prune -o -depth -type d -empty -print0 | xargs -0 rmdir 2>/dev/null || true

cp -r "$PROJECT_DIR/dist"/. .
touch .nojekyll

git add -A
if git diff --cached --quiet; then
  echo "==> nothing changed, skipping commit"
else
  git commit -q -m "build: deploy $(git -C "$PROJECT_DIR" rev-parse --short HEAD)"
  echo "==> committed $(git rev-parse --short HEAD)"
fi

if [ "$PUSH" -eq 1 ]; then
  echo "==> pushing to origin/$PAGES_BRANCH"
  git push --force origin "$PAGES_BRANCH"
else
  echo "==> skipping push (--no-push)"
fi

echo "==> done"
