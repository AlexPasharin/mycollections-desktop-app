#!/usr/bin/env bash
# Prints the active DATABASE_URL from the project .env (first non-comment assignment).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "No .env at ${ENV_FILE}" >&2
  exit 1
fi

url=""
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line//$'\r'/}"
  line_trim="${line#"${line%%[![:space:]]*}"}"
  [[ "$line_trim" == \#* ]] && continue
  [[ "$line_trim" != DATABASE_URL=* ]] && continue

  value="${line_trim#DATABASE_URL=}"
  if [[ "$value" == \"*\" ]]; then
    value="${value#\"}"
    value="${value%\"}"
  elif [[ "$value" == \'*\' ]]; then
    value="${value#\'}"
    value="${value%\'}"
  fi

  url="$value"
  break
done <"$ENV_FILE"

if [[ -z "$url" ]]; then
  echo "No active DATABASE_URL in .env (uncomment a DATABASE_URL= line)." >&2
  exit 1
fi

echo "DATABASE_URL=${url}"
