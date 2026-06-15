import express from 'express';
import request from 'supertest';
import { ProcessingStatus } from '@kartverket/ros-common';
import { createRouter, extractToken, errorHandler } from '../router';
import { DomainError } from '../lib/errors';

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

function mockGithubCredentialsProvider(appToken: string | undefined = undefined) {
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
  return {} as any;
}

async function createTestApp(
  overrides: Partial<Parameters<typeof createRouter>[0]> = {},
) {
  const app = express();
  const router = await createRouter({
    logger: mockLogger(),
    httpAuth: mockHttpAuth(),
    riScService: mockRiScService(),
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
  describe('health endpoint', () => {
    it('returns ok status', async () => {
      const app = await createTestApp();
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

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
      const githubCredentialsProvider = mockGithubCredentialsProvider('app-tok');
      const app = await createTestApp({ riScService, githubCredentialsProvider });

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
      const githubCredentialsProvider = mockGithubCredentialsProvider('app-tok');
      const app = await createTestApp({ riScService, githubCredentialsProvider });

      const res = await request(app)
        .get('/risc/myorg/myrepo/5.2/all')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok');

      expect(res.status).toBe(200);
      expect(githubCredentialsProvider.getCredentials).not.toHaveBeenCalled();
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
      const githubCredentialsProvider = mockGithubCredentialsProvider('app-tok');
      const app = await createTestApp({ riScService, githubCredentialsProvider });

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
      const githubCredentialsProvider = mockGithubCredentialsProvider('app-tok');
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
      const githubCredentialsProvider = mockGithubCredentialsProvider('app-tok');
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
  });

  describe('POST /risc/:owner/:repo', () => {
    it('returns 201 on successful create', async () => {
      const riScService = mockRiScService();
      const app = await createTestApp({ riScService });

      const res = await request(app)
        .post('/risc/owner/repo')
        .set('GCP-Access-Token', 'gcp-tok')
        .set('GitHub-Access-Token', 'gh-tok')
        .send({ riSc: '{}', schemaVersion: '5.2', sopsConfig: {} });

      expect(res.status).toBe(201);
      expect(riScService.createRiSc).toHaveBeenCalled();
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
      const app = await createTestApp({ riScService });

      const res = await request(app)
        .post('/risc/owner/repo/publish/ros_abc12')
        .set('GitHub-Access-Token', 'gh-tok')
        .send({ name: 'Test User', email: 'test@example.com' });

      expect(res.status).toBe(200);
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
      expect(gcpKmsService.getGcpCryptoKeys).toHaveBeenCalledWith('gcp-tok');
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
          super('No access');
        }
      }

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      handler(new TestError(), {} as any, res, jest.fn());
      expect(logger.warn).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
