// File: packages/core-engine/src/api/http.ts
// Purpose: Express HTTP server with REST routes

import express, { Express } from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import intentsRouter from './routes/intents';
import actionsRouter from './routes/actions';
import recipesRouter from './routes/recipes';
import sttRouter from './routes/stt';
import { logger } from '../utils/logger';

export function createHttpServer(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check (no auth required)
  app.get('/health', (req, res) => {
    res.json({ ok: true, status: 'healthy' });
  });

  // Protected routes
  app.use('/v1/intents', authMiddleware, intentsRouter);
  app.use('/v1/actions', authMiddleware, actionsRouter);
  app.use('/v1/recipes', authMiddleware, recipesRouter);
  app.use('/v1/stt', authMiddleware, sttRouter); // NEW: STT control

  // Error handling
  app.use(errorHandler);

  logger.info('HTTP server configured');
  return app;
}
