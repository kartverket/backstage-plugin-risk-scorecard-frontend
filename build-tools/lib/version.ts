import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import semver from 'semver';
import { Bumper } from 'conventional-recommended-bump';

interface VersionInfo {
  currentVersion: string;
  newVersion: string;
  releaseType: semver.ReleaseType;
  reason: string;
}

interface BumpResult {
  releaseType: semver.ReleaseType | null;
  reason: string;
}

/**
 * Get the latest git tag, or null if none exists
 */
export function getLatestTag(): string | null {
  try {
    const tag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return tag;
  } catch {
    return null;
  }
}

/**
 * Get all commits since a given tag (or all commits if no tag)
 */
export function getCommitsSince(tag: string | null): string {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  try {
    return execSync(`git log ${range} --oneline`, {
      encoding: 'utf-8',
    }).trim();
  } catch {
    return '';
  }
}

/**
 * Use conventional-recommended-bump to determine the version bump type
 * Uses 'conventionalcommits' preset which properly supports the full spec
 * including the ! notation for breaking changes (e.g., feat!:)
 * Returns null releaseType if no conventional commits warrant a release
 */
async function getRecommendedBump(): Promise<BumpResult> {
  const bumper = new Bumper(process.cwd());
  bumper.loadPreset('conventionalcommits');

  const recommendation = await bumper.bump();

  // Check if we got a proper recommendation with releaseType (not EmptyBumperRecommendation)
  if (!('releaseType' in recommendation)) {
    return { releaseType: null, reason: 'No conventional commits found' };
  }

  const reason = recommendation.reason || '';
  const releaseType = recommendation.releaseType as semver.ReleaseType;
  return { releaseType, reason };
}

/**
 * Calculate the new version based on the current version and bump type
 */
function calculateNewVersion(
  currentVersion: string,
  releaseType: semver.ReleaseType,
  prerelease?: string,
): string | null {
  if (prerelease) {
    // Use premajor/preminor/prepatch to reflect the intended bump in the version
    const prereleaseType = `pre${releaseType}` as semver.ReleaseType;
    return semver.inc(currentVersion, prereleaseType, prerelease);
  }
  return semver.inc(currentVersion, releaseType);
}

/**
 * Update the version in the plugin's package.json
 */
export function updatePackageVersion(
  pluginPath: string,
  newVersion: string,
): void {
  const packageJsonPath = resolve(pluginPath, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  packageJson.version = newVersion;
  writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8',
  );
}

/**
 * Get the version from the latest git tag (strips 'v' prefix if present)
 */
function getVersionFromTag(tag: string | null): string {
  if (!tag) {
    return '0.0.0';
  }
  // Strip 'v' prefix if present
  return tag.startsWith('v') ? tag.slice(1) : tag;
}

/**
 * Full version bump workflow: determine bump type and calculate new version
 * Returns null if there are no conventional commits
 */
export async function determineVersionBump(
  prerelease?: string,
): Promise<VersionInfo | null> {
  const latestTag = getLatestTag();
  const currentVersion = getVersionFromTag(latestTag);

  const { releaseType, reason } = await getRecommendedBump();

  // If no releaseType returned, no conventional commits were found
  if (!releaseType) {
    return null;
  }

  const newVersion = calculateNewVersion(
    currentVersion,
    releaseType,
    prerelease,
  );
  if (!newVersion) {
    throw new Error(
      `Failed to calculate new version from ${currentVersion} with ${releaseType}`,
    );
  }

  return {
    currentVersion,
    newVersion,
    releaseType,
    reason,
  };
}
