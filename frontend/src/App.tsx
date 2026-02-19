import { useState, useEffect } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { QuickAdd } from './components/QuickAdd';
import { StatusCard } from './components/StatusCard';
import { ClassificationBreakdown } from './components/ClassificationBreakdown';
import { NavButtons } from './components/NavButtons';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionList } from './components/TransactionList';
import { ThemeDropdown } from './components/ThemeDropdown';
import { EditTransactionModal } from './components/EditTransactionModal';
import { Login } from './components/Login';
import { GlobalSummary } from './components/GlobalSummary';

import { useTheme } from './hooks/useTheme';
import { useDashboard } from './hooks/useDashboard';
import { useTransactions } from './hooks/useTransactions';

import type { Category, TransactionType, Transaction } from './types';
import { BarChart3 } from 'lucide-react';

// Setup axios defaults
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true; // Importante para enviar cookies

function App() {
    // Estado de autenticación
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = verificando
    // Custom Hooks
    const { theme, setTheme, setLanguage, isDarkMode, showThemeMenu, setShowThemeMenu } = useTheme();
    const { dashboard, classificationBreakdown, fetchDashboardData } = useDashboard();

    // Pass refreshDashboard to useTransactions so adding a transaction updates the dashboard
    const {
        recentTransactions,
        pagination,
        goToPage,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        filters
    } = useTransactions({ refreshDashboard: fetchDashboardData });

    // Local state for UI only (modals, etc)
    const [categories, setCategories] = useState<Category[]>([]);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickAddType, setQuickAddType] = useState<TransactionType>('expense');
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [currentView, setCurrentView] = useState<'dashboard' | 'summary'>('dashboard');

    // Verificar autenticación al cargar
    useEffect(() => {
        axios.get('/auth/check', { withCredentials: true })
            .then(res => {
                setIsAuthenticated(res.data.authenticated);
            })
            .catch(() => {
                setIsAuthenticated(false);
            });
    }, []);

    // Fetch categories on mount (solo si está autenticado)
    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/categories').then(res => setCategories(res.data)).catch(console.error);
        }
    }, [isAuthenticated]);

    const handleOpenQuickAdd = (type: TransactionType) => {
        console.log('Opening QuickAdd for:', type);
        setQuickAddType(type);
        setShowQuickAdd(true);
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    // Mostrar loading mientras se verifica la autenticación
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen gradient-bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-4 mx-auto animate-pulse">
                        <span className="text-2xl font-bold text-white">家</span>
                    </div>
                    <p className="text-zinc-500 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Mostrar login si no está autenticado
    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // Vista de Resumen Global
    if (currentView === 'summary') {
        return (
            <GlobalSummary
                onBack={() => setCurrentView('dashboard')}
                isDarkMode={isDarkMode}
            />
        );
    }

    // Dashboard principal (solo si está autenticado)
    return (
        <div className={clsx(
            "min-h-screen transition-colors duration-500 font-sans selection:bg-orange-500/30",
            isDarkMode ? "gradient-bg-dark text-zinc-200" : "gradient-bg-light text-zinc-900"
        )}>
            <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">

                {/* Header */}
                <header className={clsx(
                    "px-6 py-5 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl",
                    isDarkMode ? "bg-black/60" : "bg-white/60"
                )}>
                    <div className="flex items-center gap-3">
                        <span className={clsx(
                            "text-xs font-black tracking-[0.3em] uppercase",
                            isDarkMode ? "text-zinc-100" : "text-zinc-900"
                        )}>
                            Kakei
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Summary Button */}
                        <button
                            onClick={() => setCurrentView('summary')}
                            className={clsx(
                                "p-2 rounded-xl transition-all duration-200 active:scale-95",
                                isDarkMode
                                    ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-orange-400"
                                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-orange-500"
                            )}
                        >
                            <BarChart3 size={18} />
                        </button>
                        <ThemeDropdown
                            theme={theme}
                            setTheme={setTheme}
                            setLanguage={setLanguage}
                            showThemeMenu={showThemeMenu}
                            setShowThemeMenu={setShowThemeMenu}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </header>

                <main className="px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    <StatusCard
                        dashboard={dashboard}
                        breakdown={classificationBreakdown}
                        onBreakdownClick={() => setShowBreakdown(true)}
                        onChartClick={() => setCurrentView('summary')}
                        isDarkMode={isDarkMode}
                    />

                    <NavButtons onOpenQuickAdd={handleOpenQuickAdd} isDarkMode={isDarkMode} />

                    <section>
                        <TransactionFilters
                            filterType={filters.filterType}
                            filterMonth={filters.filterMonth}
                            filterYear={filters.filterYear}
                            filterWeek={filters.filterWeek}
                            showFilterMenu={filters.showFilterMenu}
                            setShowFilterMenu={filters.setShowFilterMenu}
                            onFilterChange={filters.setFilterType}
                            classificationFilter={filters.classificationFilter}
                            showClassificationMenu={filters.showClassificationMenu}
                            setShowClassificationMenu={filters.setShowClassificationMenu}
                            onClassificationChange={filters.setClassificationFilter}
                            isDarkMode={isDarkMode}
                        />

                        <TransactionList
                            transactions={recentTransactions}
                            pagination={pagination}
                            onPageChange={goToPage}
                            onEdit={(tr) => setEditingTransaction(tr)}
                            onDelete={deleteTransaction}
                            isDarkMode={isDarkMode}
                        />
                    </section>
                </main>

                {/* Expense Breakdown Modal */}
                {showBreakdown && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setShowBreakdown(false)} />
                        <div className="relative w-full max-w-md mx-4 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <ClassificationBreakdown
                                data={classificationBreakdown}
                                isDarkMode={isDarkMode}
                                onClose={() => setShowBreakdown(false)}
                                isModal={true}
                            />
                        </div>
                    </div>
                )}

                {/* Quick Add Modal */}
                {showQuickAdd && (
                    <QuickAdd
                        type={quickAddType}
                        categories={categories.filter(c => c.type === quickAddType)}
                        onAddTransaction={addTransaction}
                        onClose={() => setShowQuickAdd(false)}
                        isDarkMode={isDarkMode}
                    />
                )}

                {/* Edit Transaction Modal */}
                {editingTransaction && (
                    <EditTransactionModal
                        transaction={editingTransaction}
                        categories={categories}
                        onSave={async (id, categoryId, amount, note, classification, createdAt) => {
                            await updateTransaction(id, categoryId, amount, note, classification, createdAt);
                            setEditingTransaction(null);
                        }}
                        onClose={() => setEditingTransaction(null)}
                        isDarkMode={isDarkMode}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
