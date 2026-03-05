import { useState, useMemo } from 'react';
import { useTransactions } from '../store/transactions';
import EditSheet from '../components/EditSheet';
import './HistoryPage.css';

const VIEW_MODES = ['Day', 'Month', 'Year'];
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getTxDate(tx) {
    if (tx.date) return tx.date;
    if (tx.createdAt) return tx.createdAt.slice(0, 10);
    return null;
}

function toDateStr(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function HistoryPage() {
    const { transactions, updateTransaction, deleteTransaction, categories } = useTransactions();
    const [editItem, setEditItem] = useState(null);
    const [viewMode, setViewMode] = useState('Month');
    const [calExpanded, setCalExpanded] = useState(false);

    const todayRaw = new Date();
    const todayStr = toDateStr(todayRaw.getFullYear(), todayRaw.getMonth(), todayRaw.getDate());

    const [selYear, setSelYear] = useState(todayRaw.getFullYear());
    const [selMonth, setSelMonth] = useState(todayRaw.getMonth());
    const [selDay, setSelDay] = useState(todayRaw.getDate());

    // Set of YYYY-MM-DD strings that have records
    const recordDates = useMemo(() => {
        const s = new Set();
        transactions.forEach(tx => { const d = getTxDate(tx); if (d) s.add(d); });
        return s;
    }, [transactions]);

    // Filtered + sorted transactions
    const filtered = useMemo(() => {
        return transactions
            .filter(tx => {
                const d = getTxDate(tx);
                if (!d) return false;
                const [y, m, day] = d.split('-').map(Number);
                if (viewMode === 'Day') return y === selYear && m - 1 === selMonth && day === selDay;
                if (viewMode === 'Month') return y === selYear && m - 1 === selMonth;
                return y === selYear;
            })
            .sort((a, b) => (getTxDate(b) || '').localeCompare(getTxDate(a) || ''));
    }, [transactions, viewMode, selYear, selMonth, selDay]);

    // Totals
    const { income, expense } = useMemo(() => {
        let income = 0, expense = 0;
        filtered.forEach(tx => {
            const amt = Number(tx.amount) || 0;
            if (tx.type === 'income') income += amt;
            else if (tx.type === 'expense') expense += amt;
        });
        return { income, expense };
    }, [filtered]);

    // Grouped for list
    const groups = useMemo(() => {
        const map = {};
        filtered.forEach(tx => {
            const d = getTxDate(tx);
            if (!d) return;
            let key, label;
            if (viewMode === 'Year') {
                const [y, m] = d.split('-').map(Number);
                key = `${y}-${String(m).padStart(2, '0')}`;
                label = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            } else {
                key = d;
                const [y, m, day] = d.split('-').map(Number);
                label = new Date(y, m - 1, day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            }
            if (!map[key]) map[key] = { label, items: [] };
            map[key].items.push(tx);
        });
        return Object.entries(map).sort(([a], [b]) => b.localeCompare(a)).map(([, g]) => g);
    }, [filtered, viewMode]);

    // Period label
    const periodLabel = useMemo(() => {
        if (viewMode === 'Day') {
            const d = new Date(selYear, selMonth, selDay);
            const today = new Date(); today.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
            const diff = Math.round((today - d) / 86400000);
            if (diff === 0) return 'Today';
            if (diff === 1) return 'Yesterday';
            return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
        if (viewMode === 'Month') return new Date(selYear, selMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return String(selYear);
    }, [viewMode, selYear, selMonth, selDay]);

    // Week strip (Mon–Sun) centered on selected day
    const weekDays = useMemo(() => {
        const base = new Date(selYear, selMonth, selDay);
        const dow = base.getDay();
        const offset = dow === 0 ? -6 : 1 - dow;
        return DAY_LABELS.map((label, i) => {
            const d = new Date(base);
            d.setDate(base.getDate() + offset + i);
            const ds = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
            return {
                label, day: d.getDate(), year: d.getFullYear(), month: d.getMonth(),
                dateStr: ds,
                isToday: ds === todayStr,
                isSelected: d.getFullYear() === selYear && d.getMonth() === selMonth && d.getDate() === selDay,
                hasRecord: recordDates.has(ds),
            };
        });
    }, [selYear, selMonth, selDay, recordDates, todayStr]);

    // Full month grid (Mon-first)
    const monthGrid = useMemo(() => {
        const first = new Date(selYear, selMonth, 1);
        const last = new Date(selYear, selMonth + 1, 0);
        let startDow = first.getDay();
        startDow = startDow === 0 ? 6 : startDow - 1;
        const cells = Array(startDow).fill(null);
        for (let d = 1; d <= last.getDate(); d++) {
            const ds = toDateStr(selYear, selMonth, d);
            cells.push({ day: d, dateStr: ds, isToday: ds === todayStr, isSelected: d === selDay, hasRecord: recordDates.has(ds) });
        }
        return cells;
    }, [selYear, selMonth, selDay, recordDates, todayStr]);

    function navigateMonth(dir) {
        let m = selMonth + dir, y = selYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        setSelMonth(m); setSelYear(y);
    }

    function pickDay(year, month, day) {
        setSelYear(year); setSelMonth(month); setSelDay(day);
        setCalExpanded(false);
        if (viewMode !== 'Day') setViewMode('Day');
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
            </header>

            {/* ── Calendar Zone ── */}
            <div className="dashboard-cal-zone">
                <div className="dashboard-cal-toprow">
                    <div className="dashboard-view-tabs">
                        {VIEW_MODES.map(mode => (
                            <button
                                key={mode}
                                className={`dashboard-view-tab${viewMode === mode ? ' dashboard-view-tab--active' : ''}`}
                                onClick={() => setViewMode(mode)}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <button
                        className={`dashboard-expand-btn${calExpanded ? ' dashboard-expand-btn--open' : ''}`}
                        onClick={() => setCalExpanded(e => !e)}
                        aria-label={calExpanded ? 'Collapse calendar' : 'Expand calendar'}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                </div>

                {/* Collapsed */}
                {!calExpanded && (
                    <div className="dashboard-cal-compact">
                        {viewMode === 'Day' ? (
                            <div className="dashboard-week-strip">
                                {weekDays.map((d, i) => (
                                    <button
                                        key={i}
                                        className={`dashboard-week-cell${d.isSelected ? ' dashboard-week-cell--selected' : ''}${d.isToday ? ' dashboard-week-cell--today' : ''}`}
                                        onClick={() => { setSelYear(d.year); setSelMonth(d.month); setSelDay(d.day); }}
                                    >
                                        <span className="dwc-label">{d.label}</span>
                                        <span className="dwc-num">{d.day}</span>
                                        <span className={`dwc-dot${d.hasRecord ? ' dwc-dot--visible' : ''}`} />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="dashboard-period-strip">
                                <button className="dashboard-nav-arrow" onClick={() => viewMode === 'Month' ? navigateMonth(-1) : setSelYear(y => y - 1)}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                                <span className="dashboard-period-label">
                                    {viewMode === 'Month'
                                        ? new Date(selYear, selMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                        : selYear}
                                </span>
                                <button className="dashboard-nav-arrow" onClick={() => viewMode === 'Month' ? navigateMonth(1) : setSelYear(y => y + 1)}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Expanded full calendar */}
                {calExpanded && (
                    <div className="dashboard-cal-full">
                        <div className="dashboard-cal-fullnav">
                            <button className="dashboard-nav-arrow" onClick={() => navigateMonth(-1)}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <span className="dashboard-cal-monthlabel">
                                {new Date(selYear, selMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button className="dashboard-nav-arrow" onClick={() => navigateMonth(1)}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                        <div className="dashboard-cal-daynames">
                            {DAY_LABELS.map(l => <span key={l} className="dcal-dayname">{l}</span>)}
                        </div>
                        <div className="dashboard-cal-grid">
                            {monthGrid.map((cell, i) =>
                                cell === null
                                    ? <span key={`e${i}`} className="dcal-cell dcal-cell--empty" />
                                    : (
                                        <button
                                            key={cell.dateStr}
                                            className={`dcal-cell${cell.isSelected ? ' dcal-cell--selected' : ''}${cell.isToday ? ' dcal-cell--today' : ''}`}
                                            onClick={() => pickDay(selYear, selMonth, cell.day)}
                                        >
                                            <span className="dcal-num">{cell.day}</span>
                                            {cell.hasRecord && <span className="dcal-dot" />}
                                        </button>
                                    )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Summary Cards ── */}
            <div className="dashboard-summary">
                <div className="dashboard-summary-card dashboard-summary-card--expense">
                    <span className="dsc-label">Expenses</span>
                    <span className="dsc-amount dsc-amount--expense">
                        −${expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="dashboard-summary-card dashboard-summary-card--income">
                    <span className="dsc-label">Income</span>
                    <span className="dsc-amount dsc-amount--income">
                        +${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* ── Transaction List ── */}
            <div className="dashboard-list hide-scrollbar">
                <div className="dashboard-list-meta">
                    <span className="dlm-period">{periodLabel}</span>
                    <span className="dlm-count">{filtered.length} records</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="dashboard-empty">
                        <p className="dashboard-empty-text">No records for this period</p>
                    </div>
                ) : (
                    groups.map(group => (
                        <div key={group.label} className="dashboard-group">
                            <h3 className="dashboard-group-label">{group.label}</h3>
                            <div className="dashboard-group-items">
                                {group.items.map(tx => (
                                    <div key={tx.id} className="history-item">
                                        <div className="history-item-icon" style={{ background: tx.type === 'income' ? 'var(--chip-mint)' : 'var(--chip-lavender)' }}>
                                            {(categories.find(c => c.id === tx.category) || categories[categories.length - 1]).icon}
                                        </div>
                                        <div className="history-item-info">
                                            <span className="history-item-name truncate">{tx.name || tx.merchant || 'Untitled'}</span>
                                            <span className="history-item-date">{formatDate(tx.date)}</span>
                                        </div>
                                        <div className="history-item-right">
                                            <span className={`history-item-amount ${tx.type === 'income' ? 'history-item-amount--income' : tx.type === 'expense' ? 'history-item-amount--expense' : ''}`}>
                                                {tx.type === 'income' ? '+' : '−'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="history-item-type">{tx.type === 'income' ? 'Received' : 'Sent'}</span>
                                        </div>
                                        <button className="history-item-tap" onClick={() => setEditItem(tx)} aria-label="Edit transaction" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <EditSheet
                open={!!editItem}
                onClose={() => setEditItem(null)}
                item={editItem}
                onSave={(updated) => { updateTransaction(updated.id, updated); setEditItem(null); }}
                onDelete={(id) => { deleteTransaction(id); setEditItem(null); }}
            />
        </div>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date(); today.setHours(0, 0, 0, 0); date.setHours(0, 0, 0, 0);
    const diff = Math.round((today - date) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
