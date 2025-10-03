#!/usr/bin/env bash
set -euo pipefail

# Safe commit-and-push helper for this migration
# Usage: run from repository root: bash commit-and-push.sh

REPO_ROOT="$(pwd)"
MSG_FILE=".git-commit-message.txt"

if [ ! -f "$MSG_FILE" ]; then
  echo "Commit message file $MSG_FILE not found. Create it or modify the script." >&2
  exit 1
fi

# Optional: remove leftover my-jekyll-site directory if present
if [ -d "my-jekyll-site" ]; then
  echo "Removing leftover my-jekyll-site/ directory..."
  rm -rf my-jekyll-site
fi

# Stage all changes, commit using the prepared message file, and push to main
git add -A
if git diff --staged --quiet; then
  echo "No staged changes to commit." 
else
  git commit -F "$MSG_FILE"
  git push origin main
fi

echo "Done. If GitHub Actions is configured, Pages deployment will start automatically."
