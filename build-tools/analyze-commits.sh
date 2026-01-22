#!/usr/bin/env bash
#
# analyze-commits.sh
# Analyzes commits since the last git tag to determine the next semantic version.
# Only considers commits that affect plugins/ros/ directory.
#
# Usage: ./analyze-commits.sh [--output-file FILE]
#
# Outputs (to stdout or file):
#   CURRENT_VERSION=X.Y.Z
#   NEXT_VERSION=X.Y.Z
#   WILL_RELEASE=true|false
#   BUMP_TYPE=major|minor|patch|none

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_DIR="plugins/ros"

OUTPUT_FILE=""
TESTING_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --output-file)
            OUTPUT_FILE="$2"
            shift 2
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

cd "$REPO_ROOT"

# Get the latest tag matching vX.Y.Z pattern
get_latest_tag() {
    git tag --list 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | head -n1
}

# Parse version from tag (strips 'v' prefix)
parse_version() {
    local tag="$1"
    echo "${tag#v}"
}

# Calculate next version based on bump type
calculate_next_version() {
    local current="$1"
    local bump_type="$2"
    
    local major minor patch
    IFS='.' read -r major minor patch <<< "$current"
    
    case "$bump_type" in
        major)
            echo "$((major + 1)).0.0"
            ;;
        minor)
            echo "$major.$((minor + 1)).0"
            ;;
        patch)
            echo "$major.$minor.$((patch + 1))"
            ;;
        none)
            echo "$current"
            ;;
    esac
}

# Analyze a single commit message and return bump type
# Returns: major, minor, patch, or empty string (no bump)
analyze_commit() {
    local message="$1"
    local first_line
    first_line=$(echo "$message" | head -n1)
    
    # Check for breaking change indicators
    # - BREAKING CHANGE: in body
    # - ! after type (e.g., feat!:, fix!:)
    if echo "$message" | grep -qiE "^BREAKING CHANGE:" || echo "$first_line" | grep -qE "^[a-z]+(\([^)]+\))?!:"; then
        echo "major"
        return
    fi
    
    # Check commit type from first line
    # Format: type(scope): description or type: description
    if echo "$first_line" | grep -qE "^feat(\([^)]+\))?:"; then
        echo "minor"
        return
    fi
    
    if echo "$first_line" | grep -qE "^fix(\([^)]+\))?:"; then
        echo "patch"
        return
    fi
    
    # Other conventional commit types that should trigger patch releases
    # perf, refactor with functional changes could be considered patch
    if echo "$first_line" | grep -qE "^(perf|revert)(\([^)]+\))?:"; then
        echo "patch"
        return
    fi
    
    # Types that don't trigger releases: chore, docs, style, test, ci, build
    echo ""
}

# Main logic
main() {
    local latest_tag
    latest_tag=$(get_latest_tag)
    
    local current_version
    if [[ -z "$latest_tag" ]]; then
        echo "No existing tags found, starting from 0.0.0" >&2
        current_version="0.0.0"
        latest_tag="" # Will use --all for git log
    else
        current_version=$(parse_version "$latest_tag")
        echo "Latest tag: $latest_tag (version $current_version)" >&2
    fi
    
    # Get commits since last tag that touch plugins/ros/
    local commits_range
    if [[ -z "$latest_tag" ]]; then
        commits_range="HEAD"
    else
        commits_range="${latest_tag}..HEAD"
    fi
    
    # Get commit hashes that modified plugins/ros/
    local commit_hashes
    commit_hashes=$(git log "$commits_range" --format="%H" -- "$PLUGIN_DIR" 2>/dev/null || echo "")
    
    if [[ -z "$commit_hashes" ]]; then
        echo "No commits affecting $PLUGIN_DIR since $latest_tag" >&2
        output_results "$current_version" "$current_version" "false" "none"
        return
    fi
    
    # Analyze each commit to find the highest bump type
    local highest_bump="none"
    local commit_count=0
    
    while IFS= read -r hash; do
        [[ -z "$hash" ]] && continue
        
        local message
        message=$(git log -1 --format="%B" "$hash")
        
        local bump
        bump=$(analyze_commit "$message")
        
        if [[ -n "$bump" ]]; then
            commit_count=$((commit_count + 1))
            echo "  Commit $hash: $bump bump" >&2
            
            # Upgrade highest bump if necessary (major > minor > patch)
            case "$bump" in
                major)
                    highest_bump="major"
                    ;;
                minor)
                    [[ "$highest_bump" != "major" ]] && highest_bump="minor"
                    ;;
                patch)
                    [[ "$highest_bump" == "none" ]] && highest_bump="patch"
                    ;;
            esac
        fi
    done <<< "$commit_hashes"
    
    echo "Found $commit_count release-triggering commits, highest bump: $highest_bump" >&2
    
    local next_version
    next_version=$(calculate_next_version "$current_version" "$highest_bump")
    
    # Append -testing suffix in testing mode
    if [[ "$TESTING_MODE" == "true" && "$highest_bump" != "none" ]]; then
        next_version="${next_version}-testing"
        echo "Testing mode: version will be $next_version" >&2
    fi
    
    local will_release="false"
    [[ "$highest_bump" != "none" ]] && will_release="true"
    
    output_results "$current_version" "$next_version" "$will_release" "$highest_bump"
}

output_results() {
    local current_version="$1"
    local next_version="$2"
    local will_release="$3"
    local bump_type="$4"
    
    local output
    output=$(cat <<EOF
CURRENT_VERSION=$current_version
NEXT_VERSION=$next_version
WILL_RELEASE=$will_release
BUMP_TYPE=$bump_type
EOF
)
    
    if [[ -n "$OUTPUT_FILE" ]]; then
        echo "$output" > "$OUTPUT_FILE"
        echo "Results written to $OUTPUT_FILE" >&2
    else
        echo "$output"
    fi
}

main
