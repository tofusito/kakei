import { Elysia, t } from 'elysia';
import { config } from '../config';

// In-memory rate limiting with automatic cleanup
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, attempt] of loginAttempts) {
        if (now > attempt.resetTime) {
            loginAttempts.delete(ip);
        }
    }
}, 5 * 60 * 1000);

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const attempt = loginAttempts.get(ip);

    if (!attempt || now > attempt.resetTime) {
        loginAttempts.set(ip, { count: 1, resetTime: now + 60000 });
        return true;
    }

    if (attempt.count >= 5) {
        return false;
    }

    attempt.count++;
    return true;
}

// Pre-hash the admin password at startup for timing-safe comparison
let hashedAdminPassword: string | null = null;

async function getHashedPassword(): Promise<string> {
    if (!hashedAdminPassword) {
        hashedAdminPassword = await Bun.password.hash(config.auth.password);
    }
    return hashedAdminPassword;
}

// Initialize hash eagerly
getHashedPassword();

export const authRoutes = new Elysia()
    .post('/api/login', async ({ body, jwt, cookie: { auth }, set, request }) => {
        const { username, password } = body;

        // Rate limiting by IP
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

        if (!checkRateLimit(clientIP)) {
            set.status = 429;
            return { error: 'Too many login attempts. Please try again later.' };
        }

        // Verify credentials using timing-safe comparison
        const isValidUser = username === config.auth.user;
        const hashedPw = await getHashedPassword();
        const isValidPassword = await Bun.password.verify(password, hashedPw);

        if (!isValidUser || !isValidPassword) {
            set.status = 401;
            return { error: 'Invalid credentials' };
        }

        // Create JWT
        const token = await jwt.sign({
            username: username,
            iat: Math.floor(Date.now() / 1000)
        });

        // Set HTTPOnly cookie (persists 7 days)
        auth.set({
            value: token,
            httpOnly: true,
            secure: config.isProduction,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60
        });

        return {
            success: true,
            message: 'Login successful'
        };
    }, {
        body: t.Object({
            username: t.String({ minLength: 1 }),
            password: t.String({ minLength: 1 })
        })
    })
    .post('/api/logout', ({ cookie: { auth } }) => {
        auth.remove();
        return { success: true };
    })
    .get('/api/auth/check', async ({ cookie: { auth }, jwt }) => {
        if (!auth.value) {
            return { authenticated: false };
        }

        try {
            const payload = await jwt.verify(auth.value);
            if (!payload) {
                return { authenticated: false };
            }
            return { authenticated: true, user: payload };
        } catch (e) {
            return { authenticated: false };
        }
    });
