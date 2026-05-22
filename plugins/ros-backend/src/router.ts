import { LoggerService } from '@backstage/backend-plugin-api';
import { HttpAuthService } from '@backstage/backend-plugin-api';
import express, {
  Request,
  RequestHandler,
  Response,
  NextFunction,
  Router,
} from 'express';
import { ProcessingStatus } from '@internal/backstage-plugin-ros-common';
import { AccessTokenValidationError, DomainError } from './lib/errors';
import type { RiScService } from './services/RiScService';
import type { GcpKmsService } from './services/GcpKmsService';
import type { InitRiScService } from './services/InitRiScService';
import type { SlackService } from './services/SlackService';
import { latestSupportedVersion } from '@internal/backstage-plugin-ros-common';
// ─── Types ────────────────────────────────────────────────────────────────────

export interface RouterOptions {
  logger: LoggerService;
  httpAuth: HttpAuthService;
  riScService: RiScService;
  gcpKmsService: GcpKmsService;
  initRiScService: InitRiScService;
  slackService: SlackService | null;
}

/** Standard error response shape consumed by the frontend. */
interface ErrorResponse {
  status: ProcessingStatus;
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extracts the GitHub or GCP access token from the request header. */
export function extractToken(req: Request, headerName: string): string | undefined {
  const token = req.headers[headerName.toLowerCase()];
  return Array.isArray(token) ? token[0] : token;
}

/**
 * Reads the requested tokens from headers and throws
 * AccessTokenValidationError (→ 401) if any are missing.
 */
function requireTokens(
  req: Request,
  need: { gcp?: boolean; github?: boolean },
): { gcpToken: string; githubToken: string } {
  const gcpToken = need.gcp ? extractToken(req, 'gcp-access-token') : '';
  const githubToken = need.github ? extractToken(req, 'github-access-token') : '';
  if ((need.gcp && !gcpToken) || (need.github && !githubToken)) {
    throw new AccessTokenValidationError('Missing required access tokens');
  }
  return { gcpToken: gcpToken ?? '', githubToken: githubToken ?? '' };
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
  const { logger, riScService, gcpKmsService, initRiScService, slackService } =
    options;

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
      const { gcpToken, githubToken } = requireTokens(req, {
        gcp: true,
        github: true,
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
      const { gcpToken, githubToken } = requireTokens(req, {
        gcp: true,
        github: true,
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
      const { gcpToken, githubToken } = requireTokens(req, {
        gcp: true,
        github: true,
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
      const { gcpToken, githubToken } = requireTokens(req, {
        gcp: true,
        github: true,
      });

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
      const { gcpToken, githubToken } = requireTokens(req, {
        gcp: true,
        github: true,
      });

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
      const { gcpToken, githubToken } = requireTokens(req, {
        gcp: true,
        github: true,
      });

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
      const { githubToken } = requireTokens(req, { github: true });

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
      const { gcpToken } = requireTokens(req, { gcp: true });

      const keys = await gcpKmsService.getGcpCryptoKeys(gcpToken);
      res.json(keys);
    }),
  );

  // ─── Init RiSc ────────────────────────────────────────────────────────────

  router.get(
    '/initrisc',
    asyncHandler(async (req, res) => {
      const { githubToken } = requireTokens(req, { github: true });

      const descriptors =
        await initRiScService.getInitRiScDescriptors(githubToken);
      res.json(descriptors);
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
