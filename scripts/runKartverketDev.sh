#!/bin/bash
set -eu

cwd=$(pwd)
kartverket_dev_path="../kartverket.dev"
kartverket_dev_display=$(cd "$kartverket_dev_path" 2>/dev/null && pwd || echo "$kartverket_dev_path")

step() {
  echo
  echo "[$1/5] $2"
}

echo "Using plugin repo: $cwd"
echo "Using host app:    $kartverket_dev_display"

step 1 "Checking kartverket.dev config"
if [ ! -f "$kartverket_dev_path/app-config.local.yaml" ]; then
  echo "Missing $kartverket_dev_path/app-config.local.yaml. Follow README.md." >&2
  exit 1
fi
echo "Found $kartverket_dev_path/app-config.local.yaml."

cd "$kartverket_dev_path"

install_state=".yarn/install-state.gz"

step 2 "Updating kartverket.dev checkout"
branch=$(git branch --show-current)
if [ "$branch" = "main" ]; then
  echo "On main; pulling latest changes."
  git pull --ff-only --quiet
  echo "kartverket.dev checkout is up to date."
else
  echo "Skipping git pull because kartverket.dev is on ${branch:-detached HEAD}, not main."
fi

step 3 "Installing kartverket.dev dependencies if needed"
if [ ! -f "$install_state" ] ||
   [ "package.json" -nt "$install_state" ] ||
   [ "packages/app/package.json" -nt "$install_state" ] ||
   [ "packages/backend/package.json" -nt "$install_state" ] ||
   [ "yarn.lock" -nt "$install_state" ]; then
  echo "Changes detected; running yarn install."
  yarn install
else
  echo "No install needed; install state is newer than package manifests."
fi

step 4 "Checking dependency alignment"
node "$cwd/scripts/checkKartverketDevDependencies.mjs"

step 5 "Starting kartverket.dev with plugin link"
echo "Running yarn dev --link $cwd"
yarn dev --link "$cwd"
