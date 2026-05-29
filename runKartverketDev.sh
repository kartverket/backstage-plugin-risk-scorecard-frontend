#!/bin/bash
set -eu

kartverket_dev_path="../kartverket.dev"

if [ ! -f "$kartverket_dev_path/app-config.local.yaml" ]; then
  echo "Missing $kartverket_dev_path/app-config.local.yaml. Follow README.md." >&2
  exit 1
fi

cwd=$(pwd)

cd "$kartverket_dev_path"


## ── Add portal: resolutions so Yarn resolves @internal packages locally ───────
#node -e "
#const fs = require('fs');
#const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
#pkg.resolutions = pkg.resolutions || {};
#pkg.resolutions['@internal/ros-backend'] = 'portal:${cwd}/ros-backend';
#fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
#console.log('Added portal: resolutions to root package.json');
#"
#
## ── Add @internal/ros-backend as a backend dependency (idempotent) ────────────
#node -e "
#const fs = require('fs');
#const pkg = JSON.parse(fs.readFileSync('packages/backend/package.json', 'utf8'));
#pkg.dependencies = pkg.dependencies || {};
#if (!pkg.dependencies['@internal/ros-backend']) {
#  pkg.dependencies['@internal/ros-backend'] = '*';
#  fs.writeFileSync('packages/backend/package.json', JSON.stringify(pkg, null, 2) + '\n');
#  console.log('Added @internal/ros-backend to packages/backend/package.json');
#} else {
#  console.log('@internal/ros-backend already present in packages/backend/package.json');
#}
#"
#
## ── Register the backend plugin in packages/backend/src/index.ts (idempotent) -
#if ! grep -q '@internal/ros-backend' packages/backend/src/index.ts; then
#  sed -i '' "s|backend\.start();|backend.add(import('@internal/ros-backend'));\nbackend.start();|" packages/backend/src/index.ts
#  echo "Registered ros-backend plugin in packages/backend/src/index.ts"
#else
#  echo "ros-backend already registered in packages/backend/src/index.ts"
#fi

# ── Install and start ─────────────────────────────────────────────────────────
install_state=".yarn/install-state.gz"

if [ ! -f "$install_state" ] ||
   [ "package.json" -nt "$install_state" ] ||
   [ "packages/app/package.json" -nt "$install_state" ] ||
   [ "packages/backend/package.json" -nt "$install_state" ] ||
   [ "yarn.lock" -nt "$install_state" ]; then
  echo "Changes detected. Running yarn install"
  yarn install
fi

yarn dev --link "$cwd"