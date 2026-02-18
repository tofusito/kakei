import { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, ChevronLeft, ChevronRight, X, Wallet } from 'lucide-react';
import { DynamicIcon } from './shared/DynamicIcon';
import { formatCurrency, formatDate } from '../lib/formatters';
import type { Transaction } from '../types';

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface TransactionListProps {
    transactions: Transaction[];
    pagination: Pagination;
    onPageChange: (page: number) => void;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: number) => void;
    isDarkMode: boolean;
}

// Color mapping for transaction types - gives each type its own visual identity
function getIconColors(type: string, isDarkMode: boolean) {
    switch (type) {
        case 'expense':
            return isDarkMode ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-100 text-rose-600';
        case 'income':
            return isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-600';
        case 'investment':
            return isDarkMode ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-600';
        default:
            return isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500';
    }
}

export function TransactionList({
    transactions,
    pagination,
    onPageChange,
    onEdit,
    onDelete,
    isDarkMode
}: TransactionListProps) {
    const { t } = useTranslation();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const handleTransactionClick = (id: number) => {
        setSelectedId(selectedId === id ? null : id);
        setConfirmDelete(null);
    };

    const handleDeleteClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDelete(id);
    };

    const handleConfirmDelete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(id);
        setSelectedId(null);
        setConfirmDelete(null);
    };

    const handleEditClick = (tr: Transaction, e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(tr);
        setSelectedId(null);
    };

    if (transactions.length === 0) {
        return (
            <div className={clsx(
                "text-center py-16 rounded-2xl border border-dashed",
                isDarkMode
                    ? "border-zinc-800 text-zinc-600"
                    : "border-zinc-200 text-zinc-400"
            )}>
                <Wallet size={32} className={clsx("mx-auto mb-3", isDarkMode ? "text-zinc-700" : "text-zinc-300")} />
                <p className="text-sm font-medium mb-1">{t('common.no_transactions')}</p>
                <p className={clsx("text-xs", isDarkMode ? "text-zinc-700" : "text-zinc-400")}>
                    Tap the buttons above to add one
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-6">
            {transactions.map((tr, index) => (
                <div
                    key={tr.id}
                    onClick={() => handleTransactionClick(tr.id)}
                    className={clsx(
                        "relative group flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer",
                        isDarkMode
                            ? "glass-card hover:bg-zinc-800/60 hover:border-zinc-700/50"
                            : "glass-card-light hover:border-zinc-300 hover:shadow-md"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    {/* Actions Overlay */}
                    {selectedId === tr.id && (
                        <div className={clsx(
                            "absolute inset-0 rounded-2xl flex items-center justify-center gap-4 z-10 animate-in fade-in duration-150",
                            isDarkMode
                                ? "bg-zinc-900/95 backdrop-blur-sm"
                                : "bg-white/95 backdrop-blur-sm"
                        )}>
                            {confirmDelete === tr.id ? (
                                <>
                                    <button
                                        onClick={(e) => handleConfirmDelete(tr.id, e)}
                                        className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-rose-500/30"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                                        className={clsx(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95",
                                            isDarkMode
                                                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                                        )}
                                    >
                                        <X size={20} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => handleEditClick(tr, e)}
                                        className={clsx(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95",
                                            isDarkMode
                                                ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                                                : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                                        )}
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(tr.id, e)}
                                        className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center transition-all hover:scale-110 hover:bg-rose-500/20 active:scale-95"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            getIconColors(tr.type, isDarkMode)
                        )}>
                            <DynamicIcon
                                name={tr.icon}
                                size={18}
                            />
                        </div>
                        <div>
                            <p className={clsx(
                                "font-bold text-sm mb-0.5",
                                isDarkMode ? "text-zinc-200" : "text-zinc-900"
                            )}>
                                {t(`categories.${tr.category}`)}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className={clsx("text-[10px]", isDarkMode ? "text-zinc-500" : "text-zinc-500")}>
                                    {formatDate(tr.createdAt)}
                                </span>
                                {tr.note && (
                                    <>
                                        <span className="text-zinc-600">•</span>
                                        <span className="text-[10px] text-zinc-500 truncate max-w-[100px]">{tr.note}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={clsx(
                            "block font-bold tabular-nums text-sm",
                            tr.type === 'expense'
                                ? (isDarkMode ? "text-zinc-200" : "text-zinc-900")
                                : tr.type === 'income'
                                    ? "text-emerald-400"
                                    : "text-blue-400"
                        )}>
                            {tr.type === 'expense' ? '-' : '+'}{formatCurrency(parseFloat(tr.amount))}
                        </span>
                        {tr.classification && (
                            <span className={clsx(
                                "text-[9px] font-medium uppercase tracking-wider",
                                tr.classification === 'survival' ? "text-emerald-500" :
                                    tr.classification === 'quality' ? "text-blue-500" :
                                        tr.classification === 'pleasure' ? "text-amber-500" : "text-rose-500"
                            )}>
                                {t(`breakdown.${tr.classification}`)}
                            </span>
                        )}
                    </div>
                </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => onPageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={clsx(
                            "p-2 rounded-lg transition-all",
                            pagination.page === 1
                                ? "opacity-30 cursor-not-allowed"
                                : isDarkMode
                                    ? "hover:bg-zinc-800 text-zinc-400"
                                    : "hover:bg-zinc-100 text-zinc-600"
                        )}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(page => {
                                if (page === 1 || page === pagination.totalPages) return true;
                                if (Math.abs(page - pagination.page) <= 1) return true;
                                return false;
                            })
                            .map((page, idx, arr) => {
                                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                                return (
                                    <div key={page} className="flex items-center">
                                        {showEllipsis && (
                                            <span className={clsx(
                                                "px-2 text-xs",
                                                isDarkMode ? "text-zinc-600" : "text-zinc-400"
                                            )}>...</span>
                                        )}
                                        <button
                                            onClick={() => onPageChange(page)}
                                            className={clsx(
                                                "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                                page === pagination.page
                                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                                                    : isDarkMode
                                                        ? "hover:bg-zinc-800 text-zinc-400"
                                                        : "hover:bg-zinc-100 text-zinc-600"
                                            )}
                                        >
                                            {page}
                                        </button>
                                    </div>
                                );
                            })}
                    </div>

                    <button
                        onClick={() => onPageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className={clsx(
                            "p-2 rounded-lg transition-all",
                            pagination.page === pagination.totalPages
                                ? "opacity-30 cursor-not-allowed"
                                : isDarkMode
                                    ? "hover:bg-zinc-800 text-zinc-400"
                                    : "hover:bg-zinc-100 text-zinc-600"
                        )}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Page info */}
            <div className={clsx(
                "text-center text-[10px] font-medium",
                isDarkMode ? "text-zinc-600" : "text-zinc-400"
            )}>
                {t('common.showing')} {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} {t('common.of')} {pagination.total}
            </div>
        </div>
    );
}
