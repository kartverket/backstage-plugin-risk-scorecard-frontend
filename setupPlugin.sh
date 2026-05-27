#!/bin/bash
set -e
echo "Starting plugin setup. Make sure you have setup app-config.local.yaml and cloned kartverket.dev..."

# Save current working directory to return to it later
cwd=$(pwd)

read -p "Enter kartverket.dev path: " kartverket_dev_path

# ── Copy config files ─────────────────────────────────────────────────────────
cp ./app-config.yaml "$kartverket_dev_path/app-config.yaml"
cp ./app-config.local.yaml "$kartverket_dev_path/app-config.local.yaml"
echo "app-config.yaml and app-config.local.yaml copied to $kartverket_dev_path"

yarn install

cd "$kartverket_dev_path"

# ── Add portal: resolutions so Yarn resolves @internal packages locally ───────
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.resolutions = pkg.resolutions || {};
pkg.resolutions['@internal/ros-backend'] = 'portal:${cwd}/ros-backend';
pkg.resolutions['@internal/backstage-plugin-ros-common'] = 'portal:${cwd}/ros-common';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('Added portal: resolutions to root package.json');
"

# ── Add @internal/ros-backend as a backend dependency (idempotent) ────────────
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('packages/backend/package.json', 'utf8'));
pkg.dependencies = pkg.dependencies || {};
if (!pkg.dependencies['@internal/ros-backend']) {
  pkg.dependencies['@internal/ros-backend'] = '*';
  fs.writeFileSync('packages/backend/package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('Added @internal/ros-backend to packages/backend/package.json');
} else {
  console.log('@internal/ros-backend already present in packages/backend/package.json');
}
"

# ── Register the backend plugin in packages/backend/src/index.ts (idempotent) -
if ! grep -q '@internal/ros-backend' packages/backend/src/index.ts; then
  sed -i '' "s|backend\.start();|backend.add(import('@internal/ros-backend'));\nbackend.start();|" packages/backend/src/index.ts
  echo "Registered ros-backend plugin in packages/backend/src/index.ts"
else
  echo "ros-backend already registered in packages/backend/src/index.ts"
fi

# ── Install and start ─────────────────────────────────────────────────────────
yarn install

echo "Plugin setup complete. Starting development server..."

yarn dev --link "$cwd"
