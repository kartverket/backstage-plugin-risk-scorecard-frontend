#!/bin/bash
set -eu

kartverket_dev_path="../kartverket.dev"

if [ ! -f "$kartverket_dev_path/app-config.local.yaml" ]; then
  echo "Missing $kartverket_dev_path/app-config.local.yaml. Follow README.md." >&2
  exit 1
fi

cwd=$(pwd)

cd "$kartverket_dev_path"

# ── Install and start ─────────────────────────────────────────────────────────
install_state=".yarn/install-state.gz"

branch=$(git branch --show-current)
if [ "$branch" = "main" ]; then
  git pull --ff-only --quiet
else
  echo "Skipping git pull in kartverket.dev because branch is ${branch:-detached HEAD}, not main"
fi

if [ ! -f "$install_state" ] ||
   [ "package.json" -nt "$install_state" ] ||
   [ "packages/app/package.json" -nt "$install_state" ] ||
   [ "packages/backend/package.json" -nt "$install_state" ] ||
   [ "yarn.lock" -nt "$install_state" ]; then
  echo "Changes detected. Running yarn install"
  yarn install
fi

node "$cwd/scripts/checkKartverketDevDependencies.mjs" "$cwd" "$(pwd)"

yarn dev --link "$cwd"
