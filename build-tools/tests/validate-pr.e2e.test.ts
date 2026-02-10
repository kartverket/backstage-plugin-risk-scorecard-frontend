/**
 * End-to-end tests for the build-tools PR validation workflow.
 *
 * These tests:
 * - Create real temporary git repositories with actual commits
 * - Run the full validation process via runValidation()
 * - Test every permutation of commit-implied bump vs PR-title-implied bump
 * - Verify that the validation correctly accepts matching bumps and rejects mismatches
 *
 * The matrix covers 5 commit scenarios × 5 PR title scenarios = 25 permutations:
 *   Commits: none | patch (fix:) | minor (feat:) | major (fix!:) | major (feat!:)
 *   Titles:  none | patch (fix:) | minor (feat:) | major (fix!:) | major (feat!:)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Test fixture that creates and manages a temporary git repository
 */
class GitRepoFixture {
  readonly path: string;
  private originalCwd: string;

  constructor() {
    this.path = mkdtempSync(join(tmpdir(), 'validate-pr-e2e-test-'));
    this.originalCwd = process.cwd();
  }

  /**
   * Initialize the git repo with an initial commit and v1.0.0 tag
   */
  init() {
    process.chdir(this.path);

    execSync('git init', { stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
    execSync('git config user.name "Test User"', { stdio: 'pipe' });

    const packageJson = {
      name: '@test/package',
      version: '1.0.0',
      description: 'Test package',
      main: 'index.js',
    };
    writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
    writeFileSync('index.js', 'module.exports = {};\n');

    execSync('git add .', { stdio: 'pipe' });
    execSync('git commit -m "chore: initial commit"', { stdio: 'pipe' });
    execSync('git tag -a "v1.0.0" -m "Release v1.0.0"', { stdio: 'pipe' });
  }

  /**
   * Create a commit with a conventional commit message
   */
  commit(message: string) {
    const timestamp = Date.now() + Math.random();
    writeFileSync(`file-${timestamp}.txt`, `Content at ${timestamp}\n`);
    execSync('git add .', { stdio: 'pipe' });
    execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
  }

  /**
   * Clean up the temporary directory and restore cwd
   */
  cleanup() {
    process.chdir(this.originalCwd);
    rmSync(this.path, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Test scenario definitions
// ---------------------------------------------------------------------------

interface CommitScenario {
  label: string;
  setup: (repo: GitRepoFixture) => void;
  /** The effective bump type these commits imply (null = no release) */
  bump: string | null;
}

interface PRTitleScenario {
  label: string;
  title: string;
  /** The effective bump type this PR title implies (null = no release) */
  bump: string | null;
}

const commitScenarios: CommitScenario[] = [
  {
    label: 'none (no conventional commits)',
    setup: repo => {
      repo.commit('updated readme');
    },
    bump: null,
  },
  {
    label: 'patch (fix: commits)',
    setup: repo => {
      repo.commit('fix: resolve null pointer exception');
    },
    bump: 'patch',
  },
  {
    label: 'minor (feat: commits)',
    setup: repo => {
      repo.commit('feat: add new dashboard feature');
    },
    bump: 'minor',
  },
  {
    label: 'major (fix!: commit)',
    setup: repo => {
      repo.commit('fix!: change error handling behavior');
    },
    bump: 'major',
  },
  {
    label: 'major (feat!: commit)',
    setup: repo => {
      repo.commit('feat!: redesign entire API');
    },
    bump: 'major',
  },
];

const prTitleScenarios: PRTitleScenario[] = [
  {
    label: 'none (non-conventional title)',
    title: 'Update readme',
    bump: null,
  },
  {
    label: 'patch (fix:)',
    title: 'fix: resolve login timeout issue',
    bump: 'patch',
  },
  {
    label: 'minor (feat:)',
    title: 'feat: add user authentication',
    bump: 'minor',
  },
  {
    label: 'major (fix!:)',
    title: 'fix!: change error response format',
    bump: 'major',
  },
  {
    label: 'major (feat!:)',
    title: 'feat!: redesign public API surface',
    bump: 'major',
  },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Validate PR E2E Tests', () => {
  let repo: GitRepoFixture;

  beforeEach(() => {
    vi.resetModules();
    repo = new GitRepoFixture();
  });

  afterEach(() => {
    repo.cleanup();
  });

  for (const commitScenario of commitScenarios) {
    describe(`When commits imply ${commitScenario.label}`, () => {
      for (const prTitleScenario of prTitleScenarios) {
        const expectedValid = commitScenario.bump === prTitleScenario.bump;

        it(`and PR title implies ${prTitleScenario.label} → should be ${expectedValid ? 'valid ✅' : 'invalid ❌'}`, async () => {
          repo.init();
          commitScenario.setup(repo);

          const { runValidation } = await import('../validate-pr.ts');
          const result = await runValidation({
            prTitle: prTitleScenario.title,
          });

          expect(result.valid).toBe(expectedValid);

          if (expectedValid && commitScenario.bump !== null) {
            // When valid with conventional commits, expectedBumpType should match
            expect(result.expectedBumpType).toBe(commitScenario.bump);
          }

          if (!expectedValid) {
            // Invalid results should have an informative error message
            expect(result.message).toContain('❌');
          } else {
            expect(result.message).toContain('✅');
          }
        });
      }
    });
  }
});
