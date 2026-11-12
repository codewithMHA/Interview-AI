import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from all possible local and root directory paths
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../../../.env'),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key_change_in_production_928374',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  JUDGE0_API_URL: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
  JUDGE0_API_KEY: process.env.JUDGE0_API_KEY || '',
};

if (env.NODE_ENV === 'production' && env.JWT_SECRET.startsWith('dev_secret_key')) {
  console.warn(
    '[SECURITY WARNING] Using default JWT_SECRET in production! Set a strong random JWT_SECRET environment variable.'
  );
}
