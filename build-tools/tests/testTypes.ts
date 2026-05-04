import type { Mock } from 'vitest';

// Track captured commands during mocked execution
export interface CapturedCommand {
  command: string;
  cwd?: string;
}

// Track GitHub release calls
export interface GitHubReleaseCall {
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
}

// Track PR comment calls
export interface PRCommentCall {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}

export interface PRCommentUpdateCall {
  owner: string;
  repo: string;
  comment_id: number;
  body: string;
}

export interface ListCommentsParams {
  owner: string;
  repo: string;
  issue_number: number;
}

// Mock Octokit types
export interface MockOctokitRepos {
  createRelease: Mock;
  uploadReleaseAsset: Mock;
}

export interface MockOctokitIssues {
  listComments: Mock;
  createComment: Mock;
  updateComment: Mock;
}

export interface MockOctokitInstance {
  repos: MockOctokitRepos;
  issues: MockOctokitIssues;
}

export interface MockStateType {
  githubReleaseCalls: GitHubReleaseCall[];
  createCommentCalls: PRCommentCall[];
  updateCommentCalls: PRCommentUpdateCall[];
  listCommentsCalls: ListCommentsParams[];
  // Map of PR number to comments on that PR
  mockExistingCommentsByPR: Map<
    number,
    { id: number; user: { login: string }; body: string }[]
  >;
}
