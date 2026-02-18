// Centralized configuration — single source of truth for all env vars

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        console.error(`❌ Missing required environment variable: ${key}`);
        process.exit(1);
    }
    return value;
}

function env(key: string, fallback: string): string {
    return process.env[key] || fallback;
}

export const config = {
    db: {
        url: requireEnv('DATABASE_URL'),
        pool: { max: 10, idle_timeout: 20 },
    },
    jwt: {
        secret: env('JWT_SECRET', 'supersecret'),
        expiry: '7d' as const,
    },
    auth: {
        user: env('KAKEI_USER', 'admin'),
        password: env('KAKEI_PASSWORD', 'admin'),
    },
    isProduction: process.env.NODE_ENV === 'production',
    port: Number(env('PORT', '3000')),
} as const;
