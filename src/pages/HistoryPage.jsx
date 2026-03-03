import { useState, useMemo } from 'react';
import { useTransactions } from '../store/transactions';
import TransactionCard from '../components/TransactionCard';
import EditSheet from '../components/EditSheet';
import BottomSheet from '../components/BottomSheet';
import Chip from '../components/Chip';
import './HistoryPage.css';

const filterCategories = [
    { id: 'sent', label: 'Sent', icon: '📤' },
    { id: 'received', label: 'Received', icon: '📥' },
    { id: 'withdrawal', label: 'Withdrawals', icon: '🏧' },
    { id: 'topup', label: 'Top-up', icon: '➕' },
    { id: 'card', label: 'Card payment', icon: '💳' },
    { id: 'exchange', label: 'Exchange', icon: '💱' },
];

const filterCurrencies = [
    { id: 'EUR', label: 'EUR', icon: '🇪🇺' },
    { id: 'USD', label: 'USD', icon: '🇺🇸' },
    { id: 'GBP', label: 'GBP', icon: '🇬🇧' },
];

const filterStatuses = [
    { id: 'completed', label: 'Completed', icon: '✅' },
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'failed', label: 'Failed', icon: '❌' },
    { id: 'cancelled', label: 'Cancelled', icon: '🚫' },
    { id: 'scheduled', label: 'Scheduled', icon: '📅' },
];

export default function HistoryPage() {
    const { transactions, updateTransaction, deleteTransaction, categories } = useTransactions();
    const [search, setSearch] = useState('');
    const [editItem, setEditItem] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);

    // Active filters
    const [activeCategories, setActiveCategories] = useState([]);
    const [activeCurrencies, setActiveCurrencies] = useState([]);
    const [activeStatuses, setActiveStatuses] = useState([]);

    const activeFilterCount = activeCategories.length + activeCurrencies.length + activeStatuses.length;

    // Filter and search
    const filtered = useMemo(() => {
        let result = [...transactions];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(tx =>
                (tx.name || '').toLowerCase().includes(q) ||
                (tx.merchant || '').toLowerCase().includes(q) ||
                (tx.note || '').toLowerCase().includes(q)
            );
        }

        if (activeCurrencies.length > 0) {
            result = result.filter(tx => activeCurrencies.includes(tx.currency));
        }

        return result;
    }, [transactions, search, activeCurrencies]);

    // Group by month
    const grouped = useMemo(() => {
        const groups = {};
        filtered.forEach(tx => {
            const d = new Date(tx.date || tx.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[key]) groups[key] = { label, items: [] };
            groups[key].items.push(tx);
        });
        return Object.entries(groups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([, g]) => g);
    }, [filtered]);

    function toggleFilter(list, setList, id) {
        setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    function resetFilters() {
        setActiveCategories([]);
        setActiveCurrencies([]);
        setActiveStatuses([]);
    }

    function handleApplyFilters() {
        setFilterOpen(false);
    }

    // Collect active filter chips for display
    const activeChips = [
        ...activeCategories.map(id => {
            const f = filterCategories.find(c => c.id === id);
            return f ? { ...f, group: 'cat' } : null;
        }),
        ...activeCurrencies.map(id => {
            const f = filterCurrencies.find(c => c.id === id);
            return f ? { ...f, group: 'cur' } : null;
        }),
        ...activeStatuses.map(id => {
            const f = filterStatuses.find(c => c.id === id);
            return f ? { ...f, group: 'stat' } : null;
        }),
    ].filter(Boolean);

    return (
        <div className="history-page">
            {/* Header */}
            <header className="history-header">
                <h1 className="history-title">Transaction</h1>
            </header>

            {/* Search */}
            <div className="history-search">
                <svg className="history-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    className="history-search-input"
                    placeholder="Search for transactions"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="history-filter-btn" onClick={() => setFilterOpen(true)} aria-label="Filters">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                        <line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
                <div className="history-active-filters hide-scrollbar">
                    {activeChips.map(chip => (
                        <Chip
                            key={chip.id}
                            label={chip.label}
                            icon={chip.icon}
                            selected
                            dismissible
                            onToggle={() => {
                                if (chip.group === 'cat') toggleFilter(activeCategories, setActiveCategories, chip.id);
                                if (chip.group === 'cur') toggleFilter(activeCurrencies, setActiveCurrencies, chip.id);
                                if (chip.group === 'stat') toggleFilter(activeStatuses, setActiveStatuses, chip.id);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Transaction List */}
            <div className="history-list hide-scrollbar">
                {grouped.length === 0 ? (
                    <div className="history-empty">
                        <p className="history-empty-text">
                            {transactions.length === 0 ? 'No transactions yet.\nStart recording with the voice button!' : 'No matching transactions found.'}
                        </p>
                    </div>
                ) : (
                    grouped.map(group => (
                        <div key={group.label} className="history-group">
                            <h3 className="history-group-label">{group.label}</h3>
                            <div className="history-group-items">
                                {group.items.map(tx => (
                                    <div key={tx.id} className="history-item">
                                        <div className="history-item-icon" style={{ background: tx.type === 'income' ? 'var(--chip-mint)' : 'var(--chip-lavender)' }}>
                                            {(categories.find(c => c.id === tx.category) || categories[categories.length - 1]).icon}
                                        </div>
                                        <div className="history-item-info">
                                            <span className="history-item-name truncate">{tx.name || tx.merchant || 'Untitled'}</span>
                                            <span className="history-item-date">{formatHistoryDate(tx.date)}</span>
                                        </div>
                                        <div className="history-item-right">
                                            <span className={`history-item-amount ${tx.type === 'income' ? 'history-item-amount--income' : tx.type === 'expense' ? 'history-item-amount--expense' : ''}`}>
                                                {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="history-item-type">{tx.type === 'income' ? 'Received' : 'Send'}</span>
                                        </div>
                                        <button className="history-item-tap" onClick={() => setEditItem(tx)} aria-label="Edit" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Filter Bottom Sheet */}
            <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters">
                <div className="filter-form">
                    <div className="filter-section">
                        <h4 className="filter-section-label">Categories</h4>
                        <div className="filter-chips">
                            {filterCategories.map(f => (
                                <Chip
                                    key={f.id}
                                    label={f.label}
                                    icon={f.icon}
                                    selected={activeCategories.includes(f.id)}
                                    onToggle={() => toggleFilter(activeCategories, setActiveCategories, f.id)}
                                    dismissible
                                />
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-section-label">Currencies</h4>
                        <div className="filter-chips">
                            {filterCurrencies.map(f => (
                                <Chip
                                    key={f.id}
                                    label={f.label}
                                    icon={f.icon}
                                    selected={activeCurrencies.includes(f.id)}
                                    onToggle={() => toggleFilter(activeCurrencies, setActiveCurrencies, f.id)}
                                    dismissible
                                />
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-section-label">Status</h4>
                        <div className="filter-chips">
                            {filterStatuses.map(f => (
                                <Chip
                                    key={f.id}
                                    label={f.label}
                                    icon={f.icon}
                                    selected={activeStatuses.includes(f.id)}
                                    onToggle={() => toggleFilter(activeStatuses, setActiveStatuses, f.id)}
                                    dismissible
                                />
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-section-label">Period</h4>
                        <div className="filter-period">
                            <select className="filter-select">
                                <option value="">select a year</option>
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                            <select className="filter-select">
                                <option value="">select a month</option>
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button className="filter-reset-btn" onClick={resetFilters}>Reset</button>
                        <button className="filter-apply-btn" onClick={handleApplyFilters}>
                            Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                        </button>
                    </div>
                </div>
            </BottomSheet>

            {/* Edit Sheet */}
            <EditSheet
                open={!!editItem}
                onClose={() => setEditItem(null)}
                item={editItem}
                onSave={(updated) => {
                    updateTransaction(updated.id, updated);
                    setEditItem(null);
                }}
                onDelete={(id) => {
                    deleteTransaction(id);
                    setEditItem(null);
                }}
            />
        </div>
    );
}

function formatHistoryDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
