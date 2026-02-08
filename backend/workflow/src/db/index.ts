import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index.js';
import { Pool } from "pg";
import { env } from '../config.js';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});
export const db = drizzle(pool, { schema });

export type Database = typeof db;
