import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import questionRoutes from './questionRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import placementModuleRoutes from './placementModuleRoutes.js';
import problemRoutes from './problemRoutes.js';
import aiRoutes from './aiRoutes.js';
import mockInterviewRoutes from './mockInterviewRoutes.js';
import roadmapRoutes from './roadmapRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import { authRateLimiter, aiRateLimiter } from '../middleware/rateLimiter.js';

const apiRouter = Router();

// Health & System status
apiRouter.use('/', healthRoutes);

// Authentication & Users (Phase 2 & Rate Limited)
apiRouter.use('/auth', authRateLimiter, authRoutes);
apiRouter.use('/users', userRoutes);

// Questions & Dashboard (Phase 3)
apiRouter.use('/questions', questionRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

// Placement Modules Hub
apiRouter.use('/placement-modules', placementModuleRoutes);

// Coding Practice & Sandbox (Phase 4)
apiRouter.use('/problems', problemRoutes);
apiRouter.use('/coding', problemRoutes);

// AI Intelligence & Code Analysis (Phase 5 & Rate Limited)
apiRouter.use('/ai', aiRateLimiter, aiRoutes);

// AI Mock Interviews (Phase 6)
apiRouter.use('/mock-interviews', mockInterviewRoutes);
apiRouter.use('/interviews', mockInterviewRoutes);

// Personalized Placement Roadmaps (Phase 7)
apiRouter.use('/roadmaps', roadmapRoutes);

// Analytics & Gamification Engine (Phase 8)
apiRouter.use('/analytics', analyticsRoutes);

// AI Resume & ATS Placement Scanner
apiRouter.use('/resume', resumeRoutes);

// Gateway index
apiRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'InterviewAI API Gateway v1.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      users: {
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        careerSetup: 'POST /api/users/career-setup',
      },
      dashboard: {
        overview: 'GET /api/dashboard/overview',
      },
      questions: {
        list: 'GET /api/questions',
        detail: 'GET /api/questions/:id',
        bookmark: 'POST /api/questions/:id/bookmark',
        complete: 'POST /api/questions/:id/complete',
      },
      placementModules: {
        list: 'GET /api/placement-modules',
        detail: 'GET /api/placement-modules/:id',
      },
      coding: '/api/coding (Phase 4)',
      ai: '/api/ai (Phase 5)',
      interviews: '/api/interviews (Phase 6)',
      roadmaps: '/api/roadmaps (Phase 7)',
      analytics: '/api/analytics (Phase 8)',
    },
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
