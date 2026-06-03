#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="20.18.1"
NODE_DIR="$ROOT_DIR/.tools/node"
ARCHIVE="/private/tmp/offlinetaker-node-v${NODE_VERSION}.tar.gz"

if [[ "$(uname -s)" != "Darwin" || "$(uname -m)" != "arm64" ]]; then
  echo "This helper currently installs Node.js for macOS arm64 only." >&2
  exit 1
fi

if [[ -x "$NODE_DIR/bin/npm" ]]; then
  "$NODE_DIR/bin/node" --version
  "$NODE_DIR/bin/npm" --version
  exit 0
fi

mkdir -p "$ROOT_DIR/.tools"
curl -L "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-arm64.tar.gz" -o "$ARCHIVE"
tar -xzf "$ARCHIVE" -C "$ROOT_DIR/.tools"
rm -rf "$NODE_DIR"
mv "$ROOT_DIR/.tools/node-v${NODE_VERSION}-darwin-arm64" "$NODE_DIR"

"$NODE_DIR/bin/node" --version
"$NODE_DIR/bin/npm" --version
