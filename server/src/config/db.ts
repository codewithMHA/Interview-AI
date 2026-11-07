import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';
import { autoSeedDatabase } from '../utils/autoSeed.js';

// Resolve MongoDB Atlas SRV records reliably across all ISP/Wi-Fi DNS configurations
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Use default OS DNS if setServers is restricted
}

let isConnected = false;
let isConnecting = false;
let retryTimer: NodeJS.Timeout | null = null;
let retryCount = 0;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    return false;
  }

  isConnecting = true;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    isConnected = !!conn.connections[0].readyState;
    isConnecting = false;
    retryCount = 0;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} / database: ${conn.connection.name}`);

    // Automatically inspect and populate empty collections (questions, problems, roadmaps)
    autoSeedDatabase().catch((err) => {
      console.warn('[MongoDB] AutoSeed background task notice:', err.message);
    });

    return true;
  } catch (error: any) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    isConnected = false;
    isConnecting = false;

    // Resilient background auto-retry for transient network drops or hot-reload restarts
    if (retryCount < 8 && !retryTimer) {
      retryCount++;
      retryTimer = setTimeout(() => {
        retryTimer = null;
        console.log(`[MongoDB] Auto-reconnecting to Atlas cluster (Attempt ${retryCount}/8)...`);
        connectDB();
      }, 3500);
    } else if (retryCount >= 8) {
      console.warn('[MongoDB] Running in unattached DB mode. Ensure MongoDB Atlas IP is whitelisted (0.0.0.0/0).');
    }
    return false;
  }
};

export const getDBStatus = () => ({
  isConnected,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});

