import express from 'express';
import { riScIndexStore } from './riscIndexStore';

export const createRouter = async (): Promise<express.Router> => {
  const router = express.Router();

  router.get('/risc-index', (req, res) => {
    const componentRef = req.query.componentRef;

    if (typeof componentRef !== 'string' || componentRef.trim() === '') {
      res.status(400).json({
        error: 'Query parameter "componentRef" is required',
      });
      return;
    }

    res.json(riScIndexStore.getAnalysesUrlsForComponentRef(componentRef.trim()));
  });

  return router;
};
