import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { verifyToken } from '../utils/token.js';
import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access denied. No authentication token provided.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    // Seamlessly heal legacy or non-ObjectId session IDs (e.g., demo-student-id-101)
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      if (getDBStatus().isConnected && decoded.email) {
        try {
          const dbUser = await User.findOne({ email: decoded.email.toLowerCase().trim() });
          if (dbUser) {
            decoded.userId = dbUser._id.toString();
          } else {
            decoded.userId = '65f1a2b3c4d5e6f7a8b9c0d1';
          }
        } catch {
          decoded.userId = '65f1a2b3c4d5e6f7a8b9c0d1';
        }
      } else {
        decoded.userId = '65f1a2b3c4d5e6f7a8b9c0d1';
      }
    }

    (decoded as any).id = decoded.userId;
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token. Please log in again.',
      timestamp: new Date().toISOString(),
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
        if (getDBStatus().isConnected && decoded.email) {
          try {
            const dbUser = await User.findOne({ email: decoded.email.toLowerCase().trim() });
            if (dbUser) {
              decoded.userId = dbUser._id.toString();
            } else {
              decoded.userId = '65f1a2b3c4d5e6f7a8b9c0d1';
            }
          } catch {
            decoded.userId = '65f1a2b3c4d5e6f7a8b9c0d1';
          }
        } else {
          decoded.userId = '65f1a2b3c4d5e6f7a8b9c0d1';
        }
      }
      (decoded as any).id = decoded.userId;
      req.user = decoded;
      return next();
    } catch {
      // Token invalid or expired, gracefully fallback to demo guest
    }
  }

  // Gracefully provide demo guest telemetry for visitors
  let fallbackId = '65f1a2b3c4d5e6f7a8b9c0d1';
  if (getDBStatus().isConnected) {
    try {
      const demoUser = await User.findOne({ email: 'student@demo.com' });
      if (demoUser) {
        fallbackId = demoUser._id.toString();
      }
    } catch {
      // ignore
    }
  }

  req.user = {
    userId: fallbackId,
    id: fallbackId,
    email: 'student@demo.com',
    role: 'student' as UserRole,
    isGuest: true,
  } as any;
  next();
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access forbidden: requires one of the following roles: [${roles.join(', ')}]`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

