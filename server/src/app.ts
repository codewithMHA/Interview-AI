import express, { Express } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { env } from './config/env.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

export const createApp = (): Express => {
  const app = express();

  // Trust first reverse proxy hop (Render, Railway, Nginx, Vercel, etc.) for accurate IP & rate limiting
  app.set('trust proxy', 1);

  // Security Hardening (Phase 9)
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Cross-Origin Resource Sharing (supports comma-separated CLIENT_ORIGIN values and Vercel domains)
  const configuredOrigins = env.CLIENT_ORIGIN.split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  const allowedOrigins = Array.from(
    new Set([
      ...configuredOrigins,
      ...(env.NODE_ENV !== 'production'
        ? ['http://localhost:3000', 'http://127.0.0.1:3000']
        : []),
    ])
  );

  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-server requests)
        if (!requestOrigin) return callback(null, true);

        if (
          allowedOrigins.includes(requestOrigin) ||
          allowedOrigins.includes('*') ||
          /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/i.test(requestOrigin) ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestOrigin)
        ) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic request logging in dev
  if (env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }

  // API Router mounted at /api
  app.use('/api', apiRouter);

  // In single-service production deployments, serve client build when present
  if (env.NODE_ENV === 'production') {
    const clientDistPath = [
      path.resolve(__dirname, '../../client/dist'),
      path.resolve(process.cwd(), 'client/dist'),
      path.resolve(process.cwd(), '../client/dist'),
    ].find((dir) => fs.existsSync(path.join(dir, 'index.html')));

    if (clientDistPath) {
      const clientIndexPath = path.join(clientDistPath, 'index.html');
      app.use(express.static(clientDistPath));
      app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
          return res.sendFile(clientIndexPath);
        }
        return next();
      });
    }
  }

  // 404 handler
  app.use(notFoundHandler);

  // Global centralized error handler
  app.use(errorHandler);

  return app;
};

