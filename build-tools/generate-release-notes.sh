#!/usr/bin/env bash
#
# generate-release-notes.sh
# Generates Markdown release notes from commits since the last git tag.
# Only considers commits that affect plugins/ros/ directory.
#
# Usage: ./generate-release-notes.sh [--version VERSION] [--output-file FILE]
#
# Options:
#   --version VERSION    The version being released (for the header)
#   --output-file FILE   Write output to file instead of stdout

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_DIR="plugins/ros"

VERSION=""
OUTPUT_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            VERSION="$2"
            shift 2
            ;;
        --output-file)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

cd "$REPO_ROOT"

# Get the latest tag matching vX.Y.Z pattern
get_latest_tag() {
    git tag --list 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | head -n1
}

# Extract type from conventional commit
get_commit_type() {
    local first_line="$1"
    
    # Match type(scope)!: or type!: or type(scope): or type:
    if echo "$first_line" | grep -qE "^([a-z]+)(\([^)]+\))?\!?:"; then
        echo "$first_line" | sed -E 's/^([a-z]+)(\([^)]+\))?\!?:.*/\1/'
    else
        echo "other"
    fi
}

# Extract scope from conventional commit (if present)
get_commit_scope() {
    local first_line="$1"
    
    if echo "$first_line" | grep -qE "^[a-z]+\(([^)]+)\)"; then
        echo "$first_line" | sed -E 's/^[a-z]+\(([^)]+)\).*/\1/'
    else
        echo ""
    fi
}

# Extract description from conventional commit
get_commit_description() {
    local first_line="$1"
    
    # Remove type(scope)!: or type!: or type(scope): or type: prefix
    echo "$first_line" | sed -E 's/^[a-z]+(\([^)]+\))?\!?:[[:space:]]*//'
}

# Check if commit has breaking change
is_breaking_change() {
    local message="$1"
    local first_line
    first_line=$(echo "$message" | head -n1)
    
    if echo "$message" | grep -qiE "^BREAKING CHANGE:" || echo "$first_line" | grep -qE "^[a-z]+(\([^)]+\))?!:"; then
        return 0
    fi
    return 1
}

# Format a commit entry
format_commit_entry() {
    local hash="$1"
    local description="$2"
    local scope="$3"
    local short_hash
    short_hash=$(echo "$hash" | cut -c1-7)
    
    if [[ -n "$scope" ]]; then
        echo "* **$scope:** $description ($short_hash)"
    else
        echo "* $description ($short_hash)"
    fi
}

# Main logic
main() {
    local latest_tag
    latest_tag=$(get_latest_tag)
    
    local commits_range
    if [[ -z "$latest_tag" ]]; then
        commits_range="HEAD"
    else
        commits_range="${latest_tag}..HEAD"
    fi
    
    # Arrays to hold categorized commits
    declare -a breaking_changes=()
    declare -a features=()
    declare -a fixes=()
    declare -a performance=()
    declare -a reverts=()
    declare -a other=()
    
    # Get commit hashes that modified plugins/ros/
    local commit_hashes
    commit_hashes=$(git log "$commits_range" --format="%H" -- "$PLUGIN_DIR" 2>/dev/null || echo "")
    
    if [[ -z "$commit_hashes" ]]; then
        generate_output "No changes in this release."
        return
    fi
    
    # Process each commit
    while IFS= read -r hash; do
        [[ -z "$hash" ]] && continue
        
        local message
        message=$(git log -1 --format="%B" "$hash")
        
        local first_line
        first_line=$(echo "$message" | head -n1)
        
        local commit_type
        commit_type=$(get_commit_type "$first_line")
        
        local scope
        scope=$(get_commit_scope "$first_line")
        
        local description
        description=$(get_commit_description "$first_line")
        
        local entry
        entry=$(format_commit_entry "$hash" "$description" "$scope")
        
        # Check for breaking changes first (they go in their own section)
        if is_breaking_change "$message"; then
            breaking_changes+=("$entry")
        fi
        
        # Categorize by type
        case "$commit_type" in
            feat)
                features+=("$entry")
                ;;
            fix)
                fixes+=("$entry")
                ;;
            perf)
                performance+=("$entry")
                ;;
            revert)
                reverts+=("$entry")
                ;;
            # Skip non-release types
            chore|docs|style|test|ci|build)
                ;;
            *)
                # Only include if it looks like a meaningful change
                if [[ -n "$description" ]]; then
                    other+=("$entry")
                fi
                ;;
        esac
    done <<< "$commit_hashes"
    
    # Generate release notes
    local notes=""
    
    if [[ -n "$VERSION" ]]; then
        notes+="# Release v$VERSION\n\n"
    fi
    
    if [[ ${#breaking_changes[@]} -gt 0 ]]; then
        notes+="## ⚠️ Breaking Changes\n\n"
        for entry in "${breaking_changes[@]}"; do
            notes+="$entry\n"
        done
        notes+="\n"
    fi
    
    if [[ ${#features[@]} -gt 0 ]]; then
        notes+="## 🚀 Features\n\n"
        for entry in "${features[@]}"; do
            notes+="$entry\n"
        done
        notes+="\n"
    fi
    
    if [[ ${#fixes[@]} -gt 0 ]]; then
        notes+="## 🐛 Bug Fixes\n\n"
        for entry in "${fixes[@]}"; do
            notes+="$entry\n"
        done
        notes+="\n"
    fi
    
    if [[ ${#performance[@]} -gt 0 ]]; then
        notes+="## ⚡ Performance Improvements\n\n"
        for entry in "${performance[@]}"; do
            notes+="$entry\n"
        done
        notes+="\n"
    fi
    
    if [[ ${#reverts[@]} -gt 0 ]]; then
        notes+="## ⏪ Reverts\n\n"
        for entry in "${reverts[@]}"; do
            notes+="$entry\n"
        done
        notes+="\n"
    fi
    
    # Only include "other" if there are no other sections
    if [[ ${#breaking_changes[@]} -eq 0 && ${#features[@]} -eq 0 && ${#fixes[@]} -eq 0 && ${#performance[@]} -eq 0 && ${#reverts[@]} -eq 0 && ${#other[@]} -gt 0 ]]; then
        notes+="## 📦 Changes\n\n"
        for entry in "${other[@]}"; do
            notes+="$entry\n"
        done
        notes+="\n"
    fi
    
    if [[ -z "$notes" ]]; then
        notes="No notable changes in this release.\n"
    fi
    
    generate_output "$notes"
}

generate_output() {
    local content="$1"
    
    if [[ -n "$OUTPUT_FILE" ]]; then
        echo -e "$content" > "$OUTPUT_FILE"
        echo "Release notes written to $OUTPUT_FILE" >&2
    else
        echo -e "$content"
    fi
}

main
