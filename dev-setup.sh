#!/usr/bin/env bash
set -e

# CI environments don't need the dev host
if [ "$CI" = "true" ]; then
  echo "CI detected — skipping dev-host setup."
  exit 0
fi

# 1. Initialize / update the submodule
echo "Initializing submodule kartverket.dev..."
if ! git submodule update --init --recursive; then
  echo "Submodule update failed (possibly missing commit). Removing and cloning directly..."
  rm -rf kartverket.dev
  git clone https://github.com/kartverket/kartverket.dev.git kartverket.dev
else
  # Check if submodule is valid (expecting kartverket.dev/package.json as a marker file)
  if [ ! -f "kartverket.dev/package.json" ]; then
    echo "Submodule not populated or incomplete. Removing and cloning directly..."
    rm -rf kartverket.dev
    git clone https://github.com/kartverket/kartverket.dev.git kartverket.dev
  fi
fi

# 2. Symlink the live plugin source into the host's workspaces, as well as the app config files
ln -s $(pwd)/plugins/ros kartverket.dev/plugins/ros

if [ -f "app-config.local.yaml" ]; then
  echo "Found app-config.local.yaml, linking it to the dev host..."
  ln -s ../app-config.local.yaml kartverket.dev/app-config.local.yaml
else
  echo "No app-config.local.yaml found."
fi

rm kartverket.dev/app-config.yaml
ln -s ../app-config.yaml kartverket.dev/app-config.yaml

# 4. Install host deps
(cd ./kartverket.dev && yarn install)

echo ""
echo "✅ Dev host ready. Run (in kartverket.dev):  yarn dev"
