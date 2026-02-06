import semver from 'semver';
import { log } from './logging.ts';
import {
  getRecommendedBumpFromCurrentCommits,
  getRecommendedBumpFromText,
} from './version.ts';

export interface PRValidationResult {
  valid: boolean;
  prTitle: string;
  expectedBumpType: semver.ReleaseType | null;
  message: string;
}

/**
 * Validate that a PR title implies a version bump that matches what the commits implies
 */
export async function validatePRTitle(
  prTitle: string,
  hasConventionalCommits: boolean,
): Promise<PRValidationResult> {
  // First, analyze commits to see if a release is expected
  log('Analyzing commits to determine expected version bump...');
  const bump = await getRecommendedBumpFromCurrentCommits();

  // NOTE: this probably never happens as the code stands now, as the Bumper instance returns a minimum of patch even when there are no conventional commits. Keeping this as a safe guard tho.
  if (!bump?.releaseType) {
    return {
      valid: true,
      prTitle,
      expectedBumpType: null,
      message: `✅ PR title is valid.
No commits in the PR would trigger a release, so any PR title is acceptable.`,
    };
  }

  log('Getting implied version bump from PR title...');
  const bumpFromPrTitle = await getRecommendedBumpFromText(prTitle);

  if (!hasConventionalCommits) {
    const valid = !bumpFromPrTitle.releaseType;
    const message = valid
      ? `✅ PR title does not imply a release, which matches the commits.`
      : `❌ PR title implies a ${bumpFromPrTitle.releaseType} release, but no conventional commits were found in the PR.`;
    return {
      valid,
      prTitle,
      expectedBumpType: null,
      message,
    };
  }

  if (bump.releaseType != bumpFromPrTitle.releaseType) {
    return {
      valid: false,
      prTitle,
      expectedBumpType: bump.releaseType,
      message: `❌ PR title bump type (${bumpFromPrTitle.releaseType}) does not match commits bump type (${bump.releaseType}).`,
    };
  }

  return {
    valid: true,
    prTitle,
    expectedBumpType: bump.releaseType,
    message: `✅ PR title bump type (${bumpFromPrTitle.releaseType}) matches the expected ${bump.releaseType} release from commits.`,
  };
}
