import { useState, useEffect } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Home, ShoppingCart, Bus, Cloud, Activity, Pill, PartyPopper, Package, Heart, Settings, ChevronDown, type LucideIcon } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

interface CategorySummary {
    id: number;
    name: string;
    icon: string;
    amount: number;
    percentage: number;
}

interface SummaryData {
    totalExpenses: number;
    period: string;
    categories: CategorySummary[];
}

interface GlobalSummaryProps {
    onBack: () => void;
    isDarkMode: boolean;
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
    Home,
    ShoppingCart,
    Bus,
    Cloud,
    Activity,
    Pill,
    PartyPopper,
    Package,
    Heart,
    Settings,
};

// Color palette for bars
const barColors = [
    'from-orange-500 to-amber-400',
    'from-rose-500 to-pink-400',
    'from-violet-500 to-purple-400',
    'from-blue-500 to-cyan-400',
    'from-emerald-500 to-teal-400',
    'from-red-500 to-orange-400',
    'from-indigo-500 to-blue-400',
    'from-fuchsia-500 to-pink-400',
    'from-lime-500 to-green-400',
    'from-amber-500 to-yellow-400',
];

type PeriodKey = 'week' | 'month' | 'year' | 'custom';

export function GlobalSummary({ onBack, isDarkMode }: GlobalSummaryProps) {
    const { t } = useTranslation();
    const [data, setData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<PeriodKey>('month');
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    const periodOptions: { key: PeriodKey; label: string }[] = [
        { key: 'week', label: t('summary.this_week') },
        { key: 'month', label: t('summary.this_month') },
        { key: 'year', label: t('summary.this_year') },
        { key: 'custom', label: t('summary.custom') },
    ];

    useEffect(() => {
        if (period !== 'custom') {
            fetchSummary();
        }
    }, [period]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            let url = `/summary?period=${period}`;
            if (period === 'custom' && customStartDate && customEndDate) {
                url = `/summary?period=custom&startDate=${customStartDate}&endDate=${customEndDate}`;
            }
            const res = await axios.get(url);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCustomDates = () => {
        if (customStartDate && customEndDate) {
            setShowCustomPicker(false);
            fetchSummary();
        }
    };

    const getIcon = (iconName: string): LucideIcon => {
        return iconMap[iconName] || Settings;
    };

    const currentPeriodLabel = periodOptions.find(p => p.key === period)?.label || t('summary.this_month');

    return (
        <div className={clsx(
            "min-h-screen transition-colors duration-500 font-sans",
            isDarkMode ? "gradient-bg-dark text-zinc-200" : "gradient-bg-light text-zinc-900"
        )}>
            <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">

                {/* Header */}
                <header className={clsx(
                    "px-6 py-5 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl",
                    isDarkMode ? "bg-black/60" : "bg-white/60"
                )}>
                    <span className={clsx(
                        "text-xs font-black tracking-[0.3em] uppercase",
                        isDarkMode ? "text-zinc-100" : "text-zinc-900"
                    )}>
                        Kakei
                    </span>
                    <button
                        onClick={onBack}
                        className={clsx(
                            "p-2 rounded-xl transition-all duration-200 active:scale-95",
                            isDarkMode
                                ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-orange-400"
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-orange-500"
                        )}
                    >
                        <Home size={18} />
                    </button>
                </header>

                <main className="px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Title & Period Selector */}
                    <div className="mb-6">
                        <h1 className={clsx(
                            "text-2xl font-bold mb-4",
                            isDarkMode ? "text-white" : "text-zinc-900"
                        )}>
                            {t('summary.header')}
                        </h1>

                        {/* Period Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                                    isDarkMode
                                        ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                                        : "bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200"
                                )}
                            >
                                {currentPeriodLabel}
                                <ChevronDown size={16} className={clsx(
                                    "transition-transform duration-200",
                                    showPeriodMenu && "rotate-180"
                                )} />
                            </button>

                            {showPeriodMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowPeriodMenu(false)}
                                    />
                                    <div className={clsx(
                                        "absolute top-full left-0 mt-2 rounded-xl border shadow-xl z-50 overflow-hidden min-w-[180px]",
                                        isDarkMode
                                            ? "bg-zinc-900 border-zinc-800"
                                            : "bg-white border-zinc-200"
                                    )}>
                                        {periodOptions.map((option) => (
                                            <button
                                                key={option.key}
                                                onClick={() => {
                                                    setPeriod(option.key);
                                                    if (option.key === 'custom') {
                                                        setShowCustomPicker(true);
                                                    }
                                                    setShowPeriodMenu(false);
                                                }}
                                                className={clsx(
                                                    "w-full px-4 py-3 text-left text-sm transition-colors",
                                                    period === option.key
                                                        ? isDarkMode
                                                            ? "bg-orange-500/20 text-orange-400"
                                                            : "bg-orange-50 text-orange-600"
                                                        : isDarkMode
                                                            ? "hover:bg-zinc-800 text-zinc-300"
                                                            : "hover:bg-zinc-50 text-zinc-700"
                                                )}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Custom Date Picker */}
                        {period === 'custom' && showCustomPicker && (
                            <div className={clsx(
                                "mt-4 p-4 rounded-xl border",
                                isDarkMode
                                    ? "bg-zinc-900 border-zinc-800"
                                    : "bg-white border-zinc-200"
                            )}>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className={clsx(
                                            "text-xs font-medium block mb-1",
                                            isDarkMode ? "text-zinc-400" : "text-zinc-600"
                                        )}>
                                            {t('summary.from')}
                                        </label>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className={clsx(
                                                "w-full px-3 py-2 rounded-lg text-sm",
                                                isDarkMode
                                                    ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                                                    : "bg-zinc-50 border-zinc-200 text-zinc-800"
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <label className={clsx(
                                            "text-xs font-medium block mb-1",
                                            isDarkMode ? "text-zinc-400" : "text-zinc-600"
                                        )}>
                                            {t('summary.to')}
                                        </label>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className={clsx(
                                                "w-full px-3 py-2 rounded-lg text-sm",
                                                isDarkMode
                                                    ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                                                    : "bg-zinc-50 border-zinc-200 text-zinc-800"
                                            )}
                                        />
                                    </div>
                                    <button
                                        onClick={handleApplyCustomDates}
                                        disabled={!customStartDate || !customEndDate}
                                        className={clsx(
                                            "w-full py-2 rounded-lg text-sm font-medium transition-all",
                                            customStartDate && customEndDate
                                                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                                                : isDarkMode
                                                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                                    : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                        )}
                                    >
                                        {t('summary.apply')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Total Expenses Card */}
                    <div className={clsx(
                        "rounded-2xl p-6 mb-6",
                        isDarkMode
                            ? "glass-card"
                            : "glass-card-light"
                    )}>
                        <span className={clsx(
                            "text-[10px] uppercase tracking-[0.2em] font-bold block mb-2",
                            isDarkMode ? "text-zinc-500" : "text-zinc-400"
                        )}>
                            {t('summary.total_expenses')}
                        </span>
                        <span className={clsx(
                            "text-3xl font-bold tabular-nums",
                            isDarkMode ? "text-rose-400 glow-red" : "text-rose-600"
                        )}>
                            {loading ? '...' : formatCurrency(data?.totalExpenses || 0)}
                        </span>
                    </div>

                    {/* Category Bars */}
                    <div className={clsx(
                        "rounded-2xl overflow-hidden",
                        isDarkMode
                            ? "glass-card"
                            : "glass-card-light"
                    )}>
                        {loading ? (
                            <div className="p-6 text-center">
                                <div className="animate-pulse flex flex-col gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={clsx(
                                            "h-12 rounded-lg",
                                            isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                                        )} />
                                    ))}
                                </div>
                            </div>
                        ) : data?.categories && data.categories.length > 0 ? (
                            <div className="divide-y divide-zinc-800/50">
                                {data.categories.map((category, index) => {
                                    const IconComponent = getIcon(category.icon);
                                    const barColor = barColors[index % barColors.length];

                                    return (
                                        <div key={category.id} className="p-4">
                                            {/* Category Header */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={clsx(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                                        isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                                                    )}>
                                                        <IconComponent size={16} className={isDarkMode ? "text-zinc-400" : "text-zinc-600"} />
                                                    </div>
                                                    <span className={clsx(
                                                        "text-sm font-medium",
                                                        isDarkMode ? "text-zinc-200" : "text-zinc-800"
                                                    )}>
                                                        {t(`categories.${category.name}`, category.name)}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={clsx(
                                                        "text-sm font-bold tabular-nums",
                                                        isDarkMode ? "text-zinc-200" : "text-zinc-800"
                                                    )}>
                                                        {formatCurrency(category.amount)}
                                                    </span>
                                                    <span className={clsx(
                                                        "text-xs ml-2",
                                                        isDarkMode ? "text-zinc-500" : "text-zinc-400"
                                                    )}>
                                                        {category.percentage}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className={clsx(
                                                "h-3 rounded-full overflow-hidden",
                                                isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                                            )}>
                                                <div
                                                    className={clsx(
                                                        "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                                                        barColor
                                                    )}
                                                    style={{ width: `${category.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <span className={clsx(
                                    "text-sm",
                                    isDarkMode ? "text-zinc-500" : "text-zinc-400"
                                )}>
                                    {t('summary.no_expenses')}
                                </span>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

