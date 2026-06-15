import { LoggerService } from '@backstage/backend-plugin-api';
import { HttpAuthService } from '@backstage/backend-plugin-api';
import express, {
  Request,
  RequestHandler,
  Response,
  NextFunction,
  Router,
} from 'express';
import type { GithubCredentialsProvider } from '@backstage/integration';
import {
  ProcessingStatus,
  latestSupportedVersion,
} from '@kartverket/ros-common';
import {
  AccessTokenValidationError,
  DomainError,
  InvalidGcpAccessTokenError,
  InvalidGitHubAccessTokenError,
  RepositoryAccessError,
} from './lib/errors';
import type { RiScService } from './services/RiScService';
import type { GcpKmsService } from './services/GcpKmsService';
import type { GitHubService } from './services/GitHubService';
import { GitHubApiError } from './services/GitHubService';
import type { InitRiScService } from './services/InitRiScService';
import type { SlackService } from './services/SlackService';
// ─── Types ────────────────────────────────────────────────────────────────────

export interface RouterOptions {
  logger: LoggerService;
  httpAuth: HttpAuthService;
  riScService: RiScService;
  gitHubService: GitHubService;
  gcpKmsService: GcpKmsService;
  initRiScService: InitRiScService;
  slackService: SlackService | null;
  githubCredentialsProvider: GithubCredentialsProvider;
}

/** Standard error response shape consumed by the frontend. */
interface ErrorResponse {
  status: ProcessingStatus;
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extracts the GitHub or GCP access token from the request header. */
export function extractToken(
  req: Request,
  headerName: string,
): string | undefined {
  const token = req.headers[headerName.toLowerCase()];
  return Array.isArray(token) ? token[0] : token;
}

/**
 * Wraps an async route handler so that thrown errors flow into Express's
 * error middleware instead of becoming unhandled promise rejections.
 */
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

/** Maps DomainError to an HTTP error response. */
function mapErrorToResponse(err: DomainError): {
  statusCode: number;
  body: ErrorResponse;
} {
  return {
    statusCode: err.httpStatus,
    body: {
      status: err.processingStatus,
      message: err.message,
    },
  };
}

// ─── Error Handler Middleware ──────────────────────────────────────────────────

/** Express error handler that maps domain errors to HTTP responses. */
export function errorHandler(logger: LoggerService) {
  return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof DomainError) {
      const { statusCode, body } = mapErrorToResponse(err);
      logger.warn(`Domain error [${err.name}]: ${err.message}`);
      res.status(statusCode).json(body);
      return;
    }

    // Unknown errors → 500
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({
      status: ProcessingStatus.ErrorWhenUpdatingRiSc,
      message: 'Internal server error',
    } satisfies ErrorResponse);
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

/**
 * Creates the Express router for the RiSc backend plugin.
 * All routes are thin: extract params/headers, call service, format response.
 */
export async function createRouter(options: RouterOptions): Promise<Router> {
  const {
    logger,
    riScService,
    gitHubService,
    gcpKmsService,
    initRiScService,
    slackService,
    githubCredentialsProvider,
  } = options;

  type GitHubTokenAccess = 'read' | 'write';

  async function requireValidGcpAccessToken(req: Request): Promise<string> {
    const gcpToken = extractToken(req, 'gcp-access-token');
    if (!gcpToken) {
      throw new AccessTokenValidationError('Missing required access tokens');
    }

    if (!(await gcpKmsService.validateAccessToken(gcpToken))) {
      throw new InvalidGcpAccessTokenError();
    }

    return gcpToken;
  }

  async function requireValidGitHubToken(
    req: Request,
    context: {
      owner: string;
      repo: string;
      access: GitHubTokenAccess;
    },
  ): Promise<string> {
    const userToken = extractToken(req, 'github-access-token');

    if (userToken) {
      let repositoryInfo;
      try {
        repositoryInfo = await gitHubService.fetchRepositoryInfo(
          context.owner,
          context.repo,
          userToken,
        );
      } catch (e) {
        if (e instanceof GitHubApiError && e.status === 401) {
          throw new InvalidGitHubAccessTokenError(
            `Invalid GitHub access token for ${context.owner}/${context.repo}`,
          );
        }
        throw e;
      }

      if (context.access === 'write' && !repositoryInfo.hasWriteAccess) {
        throw new RepositoryAccessError(
          `Access denied: No write-access on ${context.owner}/${context.repo}`,
        );
      }

      return userToken;
    }

    if (context.access === 'write') {
      throw new AccessTokenValidationError('Missing required access tokens');
    }

    try {
      // Backstage's GithubCredentialsProvider is stateful and caches app tokens
      // internally per URL, so repeated lookups reuse the cached token.
      const { token } = await githubCredentialsProvider.getCredentials({
        url: `https://github.com/${context.owner}/${context.repo}`,
      });
      if (token) {
        return token;
      }
    } catch (e) {
      logger.error(
        `Could not resolve GitHub App installation token for ${context.owner}/${context.repo}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
    }

    throw new AccessTokenValidationError('Missing required access tokens');
  }

  const router = Router();
  router.use(express.json());

  // Request logging
  router.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // ─── Health ───────────────────────────────────────────────────────────────

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // ─── RiSc CRUD ────────────────────────────────────────────────────────────

  router.get(
    '/risc/:owner/:repo/:version/all',
    asyncHandler(async (req, res) => {
      const { owner, repo, version } = req.params;
      const gcpToken = await requireValidGcpAccessToken(req);
      const githubToken = await requireValidGitHubToken(req, {
        owner,
        repo,
        access: 'read',
      });

      const result = await riScService.fetchAllRiScs(
        owner,
        repo,
        version,
        gcpToken,
        githubToken,
      );
      res.json(result);
    }),
  );

  router.get(
    '/risc/:owner/:repo/:id',
    asyncHandler(async (req, res) => {
      const { owner, repo, id } = req.params;
      const gcpToken = await requireValidGcpAccessToken(req);
      const githubToken = await requireValidGitHubToken(req, {
        owner,
        repo,
        access: 'read',
      });

      // No dedicated fetchRiSc method — use fetchAllRiScs and filter
      const all = await riScService.fetchAllRiScs(
        owner,
        repo,
        latestSupportedVersion,
        gcpToken,
        githubToken,
      );
      const risc = all.find(r => r.riScId === id);
      if (!risc) {
        res.status(404).json({
          status: ProcessingStatus.ErrorWhenUpdatingRiSc,
          message: `RiSc ${id} not found`,
        } satisfies ErrorResponse);
        return;
      }
      res.json(risc);
    }),
  );

  router.post(
    '/risc/:owner/:repo/:id/difference',
    asyncHandler(async (req, res) => {
      const { owner, repo, id } = req.params;
      const gcpToken = await requireValidGcpAccessToken(req);
      const githubToken = await requireValidGitHubToken(req, {
        owner,
        repo,
        access: 'read',
      });

      const { riSc: draftContent } = req.body as { riSc: string };
      const result = await riScService.fetchDifference(
        owner,
        repo,
        id,
        draftContent,
        gcpToken,
        githubToken,
      );
      res.json(result);
    }),
  );

  router.post(
    '/risc/:owner/:repo',
    asyncHandler(async (req, res) => {
      const { owner, repo } = req.params;
      const githubToken = await requireValidGitHubToken(req, {
        owner,
        repo,
        access: 'write',
      });
      const gcpToken = await requireValidGcpAccessToken(req);

      const { riSc, schemaVersion, sopsConfig } = req.body as {
        riSc: string;
        schemaVersion: string;
        sopsConfig: unknown;
      };

      const result = await riScService.createRiSc(
        owner,
        repo,
        riSc,
        schemaVersion,
        sopsConfig as Parameters<typeof riScService.createRiSc>[4],
        gcpToken,
        githubToken,
      );
      res.status(201).json(result);
    }),
  );

  router.put(
    '/risc/:owner/:repo/:id',
    asyncHandler(async (req, res) => {
      const { owner, repo, id } = req.params;
      const githubToken = await requireValidGitHubToken(req, {
        owner,
        repo,
        access: 'write',
      });
      const gcpToken = await requireValidGcpAccessToken(req);

      const { riSc, schemaVersion, sopsConfig, isRequiresNewApproval } =
        req.body as {
          riSc: string;
          schemaVersion: string;
          sopsConfig: unknown;
          isRequiresNewApproval: boolean;
        };

      const result = await riScService.updateRiSc(
        owner,
        repo,
        id,
        riSc,
        schemaVersion,
        sopsConfig as Parameters<typeof riScService.updateRiSc>[5],
        isRequiresNewApproval ?? false,
        gcpToken,
        githubToken,
      );
      res.json(result);
    }),
  );

  router.delete(
    '/risc/:owner/:repo/:id',
    asyncHandler(async (req, res) => {
      const { owner, repo, id } = req.params;
      const githubToken = await requireValidGitHubToken(req, {
        owner,
        repo,
        access: 'write',
      });
      const gcpToken = await requireValidGcpAccessToken(req);

      const result = await riScService.deleteRiSc(
        owner,
        repo,
        id,
        gcpToken,
        githubToken,
      );
      res.json(result);
    }),
  );

  router.post(
    '/risc/:owner/:repo/publish/:id',
    asyncHandler(async (req, res) => {
      const { owner, repo, id } = req.params;
      const githubToken = await requireValidGitHubToken(req, {
        owner,
        repo,
        access: 'write',
      });

      const userInfo = req.body as { name: string; email: string };
      const result = await riScService.publishRiSc(
        owner,
        repo,
        id,
        githubToken,
        userInfo,
      );
      res.json(result);
    }),
  );

  // ─── GCP KMS ──────────────────────────────────────────────────────────────

  router.get(
    '/google/gcpCryptoKeys',
    asyncHandler(async (req, res) => {
      const gcpToken = await requireValidGcpAccessToken(req);

      const keys = await gcpKmsService.getGcpCryptoKeys(gcpToken);
      res.json(keys);
    }),
  );

  // ─── Init RiSc ────────────────────────────────────────────────────────────

  router.get(
    '/initrisc',
    asyncHandler(async (req, res) => {
      const { repoOwner, repoName } = initRiScService.templateRepo;
      const githubToken = await requireValidGitHubToken(req, {
        owner: repoOwner,
        repo: repoName,
        access: 'read',
      });

      const descriptors =
        await initRiScService.getInitRiScDescriptors(githubToken);
      res.json(descriptors);
    }),
  );

  router.get(
    '/initrisc/:id',
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { githubToken } = requireTokens(req, { github: true });
      const ref = typeof req.query.ref === 'string' ? req.query.ref : undefined;

      const template = await initRiScService.fetchRiScTemplate(
        id,
        githubToken,
        ref,
      );
      res.json(template);
    }),
  );

  // ─── Slack Feedback ───────────────────────────────────────────────────────

  router.post(
    '/slack/feedback',
    asyncHandler(async (req, res) => {
      if (!slackService) {
        res.status(501).json({
          status: ProcessingStatus.ErrorWhenUpdatingRiSc,
          message: 'Slack integration not configured',
        } satisfies ErrorResponse);
        return;
      }

      const { message } = req.body as { message: string };
      if (!message) {
        res.status(400).json({
          status: ProcessingStatus.ErrorWhenUpdatingRiSc,
          message: 'Missing feedback message',
        } satisfies ErrorResponse);
        return;
      }

      await slackService.sendFeedback(message);
      res.json({ status: 'ok' });
    }),
  );

  // ─── Error Handler (must be last) ─────────────────────────────────────────

  router.use(errorHandler(logger));

  return router;
}
