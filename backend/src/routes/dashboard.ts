import { Elysia, t } from 'elysia';
import { db } from '../db';
import { transactions, categories } from '../../database/schema';
import { eq, sum, and, gte, sql } from 'drizzle-orm';
import { buildDateCondition, type DateFilterQuery } from '../utils/dateFilters';

export const dashboardRoutes = new Elysia({ prefix: '/api' })
    .get('/dashboard', async () => {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Single query for all totals using CASE WHEN + parallel with daily chart data
        const [totalsResult, dailyData] = await Promise.all([
            db.select({
                expenses: sql<number>`COALESCE(SUM(CASE WHEN ${categories.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`.mapWith(Number),
                income: sql<number>`COALESCE(SUM(CASE WHEN ${categories.type} = 'income' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`.mapWith(Number),
                investments: sql<number>`COALESCE(SUM(CASE WHEN ${categories.type} = 'investment' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`.mapWith(Number),
            })
                .from(transactions)
                .leftJoin(categories, eq(transactions.categoryId, categories.id))
                .where(gte(transactions.createdAt, startOfMonth)),

            db.select({
                date: sql<string>`to_char(${transactions.createdAt}, 'DD')`,
                amount: sum(transactions.amount).mapWith(Number)
            })
                .from(transactions)
                .leftJoin(categories, eq(transactions.categoryId, categories.id))
                .where(
                    and(
                        gte(transactions.createdAt, startOfMonth),
                        eq(categories.type, 'expense')
                    )
                )
                .groupBy(sql`to_char(${transactions.createdAt}, 'DD')`)
                .orderBy(sql`to_char(${transactions.createdAt}, 'DD')`)
        ]);

        const { expenses, income, investments } = totalsResult[0] || { expenses: 0, income: 0, investments: 0 };

        const chartData = dailyData.map(d => ({
            name: d.date,
            amount: d.amount
        }));

        return {
            balance: income - expenses - investments,
            expenses,
            income,
            investments,
            chartData
        };
    })
    .get('/classification-breakdown', async ({ query }) => {
        const dateCondition = buildDateCondition(query as DateFilterQuery);

        const expenseCondition = eq(categories.type, 'expense');
        const whereClause = dateCondition
            ? and(dateCondition, expenseCondition)
            : expenseCondition;

        const breakdown = await db.select({
            classification: transactions.classification,
            total: sum(transactions.amount).mapWith(Number)
        })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(whereClause)
            .groupBy(transactions.classification);

        const result = {
            survival: 0,
            quality: 0,
            pleasure: 0,
            waste: 0
        };

        breakdown.forEach(item => {
            if (item.classification && item.total) {
                result[item.classification as keyof typeof result] = item.total;
            }
        });

        return result;
    });
