import express from 'express';
import { riScIndexStore } from './riscIndexStore';

export const createRouter = async (): Promise<express.Router> => {
  const router = express.Router();

  router.get('/system-riscs', (req, res) => {
    const entityRef = req.query.entityRef;

    if (typeof entityRef !== 'string' || entityRef.trim() === '') {
      res.status(400).json({
        error: 'Query parameter "entityRef" is required',
      });
      return;
    }

    res.json(riScIndexStore.getSystemRiScsForEntityRef(entityRef.trim()));
  });

  return router;
};
