import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

export async function runMigrations() {
    console.log('⏳ Running migrations...');

    // Dedicated migration client with max 1 connection (required by drizzle migrator)
    const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
    const migrationDb = drizzle(migrationClient);

    try {
        await migrate(migrationDb, { migrationsFolder: './database/drizzle' });
        console.log('✅ Migrations completed');
    } finally {
        // Always close the migration-only client
        await migrationClient.end();
    }
}
