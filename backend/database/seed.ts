import { categories, users } from './schema';
import { db } from '../src/db';
import { count as countFn } from 'drizzle-orm';

const DEFAULT_CATEGORIES = [
    // Income
    { name: 'Salary', icon: 'Wallet', type: 'income' },
    { name: 'Money Received', icon: 'HandCoins', type: 'income' },
    { name: 'Sales', icon: 'Store', type: 'income' },
    { name: 'Investment Returns', icon: 'TrendingUp', type: 'income' },
    { name: 'Refunds', icon: 'Repeat', type: 'income' },

    // Investment
    { name: 'Index Funds', icon: 'TrendingUp', type: 'investment' },
    { name: 'ETFs', icon: 'BarChart3', type: 'investment' },
    { name: 'Savings', icon: 'Landmark', type: 'investment' },

    // Expense
    { name: 'Housing', icon: 'Home', type: 'expense' },
    { name: 'Groceries', icon: 'ShoppingCart', type: 'expense' },
    { name: 'Transport', icon: 'Train', type: 'expense' },
    { name: 'Subscriptions', icon: 'Cloud', type: 'expense' },
    { name: 'Services', icon: 'Activity', type: 'expense' },
    { name: 'Health', icon: 'Pill', type: 'expense' },
    { name: 'Leisure', icon: 'PartyPopper', type: 'expense' },
    { name: 'Shopping', icon: 'Package', type: 'expense' },
    { name: 'Gifts Given', icon: 'Heart', type: 'expense' },
    { name: 'Other', icon: 'Settings', type: 'expense' },
] as const;

export async function runSeed() {
    console.log('🌱 Seeding database...');

    try {
        // Fixed: count() always returns 1 row — check the count VALUE, not array length
        const [result] = await db.select({ total: countFn() }).from(categories);
        if (result && result.total > 0) {
            console.log('Database already seeded, skipping.');
            return;
        }
    } catch (e) {
        console.log('Could not check seed status, proceeding with seed...');
    }

    // Seed default user
    await db.insert(users).values({
        username: 'admin',
        passwordHash: await Bun.password.hash('admin') // Will be overwritten by onStart with real env password
    }).onConflictDoNothing();

    // Batch insert all categories
    await db.insert(categories).values([...DEFAULT_CATEGORIES]).onConflictDoNothing();

    console.log('✅ Seeding completed');
}
