#!/usr/bin/env bash
# Reads LOCAL_* / REMOTE_* / PRISMA_* DB URL keys from `.env`, compares PRISMA_DB_URL to the three
# Kysely URLs, and prints where Prisma points. Usage: bash check-prisma-db-url.sh (yarn which-prisma-db).
# Always exits 0 — use ✅/❌ in the printed line to distinguish outcomes.

set -euo pipefail

ANSI_RED_BOLD=""
ANSI_RESET=""
if [[ -t 1 ]] || [[ -t 2 ]]; then
  ANSI_RED_BOLD=$'\033[1;31m'
  ANSI_RESET=$'\033[0m'
fi

EMOJI_SUCCESS="✅"
EMOJI_ERROR="❌"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

# Reads one KEY=VALUE from ENV_FILE (first non-comment occurrence). Writes the value without trailing newline (may be empty).
read_env_assignment() {
  local KEY="$1"
  local ENV_FILE_LOCAL="$2"
  local prefix="${KEY}="
  local value=""

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line//$'\r'/}"
    line_trim="${line#"${line%%[![:space:]]*}"}"
    [[ "$line_trim" == \#* ]] && continue
    [[ "$line_trim" != "$prefix"* ]] && continue

    value="${line_trim#"$prefix"}"
    if [[ "$value" == \"*\" ]]; then
      value="${value#\"}"
      value="${value%\"}"
    elif [[ "$value" == \'*\' ]]; then
      value="${value#\'}"
      value="${value%\'}"
    fi

    break
  done <"$ENV_FILE_LOCAL"

  printf "%s" "$value"
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "${ANSI_RED_BOLD}${EMOJI_ERROR} No .env at ${ENV_FILE}${ANSI_RESET}" >&2
  exit 0
fi

LOCAL_DEV="$(read_env_assignment LOCAL_DEV_DB_URL "$ENV_FILE")"
LOCAL_PROD="$(read_env_assignment LOCAL_PROD_DB_URL "$ENV_FILE")"
REMOTE_PROD="$(read_env_assignment REMOTE_PROD_DB_URL "$ENV_FILE")"
PRISMA="$(read_env_assignment PRISMA_DB_URL "$ENV_FILE")"

if [[ -z "$PRISMA" ]]; then
  echo "${ANSI_RED_BOLD}${EMOJI_ERROR} Error: PRISMA_DB_URL is missing or empty in .env${ANSI_RESET}" >&2
  exit 0
fi

if [[ -n "$LOCAL_DEV" && "$PRISMA" == "$LOCAL_DEV" ]]; then
  echo "${EMOJI_SUCCESS} Prisma DB URL points to ${ANSI_RED_BOLD}LOCAL DEV DB${ANSI_RESET}"
  exit 0
fi

if [[ -n "$LOCAL_PROD" && "$PRISMA" == "$LOCAL_PROD" ]]; then
  echo "${EMOJI_SUCCESS} Prisma DB URL points to ${ANSI_RED_BOLD}LOCAL PROD DB${ANSI_RESET}"
  exit 0
fi

if [[ -n "$REMOTE_PROD" && "$PRISMA" == "$REMOTE_PROD" ]]; then
  echo "${EMOJI_SUCCESS} Prisma DB URL points to ${ANSI_RED_BOLD}REMOTE PROD DB${ANSI_RESET}"
  exit 0
fi

echo "${ANSI_RED_BOLD}${EMOJI_ERROR} Error: Prisma DB URL does not match any of the allowed DB URL values${ANSI_RESET}" >&2
exit 0
