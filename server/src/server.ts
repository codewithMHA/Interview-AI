import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 InterviewAI Backend API Server running`);
      console.log(`📡 URL: http://localhost:${env.PORT}`);
      console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`💻 Environment: ${env.NODE_ENV}`);
      console.log('====================================================');
    });

    // Attempt DB connection in non-blocking manner
    connectDB().catch((err) => {
      console.warn('[MongoDB] Initial connection attempt error:', err.message);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      console.log(`\nReceived ${signal}. Gracefully closing server...`);
      server.close(() => {
        console.log('Server terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Fatal server startup error:', error);
    process.exit(1);
  }
};

startServer();

