import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { verifyToken } from '../utils/token.js';
import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';

const LEGACY_DEMO_ID = '65f1a2b3c4d5e6f7a8b9c0d1';

/**
 * Resolves non-ObjectId session IDs only for known demo aliases or MongoDB email matches,
 * ensuring distinct registered users are never merged into the demo student identity.
 */
const normalizeDecodedUser = async (decoded: any): Promise<any> => {
  if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
    const normalizedEmail = decoded.email?.toLowerCase().trim();
    const isDemoAlias =
      decoded.userId === 'demo-student-id-101' ||
      normalizedEmail === 'student@placement.edu' ||
      normalizedEmail === 'student@demo.com';

    if (getDBStatus().isConnected && normalizedEmail) {
      try {
        const dbUser = await User.findOne({ email: normalizedEmail });
        if (dbUser) {
          decoded.userId = dbUser._id.toString();
        } else if (isDemoAlias) {
          decoded.userId = LEGACY_DEMO_ID;
        }
      } catch {
        if (isDemoAlias) decoded.userId = LEGACY_DEMO_ID;
      }
    } else if (isDemoAlias) {
      decoded.userId = LEGACY_DEMO_ID;
    }
  }

  decoded.id = decoded.userId;
  return decoded;
};

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
    const decoded = await normalizeDecodedUser(verifyToken(token));
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
      const decoded = await normalizeDecodedUser(verifyToken(token));
      req.user = decoded;
      return next();
    } catch {
      // Token invalid or expired, gracefully fallback to demo guest
    }
  }

  // Gracefully provide demo guest telemetry for visitors
  let fallbackId = LEGACY_DEMO_ID;
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

