import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isBadRequestError = err.name === 'CastError' || err.name === 'ValidationError';
  const statusCode = err.statusCode || (isBadRequestError ? 400 : 500);
  const message =
    err.name === 'CastError' && !err.statusCode
      ? 'Invalid identifier format'
      : err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.url} - ${statusCode}: ${message}`);
  if (err.stack && env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    details: err.details || null,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
};

