#!/usr/bin/env bash
set -e

# CI environments don't need the dev host
if [ "$CI" = "true" ]; then
  echo "CI detected — skipping dev-host setup."
  exit 0
fi

# 1. Initialize / update the submodule
git submodule update --init --recursive 2>/dev/null || true

# If the submodule directory wasn't populated, fall back to a direct clone
if [ ! -e "kartverket.dev/.git" ]; then
  echo "Submodule not populated (pinned commit may no longer exist). Cloning directly..."
  rm -rf kartverket.dev
  git clone https://github.com/kartverket/kartverket.dev.git kartverket.dev
fi

# 2. Symlink the live plugin source into the host's workspaces, as well as the app config files
mkdir -p kartverket.dev/plugins
ln -s ../../plugins/ros kartverket.dev/plugins/ros
ln -s ../app-config.local.yaml kartverket.dev/app-config.local.yaml
rm -f kartverket.dev/app-config.yaml
ln -s ../app-config.yaml kartverket.dev/app-config.yaml

# 4. Install host deps
(cd ./kartverket.dev && yarn install)

echo ""
echo "✅ Dev host ready. Run (in kartverket.dev):  yarn dev"
