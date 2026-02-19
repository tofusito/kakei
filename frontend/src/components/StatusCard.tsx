import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../lib/formatters';
import type { DashboardData, ClassificationBreakdown } from '../types';

interface StatusCardProps {
    dashboard: DashboardData;
    breakdown: ClassificationBreakdown;
    onBreakdownClick: () => void;
    onChartClick: () => void;
    isDarkMode: boolean;
}

import { ExpenseRing } from './ExpenseRing';

export function StatusCard({ dashboard, breakdown, onBreakdownClick, onChartClick, isDarkMode }: StatusCardProps) {
    const { t } = useTranslation();

    return (
        <section className="mb-8">
            <div className={clsx(
                "rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
                isDarkMode
                    ? "glass-card shadow-lg shadow-black/20"
                    : "glass-card-light shadow-lg shadow-zinc-200/50"
            )}>
                {/* Subtle gradient accent at the top */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className={clsx(
                            "text-[10px] uppercase tracking-[0.2em] font-bold",
                            isDarkMode ? "text-zinc-500" : "text-zinc-400"
                        )}>
                            {t('status.header')}
                        </span>
                        {/* Expense Ring - click to show breakdown */}
                        <ExpenseRing
                            survival={breakdown.survival}
                            quality={breakdown.quality}
                            pleasure={breakdown.pleasure}
                            waste={breakdown.waste}
                            onClick={onBreakdownClick}
                            isDarkMode={isDarkMode}
                        />
                    </div>

                    <div className="mb-8">
                        <div className={clsx(
                            "text-4xl font-bold tracking-tighter tabular-nums animate-count-up",
                            {
                                "text-emerald-400 glow-green": dashboard.balance > 0,
                                "text-rose-500 glow-red": dashboard.balance < 0,
                                [isDarkMode ? "text-zinc-400" : "text-zinc-900"]: dashboard.balance === 0
                            }
                        )}>
                            {formatCurrency(dashboard.balance)}
                        </div>
                    </div>

                    <div
                        className="h-20 w-full mb-6 cursor-pointer transition-opacity hover:opacity-80 active:scale-[0.98]"
                        onClick={onChartClick}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboard.chartData}>
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDarkMode ? "#f97316" : "#ea580c"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isDarkMode ? "#f97316" : "#ea580c"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke={isDarkMode ? "#f97316" : "#ea580c"}
                                    strokeWidth={2}
                                    fill="url(#chartGradient)"
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={clsx(
                        "grid grid-cols-3 gap-3 pt-5",
                        isDarkMode ? "border-t border-white/5" : "border-t border-black/5"
                    )}>
                        {/* Income */}
                        <div className={clsx(
                            "rounded-xl p-3 text-center transition-colors",
                            isDarkMode ? "bg-emerald-500/5" : "bg-emerald-50"
                        )}>
                            <span className={clsx(
                                "text-[9px] uppercase tracking-wider block mb-1 font-semibold",
                                isDarkMode ? "text-emerald-400/60" : "text-emerald-600/60"
                            )}>
                                {t('status.income')}
                            </span>
                            <span className={clsx(
                                "text-sm font-bold tabular-nums block",
                                isDarkMode ? "text-emerald-400" : "text-emerald-600"
                            )}>
                                +{formatCurrency(dashboard.income)}
                            </span>
                        </div>

                        {/* Expenses */}
                        <div className={clsx(
                            "rounded-xl p-3 text-center transition-colors",
                            isDarkMode ? "bg-rose-500/5" : "bg-rose-50"
                        )}>
                            <span className={clsx(
                                "text-[9px] uppercase tracking-wider block mb-1 font-semibold",
                                isDarkMode ? "text-rose-400/60" : "text-rose-600/60"
                            )}>
                                {t('status.expenses')}
                            </span>
                            <span className={clsx(
                                "text-sm font-bold tabular-nums block",
                                isDarkMode ? "text-rose-400" : "text-rose-600"
                            )}>
                                {formatCurrency(dashboard.expenses)}
                            </span>
                        </div>

                        {/* Investment */}
                        <div className={clsx(
                            "rounded-xl p-3 text-center transition-colors",
                            isDarkMode ? "bg-blue-500/5" : "bg-blue-50"
                        )}>
                            <span className={clsx(
                                "text-[9px] uppercase tracking-wider block mb-1 font-semibold",
                                isDarkMode ? "text-blue-400/60" : "text-blue-600/60"
                            )}>
                                {t('status.investment')}
                            </span>
                            <span className={clsx(
                                "text-sm font-bold tabular-nums block",
                                isDarkMode ? "text-blue-400" : "text-blue-600"
                            )}>
                                {formatCurrency(dashboard.investments)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
