/**
 * End-to-end tests for the build-tools release workflow.
 *
 * These tests:
 * - Create real temporary git repositories with actual commits
 * - Run the full release process via runRelease()
 * - Mock only execSync (after repo setup) and Octokit to prevent real npm publish/git push/GitHub API calls
 * - Verify the correct commands are constructed and called
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync as realExecSync } from 'node:child_process';
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type {
  CapturedCommand,
  GitHubReleaseCall,
  PRCommentCall,
  PRCommentUpdateCall,
  ListCommentsParams,
  MockOctokitInstance,
  MockStateType,
} from './testTypes.js';

let capturedCommands: CapturedCommand[] = [];
let mockEnabled = false;

// Mock child_process module
vi.mock('node:child_process', async importOriginal => {
  const original = await importOriginal<typeof import('node:child_process')>();

  return {
    ...original,
    execSync: vi.fn(
      (
        command: string,
        options?: { cwd?: string; encoding?: string; stdio?: unknown },
      ) => {
        if (!mockEnabled) {
          // During repo setup, use real execSync
          return original.execSync(
            command,
            options as Parameters<typeof original.execSync>[1],
          );
        }

        // During test execution, capture and mock commands
        capturedCommands.push({ command, cwd: options?.cwd });

        // // Return appropriate mock responses based on command
        if (command.includes('npm publish')) {
          return '';
        }
        if (command.includes('yarn tsc') || command.includes('yarn build')) {
          return '';
        }
        if (command.includes('git push')) {
          return '';
        }
        if (command.includes('git tag -a')) {
          return '';
        }
        if (command.includes('git remote get-url')) {
          return 'https://github.com/test-owner/test-repo.git';
        }

        // For other git commands (describe, log), use real execSync
        return original.execSync(
          command,
          options as Parameters<typeof original.execSync>[1],
        );
      },
    ),
  };
});

const mockState: MockStateType = {
  githubReleaseCalls: [],
  createCommentCalls: [],
  updateCommentCalls: [],
  listCommentsCalls: [],
  mockExistingCommentsByPR: new Map(),
};

function resetCommentMocks() {
  mockState.createCommentCalls = [];
  mockState.updateCommentCalls = [];
  mockState.listCommentsCalls = [];
  mockState.mockExistingCommentsByPR.clear();
}

function resetAllMocks() {
  mockState.githubReleaseCalls = [];
  resetCommentMocks();
}

// Mock Octokit - we mock this to prevent actual GitHub API calls
// NOTE: In Vitest v4, constructor mocks must use `function` or `class` syntax, not arrow functions
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(function (this: MockOctokitInstance) {
    this.repos = {
      createRelease: vi.fn().mockImplementation((params: GitHubReleaseCall) => {
        mockState.githubReleaseCalls.push(params);
        return Promise.resolve({
          data: {
            id: 123,
            upload_url: 'https://uploads.github.com/test',
            html_url: `https://github.com/test/releases/${params.tag_name}`,
          },
        });
      }),
      uploadReleaseAsset: vi.fn().mockResolvedValue({ data: { id: 456 } }),
    };
    this.issues = {
      listComments: vi.fn().mockImplementation((params: ListCommentsParams) => {
        mockState.listCommentsCalls.push(params);
        // Return comments for this specific PR, or empty array if none
        const comments =
          mockState.mockExistingCommentsByPR.get(params.issue_number) || [];
        return Promise.resolve({ data: comments });
      }),
      createComment: vi.fn().mockImplementation((params: PRCommentCall) => {
        mockState.createCommentCalls.push(params);
        const newComment = {
          id: Date.now() + Math.random(),
          user: { login: 'github-actions[bot]' },
          body: params.body,
        };
        // Store comment for this specific PR
        const prComments =
          mockState.mockExistingCommentsByPR.get(params.issue_number) || [];
        prComments.push(newComment);
        mockState.mockExistingCommentsByPR.set(params.issue_number, prComments);
        return Promise.resolve({ data: newComment });
      }),
      updateComment: vi
        .fn()
        .mockImplementation((params: PRCommentUpdateCall) => {
          mockState.updateCommentCalls.push(params);
          return Promise.resolve({
            data: { id: params.comment_id, body: params.body },
          });
        }),
    };
  }),
}));

/**
 * Test fixture that creates and manages a temporary git repository
 */
class GitRepoFixture {
  readonly path: string;
  private originalCwd: string;

  constructor() {
    this.path = mkdtempSync(join(tmpdir(), 'release-e2e-test-'));
    this.originalCwd = process.cwd();
  }

  /**
   * Initialize the git repo and create initial package.json
   */
  init(options: { initialVersion?: string; packageName?: string } = {}) {
    const { initialVersion = '0.0.0', packageName = '@test/package' } = options;

    process.chdir(this.path);

    // Initialize git repo (uses real execSync since mockEnabled=false during setup)
    realExecSync('git init', { stdio: 'pipe' });
    realExecSync('git config user.email "test@example.com"', { stdio: 'pipe' });
    realExecSync('git config user.name "Test User"', { stdio: 'pipe' });

    // Create package.json
    const packageJson = {
      name: packageName,
      version: initialVersion,
      description: 'Test package',
      main: 'index.js',
    };
    writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');

    // Create a simple index.js
    writeFileSync('index.js', 'module.exports = {};\n');

    // Initial commit
    realExecSync('git add .', { stdio: 'pipe' });
    realExecSync('git commit -m "chore: initial commit"', { stdio: 'pipe' });
  }

  /**
   * Create a commit with a conventional commit message
   */
  commit(message: string, files?: Record<string, string>) {
    if (files) {
      for (const [filename, content] of Object.entries(files)) {
        const dir = filename.includes('/')
          ? filename.split('/').slice(0, -1).join('/')
          : null;
        if (dir) {
          mkdirSync(dir, { recursive: true });
        }
        writeFileSync(filename, content);
      }
    } else {
      const timestamp = Date.now() + Math.random();
      writeFileSync(`file-${timestamp}.txt`, `Content at ${timestamp}\n`);
    }

    realExecSync('git add .', { stdio: 'pipe' });
    realExecSync(`git commit -m "${message}"`, { stdio: 'pipe' });
  }

  /**
   * Create a commit with a body (for BREAKING CHANGE footer)
   */
  commitWithBody(message: string, body: string) {
    const timestamp = Date.now() + Math.random();
    writeFileSync(`file-${timestamp}.txt`, `Content at ${timestamp}\n`);
    realExecSync('git add .', { stdio: 'pipe' });
    // Use -m twice: first for subject, second for body
    realExecSync(`git commit -m "${message}" -m "${body}"`, { stdio: 'pipe' });
  }

  /**
   * Create a git tag
   */
  tag(tagName: string) {
    realExecSync(`git tag -a "${tagName}" -m "Release ${tagName}"`, {
      stdio: 'pipe',
    });
  }

  /**
   * Get the current package.json content
   */
  getPackageJson(): { name: string; version: string; [key: string]: unknown } {
    return JSON.parse(readFileSync(join(this.path, 'package.json'), 'utf-8'));
  }

  /**
   * Clean up the temporary directory
   */
  cleanup() {
    process.chdir(this.originalCwd);
    rmSync(this.path, { recursive: true, force: true });
  }
}

/**
 * Helper to enable mock mode (call after repo setup, before runRelease)
 */
function enableMocks() {
  mockEnabled = true;
  capturedCommands = [];
  resetAllMocks();
}

/**
 * Helper to disable mock mode (call during cleanup)
 */
function disableMocks() {
  mockEnabled = false;
}

/**
 * Helper to find captured commands matching a pattern
 */
function findCommands(pattern: string | RegExp): CapturedCommand[] {
  return capturedCommands.filter(cmd =>
    typeof pattern === 'string'
      ? cmd.command.includes(pattern)
      : pattern.test(cmd.command),
  );
}

/**
 * Helper to check if a command was captured
 */
function hasCommand(pattern: string | RegExp): boolean {
  return findCommands(pattern).length > 0;
}

describe('Release E2E Tests', () => {
  let repo: GitRepoFixture;
  let originalGithubToken: string | undefined;

  beforeEach(() => {
    vi.resetModules();
    disableMocks();
    repo = new GitRepoFixture();
    // Set a fake GitHub token so the release process doesn't skip the GitHub release step
    originalGithubToken = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = 'test-token';
  });

  afterEach(() => {
    disableMocks();
    if (repo) {
      repo.cleanup();
    }
    // Restore original token
    if (originalGithubToken !== undefined) {
      process.env.GITHUB_TOKEN = originalGithubToken;
    } else {
      delete process.env.GITHUB_TOKEN;
    }
  });

  function setup(setupFunc: () => void) {
    setupFunc();
    enableMocks();
  }

  describe('No release scenarios', () => {
    it('should skip release when no conventional commits exist', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('updated readme'); // Not a conventional commit
        repo.commit('some other change');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.skipReason).toBe('no-conventional-commits');

      // Verify no npm publish was attempted
      expect(findCommands('npm publish')).toHaveLength(0);
    });

    it('should skip release when only docs commits exist', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('docs: update README');
        repo.commit('docs: add API documentation');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.skipReason).toBe('no-conventional-commits');
    });

    it('should skip release when only chore commits exist', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('chore: update dependencies');
        repo.commit('chore(deps): bump lodash');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
    });

    it('should skip release when only refactor/style/test commits exist', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('refactor: simplify logic');
        repo.commit('style: format code');
        repo.commit('test: add unit tests');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
    });
  });

  describe('Patch release', () => {
    it('should create patch release for fix commit', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('fix: resolve null pointer exception');
      });
      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);
      expect(result.version).toBe('1.0.1');
      expect(result.releaseType).toBe('patch');

      // Verify npm publish was called
      expect(hasCommand('npm publish')).toBe(true);

      // Verify package.json was updated
      expect(repo.getPackageJson().version).toBe('1.0.1');
    });

    it('should create single patch release for multiple fix commits', async () => {
      setup(() => {
        repo.init({ initialVersion: '2.5.0' });
        repo.tag('v2.5.0');
        repo.commit('fix: first bug fix');
        repo.commit('fix: second bug fix');
        repo.commit('fix: third bug fix');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.version).toBe('2.5.1'); // Single patch bump, not 2.5.3
      expect(result.releaseType).toBe('patch');
    });
  });

  describe('Minor release', () => {
    it('should create minor release for feat commit', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: add new dashboard feature');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);
      expect(result.version).toBe('1.1.0');
      expect(result.releaseType).toBe('minor');
    });

    it('should create single minor release for multiple feat commits', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: feature one');
        repo.commit('feat: feature two');
        repo.commit('feat: feature three');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.version).toBe('1.1.0'); // Single minor bump
      expect(result.releaseType).toBe('minor');
    });

    it('should create minor release when mixing feat and fix commits', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('fix: bug fix one');
        repo.commit('fix: bug fix two');
        repo.commit('fix: bug fix three');
        repo.commit('feat: new feature');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      // feat takes precedence over fix - single minor bump
      expect(result.version).toBe('1.1.0');
      expect(result.releaseType).toBe('minor');
    });
  });

  describe('Major release', () => {
    it('should create major release for feat! commit', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.5.0' });
        repo.tag('v1.5.0');
        repo.commit('feat!: redesign entire API');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.version).toBe('2.0.0');
      expect(result.releaseType).toBe('major');
    });

    it('should create major release for fix! commit', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('fix!: change error handling behavior');
      });
      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.version).toBe('2.0.0');
      expect(result.releaseType).toBe('major');
    });

    it('should create major release for commit with BREAKING CHANGE footer', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commitWithBody(
          'feat: new authentication system',
          'BREAKING CHANGE: removed old auth methods',
        );
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.version).toBe('2.0.0');
      expect(result.releaseType).toBe('major');
    });

    it('should create major release when breaking change is mixed with other commits', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('fix: minor bug fix');
        repo.commit('feat: new feature');
        repo.commit('feat!: breaking API change');
        repo.commit('fix: another fix');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      // Breaking change takes precedence
      expect(result.version).toBe('2.0.0');
      expect(result.releaseType).toBe('major');
    });
  });

  describe('Version used consistently', () => {
    it('should use same version for package.json and npm publish', async () => {
      setup(() => {
        repo.init({ initialVersion: '3.2.1' });
        repo.tag('v3.2.1');
        repo.commit('feat: add export functionality');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      const expectedVersion = '3.3.0';
      expect(result.version).toBe(expectedVersion);

      // package.json updated to correct version
      expect(repo.getPackageJson().version).toBe(expectedVersion);

      // npm publish was called
      expect(hasCommand('npm publish')).toBe(true);

      // git tag was created with correct version
      expect(hasCommand(`git tag -a "v${expectedVersion}"`)).toBe(true);

      // GitHub release was created with correct version
      expect(mockState.githubReleaseCalls).toHaveLength(1);
      expect(mockState.githubReleaseCalls[0].tag_name).toBe(
        `v${expectedVersion}`,
      );
    });
  });

  describe('Dry run mode', () => {
    it('should not publish or create release in dry-run mode', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: new feature');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: true, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.version).toBe('1.1.0');

      // npm publish should NOT be called without --dry-run flag
      const publishCommands = findCommands('npm publish');
      const realPublishCommands = publishCommands.filter(
        cmd => !cmd.command.includes('--dry-run'),
      );
      expect(realPublishCommands).toHaveLength(0);

      // Package.json should NOT be updated in dry-run
      expect(repo.getPackageJson().version).toBe('1.0.0');
    });

    it('should not comment on any PR when dry-run without pr-number', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: new feature (#42)');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: true, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.version).toBe('1.1.0');

      // No PR comments should be made in dry-run mode without pr-number
      expect(mockState.createCommentCalls).toHaveLength(0);
      expect(mockState.updateCommentCalls).toHaveLength(0);
    });

    it('should comment on specified PR when dry-run with pr-number', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: new feature');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({
        dryRun: true,
        pluginPath: repo.path,
        prNumber: 42,
      });

      expect(result.success).toBe(true);
      expect(result.version).toBe('1.1.0');

      // Should have commented on exactly PR #42
      expect(mockState.createCommentCalls).toHaveLength(1);
      expect(mockState.createCommentCalls[0].issue_number).toBe(42);

      // Comment should contain release preview info
      const body = mockState.createCommentCalls[0].body;
      expect(body).toContain('Release Preview');
      expect(body).toContain('1.0.0'); // current version
      expect(body).toContain('1.1.0'); // new version
      expect(body).toContain('minor'); // release type
    });

    it('should comment on PR with no release info when dry-run with pr-number but no conventional commits', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('updated readme'); // Not a conventional commit
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({
        dryRun: true,
        pluginPath: repo.path,
        prNumber: 42,
      });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.skipReason).toBe('no-conventional-commits');

      // Should still comment on PR #42 to inform about no release
      expect(mockState.createCommentCalls).toHaveLength(1);
      expect(mockState.createCommentCalls[0].issue_number).toBe(42);

      // Comment should explain why no release will happen
      const body = mockState.createCommentCalls[0].body;
      expect(body).toContain('not');
      expect(body).toContain('release');
      expect(body).toContain('conventional commit');
    });

    it('should build package with yarn tsc and yarn build in dry-run mode', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: new feature');
      });

      const { runRelease } = await import('../release.ts');
      await runRelease({ dryRun: true, pluginPath: repo.path });

      // Build commands should be called even in dry-run mode
      expect(hasCommand('yarn tsc')).toBe(true);
      expect(hasCommand('yarn build')).toBe(true);
    });

    it('should build package with yarn tsc and yarn build in non-dry-run mode', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: new feature');
      });

      const { runRelease } = await import('../release.ts');
      await runRelease({ dryRun: false, pluginPath: repo.path });

      // Build commands should be called in non-dry-run mode
      expect(hasCommand('yarn tsc')).toBe(true);
      expect(hasCommand('yarn build')).toBe(true);
    });
  });

  describe('Changelog content', () => {
    it('should include commit messages in changelog', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: add user authentication');
        repo.commit('fix: resolve login timeout issue');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.changelog).toContain('user authentication');
      expect(result.changelog).toContain('login timeout');
    });
  });

  describe('PR commenting on release', () => {
    it('should comment on all PRs mentioned in commit messages after release', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: add feature one (#123)');
        repo.commit('fix: fix bug two (#124)');
        repo.commit('feat: add feature three (#125)');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.version).toBe('1.1.0');

      // Should have commented on all three PRs
      expect(
        mockState.createCommentCalls.length +
          mockState.updateCommentCalls.length,
      ).toBe(3);

      // Verify each PR received a comment
      const allCommentBodies = [
        ...mockState.createCommentCalls.map(c => c.body),
        ...mockState.updateCommentCalls.map(c => c.body),
      ];

      // All comments should mention the released version
      for (const body of allCommentBodies) {
        expect(body).toContain('1.1.0');
        expect(body).toContain('This PR was released');
      }

      // Should have attempted to comment on PRs 123, 124, 125
      const prNumbers = mockState.createCommentCalls.map(c => c.issue_number);
      expect(prNumbers).toContain(123);
      expect(prNumbers).toContain(124);
      expect(prNumbers).toContain(125);
    });

    it('should include release URL in PR comments', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: add feature (#200)');
      });

      const { runRelease } = await import('../release.ts');
      await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(mockState.createCommentCalls).toHaveLength(1);
      expect(mockState.createCommentCalls[0].body).toContain(
        'https://github.com/',
      );
    });

    it('should not comment on any PRs when commits have no PR numbers', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: add feature without PR reference');
        repo.commit('fix: fix bug without PR reference');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);
      expect(result.version).toBe('1.1.0');

      // No PR comments should be made since no commits reference PRs
      expect(mockState.createCommentCalls).toHaveLength(0);
      expect(mockState.updateCommentCalls).toHaveLength(0);
    });

    it('should not comment on PRs when no release is generated despite PR numbers in commits', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('chore: update dependencies (#300)');
        repo.commit('docs: update README (#301)');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({ dryRun: false, pluginPath: repo.path });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);

      // No PR comments should be made since no release was generated
      expect(mockState.createCommentCalls).toHaveLength(0);
      expect(mockState.updateCommentCalls).toHaveLength(0);
    });
  });

  describe('Prerelease', () => {
    it('should create prerelease version in dry-run mode but not publish', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: add new feature');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({
        dryRun: true,
        pluginPath: repo.path,
        prerelease: 'beta',
      });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);
      // Should create a prerelease version reflecting the minor bump
      expect(result.version).toMatch(/^1\.1\.0-beta\.0$/);

      // Package.json should NOT be updated in dry-run
      expect(repo.getPackageJson().version).toBe('1.0.0');

      // No real npm publish
      const publishCommands = findCommands('npm publish');
      const realPublishCommands = publishCommands.filter(
        cmd => !cmd.command.includes('--dry-run'),
      );
      expect(realPublishCommands).toHaveLength(0);
    });

    it('should create and publish prerelease version', async () => {
      setup(() => {
        repo.init({ initialVersion: '2.0.0' });
        repo.tag('v2.0.0');
        repo.commit('feat!: add experimental feature');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({
        dryRun: false,
        pluginPath: repo.path,
        prerelease: 'alpha',
      });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);
      // Should create a prerelease version reflecting the major bump
      expect(result.version).toMatch(/^3\.0\.0-alpha\.0$/);

      // Package.json should be updated
      expect(repo.getPackageJson().version).toMatch(/^3\.0\.0-alpha\.0$/);

      // npm publish was called
      expect(hasCommand('npm publish')).toBe(true);

      // GitHub release was created and marked as prerelease
      expect(mockState.githubReleaseCalls).toHaveLength(1);
      expect(mockState.githubReleaseCalls[0].tag_name).toMatch(
        /^v3\.0\.0-alpha\.0$/,
      );
      expect(mockState.githubReleaseCalls[0].prerelease).toBe(true);
    });

    it('should publish prerelease with correct npm --tag flag', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: new feature');
      });

      const { runRelease } = await import('../release.ts');
      await runRelease({
        dryRun: false,
        pluginPath: repo.path,
        prerelease: 'beta',
      });

      // npm publish should be called with --tag flag for prerelease
      const publishCommands = findCommands('npm publish');
      expect(publishCommands).toHaveLength(1);
      expect(publishCommands[0].command).toContain('--tag beta');
    });

    it('should log tag in dry-run mode for prerelease', async () => {
      setup(() => {
        repo.init({ initialVersion: '1.0.0' });
        repo.tag('v1.0.0');
        repo.commit('feat: new feature');
      });

      const { runRelease } = await import('../release.ts');
      const result = await runRelease({
        dryRun: true,
        pluginPath: repo.path,
        prerelease: 'rc',
      });

      expect(result.success).toBe(true);

      // npm publish --dry-run should include the --tag flag for prerelease
      const publishCommands = findCommands('npm publish');
      expect(publishCommands).toHaveLength(1);
      expect(publishCommands[0].command).toContain('--dry-run');
      expect(publishCommands[0].command).toContain('--tag rc');
    });
  });
});
