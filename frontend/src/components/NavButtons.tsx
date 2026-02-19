import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import type { TransactionType } from '../types';

interface NavButtonsProps {
    onOpenQuickAdd: (type: TransactionType) => void;
    isDarkMode: boolean;
}

export function NavButtons({ onOpenQuickAdd, isDarkMode }: NavButtonsProps) {
    const { t } = useTranslation();
    return (
        <section className="grid grid-cols-3 gap-3 mb-12">
            <button
                onClick={() => onOpenQuickAdd('expense')}
                className={clsx(
                    "flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-95 group",
                    isDarkMode
                        ? "bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 text-zinc-200 hover:from-rose-500/20 hover:to-rose-600/10 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5"
                        : "bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200 text-rose-700 hover:from-rose-100 hover:to-rose-200/50 hover:shadow-lg hover:shadow-rose-200/50"
                )}
            >
                <div className={clsx(
                    "mb-2 p-2.5 rounded-xl transition-transform group-hover:scale-110",
                    isDarkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-200/80 text-rose-600"
                )}>
                    <ArrowDown size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('nav.expense')}</span>
            </button>

            <button
                onClick={() => onOpenQuickAdd('income')}
                className={clsx(
                    "flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-95 group",
                    isDarkMode
                        ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 text-zinc-200 hover:from-emerald-500/20 hover:to-emerald-600/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
                        : "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200/50 hover:shadow-lg hover:shadow-emerald-200/50"
                )}
            >
                <div className={clsx(
                    "mb-2 p-2.5 rounded-xl transition-transform group-hover:scale-110",
                    isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-200/80 text-emerald-600"
                )}>
                    <ArrowUp size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('nav.income')}</span>
            </button>

            <button
                onClick={() => onOpenQuickAdd('investment')}
                className={clsx(
                    "flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-95 group",
                    isDarkMode
                        ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 text-zinc-200 hover:from-blue-500/20 hover:to-blue-600/10 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5"
                        : "bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200/50 hover:shadow-lg hover:shadow-blue-200/50"
                )}
            >
                <div className={clsx(
                    "mb-2 p-2.5 rounded-xl transition-transform group-hover:scale-110",
                    isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-200/80 text-blue-600"
                )}>
                    <TrendingUp size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('nav.invest')}</span>
            </button>
        </section>
    );
}
