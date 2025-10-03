#!/usr/bin/env bash
set -euo pipefail

# Fetch KaTeX distribution files (CSS, JS, contrib/auto-render, fonts) into assets/vendor/katex
# Usage: from repo root: ./scripts/fetch-katex.sh

KATEX_VERSION="0.16.8"
DEST_DIR="assets/vendor/katex"

echo "Fetching KaTeX $KATEX_VERSION into $DEST_DIR"
mkdir -p "$DEST_DIR"

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "Downloading package tarball..."
curl -L -o "$TMPDIR/katex.tgz" "https://registry.npmjs.org/katex/-/katex-$KATEX_VERSION.tgz"

echo "Extracting dist files..."
tar -xzf "$TMPDIR/katex.tgz" -C "$TMPDIR"

if [ -d "$TMPDIR/package/dist" ]; then
  cp -R "$TMPDIR/package/dist/"* "$DEST_DIR/"
  echo "Copied KaTeX dist files to $DEST_DIR"
else
  echo "ERROR: expected dist files inside package; aborting"
  exit 2
fi

echo "Done. You can now commit $DEST_DIR to your repository."
