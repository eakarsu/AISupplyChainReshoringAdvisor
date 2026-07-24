#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a
source "$PROJECT_DIR/.env"
set +a

: "${BACKEND_PORT:?BACKEND_PORT is required}"
: "${FRONTEND_PORT:?FRONTEND_PORT is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${JWT_SECRET:?JWT_SECRET is required}"
: "${GOVERNANCE_TENANT_ID:?GOVERNANCE_TENANT_ID is required}"
: "${OPENROUTER_API_KEY:?OPENROUTER_API_KEY is required}"
: "${OPENROUTER_MODEL:?OPENROUTER_MODEL is required}"
: "${OPENROUTER_BASE_URL:?OPENROUTER_BASE_URL is required}"
[[ ${#JWT_SECRET} -ge 32 ]] || { echo "JWT_SECRET must contain at least 32 characters." >&2; exit 1; }
[[ "${ALLOW_SCHEMA_MIGRATION:-}" == "true" || "${ALLOW_SCHEMA_MIGRATION:-}" == "1" ]] ||
  { echo "ALLOW_SCHEMA_MIGRATION=true is required." >&2; exit 1; }
export ENABLE_GENERATED_FEATURES="${ENABLE_GENERATED_FEATURES:-true}"

for directory in "$PROJECT_DIR/backend/node_modules" "$PROJECT_DIR/frontend/node_modules"; do
  [[ -d "$directory" ]] || { echo "Missing dependencies: $directory" >&2; exit 1; }
done
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use; no process was changed." >&2
    exit 1
  fi
done

node "$PROJECT_DIR/backend/scripts/prepareRuntime.js"

api_pid=''
ui_pid=''
cleanup() {
  trap - EXIT INT TERM
  [[ -z "$ui_pid" ]] || kill "$ui_pid" 2>/dev/null || true
  [[ -z "$api_pid" ]] || kill "$api_pid" 2>/dev/null || true
  [[ -z "$ui_pid" ]] || wait "$ui_pid" 2>/dev/null || true
  [[ -z "$api_pid" ]] || wait "$api_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(cd "$PROJECT_DIR/backend" && PORT="$BACKEND_PORT" BACKEND_PORT="$BACKEND_PORT" node server.js) &
api_pid=$!
(cd "$PROJECT_DIR/frontend" && BROWSER=none PORT="$FRONTEND_PORT" REACT_APP_API_URL="http://127.0.0.1:$BACKEND_PORT/api" npx react-scripts start) &
ui_pid=$!
echo "Reshoring API: http://127.0.0.1:$BACKEND_PORT"
echo "Frontend: http://127.0.0.1:$FRONTEND_PORT"
wait "$api_pid" "$ui_pid"
