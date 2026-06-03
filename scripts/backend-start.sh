#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/backend"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
  .venv/bin/python -m pip install -r requirements.txt
fi

.venv/bin/uvicorn app.main:app --reload
