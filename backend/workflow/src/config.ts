import { config } from 'dotenv';

// Load environment variables
config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:supersecret@localhost:5432/workflow',
  PORT: parseInt(process.env.PORT || '8080', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-it-in-prod',
} as const;

export function validateEnv(): void {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  Warning: DATABASE_URL not set in environment variables. Using default.');
  }
}
