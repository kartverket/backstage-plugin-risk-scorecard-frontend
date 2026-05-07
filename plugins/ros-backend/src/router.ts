import { LoggerService } from '@backstage/backend-plugin-api';
import { HttpAuthService } from '@backstage/backend-plugin-api';
import express, { Request, Response, NextFunction, Router } from 'express';
import { ProcessingStatus } from '@internal/backstage-plugin-ros-common';
import { DomainError } from './lib/errors';
import type { RiScService } from './services/RiScService';
import type { GcpKmsService } from './services/GcpKmsService';
import type { InitRiScService } from './services/InitRiScService';
import type { SlackService } from './services/SlackService';

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

/** Extracts the GCP access token from the request header. */
export function extractGcpToken(req: Request): string | undefined {
  const token = req.headers['gcp-access-token'];
  return Array.isArray(token) ? token[0] : token;
}

/** Extracts the GitHub access token from the request header. */
export function extractGitHubToken(req: Request): string | undefined {
  const token = req.headers['github-access-token'];
  return Array.isArray(token) ? token[0] : token;
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
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { owner, repo, version } = req.params;
        const gcpToken = extractGcpToken(req);
        const githubToken = extractGitHubToken(req);

        if (!gcpToken || !githubToken) {
          res.status(401).json({
            status: ProcessingStatus.AccessTokensValidationFailure,
            message: 'Missing required access tokens',
          } satisfies ErrorResponse);
          return;
        }

        const result = await riScService.fetchAllRiScs(
          owner,
          repo,
          version,
          gcpToken,
          githubToken,
        );
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/risc/:owner/:repo/:id',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { owner, repo, id } = req.params;
        const gcpToken = extractGcpToken(req);
        const githubToken = extractGitHubToken(req);

        if (!gcpToken || !githubToken) {
          res.status(401).json({
            status: ProcessingStatus.AccessTokensValidationFailure,
            message: 'Missing required access tokens',
          } satisfies ErrorResponse);
          return;
        }

        // No dedicated fetchRiSc method — use fetchAllRiScs and filter
        const all = await riScService.fetchAllRiScs(
          owner,
          repo,
          '5.2',
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
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/risc/:owner/:repo/:id/difference',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { owner, repo, id } = req.params;
        const gcpToken = extractGcpToken(req);
        const githubToken = extractGitHubToken(req);

        if (!gcpToken || !githubToken) {
          res.status(401).json({
            status: ProcessingStatus.AccessTokensValidationFailure,
            message: 'Missing required access tokens',
          } satisfies ErrorResponse);
          return;
        }

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
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/risc/:owner/:repo',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { owner, repo } = req.params;
        const gcpToken = extractGcpToken(req);
        const githubToken = extractGitHubToken(req);

        if (!gcpToken || !githubToken) {
          res.status(401).json({
            status: ProcessingStatus.AccessTokensValidationFailure,
            message: 'Missing required access tokens',
          } satisfies ErrorResponse);
          return;
        }

        const { content, schemaVersion, sopsConfig } = req.body as {
          content: string;
          schemaVersion: string;
          sopsConfig: unknown;
        };

        const result = await riScService.createRiSc(
          owner,
          repo,
          content,
          schemaVersion,
          sopsConfig as Parameters<typeof riScService.createRiSc>[4],
          gcpToken,
          githubToken,
        );
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    },
  );

  router.put(
    '/risc/:owner/:repo/:id',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { owner, repo, id } = req.params;
        const gcpToken = extractGcpToken(req);
        const githubToken = extractGitHubToken(req);

        if (!gcpToken || !githubToken) {
          res.status(401).json({
            status: ProcessingStatus.AccessTokensValidationFailure,
            message: 'Missing required access tokens',
          } satisfies ErrorResponse);
          return;
        }

        const { content, schemaVersion, sopsConfig, isRequiresNewApproval } =
          req.body as {
            content: string;
            schemaVersion: string;
            sopsConfig: unknown;
            isRequiresNewApproval: boolean;
          };

        const result = await riScService.updateRiSc(
          owner,
          repo,
          id,
          content,
          schemaVersion,
          sopsConfig as Parameters<typeof riScService.updateRiSc>[5],
          isRequiresNewApproval ?? false,
          gcpToken,
          githubToken,
        );
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    '/risc/:owner/:repo/:id',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { owner, repo, id } = req.params;
        const gcpToken = extractGcpToken(req);
        const githubToken = extractGitHubToken(req);

        if (!gcpToken || !githubToken) {
          res.status(401).json({
            status: ProcessingStatus.AccessTokensValidationFailure,
            message: 'Missing required access tokens',
          } satisfies ErrorResponse);
          return;
        }

        const result = await riScService.deleteRiSc(
          owner,
          repo,
          id,
          gcpToken,
          githubToken,
        );
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/risc/:owner/:repo/publish/:id',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { owner, repo, id } = req.params;
        const githubToken = extractGitHubToken(req);

        if (!githubToken) {
          res.status(401).json({
            status: ProcessingStatus.AccessTokensValidationFailure,
            message: 'Missing required access tokens',
          } satisfies ErrorResponse);
          return;
        }

        const userInfo = req.body as { name: string; email: string };
        const result = await riScService.publishRiSc(
          owner,
          repo,
          id,
          githubToken,
          userInfo,
        );
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  );

  // ─── GCP KMS ──────────────────────────────────────────────────────────────

  router.get(
    '/google/gcpCryptoKeys',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const gcpToken = extractGcpToken(req);

        if (!gcpToken) {
          res.status(401).json({
            status: ProcessingStatus.AccessTokensValidationFailure,
            message: 'Missing GCP access token',
          } satisfies ErrorResponse);
          return;
        }

        const keys = await gcpKmsService.getGcpCryptoKeys(gcpToken);
        res.json(keys);
      } catch (err) {
        next(err);
      }
    },
  );

  // ─── Init RiSc ────────────────────────────────────────────────────────────

  router.get(
    '/initrisc',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const githubToken = extractGitHubToken(req);

        if (!githubToken) {
          res.status(401).json({
            status: ProcessingStatus.AccessTokensValidationFailure,
            message: 'Missing GitHub access token',
          } satisfies ErrorResponse);
          return;
        }

        const descriptors =
          await initRiScService.getInitRiScDescriptors(githubToken);
        res.json(descriptors);
      } catch (err) {
        next(err);
      }
    },
  );

  // ─── Slack Feedback ───────────────────────────────────────────────────────

  router.post(
    '/slack/feedback',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
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
      } catch (err) {
        next(err);
      }
    },
  );

  // ─── Error Handler (must be last) ─────────────────────────────────────────

  router.use(errorHandler(logger));

  return router;
}
