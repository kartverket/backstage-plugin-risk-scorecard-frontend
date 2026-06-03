import { execSync } from 'node:child_process';
import { Octokit } from '@octokit/rest';
import { log } from './logging.ts';

const BOT_LOGIN = 'github-actions[bot]';

interface GitHubReleaseOptions {
  version: string;
  changelog: string;
  dryRun?: boolean;
  prerelease?: boolean;
}

interface GitHubReleaseResult {
  success: boolean;
  tagName: string;
  releaseUrl?: string;
  error?: string;
}

/**
 * Get repository info from git remote
 */
function getRepoInfo(): { owner: string; repo: string } {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      encoding: 'utf-8',
    }).trim();

    // Handle both HTTPS and SSH URLs
    // HTTPS: https://github.com/owner/repo.git
    // SSH: git@github.com:owner/repo.git
    const httpsMatch = remoteUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    const sshMatch = remoteUrl.match(/github\.com:([^/]+)\/([^/.]+)/);

    const match = httpsMatch || sshMatch;
    if (!match) {
      throw new Error(
        `Could not parse GitHub repo from remote URL: ${remoteUrl}`,
      );
    }

    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  } catch (error) {
    throw new Error(
      `Failed to get repo info: ${error instanceof Error ? error.message : error}`,
    );
  }
}

/**
 * Create a git tag locally
 */
function createGitTag(tagName: string, message: string, dryRun = false): void {
  if (dryRun) {
    log(`[DRY RUN] Would create tag: ${tagName}`);
    return;
  }

  execSync(`git tag -a "${tagName}" -m "${message}"`, {
    encoding: 'utf-8',
    stdio: 'inherit',
  });
}

/**
 * Push a git tag to remote
 */
function pushGitTag(tagName: string, dryRun = false): void {
  if (dryRun) {
    log(`[DRY RUN] Would push tag: ${tagName}`);
    return;
  }

  execSync(`git push origin "${tagName}"`, {
    encoding: 'utf-8',
    stdio: 'inherit',
  });
}

/**
 * Extract unique PR numbers from commit messages.
 * Matches patterns like #123, #456, etc.
 */
export function extractPRNumbers(commitLog: string): number[] {
  const matches = commitLog.match(/#(\d+)/g) || [];
  const numbers = matches.map(m => parseInt(m.slice(1), 10));
  // Return unique numbers
  return [...new Set(numbers)];
}

/**
 * Create a GitHub release using the GitHub API
 */
export async function createGitHubRelease(
  options: GitHubReleaseOptions,
): Promise<GitHubReleaseResult> {
  const { version, changelog, dryRun = false, prerelease = false } = options;

  const tagName = `v${version}`;
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    return {
      success: false,
      tagName,
      error: 'GITHUB_TOKEN or GH_TOKEN environment variable is required',
    };
  }

  try {
    const { owner, repo } = getRepoInfo();
    if (dryRun) {
      log(`[DRY RUN] Would create GitHub release:`);
      log(`Tag: ${tagName}`);
      log(`Prerelease: ${prerelease}`);
      log(
        `Changelog:\n${changelog.slice(0, 500)}${changelog.length > 500 ? '...' : ''}`,
      );
      return {
        success: true,
        tagName,
        releaseUrl: `https://github.com/${owner}/${repo}/releases/tag/${tagName}`,
      };
    }

    const octokit = new Octokit({ auth: token });

    // Create the git tag first
    log(`Creating git tag: ${tagName}`);
    createGitTag(tagName, `Release ${version}`);

    // Push the tag
    log(`Pushing tag to origin...`);
    pushGitTag(tagName);

    // Create the GitHub release
    log(`Creating GitHub release...`);
    const { data: release } = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: tagName,
      name: `v${version}`,
      body: changelog,
      draft: false,
      prerelease,
    });

    return {
      success: true,
      tagName,
      releaseUrl: release.html_url,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      tagName,
      error: message,
    };
  }
}

interface CommentResult {
  success: boolean;
  created: boolean;
  commentId?: number;
  error?: string;
}

/**
 * Create or update a comment on a PR (edit-last pattern).
 * Finds the last comment by github-actions[bot] and updates it,
 * or creates a new comment if none exists.
 */
export async function createOrUpdateComment(
  prNumber: number,
  body: string,
): Promise<CommentResult> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    return {
      success: false,
      created: false,
      error: 'GITHUB_TOKEN or GH_TOKEN environment variable is required',
    };
  }

  try {
    const { owner, repo } = getRepoInfo();
    const octokit = new Octokit({ auth: token });

    // List existing comments to find last bot comment
    const { data: comments } = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    });

    // Find the last comment by github-actions[bot]
    const botComments = comments.filter(c => c.user?.login === BOT_LOGIN);
    const lastBotComment = botComments[botComments.length - 1];

    if (lastBotComment) {
      // Update existing comment
      await octokit.issues.updateComment({
        owner,
        repo,
        comment_id: lastBotComment.id,
        body,
      });
      return { success: true, created: false, commentId: lastBotComment.id };
    } else {
      // Create new comment
      const { data } = await octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body,
      });
      return { success: true, created: true, commentId: data.id };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      created: false,
      error: message,
    };
  }
}
