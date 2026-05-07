import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { HttpAuthService } from '@backstage/backend-plugin-api';
import express, { Router } from 'express';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  httpAuth: HttpAuthService;
}

/**
 * Creates the Express router for the RiSc backend plugin.
 *
 * Endpoints will be added in T9. For now this serves a health check
 * to verify the plugin is loaded and routable.
 */
export async function createRouter(options: RouterOptions): Promise<Router> {
  const { logger } = options;
  const router = Router();

  router.use(express.json());

  router.get('/health', (_req, res) => {
    logger.info('RiSc backend health check');
    res.json({ status: 'ok' });
  });

  return router;
}
