import {
  GitHubService,
  GitHubApiError,
  GithubStatus,
} from '../services/GitHubService';

// ─── Mock Fetch Setup ─────────────────────────────────────────────────────────

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body !== undefined ? JSON.stringify(body) : ''),
    headers: new Headers(),
  } as Response;
}

function mockErrorResponse(status: number, body = ''): Response {
  return {
    ok: false,
    status,
    text: async () => body,
    headers: new Headers(),
  } as Response;
}

describe('GitHubService', () => {
  let service: GitHubService;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    service = new GitHubService(mockFetch);
  });

  const owner = 'test-org';
  const repo = 'test-repo';
  const token = 'ghp_test_token_123';

  // ─── Helper Path Tests ──────────────────────────────────────────────

  describe('path helpers', () => {
    it('constructs correct file path for a RiSc ID', () => {
      expect(service.riScFilePath('.ros_abc-123')).toBe(
        '.ros/.ros_abc-123.yaml',
      );
    });

    it('extracts RiSc ID from filename', () => {
      expect(service.riScIdFromFilename('.ros_abc-123.yaml')).toBe(
        '.ros_abc-123',
      );
    });

    it('constructs draft branch name', () => {
      expect(service.draftBranchName('.ros_abc-123')).toBe(
        'risc-draft/.ros_abc-123',
      );
    });

    it('extracts RiSc ID from branch ref', () => {
      expect(
        service.riScIdFromBranchRef('refs/heads/risc-draft/.ros_abc-123'),
      ).toBe('.ros_abc-123');
    });
  });

  // ─── fetchPublishedRiScFiles ────────────────────────────────────────

  describe('fetchPublishedRiScFiles', () => {
    it('returns files matching the RiSc naming pattern', async () => {
      const files = [
        { name: '.ros_risk-001.yaml', sha: 'abc123', content: null },
        { name: '.ros_risk-002.yaml', sha: 'def456', content: null },
        { name: 'readme.md', sha: 'ghi789', content: null },
      ];
      mockFetch.mockResolvedValue(mockResponse(files));

      const result = await service.fetchPublishedRiScFiles(owner, repo, token);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('.ros_risk-001.yaml');
      expect(result[1].name).toBe('.ros_risk-002.yaml');
    });

    it('returns empty array when directory does not exist (404)', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(404));

      const result = await service.fetchPublishedRiScFiles(owner, repo, token);
      expect(result).toEqual([]);
    });

    it('returns empty array when repo is empty (409)', async () => {
      mockFetch.mockResolvedValue(
        mockErrorResponse(409, 'Git Repository is empty'),
      );

      const result = await service.fetchPublishedRiScFiles(owner, repo, token);
      expect(result).toEqual([]);
    });

    it('throws on unexpected errors', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(500, 'Internal error'));

      await expect(
        service.fetchPublishedRiScFiles(owner, repo, token),
      ).rejects.toThrow(GitHubApiError);
    });
  });

  // ─── fetchFileContent ───────────────────────────────────────────────

  describe('fetchFileContent', () => {
    it('decodes base64 content successfully', async () => {
      const content = Buffer.from('hello world', 'utf-8').toString('base64');
      mockFetch.mockResolvedValue(
        mockResponse({ name: 'test.yaml', sha: 'abc', content }),
      );

      const result = await service.fetchFileContent(
        owner,
        repo,
        '.ros/test.yaml',
        token,
      );
      expect(result.status).toBe(GithubStatus.Success);
      expect(result.data).toBe('hello world');
    });

    it('handles base64 content with newlines', async () => {
      const raw = 'a longer string that produces multiline base64';
      const contentWithNewlines =
        Buffer.from(raw, 'utf-8')
          .toString('base64')
          .match(/.{1,20}/g)
          ?.join('\n') ?? '';
      mockFetch.mockResolvedValue(
        mockResponse({
          name: 'test.yaml',
          sha: 'abc',
          content: contentWithNewlines,
        }),
      );

      const result = await service.fetchFileContent(
        owner,
        repo,
        '.ros/test.yaml',
        token,
      );
      expect(result.status).toBe(GithubStatus.Success);
      expect(result.data).toBe(raw);
    });

    it('returns ContentIsEmpty when file has no content field', async () => {
      mockFetch.mockResolvedValue(
        mockResponse({ name: 'test.yaml', sha: 'abc', content: null }),
      );

      const result = await service.fetchFileContent(
        owner,
        repo,
        '.ros/test.yaml',
        token,
      );
      expect(result.status).toBe(GithubStatus.ContentIsEmpty);
      expect(result.data).toBeNull();
    });

    it('returns NotFound status on 404', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(404));

      const result = await service.fetchFileContent(
        owner,
        repo,
        '.ros/nonexistent.yaml',
        token,
      );
      expect(result.status).toBe(GithubStatus.NotFound);
      expect(result.data).toBeNull();
    });

    it('returns Unauthorized status on 401', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(401));

      const result = await service.fetchFileContent(
        owner,
        repo,
        '.ros/test.yaml',
        token,
      );
      expect(result.status).toBe(GithubStatus.Unauthorized);
    });

    it('passes ref parameter for branch-specific content', async () => {
      const content = Buffer.from('branch content', 'utf-8').toString('base64');
      mockFetch.mockResolvedValue(
        mockResponse({ name: 'test.yaml', sha: 'abc', content }),
      );

      await service.fetchFileContent(
        owner,
        repo,
        '.ros/test.yaml',
        token,
        'my-branch',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('?ref=my-branch'),
        expect.any(Object),
      );
    });
  });

  // ─── fetchFileInfo ──────────────────────────────────────────────────

  describe('fetchFileInfo', () => {
    it('returns file DTO on success', async () => {
      const fileDto = { name: 'test.yaml', sha: 'abc123', content: 'base64' };
      mockFetch.mockResolvedValue(mockResponse(fileDto));

      const result = await service.fetchFileInfo(
        owner,
        repo,
        '.ros/test.yaml',
        token,
      );
      expect(result).toEqual(fileDto);
    });

    it('returns null on 404', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(404));

      const result = await service.fetchFileInfo(
        owner,
        repo,
        '.ros/nonexistent.yaml',
        token,
      );
      expect(result).toBeNull();
    });
  });

  // ─── writeFile ──────────────────────────────────────────────────────

  describe('writeFile', () => {
    it('sends base64-encoded content with PUT', async () => {
      mockFetch.mockResolvedValue(mockResponse({ content: {} }));

      await service.writeFile(
        owner,
        repo,
        '.ros/test.yaml',
        'file content here',
        'Create file',
        'main',
        token,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/contents/.ros/test.yaml'),
        expect.objectContaining({ method: 'PUT' }),
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.message).toBe('Create file');
      expect(callBody.branch).toBe('main');
      expect(Buffer.from(callBody.content, 'base64').toString('utf-8')).toBe(
        'file content here',
      );
    });

    it('includes sha when updating existing file', async () => {
      mockFetch.mockResolvedValue(mockResponse({ content: {} }));

      await service.writeFile(
        owner,
        repo,
        '.ros/test.yaml',
        'updated',
        'Update file',
        'my-branch',
        token,
        'existing-sha-123',
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.sha).toBe('existing-sha-123');
    });

    it('throws GitHubApiError on 409 conflict', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(409, 'SHA mismatch'));

      await expect(
        service.writeFile(
          owner,
          repo,
          '.ros/test.yaml',
          'content',
          'msg',
          'branch',
          token,
          'stale-sha',
        ),
      ).rejects.toThrow(GitHubApiError);
    });
  });

  // ─── deleteFile ─────────────────────────────────────────────────────

  describe('deleteFile', () => {
    it('sends DELETE with sha and branch', async () => {
      mockFetch.mockResolvedValue(mockResponse({ content: null }));

      await service.deleteFile(
        owner,
        repo,
        '.ros/test.yaml',
        'file-sha-456',
        'Delete RiSc',
        token,
        'my-branch',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/contents/.ros/test.yaml'),
        expect.objectContaining({ method: 'DELETE' }),
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.sha).toBe('file-sha-456');
      expect(callBody.message).toBe('Delete RiSc');
      expect(callBody.branch).toBe('my-branch');
    });
  });

  // ─── fetchDraftBranches ─────────────────────────────────────────────

  describe('fetchDraftBranches', () => {
    it('returns matching branch references', async () => {
      const refs = [
        { ref: 'refs/heads/risc-draft/.ros_001', url: 'https://...' },
        { ref: 'refs/heads/risc-draft/.ros_002', url: 'https://...' },
      ];
      mockFetch.mockResolvedValue(mockResponse(refs));

      const result = await service.fetchDraftBranches(owner, repo, token);
      expect(result).toHaveLength(2);
      expect(result[0].ref).toContain('.ros_001');
    });

    it('returns empty array on 404', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(404));

      const result = await service.fetchDraftBranches(owner, repo, token);
      expect(result).toEqual([]);
    });
  });

  // ─── createBranch ───────────────────────────────────────────────────

  describe('createBranch', () => {
    it('sends POST with refs/heads/ prefix and SHA', async () => {
      mockFetch.mockResolvedValue(
        mockResponse({ ref: 'refs/heads/new-branch' }),
      );

      await service.createBranch(
        owner,
        repo,
        'risc-draft/.ros_new',
        'abc123sha',
        token,
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.ref).toBe('refs/heads/risc-draft/.ros_new');
      expect(callBody.sha).toBe('abc123sha');
    });
  });

  // ─── deleteBranch ───────────────────────────────────────────────────

  describe('deleteBranch', () => {
    it('sends DELETE to the correct ref path', async () => {
      mockFetch.mockResolvedValue(mockResponse(undefined, 204));

      await service.deleteBranch(owner, repo, 'risc-draft/.ros_old', token);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/git/refs/heads/risc-draft/.ros_old'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  // ─── fetchOpenPullRequests ──────────────────────────────────────────

  describe('fetchOpenPullRequests', () => {
    it('returns open PRs', async () => {
      const prs = [
        {
          html_url: 'https://github.com/pr/1',
          title: 'Update RiSc',
          created_at: '2024-01-01T00:00:00Z',
          head: { ref: 'risc-draft/.ros_001' },
          base: { ref: 'main' },
          number: 1,
        },
      ];
      mockFetch.mockResolvedValue(mockResponse(prs));

      const result = await service.fetchOpenPullRequests(owner, repo, token);
      expect(result).toHaveLength(1);
      expect(result[0].number).toBe(1);
    });

    it('includes state=open query parameter', async () => {
      mockFetch.mockResolvedValue(mockResponse([]));

      await service.fetchOpenPullRequests(owner, repo, token);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('?state=open'),
        expect.any(Object),
      );
    });
  });

  // ─── createPullRequest ──────────────────────────────────────────────

  describe('createPullRequest', () => {
    it('creates PR with correct payload', async () => {
      const prResponse = {
        html_url: 'https://github.com/pr/42',
        title: 'Updated risk scorecard',
        created_at: '2024-01-01T00:00:00Z',
        head: { ref: 'risc-draft/.ros_001' },
        base: { ref: 'main' },
        number: 42,
      };
      mockFetch.mockResolvedValue(mockResponse(prResponse));

      const result = await service.createPullRequest(
        owner,
        repo,
        'Updated risk scorecard',
        'PR body text',
        'risc-draft/.ros_001',
        'main',
        token,
      );

      expect(result.number).toBe(42);
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.title).toBe('Updated risk scorecard');
      expect(callBody.head).toBe('risc-draft/.ros_001');
      expect(callBody.base).toBe('main');
    });

    it('throws on failure', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(422, 'Validation Failed'));

      await expect(
        service.createPullRequest(
          owner,
          repo,
          'title',
          'body',
          'head',
          'base',
          token,
        ),
      ).rejects.toThrow(GitHubApiError);
    });
  });

  // ─── closePullRequest ───────────────────────────────────────────────

  describe('closePullRequest', () => {
    it('sends PATCH with state: closed', async () => {
      mockFetch.mockResolvedValue(mockResponse({ state: 'closed' }));

      await service.closePullRequest(owner, repo, 42, token);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/pulls/42'),
        expect.objectContaining({ method: 'PATCH' }),
      );
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.state).toBe('closed');
    });
  });

  // ─── fetchRepositoryInfo ────────────────────────────────────────────

  describe('fetchRepositoryInfo', () => {
    it('returns repository info with write access', async () => {
      mockFetch.mockResolvedValue(
        mockResponse({
          default_branch: 'main',
          permissions: {
            admin: false,
            maintain: false,
            push: true,
            triage: true,
            pull: true,
          },
        }),
      );

      const result = await service.fetchRepositoryInfo(owner, repo, token);
      expect(result.defaultBranch).toBe('main');
      expect(result.hasWriteAccess).toBe(true);
    });

    it('returns no write access when push is false', async () => {
      mockFetch.mockResolvedValue(
        mockResponse({
          default_branch: 'main',
          permissions: {
            admin: false,
            maintain: false,
            push: false,
            triage: false,
            pull: true,
          },
        }),
      );

      const result = await service.fetchRepositoryInfo(owner, repo, token);
      expect(result.hasWriteAccess).toBe(false);
    });

    it('throws on 403 permission denied', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(403, 'Forbidden'));

      await expect(
        service.fetchRepositoryInfo(owner, repo, token),
      ).rejects.toThrow(GitHubApiError);
    });
  });

  // ─── fetchCommits ───────────────────────────────────────────────────

  describe('fetchCommits', () => {
    it('fetches commits with query parameters', async () => {
      const commits = [
        {
          sha: 'abc',
          url: 'https://...',
          commit: {
            message: 'Update',
            committer: { date: '2024-01-01', name: 'test' },
          },
        },
      ];
      mockFetch.mockResolvedValue(mockResponse(commits));

      const result = await service.fetchCommits(owner, repo, token, {
        path: '.ros/test.yaml',
        perPage: 1,
      });

      expect(result).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('path=.ros%2Ftest.yaml'),
        expect.any(Object),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('per_page=1'),
        expect.any(Object),
      );
    });
  });

  // ─── fetchBranchHeadSha ─────────────────────────────────────────────

  describe('fetchBranchHeadSha', () => {
    it('returns SHA on success', async () => {
      mockFetch.mockResolvedValue(
        mockResponse({
          sha: 'deadbeef123',
          url: 'https://...',
          commit: {
            message: 'latest',
            committer: { date: '2024-01-01', name: 'test' },
          },
        }),
      );

      const result = await service.fetchBranchHeadSha(
        owner,
        repo,
        'main',
        token,
      );
      expect(result).toBe('deadbeef123');
    });

    it('returns null when branch not found', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse(404));

      const result = await service.fetchBranchHeadSha(
        owner,
        repo,
        'nonexistent',
        token,
      );
      expect(result).toBeNull();
    });
  });

  // ─── Authorization headers ──────────────────────────────────────────

  describe('authorization', () => {
    it('sends correct authorization header', async () => {
      mockFetch.mockResolvedValue(mockResponse([]));

      await service.fetchPublishedRiScFiles(owner, repo, token);

      const headers = mockFetch.mock.calls[0][1].headers as Record<
        string,
        string
      >;
      expect(headers.Authorization).toBe(`token ${token}`);
      expect(headers.Accept).toBe('application/vnd.github+json');
      // eslint-disable-next-line dot-notation
      expect(headers['X-GitHub-Api-Version']).toBe('2022-11-28');
    });
  });

  // ─── fetchDefaultBranchSha ──────────────────────────────────────────

  describe('fetchDefaultBranchSha', () => {
    it('returns SHA of default branch HEAD', async () => {
      // First call: fetchRepositoryInfo
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          default_branch: 'main',
          permissions: {
            admin: false,
            maintain: false,
            push: true,
            triage: false,
            pull: true,
          },
        }),
      );
      // Second call: fetchBranchHeadSha
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          sha: 'headsha456',
          url: 'https://...',
          commit: {
            message: 'latest',
            committer: { date: '2024-01-01', name: 'test' },
          },
        }),
      );

      const result = await service.fetchDefaultBranchSha(owner, repo, token);
      expect(result).toBe('headsha456');
    });

    it('throws when HEAD SHA cannot be determined', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          default_branch: 'main',
          permissions: {
            admin: false,
            maintain: false,
            push: true,
            triage: false,
            pull: true,
          },
        }),
      );
      mockFetch.mockResolvedValueOnce(mockErrorResponse(404));

      await expect(
        service.fetchDefaultBranchSha(owner, repo, token),
      ).rejects.toThrow('Could not determine HEAD SHA');
    });
  });
});
