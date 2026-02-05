# Build Tools

Automated release tooling for the ROS (Risk Scorecard) plugin. This tool automates versioning, changelog generation, npm publishing, and GitHub release creation using industry-standard conventions and best practices.

## Overview

The release tool provides a complete automation workflow for:

- **Version Bump Detection**: Analyzes commit history to determine appropriate version increments
- **Changelog Generation**: Creates formatted release notes from conventional commits
- **Package Building**: Compiles TypeScript and builds the plugin package
- **NPM Publishing**: Publishes packages to npm registry using OIDC trusted publishing
- **GitHub Releases**: Creates GitHub releases with automated tagging and tarball attachments
- **PR Comments**: Automatically notifies PRs included in a release

## Core Technologies

### Semantic Versioning (SemVer)

Version numbers follow the [Semantic Versioning](https://semver.org/) specification (MAJOR.MINOR.PATCH).

**Library**: [semver](https://github.com/npm/node-semver)

- Parses and manipulates version numbers
- Calculates version increments (patch, minor, major)
- Handles prerelease versions (alpha, beta, rc)

### Conventional Commits

Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Libraries**:

- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) - Generates changelog from git metadata
- [conventional-recommended-bump](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-recommended-bump) - Analyzes commits to determine version bump type
- [conventional-changelog-conventionalcommits](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits) - Preset to use for analyzing conventional commits. Follows the specification.

**Supported commit types**:

- `feat:` - New feature (triggers MINOR version bump)
- `fix:` - Bug fix (triggers PATCH version bump)
- `fix!:` or `BREAKING CHANGE:` - Breaking change (triggers MAJOR version bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking change (triggers MAJOR version bump)
- `docs:`, `chore:`, `style:`, `refactor:`, `perf:`, `test:`, etc - No version bump

### GitHub API Integration

**Library**: [@octokit/rest](https://octokit.github.io/rest.js/v22/)

- Creates and manages GitHub releases
- Posts comments on pull requests
- Uploads release assets (tarballs)

### CLI Argument Parsing

**Library**: [yargs](https://github.com/yargs/yargs)

- Handles command-line options and flags
- Provides help documentation

## How It Works

### Release Process Flow

```
1. Fetch Latest Tag
   ↓
2. Get Commits Since Last Release
   ↓
3. Generate Changelog (validates conventional commits)
   ↓
4. Determine Version Bump (major/minor/patch)
   ↓
5. Update package.json Version
   ↓
6. Build Package (TypeScript + Backstage CLI)
   ↓
7. Create Tarball
   ↓
8. Publish to NPM (with OIDC)
   ↓
9. Create Git Tag
   ↓
10. Create GitHub Release
    ↓
11. Comment on Related PRs
```

### Version Bump Logic

The tool uses `conventional-recommended-bump` with the `conventionalcommits` preset to analyze commits:

- **MAJOR** (1.0.0 → 2.0.0): Triggered by commits with `!` suffix or `BREAKING CHANGE:` footer

  ```
  feat!: remove legacy API endpoint
  ```

- **MINOR** (1.0.0 → 1.1.0): Triggered by `feat:` commits

  ```
  feat: add new risk matrix visualization
  ```

- **PATCH** (1.0.0 → 1.0.1): Triggered by `fix:` commits

  ```
  fix: correct calculation in risk score
  ```

- **PRERELEASE** (1.0.0 → 1.1.0-beta.0): Specified via `--prerelease` flag
  ```
  yarn tsx release.ts --prerelease beta
  ```

### Changelog Generation

Uses `conventional-changelog` to generate formatted release notes:

- Groups commits by type (Features, Bug Fixes, Breaking Changes)
- Includes commit hashes and PR references
- Automatically links to GitHub issues and PRs
- Formats output as Markdown

### NPM Publishing with OIDC

The tool uses npm's OIDC trusted publishing for secure, token-free authentication:

**Prerequisites**:

- npm CLI 11.5.1+ (auto-detects OIDC environment)
- GitHub Actions with `id-token: write` permission
- [Trusted publishing](https://docs.npmjs.com/trusted-publishers) configured on npmjs.com

## Usage

The `release.ts` script includes a shebang (`#!/usr/bin/env -S yarn dlx tsx`) that allows it to be executed directly on Unix-like systems (Linux, macOS). On Windows, you need to use the `yarn tsx` command explicitly.

### Basic Release

**Unix/Linux/macOS:**

```bash
./release.ts
```

**Windows or universal:**

```bash
yarn tsx release.ts
```

### Dry Run (Preview)

**Unix/Linux/macOS:**

```bash
./release.ts --dry-run
```

**Windows or universal:**

```bash
yarn tsx release.ts --dry-run
```

Preview changes without publishing or creating releases.

### Prerelease Versions

**Unix/Linux/macOS:**

```bash
./release.ts --prerelease beta
./release.ts --prerelease alpha
./release.ts --prerelease rc
```

**Windows or universal:**

```bash
yarn tsx release.ts --prerelease beta
yarn tsx release.ts --prerelease alpha
yarn tsx release.ts --prerelease rc
```

Creates prerelease versions (e.g., `1.2.0-beta.0`) and publishes with the specified dist-tag.

### PR Preview Comment

**Unix/Linux/macOS:**

```bash
./release.ts --dry-run --pr-number 123
```

**Windows or universal:**

```bash
yarn tsx release.ts --dry-run --pr-number 123
```

Posts a comment on PR #123 with release preview information.

## CLI Options

| Option         | Alias | Type    | Description                                         |
| -------------- | ----- | ------- | --------------------------------------------------- |
| `--dry-run`    | `-d`  | boolean | Preview release without making changes              |
| `--prerelease` | `-p`  | string  | Create prerelease with identifier (beta, alpha, rc) |
| `--pr-number`  |       | number  | PR number to comment on (used with --dry-run)       |

## Module Structure

### Core Modules

- **[release.ts](release.ts)** - Main orchestration logic and CLI entry point
- **[lib/version.ts](lib/version.ts)** - Version detection and package.json updates
- **[lib/changelog.ts](lib/changelog.ts)** - Changelog generation using conventional commits
- **[lib/npm.ts](lib/npm.ts)** - Package building and npm publishing
- **[lib/github.ts](lib/github.ts)** - GitHub API interactions (releases, comments)
- **[lib/logging.ts](lib/logging.ts)** - Logging utilities

## Environment Requirements

### GitHub Actions

When running in GitHub Actions, ensure the workflow has:

```yaml
permissions:
  contents: write # For creating releases and tags
  pull-requests: write # For commenting on PRs
  issues: write # For commenting on released issues
  id-token: write # For npm OIDC publishing
```

### Environment Variables

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions for API access
- No `NPM_AUTH_TOKEN` needed when using OIDC trusted publishing

## Testing

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:coverage
```

Tests are written using [Vitest](https://vitest.dev/) with coverage reporting via [@vitest/coverage-v8](https://github.com/vitest-dev/vitest/tree/main/packages/coverage-v8).

### A note about the tests

The tests are written in an end-to-end fashion, but the "far end", is most often a mock. This is to prevent the tests from actually doing operations towards npm or github. Instead, we use mocks to capture calls. But, since we use execSync from node:child_process both for test setup (the setup creates a real temporary git repo to host commits) and for real usage that we want to mock, there is a mechanism to turn the mocks on and off. A bit weird, but it is only relevant for test setup to have the mocks off.

But, since we rely on capturing mocked calls to do verifications of expected behaviour, this also means you need to be awere if any implementation details are changed. Test verifications and/or mock setup will then probably also need to change. For example if octokit is replaced with simply running git commands to create tag/release, the premise of the tests are no longer valid. But the spec itself still is. So treat the tests as documentation as well as specification on what the tool does. Unless you change/add behaviour, the specification should not need changing.

## Skip Scenarios

The tool will skip releasing (exit successfully without changes) when:

1. **No Commits**: No commits exist since the last tag
2. **No Conventional Commits**: Commits exist but none follow conventional commit format

In both cases, when run with `--dry-run --pr-number`, it will comment on the PR explaining why no release will occur.
