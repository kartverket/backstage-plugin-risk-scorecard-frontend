import express from 'express';
import request from 'supertest';
import { ProcessingStatus } from '@kartverket/ros-common';
import { createRouter, extractToken, errorHandler } from '../router';
import {
  DomainError,
  GcpIamPermissionsFetchError,
  GcpOAuthTokenInfoFetchError,
  GcpProjectIdsFetchError,
  InitRiScConfigFetchError,
  InitRiScFetchError,
} from '../lib/errors';
import { GitHubApiError } from '../services/GitHubService';

// ─── Mock Services ────────────────────────────────────────────────────────────

function mockRiScService() {
  return {
    fetchAllRiScs: jest.fn().mockResolvedValue([]),
    createRiSc: jest.fn().mockResolvedValue({
      riScId: 'ros_abc12',
      status: 'CreatedRiSc',
      statusMessage: 'Created',
      riScContent: '{}',
      sopsConfig: null,
    }),
    updateRiSc: jest.fn().mockResolvedValue({
      riScId: 'ros_abc12',
      status: 'UpdatedRiSc',
      statusMessage: 'Updated',
    }),
    deleteRiSc: jest.fn().mockResolvedValue({
      riScId: 'ros_abc12',
      status: 'DeletedRiSc',
      statusMessage: 'Deleted',
    }),
    publishRiSc: jest.fn().mockResolvedValue({
      riScId: 'ros_abc12',
      status: 'CreatedPullRequest',
      statusMessage: 'PR created',
      pendingApproval: null,
    }),
    fetchDifference: jest.fn().mockResolvedValue({
      status: 'Success',
      differenceState: null,
      errorMessage: '',
      defaultLastModifiedDateString: '',
    }),
  } as any;
}

function mockGcpKmsService() {
  return {
    getGcpCryptoKeys: jest.fn().mockResolvedValue([]),
    validateAccessToken: jest.fn().mockResolvedValue(true),
  } as any;
}

function mockGitHubService() {
  return {
    fetchRepositoryInfo: jest.fn().mockResolvedValue({
      defaultBranch: 'main',
      hasReadAccess: true,
      hasWriteAccess: true,
    }),
  } as any;
}

function mockInitRiScService() {
  return {
    getInitRiScDescriptors: jest.fn().mockResolvedValue([]),
    fetchRiScTemplate: jest.fn().mockResolvedValue({
      schemaVersion: '5.0',
      title: 'Template',
      scope: 'Scope',
      scenarios: [],
    }),
    templateRepo: { repoOwner: 'kartverket', repoName: 'risk-scorecards-init' },
  } as any;
}

function mockSlackService() {
  return {
    sendFeedback: jest.fn().mockResolvedValue(undefined),
  } as any;
}

function mockGithubCredentialsProvider(
  appToken: string | undefined = undefined,
) {
  return {
    getCredentials: jest.fn().mockResolvedValue({ token: appToken }),
  } as any;
}

function mockLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  } as any;
}

function mockHttpAuth() {
  return {
    credentials: jest.fn().mockResolvedValue({
      $$type: '@backstage/BackstageCredentials',
      principal: {
        type: 'user',
        userEntityRef: 'user:default/test-user',
      },
    }),
  } as any;
}

async function createTestApp(
  overrides: Partial<Parameters<typeof createRouter>[0]> = {},
) {
  const app = express();
  const router = await createRouter({
    logger: mockLogger(),
    httpAuth: mockHttpAuth(),
    riScService: mockRiScService(),
    gitHubService: mockGitHubService(),
    gcpKmsService: mockGcpKmsService(),
    initRiScService: mockInitRiScService(),
    slackService: mockSlackService(),
    githubCredentialsProvider: mockGithubCredentialsProvider(),
    ...overrides,
  });
  app.use(router);
  return app;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('router', () => {
  describe('header extraction helpers', () => {
    it('extractToken returns token from header', () => {
      const req = { headers: { 'gcp-access-token': 'my-token' } } as any;
      expect(extractToken(req, 'gcp-access-token')).toBe('my-token');
    });

    it('extractToken returns undefined when missing', () => {
      const req = { headers: {} } as any;
      expect(extractToken(req, 'gcp-access-token')).toBeUndefined();
    });

    it('extractToken returns GitHub token from header', () => {
      const req = { headers: { 'github-access-token': 'gh-token' } } as any;
      expect(extractToken(req, 'github-access-token')).toBe('gh-token');
    });

    it('extractToken handles array header values', () => {
      const req = {
        headers: { 'github-access-token': ['first', 'second'] },
      } as any;
      expect(extractToken(req, 'github-access-token')).toBe('first');
    });
  });

  describe('auth token validation', () => {
    it('returns 401 when Backstage user credentials are missing', async () => {
      const httpAuth = mockHttpAuth();
      const authenticationError = new Error('Missing credentials');
      authenticationError.name = 'AuthenticationError';
      httpAuth.credentials.mockRejectedValue(authenticationError);
      const riScService = mockRiScService();
      const app = await createTestApp({
        httpAuth,
        riScService,
      });

      const res = await request(app)
        .get('/risc/owner/repo/5.2/all')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: ProcessingStatus.AccessTokensValidationFailure,
        message: 'Missing credentials',
      });
      expect(httpAuth.credentials).toHaveBeenCalledWith(expect.anything(), {
        allow: ['user'],
      });
      expect(riScService.fetchAllRiScs).not.toHaveBeenCalled();
    });

    it('returns 401 when GCP token is missing on risc routes', async () => {
      const app = await createTestApp();
      const res = await request(app)
        .get('/risc/owner/repo/5.2/all')
        .set('GitHub-Access-Token', 'gh-tok');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(
        ProcessingStatus.AccessTokensValidationFailure,
      );
    });

    it('returns 401 when GitHub token is missing on risc routes and no app token is available', async () => {
      const app = await createTestApp();
      const res = await request(app)
        .get('/risc/owner/repo/5.2/all')
        .set('GCP-Access-Token', 'gcp-tok');
      expect(res.status).toBe(401);
    });
  });

  describe('GitHub app token fallback for reads', () => {
    it('falls back to app token on fetch-all when GitHub header is missing', async () => {
      const riScService = mockRiScService();
      const githubCredentialsProvider =
        mockGithubCredentialsProvider('app-tok');
      const app = await createTestApp({
        riScService,
        githubCredentialsProvider,
      });

      const res = await request(app)
        .get('/risc/myorg/myrepo/5.2/all')
        .set('GCP-Access-Token', 'gcp-tok');

      expect(res.status).toBe(200);
      expect(githubCredentialsProvider.getCredentials).toHaveBeenCalledWith({
        url: 'https://github.com/myorg/myrepo',
      });
      expect(riScService.fetchAllRiScs).toHaveBeenCalledWith(
        'myorg',
        'myrepo',
        '5.2',
        'gcp-tok',
        'app-tok',
      );
    });

    it('prefers user-supplied GitHub token over app token', async () => {
      const riScService = mockRiScService();
      const gitHubService = mockGitHubService();
      const githubCredentialsProvider =
        mockGithubCredentialsProvider('app-tok');
      const app = await createTestApp({
        riScService,
        gitHubService,
        githubCredentialsProvider,
      });

      const res = await request(app)
        .get('/risc/myorg/myrepo/5.2/all')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(200);
      expect(githubCredentialsProvider.getCredentials).not.toHaveBeenCalled();
      expect(gitHubService.fetchRepositoryInfo).toHaveBeenCalledWith(
        'myorg',
        'myrepo',
        'gh-tok',
      );
      expect(riScService.fetchAllRiScs).toHaveBeenCalledWith(
        'myorg',
        'myrepo',
        '5.2',
        'gcp-tok',
        'gh-tok',
      );
    });

    it('falls back to app token on difference when GitHub header is missing', async () => {
      const riScService = mockRiScService();
      const githubCredentialsProvider =
        mockGithubCredentialsProvider('app-tok');
      const app = await createTestApp({
        riScService,
        githubCredentialsProvider,
      });

      const res = await request(app)
        .post('/risc/myorg/myrepo/ros_abc12/difference')
        .set('GCP-Access-Token', 'gcp-tok')
        .send({ riSc: '{}' });

      expect(res.status).toBe(200);
      expect(riScService.fetchDifference).toHaveBeenCalledWith(
        'myorg',
        'myrepo',
        'ros_abc12',
        '{}',
        'gcp-tok',
        'app-tok',
      );
    });

    it('falls back to app token on initrisc using the template repo', async () => {
      const initRiScService = mockInitRiScService();
      const githubCredentialsProvider =
        mockGithubCredentialsProvider('app-tok');
      const app = await createTestApp({
        initRiScService,
        githubCredentialsProvider,
      });

      const res = await request(app).get('/initrisc');

      expect(res.status).toBe(200);
      expect(githubCredentialsProvider.getCredentials).toHaveBeenCalledWith({
        url: 'https://github.com/kartverket/risk-scorecards-init',
      });
      expect(initRiScService.getInitRiScDescriptors).toHaveBeenCalledWith(
        'app-tok',
      );
    });

    it('does not fall back to app token for writes', async () => {
      const githubCredentialsProvider =
        mockGithubCredentialsProvider('app-tok');
      const app = await createTestApp({ githubCredentialsProvider });

      const createRes = await request(app)
        .post('/risc/owner/repo')
        .set('GCP-Access-Token', 'gcp-tok')
        .send({ riSc: '{}', schemaVersion: '5.2', sopsConfig: {} });
      const updateRes = await request(app)
        .put('/risc/owner/repo/ros_abc12')
        .set('GCP-Access-Token', 'gcp-tok')
        .send({ riSc: '{}', schemaVersion: '5.2', sopsConfig: {} });
      const deleteRes = await request(app)
        .delete('/risc/owner/repo/ros_abc12')
        .set('GCP-Access-Token', 'gcp-tok');
      const publishRes = await request(app)
        .post('/risc/owner/repo/publish/ros_abc12')
        .send({ name: 'Test User', email: 'test@example.com' });

      expect(createRes.status).toBe(401);
      expect(updateRes.status).toBe(401);
      expect(deleteRes.status).toBe(401);
      expect(publishRes.status).toBe(401);
      expect(githubCredentialsProvider.getCredentials).not.toHaveBeenCalled();
    });
  });

  describe('GET /risc/:owner/:repo/:version/all', () => {
    it('calls fetchAllRiScs with correct params', async () => {
      const riScService = mockRiScService();
      const app = await createTestApp({ riScService });

      const res = await request(app)
        .get('/risc/myorg/myrepo/5.2/all')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(200);
      expect(riScService.fetchAllRiScs).toHaveBeenCalledWith(
        'myorg',
        'myrepo',
        '5.2',
        'gcp-tok',
        'gh-tok',
      );
    });

    it('returns the read-access status when the repository is inaccessible', async () => {
      const riScService = mockRiScService();
      const gitHubService = mockGitHubService();
      gitHubService.fetchRepositoryInfo.mockResolvedValue({
        defaultBranch: 'main',
        hasReadAccess: false,
        hasWriteAccess: false,
      });
      const app = await createTestApp({ riScService, gitHubService });

      const res = await request(app)
        .get('/risc/owner/repo/5.4/all')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(403);
      expect(res.body.status).toBe(ProcessingStatus.NoReadAccessToRepository);
      expect(riScService.fetchAllRiScs).not.toHaveBeenCalled();
    });
  });

  describe('POST /risc/:owner/:repo', () => {
    it('returns 201 on successful create', async () => {
      const riScService = mockRiScService();
      const gitHubService = mockGitHubService();
      const gcpKmsService = mockGcpKmsService();
      const app = await createTestApp({
        riScService,
        gitHubService,
        gcpKmsService,
      });

      const res = await request(app)
        .post('/risc/owner/repo')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok')
        .send({ riSc: '{}', schemaVersion: '5.2', sopsConfig: {} });

      expect(res.status).toBe(201);
      expect(gitHubService.fetchRepositoryInfo).toHaveBeenCalledWith(
        'owner',
        'repo',
        'gh-tok',
      );
      expect(gcpKmsService.validateAccessToken).toHaveBeenCalledWith('gcp-tok');
      expect(riScService.createRiSc).toHaveBeenCalled();
    });

    it('returns 403 when GitHub token lacks write access', async () => {
      const riScService = mockRiScService();
      const gitHubService = mockGitHubService();
      gitHubService.fetchRepositoryInfo.mockResolvedValue({
        defaultBranch: 'main',
        hasReadAccess: true,
        hasWriteAccess: false,
      });
      const app = await createTestApp({ riScService, gitHubService });

      const res = await request(app)
        .post('/risc/owner/repo')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok')
        .send({ riSc: '{}', schemaVersion: '5.4', sopsConfig: {} });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe(ProcessingStatus.NoWriteAccessToRepository);
      expect(riScService.createRiSc).not.toHaveBeenCalled();
    });

    it('returns 403 when GitHub token lacks read access', async () => {
      const riScService = mockRiScService();
      const gitHubService = mockGitHubService();
      gitHubService.fetchRepositoryInfo.mockResolvedValue({
        defaultBranch: 'main',
        hasReadAccess: false,
        hasWriteAccess: false,
      });
      const app = await createTestApp({ riScService, gitHubService });

      const res = await request(app)
        .post('/risc/owner/repo')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok')
        .send({ riSc: '{}', schemaVersion: '5.4', sopsConfig: {} });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe(ProcessingStatus.NoReadAccessToRepository);
      expect(riScService.createRiSc).not.toHaveBeenCalled();
    });

    it('returns 401 when GitHub token validation fails as unauthorized', async () => {
      const riScService = mockRiScService();
      const gitHubService = mockGitHubService();
      gitHubService.fetchRepositoryInfo.mockRejectedValue(
        new GitHubApiError('Unauthorized', 401),
      );
      const app = await createTestApp({ riScService, gitHubService });

      const res = await request(app)
        .post('/risc/owner/repo')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok')
        .send({ riSc: '{}', schemaVersion: '5.4', sopsConfig: {} });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe(ProcessingStatus.InvalidGitHubAccessToken);
      expect(riScService.createRiSc).not.toHaveBeenCalled();
    });

    it.each([403, 404])(
      'returns 403 when GitHub repository lookup fails with %s',
      async githubStatus => {
        const riScService = mockRiScService();
        const gitHubService = mockGitHubService();
        gitHubService.fetchRepositoryInfo.mockRejectedValue(
          new GitHubApiError('Repository lookup failed', githubStatus),
        );
        const app = await createTestApp({ riScService, gitHubService });

        const res = await request(app)
          .post('/risc/owner/repo')
          .set('GCP-Access-Token', 'gcp-tok')
          .set('GitHub-Access-Token', 'gh-tok')
          .send({ riSc: '{}', schemaVersion: '5.4', sopsConfig: {} });

        expect(res.status).toBe(403);
        expect(res.body.status).toBe(ProcessingStatus.NoReadAccessToRepository);
        expect(res.body.message).toBe(
          'Repository unavailable or read access denied: owner/repo',
        );
        expect(riScService.createRiSc).not.toHaveBeenCalled();
      },
    );

    it('returns 401 when GCP token validation fails', async () => {
      const riScService = mockRiScService();
      const gcpKmsService = mockGcpKmsService();
      gcpKmsService.validateAccessToken.mockResolvedValue(false);
      const app = await createTestApp({ riScService, gcpKmsService });

      const res = await request(app)
        .post('/risc/owner/repo')
        .set('GCP-Access-Token', 'bad-gcp')
        .set('GitHub-Access-Token', 'gh-tok')
        .send({ riSc: '{}', schemaVersion: '5.4', sopsConfig: {} });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe(ProcessingStatus.InvalidGcpAccessToken);
      expect(riScService.createRiSc).not.toHaveBeenCalled();
    });
  });

  describe('PUT /risc/:owner/:repo/:id', () => {
    it('calls updateRiSc and returns 200', async () => {
      const riScService = mockRiScService();
      const app = await createTestApp({ riScService });

      const res = await request(app)
        .put('/risc/owner/repo/ros_abc12')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok')
        .send({
          riSc: '{}',
          schemaVersion: '5.2',
          sopsConfig: {},
          isRequiresNewApproval: false,
        });

      expect(res.status).toBe(200);
      expect(riScService.updateRiSc).toHaveBeenCalledWith(
        'owner',
        'repo',
        'ros_abc12',
        '{}',
        '5.2',
        expect.anything(),
        false,
        'gcp-tok',
        'gh-tok',
      );
    });
  });

  describe('DELETE /risc/:owner/:repo/:id', () => {
    it('calls deleteRiSc', async () => {
      const riScService = mockRiScService();
      const app = await createTestApp({ riScService });

      const res = await request(app)
        .delete('/risc/owner/repo/ros_abc12')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(200);
      expect(riScService.deleteRiSc).toHaveBeenCalledWith(
        'owner',
        'repo',
        'ros_abc12',
        'gcp-tok',
        'gh-tok',
      );
    });
  });

  describe('POST /risc/:owner/:repo/publish/:id', () => {
    it('calls publishRiSc with user info', async () => {
      const riScService = mockRiScService();
      const gitHubService = mockGitHubService();
      const gcpKmsService = mockGcpKmsService();
      const app = await createTestApp({
        riScService,
        gitHubService,
        gcpKmsService,
      });

      const res = await request(app)
        .post('/risc/owner/repo/publish/ros_abc12')
        .set('GitHub-Access-Token', 'gh-tok')
        .send({ name: 'Test User', email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(gitHubService.fetchRepositoryInfo).toHaveBeenCalledWith(
        'owner',
        'repo',
        'gh-tok',
      );
      expect(gcpKmsService.validateAccessToken).not.toHaveBeenCalled();
      expect(riScService.publishRiSc).toHaveBeenCalledWith(
        'owner',
        'repo',
        'ros_abc12',
        'gh-tok',
        { name: 'Test User', email: 'test@example.com' },
      );
    });
  });

  describe('GET /google/gcpCryptoKeys', () => {
    it('calls getGcpCryptoKeys with token', async () => {
      const gcpKmsService = mockGcpKmsService();
      const app = await createTestApp({ gcpKmsService });

      const res = await request(app)
        .get('/google/gcpCryptoKeys')
        .set('GCP-Access-Token', 'gcp-tok');

      expect(res.status).toBe(200);
      expect(gcpKmsService.validateAccessToken).toHaveBeenCalledWith('gcp-tok');
      expect(gcpKmsService.getGcpCryptoKeys).toHaveBeenCalledWith('gcp-tok');
    });

    it('returns the token-info fetch status when validation is unavailable', async () => {
      const gcpKmsService = mockGcpKmsService();
      gcpKmsService.validateAccessToken.mockRejectedValue(
        new GcpOAuthTokenInfoFetchError(),
      );
      const app = await createTestApp({ gcpKmsService });

      const res = await request(app)
        .get('/google/gcpCryptoKeys')
        .set('GCP-Access-Token', 'gcp-tok');

      expect(res.status).toBe(500);
      expect(res.body.status).toBe(
        ProcessingStatus.FailedToFetchGCPOAuth2TokenInformation,
      );
      expect(gcpKmsService.getGcpCryptoKeys).not.toHaveBeenCalled();
    });

    it('returns the IAM-permissions fetch status', async () => {
      const gcpKmsService = mockGcpKmsService();
      gcpKmsService.getGcpCryptoKeys.mockRejectedValue(
        new GcpIamPermissionsFetchError(),
      );
      const app = await createTestApp({ gcpKmsService });

      const res = await request(app)
        .get('/google/gcpCryptoKeys')
        .set('GCP-Access-Token', 'gcp-tok');

      expect(res.status).toBe(500);
      expect(res.body.status).toBe(
        ProcessingStatus.FailedToFetchGCPIAMPermissions,
      );
    });

    it('returns the project-IDs fetch status', async () => {
      const gcpKmsService = mockGcpKmsService();
      gcpKmsService.getGcpCryptoKeys.mockRejectedValue(
        new GcpProjectIdsFetchError(),
      );
      const app = await createTestApp({ gcpKmsService });

      const res = await request(app)
        .get('/google/gcpCryptoKeys')
        .set('GCP-Access-Token', 'gcp-tok');

      expect(res.status).toBe(500);
      expect(res.body.status).toBe(ProcessingStatus.FailedToFetchGcpProjectIds);
    });
  });

  describe('GET /initrisc', () => {
    it('calls getInitRiScDescriptors', async () => {
      const initRiScService = mockInitRiScService();
      const app = await createTestApp({ initRiScService });

      const res = await request(app)
        .get('/initrisc')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(200);
      expect(initRiScService.getInitRiScDescriptors).toHaveBeenCalledWith(
        'gh-tok',
      );
    });

    it('returns the descriptor-config fetch status when GitHub content is unavailable', async () => {
      const initRiScService = mockInitRiScService();
      initRiScService.getInitRiScDescriptors.mockRejectedValue(
        new InitRiScConfigFetchError(),
      );
      const app = await createTestApp({ initRiScService });

      const res = await request(app)
        .get('/initrisc')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(500);
      expect(res.body.status).toBe(
        ProcessingStatus.FailedToFetchInitRiScConfigFromGitHub,
      );
    });
  });

  describe('GET /initrisc/:id', () => {
    it('calls fetchRiScTemplate with id and token', async () => {
      const initRiScService = mockInitRiScService();
      const app = await createTestApp({ initRiScService });

      const res = await request(app)
        .get('/initrisc/web-app-api')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        schemaVersion: '5.0',
        title: 'Template',
        scope: 'Scope',
        scenarios: [],
      });
      expect(initRiScService.fetchRiScTemplate).toHaveBeenCalledWith(
        'web-app-api',
        'gh-tok',
        undefined,
      );
    });

    it('passes ref query param to fetchRiScTemplate', async () => {
      const initRiScService = mockInitRiScService();
      const app = await createTestApp({ initRiScService });

      const res = await request(app)
        .get('/initrisc/web-app-api?ref=add-scenarios')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(200);
      expect(initRiScService.fetchRiScTemplate).toHaveBeenCalledWith(
        'web-app-api',
        'gh-tok',
        'add-scenarios',
      );
    });

    it('returns the template fetch status when GitHub content is unavailable', async () => {
      const initRiScService = mockInitRiScService();
      initRiScService.fetchRiScTemplate.mockRejectedValue(
        new InitRiScFetchError(),
      );
      const app = await createTestApp({ initRiScService });

      const res = await request(app)
        .get('/initrisc/web-app-api')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(500);
      expect(res.body.status).toBe(
        ProcessingStatus.FailedToFetchInitRiScFromGitHub,
      );
    });
  });

  describe('POST /slack/feedback', () => {
    it('sends feedback successfully', async () => {
      const slackService = mockSlackService();
      const app = await createTestApp({ slackService });

      const res = await request(app)
        .post('/slack/feedback')
        .send({ message: 'Great tool!' });

      expect(res.status).toBe(200);
      expect(slackService.sendFeedback).toHaveBeenCalledWith('Great tool!');
    });

    it('returns 501 when slack not configured', async () => {
      const app = await createTestApp({ slackService: null });

      const res = await request(app)
        .post('/slack/feedback')
        .send({ message: 'Test' });

      expect(res.status).toBe(501);
    });

    it('returns 400 when message is missing', async () => {
      const slackService = mockSlackService();
      const app = await createTestApp({ slackService });

      const res = await request(app).post('/slack/feedback').send({});

      expect(res.status).toBe(400);
    });
  });

  describe('error handler middleware', () => {
    it('maps DomainError to correct HTTP status and response shape', async () => {
      class TestDomainError extends DomainError {
        readonly httpStatus = 422;
        readonly processingStatus = ProcessingStatus.ErrorWhenUpdatingRiSc;
        constructor() {
          super('Validation failed');
        }
      }

      const riScService = mockRiScService();
      riScService.fetchAllRiScs.mockRejectedValue(new TestDomainError());
      const app = await createTestApp({ riScService });

      const res = await request(app)
        .get('/risc/owner/repo/5.2/all')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(422);
      expect(res.body).toEqual({
        status: ProcessingStatus.ErrorWhenUpdatingRiSc,
        message: 'Validation failed',
      });
    });

    it('maps unknown errors to 500', async () => {
      const riScService = mockRiScService();
      riScService.fetchAllRiScs.mockRejectedValue(new Error('oops'));
      const app = await createTestApp({ riScService });

      const res = await request(app)
        .get('/risc/owner/repo/5.2/all')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Internal server error');
    });
  });

  describe('error handler function directly', () => {
    it('calls logger.warn for domain errors', () => {
      const logger = mockLogger();
      const handler = errorHandler(logger);

      class TestError extends DomainError {
        readonly httpStatus = 403;
        readonly processingStatus = ProcessingStatus.NoWriteAccessToRepository;
        constructor() {
          super('No access', { cause: new Error('Underlying failure') });
        }
      }

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const error = new TestError();
      handler(error, {} as any, res, jest.fn());
      expect(logger.warn).toHaveBeenCalledWith(
        'Domain error [TestError]: No access',
        error,
      );
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
