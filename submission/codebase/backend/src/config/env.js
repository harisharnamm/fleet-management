import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Attempt loading .env.local and .env from root and backend directory
const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env.local'),
  path.resolve(process.cwd(), 'backend/.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

export const config = {
  port: parseInt(process.env.PORT || '4001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED || '',
  neonBranch: process.env.NEON_BRANCH || 'production',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-fleet-management-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  gatewayUrl: process.env.GATEWAY_URL || 'http://localhost:4000',
  smsProvider: process.env.SMS_PROVIDER || 'mock'
};
