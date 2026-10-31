#!/usr/bin/env bash
#
# Scan this repository (every branch and the working tree) for leaked
# credentials with git-leaks.
#
#   scripts/scan-secrets.sh          # scan both repositories
#
# The binary is downloaded on first use into .tools/ (git-ignored).
#
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="$PROJECT_DIR/.tools"
BINARY="$TOOLS_DIR/gitleaks"
CONFIG="$PROJECT_DIR/.gitleaks.toml"
VERSION="v8.30.1"
ARCHIVE="gitleaks_${VERSION#v}_linux_x64.tar.gz"
URL="https://github.com/gitleaks/gitleaks/releases/download/${VERSION}/${ARCHIVE}"

if [ ! -x "$BINARY" ]; then
  echo "==> downloading git-leaks $VERSION"
  mkdir -p "$TOOLS_DIR"
  tmp="$(mktemp)"
  curl -sSL --max-time 180 "$URL" -o "$tmp"
  tar -xzf "$tmp" -C "$TOOLS_DIR" gitleaks
  rm -f "$tmp"
  chmod +x "$BINARY"
fi

status=0

echo "==> scanning the Astro repository (history)"
"$BINARY" git "$PROJECT_DIR" --config "$CONFIG" --redact --no-banner --no-color -v || status=1

echo
echo "==> scanning the Astro repository (working tree, including .env)"
"$BINARY" dir "$PROJECT_DIR" --config "$CONFIG" --redact --no-banner --no-color -v || status=1

exit $status
