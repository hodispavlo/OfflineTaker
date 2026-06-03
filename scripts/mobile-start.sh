#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="$ROOT_DIR/.tools/node/bin:$PATH"
export EXPO_PUBLIC_API_BASE_URL="${EXPO_PUBLIC_API_BASE_URL:-http://127.0.0.1:8000}"

if ! command -v npm >/dev/null 2>&1; then
  "$ROOT_DIR/scripts/setup-node.sh"
fi

cd "$ROOT_DIR/mobile"
npm run start:clear
