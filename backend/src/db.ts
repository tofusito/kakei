import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, categories, transactions, userSettings } from '../database/schema';
import { config } from './config';

// Single shared Postgres client with connection pool
export const client = postgres(config.db.url, {
    max: config.db.pool.max,
    idle_timeout: config.db.pool.idle_timeout,
});

export const db = drizzle(client, { schema: { users, categories, transactions, userSettings } });
