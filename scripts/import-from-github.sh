#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <github_repo_url> [branch]"
  exit 2
fi

REPO_URL="$1"
BRANCH="${2:-main}"

if [[ "$REPO_URL" == *"<your-username>"* || "$REPO_URL" == *"<your-repo-name>"* || "$REPO_URL" == *"<"* ]]; then
  echo "[ERROR] Replace placeholder values in the repo URL."
  echo "[HINT] Example: git clone https://github.com/acme/switchhands-app.git"
  exit 2
fi
WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "[INFO] Cloning ${REPO_URL} (branch: ${BRANCH})"
if ! git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$TMP_DIR/repo"; then
  echo "[ERROR] Clone failed. Check repo URL/branch/auth."
  exit 1
fi

echo "[INFO] Syncing files into ${WORKDIR}"
rsync -a --delete \
  --exclude '.git' \
  "$TMP_DIR/repo/" "$WORKDIR/"

echo "[INFO] Import complete. Current repo now mirrors remote content (excluding .git)."
echo "[INFO] Next steps: git status && run project build/test commands."
