#!/usr/bin/env bash
set -euo pipefail

URL="${1:-https://www.switchhands.ai}"

echo "Running smoke checks for: ${URL}"

# 1) Basic reachability
status_code="$(curl -sS -o /tmp/switchhands-body.html -w '%{http_code}' "${URL}" || true)"
if [[ "${status_code}" =~ ^2|3 ]]; then
  echo "[PASS] Reachability returned HTTP ${status_code}"
else
  echo "[FAIL] Reachability returned HTTP ${status_code}"
fi

# 2) HTTP -> HTTPS redirect
http_url="${URL/https:/http:}"
redirect_code="$(curl -sS -I -o /tmp/switchhands-headers-http.txt -w '%{http_code}' "${http_url}" || true)"
if [[ "${redirect_code}" =~ ^30[1278]$ ]]; then
  echo "[PASS] HTTP redirects with HTTP ${redirect_code}"
else
  echo "[WARN] HTTP redirect not detected (HTTP ${redirect_code})"
fi

# 3) Core security headers
headers="$(curl -sS -I "${URL}" || true)"
for h in "strict-transport-security" "content-security-policy" "x-content-type-options"; do
  if echo "${headers}" | tr '[:upper:]' '[:lower:]' | grep -q "^${h}:"; then
    echo "[PASS] Header present: ${h}"
  else
    echo "[WARN] Header missing: ${h}"
  fi
done

# 4) Basic content sanity
if [[ -f /tmp/switchhands-body.html ]] && grep -qi "<html" /tmp/switchhands-body.html; then
  echo "[PASS] HTML payload detected"
else
  echo "[WARN] HTML payload not detected"
fi
