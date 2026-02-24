#!/usr/bin/env bash
set -euo pipefail

echo "[INFO] Running repository security checks"

if command -v npm >/dev/null 2>&1 && [[ -f package.json ]]; then
  echo "[INFO] npm audit (production)"
  npm audit --omit=dev || true
else
  echo "[WARN] Skipping npm audit (npm/package.json not found)"
fi

if command -v pnpm >/dev/null 2>&1 && [[ -f pnpm-lock.yaml ]]; then
  echo "[INFO] pnpm audit"
  pnpm audit || true
fi

if command -v pip-audit >/dev/null 2>&1 && ([[ -f requirements.txt ]] || [[ -f pyproject.toml ]]); then
  echo "[INFO] pip-audit"
  pip-audit || true
else
  echo "[WARN] Skipping pip-audit (tool or python deps file missing)"
fi

if command -v gitleaks >/dev/null 2>&1; then
  echo "[INFO] gitleaks secret scan"
  gitleaks detect --no-banner --source . || true
else
  echo "[WARN] Skipping gitleaks (not installed)"
fi

echo "[INFO] Security scan completed"
