import { Elysia, t } from 'elysia';
import { db } from '../db';
import { users, userSettings } from '../../database/schema';
import { eq } from 'drizzle-orm';

export const settingsRoutes = new Elysia({ prefix: '/api' })
    .get('/settings', async () => {
        // Get first user (single-user app)
        const [user] = await db.select().from(users).limit(1);
        if (!user) return { theme: 'dark', language: 'en' };

        const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, user.id));

        if (!settings) {
            const [newSettings] = await db.insert(userSettings).values({
                userId: user.id,
                theme: 'dark',
                language: 'en'
            }).returning();
            return newSettings;
        }

        return settings;
    })
    .post('/settings', async ({ body }) => {
        const { theme, language } = body;

        const [user] = await db.select().from(users).limit(1);
        if (!user) throw new Error('No user found');

        const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, user.id));

        if (!settings) {
            await db.insert(userSettings).values({
                userId: user.id,
                theme,
                language
            });
        } else {
            await db.update(userSettings)
                .set({
                    theme,
                    language,
                    updatedAt: new Date()
                })
                .where(eq(userSettings.userId, user.id));
        }

        return { success: true, theme, language };
    }, {
        body: t.Object({
            theme: t.Union([t.Literal('light'), t.Literal('dark')]),
            language: t.Union([t.Literal('en'), t.Literal('es')])
        })
    });
