#!/usr/bin/env bash
#
# create-github-release.sh
# Creates a GitHub release with tag and attaches the npm tarball.
#
# Usage: ./create-github-release.sh --version VERSION --notes-file FILE [--tarball FILE] [--dry-run]
#
# Options:
#   --version VERSION    The version to release (will create tag vVERSION)
#   --notes-file FILE    Path to the release notes markdown file
#   --tarball FILE       Path to the tarball to attach (optional)
#   --dry-run            Show what would be done without creating the release
#
# Environment variables:
#   GITHUB_TOKEN         GitHub token for API authentication (required)
#   GITHUB_REPOSITORY    Repository in format owner/repo (set automatically in Actions)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

VERSION=""
NOTES_FILE=""
TARBALL=""
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            VERSION="$2"
            shift 2
            ;;
        --notes-file)
            NOTES_FILE="$2"
            shift 2
            ;;
        --tarball)
            TARBALL="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Validate required arguments
if [[ -z "$VERSION" ]]; then
    echo "Error: --version is required" >&2
    exit 1
fi

if [[ -z "$NOTES_FILE" ]]; then
    echo "Error: --notes-file is required" >&2
    exit 1
fi

if [[ ! -f "$NOTES_FILE" ]]; then
    echo "Error: Notes file not found: $NOTES_FILE" >&2
    exit 1
fi

cd "$REPO_ROOT"

TAG_NAME="v$VERSION"

# Create and push git tag
create_tag() {
    echo "Creating git tag: $TAG_NAME" >&2
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "DRY RUN: Would create and push tag $TAG_NAME" >&2
        return
    fi
    
    # Check if tag already exists
    if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
        echo "Tag $TAG_NAME already exists, skipping tag creation" >&2
        return
    fi
    
    git tag -a "$TAG_NAME" -m "Release $TAG_NAME"
    git push origin "$TAG_NAME"
    
    echo "Tag $TAG_NAME created and pushed" >&2
}

# Create GitHub release using gh CLI
create_release() {
    echo "Creating GitHub release for $TAG_NAME" >&2
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "DRY RUN: Would create GitHub release:" >&2
        echo "  Tag: $TAG_NAME" >&2
        echo "  Title: Release $TAG_NAME" >&2
        echo "  Notes file: $NOTES_FILE" >&2
        if [[ -n "$TARBALL" ]]; then
            echo "  Attachment: $TARBALL" >&2
        fi
        echo "" >&2
        echo "Release notes preview:" >&2
        cat "$NOTES_FILE" >&2
        return
    fi
    
    # Check for gh CLI
    if ! command -v gh &> /dev/null; then
        echo "Error: GitHub CLI (gh) is not installed" >&2
        exit 1
    fi
    
    # Check for authentication
    if [[ -z "${GITHUB_TOKEN:-}" ]]; then
        echo "Error: GITHUB_TOKEN is not set" >&2
        exit 1
    fi
    
    # Build gh release create command
    local gh_args=(
        "release" "create" "$TAG_NAME"
        "--title" "Release $TAG_NAME"
        "--notes-file" "$NOTES_FILE"
    )
    
    # Add tarball if provided
    if [[ -n "$TARBALL" && -f "$TARBALL" ]]; then
        gh_args+=("$TARBALL#NPM Package")
    fi
    
    # Create the release
    gh "${gh_args[@]}"
    
    echo "GitHub release created: $TAG_NAME" >&2
}

# Main logic
main() {
    echo "=== GitHub Release ===" >&2
    echo "Version: $VERSION" >&2
    echo "Tag: $TAG_NAME" >&2
    echo "Dry run: $DRY_RUN" >&2
    
    create_tag
    create_release
    
    echo "RELEASE_TAG=$TAG_NAME"
}

main
