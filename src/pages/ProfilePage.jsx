import { useState, useMemo } from 'react';
import { useTransactions } from '../store/transactions';
import { useSettings, CURRENCIES } from '../store/settings';
import './ProfilePage.css';

function fmtAmount(n) {
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProfilePage({ onNavigate }) {
    const { transactions } = useTransactions();
    const { settings, updateSettings } = useSettings();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats = useMemo(() => {
        const thisMonth = transactions.filter(tx => {
            const d = new Date(tx.date || tx.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const income = thisMonth
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);
        const expenses = thisMonth
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);
        return { income, expenses, net: income - expenses };
    }, [transactions, currentMonth, currentYear]);

    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const currency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];
    const sym = currency.symbol;

    const [incomeInput, setIncomeInput] = useState(
        settings.monthlyIncome > 0 ? String(settings.monthlyIncome) : ''
    );
    const [budgetInput, setBudgetInput] = useState(
        settings.budgetLimit > 0 ? String(settings.budgetLimit) : ''
    );

    const budgetPct = settings.budgetLimit > 0
        ? Math.min(100, (stats.expenses / settings.budgetLimit) * 100)
        : 0;
    const overBudget = settings.budgetLimit > 0 && stats.expenses > settings.budgetLimit;

    return (
        <div className="profile-page">
            <header className="profile-header">
                <h1 className="profile-title">Profile</h1>
            </header>

            <div className="profile-content hide-scrollbar">
                {/* Avatar card */}
                <div className="profile-avatar-card">
                    <div className="profile-avatar">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="profile-user-info">
                        <span className="profile-user-name">SaySpend User</span>
                        <span className="profile-user-email">user@sayspend.app</span>
                    </div>
                </div>

                {/* Monthly overview card — tap to view full report */}
                <button className="profile-overview-card" onClick={() => onNavigate('history')}>
                    <div className="profile-overview-header">
                        <span className="profile-overview-month">{monthLabel}</span>
                        <span className="profile-overview-link">View Report ›</span>
                    </div>
                    <div className="profile-stats-row">
                        <div className="profile-stat">
                            <span className="profile-stat-label">Income</span>
                            <span className="profile-stat-value profile-stat--income">+{sym}{fmtAmount(stats.income)}</span>
                        </div>
                        <div className="profile-stat-sep" />
                        <div className="profile-stat">
                            <span className="profile-stat-label">Expenses</span>
                            <span className="profile-stat-value profile-stat--expense">-{sym}{fmtAmount(stats.expenses)}</span>
                        </div>
                        <div className="profile-stat-sep" />
                        <div className="profile-stat">
                            <span className="profile-stat-label">Net</span>
                            <span className={`profile-stat-value ${stats.net >= 0 ? 'profile-stat--income' : 'profile-stat--expense'}`}>
                                {stats.net >= 0 ? '+' : '-'}{sym}{fmtAmount(Math.abs(stats.net))}
                            </span>
                        </div>
                    </div>
                    {settings.budgetLimit > 0 && (
                        <div className="profile-budget-bar">
                            <div className="profile-budget-labels">
                                <span>Spending budget</span>
                                <span className={overBudget ? 'profile-budget-over' : ''}>
                                    {sym}{fmtAmount(stats.expenses)} / {sym}{fmtAmount(settings.budgetLimit)}
                                </span>
                            </div>
                            <div className="profile-budget-track">
                                <div
                                    className={`profile-budget-fill ${overBudget ? 'profile-budget-fill--over' : ''}`}
                                    style={{ width: `${budgetPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                </button>

                {/* Financial Settings */}
                <div className="profile-section">
                    <h3 className="profile-section-label">Financial Settings</h3>
                    <div className="profile-fields-card">
                        <div className="profile-field">
                            <div className="profile-field-icon">💵</div>
                            <div className="profile-field-body">
                                <label className="profile-field-label">Monthly Income</label>
                                <div className="profile-field-input-wrap">
                                    <span className="profile-field-sym">{sym}</span>
                                    <input
                                        className="profile-field-input"
                                        type="number"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={incomeInput}
                                        onChange={e => setIncomeInput(e.target.value)}
                                        onBlur={() => updateSettings({ monthlyIncome: parseFloat(incomeInput) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="profile-field-divider" />
                        <div className="profile-field">
                            <div className="profile-field-icon">🎯</div>
                            <div className="profile-field-body">
                                <label className="profile-field-label">Spending Budget</label>
                                <div className="profile-field-input-wrap">
                                    <span className="profile-field-sym">{sym}</span>
                                    <input
                                        className="profile-field-input"
                                        type="number"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={budgetInput}
                                        onChange={e => setBudgetInput(e.target.value)}
                                        onBlur={() => updateSettings({ budgetLimit: parseFloat(budgetInput) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Navigation */}
                <div className="profile-section">
                    <button className="profile-nav-row" onClick={() => onNavigate('settings')}>
                        <div className="profile-nav-left">
                            <div className="profile-nav-icon">⚙️</div>
                            <span className="profile-nav-title">Settings</span>
                        </div>
                        <span className="profile-nav-chevron">›</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
