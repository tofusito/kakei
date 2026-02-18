import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { cookie } from '@elysiajs/cookie';
import { staticPlugin } from '@elysiajs/static';
import { runMigrations } from '../database/migrate';
import { runSeed } from '../database/seed';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { config } from './config';
import { dashboardRoutes } from './routes/dashboard';
import { transactionRoutes } from './routes/transactions';
import { settingsRoutes } from './routes/settings';
import { authRoutes } from './routes/auth';
import { summaryRoutes } from './routes/summary';
import { authMiddleware } from './middleware/auth';

const app = new Elysia()
    .use(cors({
        credentials: true,
        origin: true
    }))
    .use(cookie())
    // Global security headers
    .onBeforeHandle(({ set }) => {
        set.headers['X-Content-Type-Options'] = 'nosniff';
        set.headers['X-Frame-Options'] = 'DENY';
        set.headers['X-XSS-Protection'] = '1; mode=block';
        set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    })
    // Global error handler — no stack traces in production
    .onError(({ code, error, set }) => {
        if (code === 'NOT_FOUND') {
            set.status = 404;
            return { error: 'Not Found' };
        }

        if (!config.isProduction) {
            console.error('Unhandled error:', error);
        }

        set.status = 500;
        return { error: config.isProduction ? 'Internal Server Error' : String(error) };
    })
    .use(authMiddleware)
    .onStart(async () => {
        try {
            console.log('🔄 Running Startup Database Init...');
            await runMigrations();
            await runSeed();
            console.log('✅ Startup Database Init Completed');
        } catch (e) {
            console.error('❌ Startup DB Init failed:', e);
        }

        // Ensure admin user exists — only re-hash if password changed
        const adminUser = config.auth.user;
        const adminPass = config.auth.password;

        const existing = await db.select().from(users).where(eq(users.username, adminUser));

        if (existing.length === 0) {
            const hashedPassword = await Bun.password.hash(adminPass);
            await db.insert(users).values({ username: adminUser, passwordHash: hashedPassword });
        } else {
            // Only update if password has changed
            const passwordChanged = !(await Bun.password.verify(adminPass, existing[0].passwordHash));
            if (passwordChanged) {
                const hashedPassword = await Bun.password.hash(adminPass);
                await db.update(users).set({ passwordHash: hashedPassword }).where(eq(users.username, adminUser));
            }
        }
    })
    // Health check endpoint (public, before auth)
    .get('/api/health', () => ({ status: 'ok', uptime: process.uptime() }))
    // 1. Auth Routes
    .use(authRoutes)
    // 2. API Routes (protected by middleware)
    .use(dashboardRoutes)
    .use(transactionRoutes)
    .use(settingsRoutes)
    .use(summaryRoutes)
    // 3. Static Files via plugin
    .use(staticPlugin({
        assets: 'public',
        prefix: '/',
        alwaysStatic: false,
    }))
    // 4. SPA fallback — serve index.html for all non-API routes
    .get('*', async ({ path, set }) => {
        if (path.startsWith('/api')) {
            set.status = 404;
            return { error: 'Not Found' };
        }
        set.headers['Content-Type'] = 'text/html; charset=utf-8';
        return Bun.file('public/index.html');
    })
    .listen(config.port);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
