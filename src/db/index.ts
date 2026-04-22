import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Session pooler for serverless (IPv4 compatible)
const client = postgres(connectionString, {
  ssl: 'require',
  max: 1, // serverless = 1 connection per invocation
});

export const db = drizzle(client, { schema });
