#!/usr/bin/env bash
#
# release.sh
# Main orchestrator for the release process.
# Analyzes commits, publishes to npm, and creates GitHub release.
#
# Usage: ./release.sh [--dry-run]
#
# Options:
#   --dry-run    Only analyze commits and show what version would be released.
#                Does not build, publish, or create releases.
#
# In dry-run mode, outputs:
#   CURRENT_VERSION=X.Y.Z
#   NEXT_VERSION=X.Y.Z
#   WILL_RELEASE=true|false
#
# Environment variables (required for full release):
#   GITHUB_TOKEN         GitHub token for creating releases
#   NODE_AUTH_TOKEN      NPM token for publishing (set via OIDC in CI)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DRY_RUN=false
TESTING_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --testing)
            TESTING_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Temporary files
ANALYSIS_FILE=$(mktemp)
NOTES_FILE=$(mktemp)
trap "rm -f $ANALYSIS_FILE $NOTES_FILE" EXIT

# Step 1: Analyze commits
echo "=== Step 1: Analyzing commits ===" >&2

ANALYZE_ARGS=(--output-file "$ANALYSIS_FILE")
[[ "$TESTING_MODE" == "true" ]] && ANALYZE_ARGS+=(--testing)

"$SCRIPT_DIR/analyze-commits.sh" "${ANALYZE_ARGS[@]}"

# Source the analysis results
source "$ANALYSIS_FILE"

echo "" >&2
echo "Analysis results:" >&2
echo "  Current version: $CURRENT_VERSION" >&2
echo "  Next version: $NEXT_VERSION" >&2
echo "  Will release: $WILL_RELEASE" >&2
echo "  Bump type: $BUMP_TYPE" >&2
if [[ "$TESTING_MODE" == "true" ]]; then
    echo "  ⚠️  TESTING MODE: Version has -testing suffix" >&2
fi
echo "" >&2

# If dry-run, just output the results and exit
if [[ "$DRY_RUN" == "true" ]]; then
    echo "CURRENT_VERSION=$CURRENT_VERSION"
    echo "NEXT_VERSION=$NEXT_VERSION"
    echo "WILL_RELEASE=$WILL_RELEASE"
    echo "BUMP_TYPE=$BUMP_TYPE"
    echo "TESTING_MODE=$TESTING_MODE"
    exit 0
fi

# Check if there's anything to release
if [[ "$WILL_RELEASE" != "true" ]]; then
    echo "No release-worthy commits found. Exiting." >&2
    exit 0
fi

# Step 2: Generate release notes
echo "=== Step 2: Generating release notes ===" >&2
"$SCRIPT_DIR/generate-release-notes.sh" --version "$NEXT_VERSION" --output-file "$NOTES_FILE"

echo "Release notes generated:" >&2
cat "$NOTES_FILE" >&2
echo "" >&2

# Step 3: Build and publish to npm
echo "=== Step 3: Publishing to npm ===" >&2
NPM_OUTPUT=$("$SCRIPT_DIR/publish-npm.sh" --version "$NEXT_VERSION")
echo "$NPM_OUTPUT" >&2

# Extract tarball path from npm output
TARBALL_PATH=$(echo "$NPM_OUTPUT" | grep "^TARBALL_PATH=" | cut -d= -f2)

if [[ -z "$TARBALL_PATH" || ! -f "$TARBALL_PATH" ]]; then
    echo "Error: Could not find tarball at $TARBALL_PATH" >&2
    exit 1
fi

echo "Tarball created at: $TARBALL_PATH" >&2
echo "" >&2

# Step 4: Create GitHub release
echo "=== Step 4: Creating GitHub release ===" >&2
"$SCRIPT_DIR/create-github-release.sh" \
    --version "$NEXT_VERSION" \
    --notes-file "$NOTES_FILE" \
    --tarball "$TARBALL_PATH"

echo "" >&2
echo "=== Release complete ===" >&2
echo "Version $NEXT_VERSION has been published to npm and GitHub." >&2
