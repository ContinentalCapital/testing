#!/usr/bin/env bash
set -euo pipefail

TARGET="src/hooks/useRealtimeSwitchlistMatcher.tsx"

if [[ ! -f "$TARGET" ]]; then
  echo "[WARN] $TARGET not found in this repo. Sync Lovable app source first."
  exit 0
fi

fail=0

check() {
  local pattern="$1"
  local label="$2"
  if rg -n "$pattern" "$TARGET" >/dev/null; then
    echo "[PASS] $label"
  else
    echo "[FAIL] $label"
    fail=1
  fi
}

check "if\s*\(!user\)\s*\{?\s*return" "Subscription is gated on authenticated user"
check "safeSubscribe\(" "Uses safeSubscribe wrapper"
check "removeSafeChannel\(" "Uses removeSafeChannel cleanup"
check "console\.debug\(" "Debug logs downgraded to console.debug"

if rg -n "console\.log\(" "$TARGET" >/dev/null; then
  echo "[FAIL] console.log calls still present"
  fail=1
else
  echo "[PASS] No console.log calls remain"
fi

if [[ "$fail" -ne 0 ]]; then
  echo "[RESULT] Realtime 403 fix verification FAILED"
  exit 1
fi

echo "[RESULT] Realtime 403 fix verification PASSED"
