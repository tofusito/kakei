import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { config } from '../config';

export const authMiddleware = new Elysia({ name: 'auth-middleware' })
    .use(jwt({
        name: 'jwt',
        secret: config.jwt.secret,
        exp: config.jwt.expiry
    }))
    .derive(async ({ jwt, cookie: { auth } }) => {
        if (!auth.value) {
            return { user: null };
        }

        try {
            const payload = await jwt.verify(auth.value);
            if (!payload) {
                auth.remove();
                return { user: null };
            }
            return { user: payload };
        } catch (e) {
            auth.remove();
            return { user: null };
        }
    })
    .onBeforeHandle(({ user, path, set }) => {
        // Public routes that don't require authentication
        const publicRoutes = ['/api/login', '/api/auth/check', '/api/health'];
        const publicPrefixes = ['/', '/login', '/manifest.json', '/favicon', '/icon-', '/apple-touch-icon', '/assets'];

        if (publicRoutes.includes(path)) {
            return;
        }

        if (publicPrefixes.some(p => path.startsWith(p) && !path.startsWith('/api'))) {
            return;
        }

        // Protect API routes
        if (path.startsWith('/api') && !user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }
    });
