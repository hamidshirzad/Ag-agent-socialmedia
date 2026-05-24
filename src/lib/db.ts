import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

// sql is null when DATABASE_URL is not configured (local dev, CI without Postgres)
export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
