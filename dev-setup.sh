#!/usr/bin/env bash
set -e

# CI environments don't need the dev host
if [ "$CI" = "true" ]; then
  echo "CI detected — skipping dev-host setup."
  exit 0
fi

# 1. Initialize / update the submodule
git submodule update --init --recursive

# 2. Symlink the live plugin source into the host's workspaces
ln -s ../../plugins/ros kartverket.dev/plugins/ros
ln -s ../app-config.local.yaml kartverket.dev/app-config.local.yaml

# 4. Install host deps
(cd ./kartverket.dev && yarn install)

echo ""
echo "✅ Dev host ready. Run (in kartverket.dev):  yarn dev"

# test