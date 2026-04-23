import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';

type RouterOptions = {
  logger: LoggerService;
};

export const createRouter = async ({
  logger,
}: RouterOptions): Promise<express.Router> => {
  const router = express.Router();

  router.get('/health', (_, res) => {
    logger.info('Risk scorecard backend healthcheck requested');
    res.json({
      pluginId: 'risk-scorecard',
      status: 'ok',
    });
  });

  return router;
};
