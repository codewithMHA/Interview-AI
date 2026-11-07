import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Lightweight, zero-external-dependency rate limiter middleware.
 * Prevents API abuse, credential brute-forcing, and Gemini API quota exhaustion.
 */
export const createRateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) => {
  const store: RateLimitStore = {};
  const { windowMs, maxRequests, message } = options;

  // Cleanup expired IPs every 5 minutes to prevent memory leaks (unref so tests/scripts exit cleanly)
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const ip in store) {
      if (store[ip].resetTime < now) {
        delete store[ip];
      }
    }
  }, 5 * 60 * 1000);
  cleanupTimer.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client IP
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();

    if (!store[clientIp] || store[clientIp].resetTime < now) {
      store[clientIp] = {
        count: 1,
        resetTime: now + windowMs,
      };
      next();
      return;
    }

    store[clientIp].count++;

    if (store[clientIp].count > maxRequests) {
      const retryAfterSeconds = Math.ceil((store[clientIp].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      res.status(429).json({
        success: false,
        error:
          message ||
          `Too many requests from this IP. Please try again in ${retryAfterSeconds} seconds.`,
        retryAfter: retryAfterSeconds,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

// Standard limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // max 30 auth attempts per minute
  message: 'Too many authentication attempts. Please wait a minute before trying again.',
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 40, // max 40 AI evaluations per minute
  message: 'AI evaluation quota limit reached for this minute. Please wait a moment.',
});
