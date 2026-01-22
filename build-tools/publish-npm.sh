#!/usr/bin/env bash
#
# publish-npm.sh
# Publishes the plugin package to npm registry.
# Supports OIDC trusted publishing via NODE_AUTH_TOKEN.
#
# Usage: ./publish-npm.sh --version VERSION [--dry-run] [--tarball-dir DIR]
#
# Options:
#   --version VERSION    The version to publish (required)
#   --dry-run            Show what would be published without actually publishing
#   --tarball-dir DIR    Directory to store the tarball (default: dist)
#
# Environment variables:
#   NODE_AUTH_TOKEN      NPM authentication token (required for publish, set by OIDC)
#   NPM_CONFIG_PROVENANCE  Set to "true" for npm provenance (set automatically in CI)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_DIR="$REPO_ROOT/plugins/ros"
PACKAGE_JSON="$PLUGIN_DIR/package.json"

VERSION=""
DRY_RUN=false
TARBALL_DIR="dist"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            VERSION="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --tarball-dir)
            TARBALL_DIR="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

if [[ -z "$VERSION" ]]; then
    echo "Error: --version is required" >&2
    exit 1
fi

cd "$PLUGIN_DIR"

# Backup original package.json
backup_package_json() {
    cp "$PACKAGE_JSON" "$PACKAGE_JSON.backup"
}

# Restore original package.json
restore_package_json() {
    if [[ -f "$PACKAGE_JSON.backup" ]]; then
        mv "$PACKAGE_JSON.backup" "$PACKAGE_JSON"
    fi
}

# Set version in package.json
set_version() {
    local version="$1"
    echo "Setting version to $version in package.json" >&2
    
    # Use node to update version (more reliable than sed for JSON)
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8'));
        pkg.version = '$version';
        fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkg, null, 2) + '\n');
    "
}

# Create tarball
create_tarball() {
    local tarball_path="$PLUGIN_DIR/$TARBALL_DIR"
    mkdir -p "$tarball_path"
    
    echo "Creating tarball in $tarball_path" >&2
    
    # Use yarn pack to create tarball
    # The --out option specifies the output path
    yarn pack --out "$tarball_path/kartverket-backstage-plugin-risk-scorecard-$VERSION.tgz"
    
    # Return the tarball filename
    echo "$tarball_path/kartverket-backstage-plugin-risk-scorecard-$VERSION.tgz"
}

# Publish to npm
publish_to_npm() {
    local tarball="$1"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "DRY RUN: Would publish $tarball to npm" >&2
        echo "DRY RUN: Package details:" >&2
        tar -tzf "$tarball" | head -20 >&2
        return
    fi
    
    # Check authentication method
    # Supports either:
    # 1. NODE_AUTH_TOKEN - Classic npm token or granular access token
    # 2. OIDC trusted publishing - Token-less auth via GitHub Actions OIDC
    if [[ -n "${NODE_AUTH_TOKEN:-}" ]]; then
        echo "Using NODE_AUTH_TOKEN for npm authentication" >&2
    elif [[ -n "${ACTIONS_ID_TOKEN_REQUEST_URL:-}" ]]; then
        # OIDC environment detected (GitHub Actions with id-token: write)
        echo "Using OIDC trusted publishing (no token)" >&2
        echo "Note: Package must be configured for trusted publishing on npmjs.com" >&2
    else
        echo "Error: No npm authentication method available" >&2
        echo "Either:" >&2
        echo "  1. Set NODE_AUTH_TOKEN environment variable, or" >&2
        echo "  2. Run in GitHub Actions with id-token: write permission" >&2
        echo "     and configure trusted publishing on npmjs.com" >&2
        exit 1
    fi
    
    echo "Publishing to npm..." >&2
    
    # Publish with public access (scoped package)
    # The tarball is already built, so we publish it directly
    yarn npm publish "$tarball" --access public
    
    echo "Successfully published version $VERSION to npm" >&2
}

# Cleanup handler
cleanup() {
    restore_package_json
}

# Main logic
main() {
    echo "=== NPM Publish ===" >&2
    echo "Version: $VERSION" >&2
    echo "Dry run: $DRY_RUN" >&2
    echo "Plugin directory: $PLUGIN_DIR" >&2
    
    # Ensure cleanup runs on exit
    trap cleanup EXIT
    
    # Backup and set version
    backup_package_json
    set_version "$VERSION"
    
    # Build the package first (prepack runs automatically with yarn pack)
    echo "Building package..." >&2
    yarn build
    
    # Create tarball
    local tarball
    tarball=$(create_tarball)
    echo "Created tarball: $tarball" >&2
    
    # Publish
    publish_to_npm "$tarball"
    
    # Output tarball path for use by other scripts
    echo "TARBALL_PATH=$tarball"
}

main
