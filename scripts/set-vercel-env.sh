#!/usr/bin/env bash
# Sets required env vars on the Vercel project via REST API.
# Usage: VERCEL_TOKEN=<your-token> ./scripts/set-vercel-env.sh
# Get a token at: https://vercel.com/account/tokens
set -euo pipefail

: "${VERCEL_TOKEN:?Please set VERCEL_TOKEN before running this script}"

PROJECT="prj_e0EyXyJYyMSUoxsZ16C63z8EDdOo"
TEAM="team_y6Bl4XIXXg09lIcO5J4AjNpO"
BASE="https://api.vercel.com/v10/projects/${PROJECT}/env?teamId=${TEAM}"

# Source local .env so values are picked up automatically
[ -f .env ] && set -a && . .env && set +a

upsert() {
  local key="$1" value="$2"
  [[ -z "$value" ]] && echo "  SKIP $key (empty)" && return
  echo "  → $key"

  # Try to create; if 400 (duplicate), patch the existing record instead
  HTTP=$(curl -s -o /tmp/venv_resp.json -w "%{http_code}" -X POST "$BASE" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"$key\",\"value\":\"$value\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\"]}")

  if [[ "$HTTP" == "400" ]]; then
    ID=$(curl -sf "https://api.vercel.com/v10/projects/${PROJECT}/env?teamId=${TEAM}&decrypt=false" \
      -H "Authorization: Bearer $VERCEL_TOKEN" | \
      python3 -c "import sys,json; [print(e['id']) for e in json.load(sys.stdin).get('envs',[]) if e['key']=='$key']" 2>/dev/null | head -1)
    [[ -n "$ID" ]] && curl -sf -X PATCH \
      "https://api.vercel.com/v10/projects/${PROJECT}/env/${ID}?teamId=${TEAM}" \
      -H "Authorization: Bearer $VERCEL_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"value\":\"$value\"}" > /dev/null && echo "    (updated existing)"
  fi
}

echo "Setting environment variables on Vercel project: fourdoor / ag-agent-socialmedia-jipx"
echo ""

upsert "GEMINI_API_KEY"    "${GEMINI_API_KEY:-}"
upsert "DATABASE_URL"      "${DATABASE_URL:-}"
upsert "CRON_SECRET"       "${CRON_SECRET:-}"
upsert "APP_URL"           "https://ag-agent-socialmedia-jipx.vercel.app"
upsert "DD_API_KEY"        "${DD_API_KEY:-}"
upsert "DD_SITE"           "datadoghq.eu"
upsert "DD_SERVICE"        "fourdoorai"
upsert "DD_ENV"            "production"
upsert "DD_LLMOBS_ML_APP"  "fourdoorai"
upsert "OPENAI_API_KEY"    "${OPENAI_API_KEY:-}"
upsert "ANTHROPIC_API_KEY" "${ANTHROPIC_API_KEY:-}"

echo ""
echo "✓ Done. Redeploy to pick up the new vars:"
echo "  git commit --allow-empty -m 'chore: trigger redeploy' && git push origin main"
