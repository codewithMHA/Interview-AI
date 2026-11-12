import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { generateToken } from '../utils/token.js';
import { getDBStatus } from '../config/db.js';
import { devStore } from '../services/devStore.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidator.js';
import { AuthenticatedRequest } from '../types/index.js';
import { autoSeedDatabase } from '../utils/autoSeed.js';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    const validationError = validateRegisterInput({ name, email, password, confirmPassword, role });
    if (validationError) {
      res.status(400).json({
        success: false,
        error: validationError,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isMongo = getDBStatus().isConnected;

    if (isMongo) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'An account with this email address already exists.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create new user (password is automatically hashed via mongoose pre-save hook)
      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: role === 'admin' ? 'admin' : 'student',
      });

      // Create linked Profile
      const newProfile = await Profile.create({
        user: newUser._id,
        name: newUser.name,
        email: newUser.email,
        degree: 'B.Tech / B.E. in Computer Science',
        graduationYear: new Date().getFullYear() + 1,
        targetRole: 'Software Engineer',
        experienceLevel: 'Beginner',
        programmingLanguages: ['JavaScript', 'Python'],
        skills: ['Data Structures', 'Algorithms', 'React', 'Node.js'],
        preparationScore: 45,
        streakCount: 1,
        xpPoints: 100,
        level: 1,
        isOnboarded: false,
      });

      newUser.profile = newProfile._id as any;
      await newUser.save();

      const token = generateToken({
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        profile: newProfile,
        timestamp: new Date().toISOString(),
      });
    } else {
      // DevStore fallback
      const existing = await devStore.findUserByEmail(normalizedEmail);
      if (existing) {
        res.status(409).json({
          success: false,
          error: 'An account with this email address already exists.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const newUser = await devStore.createUser({
        name,
        email: normalizedEmail,
        password,
        role,
      });
      const profile = await devStore.getProfile(newUser.id);

      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        profile,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const validationError = validateLoginInput({ email, password });
    if (validationError) {
      res.status(400).json({
        success: false,
        error: validationError,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const allowDemoBypass = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_LOGIN === 'true';
    const isDemoEmail = normalizedEmail === 'student@placement.edu' || normalizedEmail === 'student@demo.com';
    const isMongo = getDBStatus().isConnected;

    if (isMongo) {
      let user: any = await User.findOne({ email: normalizedEmail }).select('+password');

      // If demo student doesn't exist yet in non-production, auto-provision
      if (!user && allowDemoBypass && isDemoEmail) {
        await autoSeedDatabase();
        user = await User.findOne({ email: { $in: ['student@placement.edu', 'student@demo.com'] } }).select('+password');
      }

      if (!user) {
        // Fallback: check devStore only for matching email (never fall back to demo user for arbitrary emails)
        const devUser =
          (await devStore.findUserByEmail(normalizedEmail)) ||
          (allowDemoBypass && isDemoEmail ? await devStore.findUserByEmail('student@placement.edu') : null);
        if (devUser) {
          const isMatch =
            (allowDemoBypass && isDemoEmail && (password === 'Placement2026!' || password === 'password123')) ||
            (await bcrypt.compare(password, devUser.password));
          if (isMatch) {
            const devProfile = await devStore.getProfile(devUser.id);
            const token = generateToken({
              userId: devUser.id,
              email: devUser.email,
              role: devUser.role,
            });
            res.status(200).json({
              success: true,
              message: 'Authentication successful.',
              token,
              user: {
                id: devUser.id,
                name: devUser.name,
                email: devUser.email,
                role: devUser.role,
              },
              profile: devProfile || null,
              timestamp: new Date().toISOString(),
            });
            return;
          }
        }

        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      let isMatch = await user.comparePassword(password);
      // Auto-heal demo student password only in non-production environments
      if (!isMatch && allowDemoBypass && isDemoEmail && (password === 'Placement2026!' || password === 'password123')) {
        isMatch = true;
      }

      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      let profile = await Profile.findOne({ user: user._id });
      if (!profile) {
        profile = await Profile.create({
          user: user._id,
          name: user.name,
          email: user.email,
          degree: 'B.Tech / B.E. in Computer Science',
          graduationYear: new Date().getFullYear() + 1,
          targetRole: 'Software Engineer',
          experienceLevel: 'Intermediate',
          programmingLanguages: ['JavaScript', 'Python'],
          skills: ['Data Structures', 'Algorithms'],
          preparationScore: 75,
          streakCount: 3,
          xpPoints: 500,
          level: 2,
          isOnboarded: true,
        });
        user.profile = profile._id as any;
        await user.save();
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        profile: profile || null,
        timestamp: new Date().toISOString(),
      });
    } else {
      // DevStore fallback
      const user = await devStore.findUserByEmail(normalizedEmail);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const profile = await devStore.getProfile(user.id);
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        profile: profile || null,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isMongo = getDBStatus().isConnected;

    if (isMongo) {
      let user: any = null;
      if (mongoose.Types.ObjectId.isValid(req.user.userId)) {
        user = await User.findById(req.user.userId);
      }
      if (!user && req.user.email) {
        user = await User.findOne({ email: req.user.email.toLowerCase().trim() });
      }

      if (!user) {
        // Fallback to devStore for legacy in-memory session tokens
        const devUser = (await devStore.findUserById(req.user.userId)) || (req.user.email ? await devStore.findUserByEmail(req.user.email) : null);
        if (devUser) {
          const devProfile = await devStore.getProfile(devUser.id);
          res.status(200).json({
            success: true,
            user: {
              id: devUser.id,
              name: devUser.name,
              email: devUser.email,
              role: devUser.role,
            },
            profile: devProfile || null,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        res.status(404).json({
          success: false,
          error: 'User not found.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const profile = await Profile.findOne({ user: user._id });

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        profile,
        timestamp: new Date().toISOString(),
      });
    } else {
      const user = (await devStore.findUserById(req.user.userId)) || (req.user.email ? await devStore.findUserByEmail(req.user.email) : null);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const profile = await devStore.getProfile(user.id);

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        profile,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

