#!/usr/bin/env -S yarn dlx tsx

import process from 'node:process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  determineVersionBump,
  getLatestTag,
  updatePackageVersion,
  getCommitsSince,
} from './lib/version.ts';
import { getChangelogFormattedForRelease } from './lib/changelog.ts';
import { buildPackage, publishToNpm, createTarball } from './lib/npm.ts';
import {
  createGitHubRelease,
  createOrUpdateComment,
  extractPRNumbers,
} from './lib/github.ts';
import { log } from './lib/logging.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const DEFAULT_PLUGIN_PATH = resolve(ROOT_DIR, 'plugins', 'ros');

export interface ReleaseOptions {
  dryRun: boolean;
  prerelease?: string;
  pluginPath?: string;
  prNumber?: number;
}

export interface ReleaseResult {
  success: boolean;
  skipped: boolean;
  skipReason?: 'no-commits' | 'no-conventional-commits';
  version?: string;
  releaseType?: string;
  changelog?: string;
  error?: string;
}

export async function runRelease(
  options: ReleaseOptions,
): Promise<ReleaseResult> {
  const pluginPath = options.pluginPath || DEFAULT_PLUGIN_PATH;

  log('🚀 Starting release process...');

  if (options.dryRun) {
    log('DRY RUN MODE - No changes will be made', 'warn');
  }

  // Step 1: Get latest tag and commits
  const latestTag = getLatestTag();
  log(`Latest tag: ${latestTag || 'none'}`);

  const commits = getCommitsSince(latestTag);
  if (!commits) {
    const result: ReleaseResult = {
      success: true,
      skipped: true,
      skipReason: 'no-commits',
    };

    log('No commits since last tag. Nothing to release.', 'warn');

    if (!options.prNumber) return result;

    // Comment on PR if pr-number is specified
    const commentBody = `## ℹ️ Release Preview

This PR will **not** trigger a release.

No commits since last tag.`;

    await createOrUpdateComment(options.prNumber, commentBody);

    log(`Commented on PR #${options.prNumber}`);

    return result;
  }

  log(`Commits since last tag:\n${commits}`);

  // Step 2: Generate changelog first to detect conventional commits
  log('🧾 Generating changelog to detect conventional commits...');
  const releaseNotes = await getChangelogFormattedForRelease();

  // Check if changelog has any content (indicates conventional commits exist)
  if (!releaseNotes || releaseNotes.trim() === '') {
    const result: ReleaseResult = {
      success: true,
      skipped: true,
      skipReason: 'no-conventional-commits',
    };

    log(
      'No conventional commits found since last tag. Nothing to release.',
      'warn',
    );
    log('Commits must follow conventional commit format (e.g., feat:, fix:)');

    if (!options.prNumber) return result;

    // Comment on PR if pr-number is specified
    const commentBody = `## ℹ️ Release Preview

This PR will **not** trigger a release.

No conventional commits found. Commits must follow [conventional commit format](https://www.conventionalcommits.org/) (e.g., \`feat:\`, \`fix:\`).`;

    await createOrUpdateComment(options.prNumber, commentBody);

    log(`Commented on PR #${options.prNumber}`);

    return result;
  }

  log('Generated release notes:');
  log('---');
  log(releaseNotes);
  log('---');

  // Step 3: Determine version bump
  log('🔍 Analyzing commits for version bump...');
  const versionInfo = await determineVersionBump(options.prerelease);

  if (!versionInfo) {
    return {
      success: false,
      skipped: false,
      error: 'Failed to determine version bump',
    };
  }

  log(`Current version: ${versionInfo.currentVersion}`);
  log(`Release type: ${versionInfo.releaseType}`);
  log(`Reason: ${versionInfo.reason}`);
  log(`New version: ${versionInfo.newVersion}`);

  // Step 4: Update package.json version
  log('📦 Updating package.json version...');
  if (!options.dryRun) {
    updatePackageVersion(pluginPath, versionInfo.newVersion);
    log(`Updated to ${versionInfo.newVersion}`);
  } else {
    log(`[DRY RUN] Would update to ${versionInfo.newVersion}`);
  }

  // Step 5: Build the package
  log('🔨 Building package...');
  const buildResult = buildPackage(pluginPath);
  if (!buildResult.success) {
    return {
      success: false,
      skipped: false,
      error: `Build failed: ${buildResult.output}`,
    };
  }

  log(`Build result: ${buildResult.output}`);

  // Step 6: Create tarball for GitHub release
  log('📦 Creating tarball...');
  const packResult = createTarball(pluginPath, options.dryRun);
  if (!packResult.success) {
    return {
      success: false,
      skipped: false,
      error: `Tarball creation failed: ${packResult.error}`,
    };
  }
  log(`Tarball: ${packResult.tarballName}`);

  // Step 7: Publish to npm
  log('📤 Publishing to npm...');
  const publishResult = publishToNpm({
    pluginPath: pluginPath,
    dryRun: options.dryRun,
    prereleaseTag: options.prerelease,
  });

  if (!publishResult.success) {
    return {
      success: false,
      skipped: false,
      error: `Publish failed: ${publishResult.output}`,
    };
  }
  log(`${publishResult.output}`);

  // Step 8: Create GitHub release with tarball
  log('🏷️  Creating GitHub release...');
  const releaseResult = await createGitHubRelease({
    version: versionInfo.newVersion,
    changelog: releaseNotes || `Release v${versionInfo.newVersion}`,
    tarballPath: packResult.tarballPath,
    dryRun: options.dryRun,
    prerelease: !!options.prerelease,
  });

  if (!releaseResult.success) {
    log(`GitHub release failed: ${releaseResult.error}`);
    // Don't fail here - npm publish already succeeded
    log('Warning: npm publish succeeded but GitHub release failed', 'warn');
    log('You may need to create the release manually', 'warn');
  } else {
    log(`Tag: ${releaseResult.tagName}`);
    if (releaseResult.releaseUrl) {
      log(`Release URL: ${releaseResult.releaseUrl}`);
    }
  }

  log(
    `Release process completed successfully! Version: ${versionInfo.newVersion}`,
  );

  // Step 9: Comment on PRs
  if (options.prNumber) {
    log(`💬 Commenting on PR #${options.prNumber} with release preview...`);
    const commentBody = `## 🚀 Release Preview

Current version: \`${versionInfo.currentVersion}\`
New version: \`${versionInfo.newVersion}\`
Release type: \`${versionInfo.releaseType}\``;
    const commentResult = await createOrUpdateComment(
      options.prNumber,
      commentBody,
    );
    if (commentResult.success) {
      log(`Successfully commented on PR #${options.prNumber}`);
    } else {
      log(
        `Comment on PR #${options.prNumber} failed: ${commentResult.error}`,
        'warn',
      );
    }
  } else if (!options.dryRun) {
    const prNumbers = extractPRNumbers(commits);
    log(`💬 Commenting on ${prNumbers.length} PR(s)...`);

    for (const prNumber of prNumbers) {
      const commentBody = `## 🚀 Released!\n\nThis PR was released as part of [v${versionInfo.newVersion}](${releaseResult.releaseUrl})!`;

      const commentResult = await createOrUpdateComment(prNumber, commentBody);

      if (commentResult.success) {
        log(`Successfully commented on PR #${prNumber}`);
      } else {
        log(
          `Comment on PR #${prNumber} failed: ${commentResult.error}`,
          'warn',
        );
      }
    }
  }

  return {
    success: true,
    skipped: false,
    version: versionInfo.newVersion,
    releaseType: versionInfo.releaseType,
    changelog: releaseNotes,
  };
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      default: false,
      description: 'Preview the release without making any changes',
    })
    .option('prerelease', {
      alias: 'p',
      type: 'string',
      description:
        'Create a prerelease with the given identifier (e.g., beta, alpha)',
    })
    .option('pr-number', {
      type: 'number',
      description:
        'PR number to comment on with release preview (only used with --dry-run)',
    })
    .help()
    .parseAsync();

  const options: ReleaseOptions = {
    dryRun: argv.dryRun,
    prerelease: argv.prerelease,
    prNumber: argv.prNumber,
  };

  try {
    const result = await runRelease(options);

    if (!result.success) {
      log(`${result.error}`, 'error');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    log(
      `Release failed: ${error instanceof Error ? error.message : error}`,
      'error',
    );
    process.exit(1);
  }
}

// Only run main() when executed directly, not when imported
const isMainModule =
  import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`;
if (isMainModule) {
  main();
}
