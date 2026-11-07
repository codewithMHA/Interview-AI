import { Router, Request, Response } from 'express';
import { getDBStatus } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    success: true,
    message: 'InterviewAI API is healthy and operational',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
    database: {
      status: dbStatus.isConnected ? 'connected' : 'disconnected/standby',
      host: dbStatus.host,
      name: dbStatus.name,
    },
    integrations: {
      geminiConfigured: !!env.GEMINI_API_KEY,
      judge0Configured: !!env.JUDGE0_API_KEY || !!env.JUDGE0_API_URL,
    },
  });
});

export default router;

