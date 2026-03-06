import { useState, useMemo } from 'react';
import BottomSheet from './BottomSheet';
import CalendarPicker from './CalendarPicker';
import TransactionCard from './TransactionCard';
import { useTransactions } from '../store/transactions';
import { useSettings, CURRENCIES } from '../store/settings';
import './DailyDashboard.css';

export default function DailyDashboard({ open, onClose, onEdit }) {
    const { transactions } = useTransactions();
    const { settings } = useSettings();
    const sym = CURRENCIES.find(c => c.code === settings.currency)?.symbol ?? '$';
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const { items, totalIncome, totalExpense } = useMemo(() => {
        const dayItems = transactions.filter(tx => tx.date === selectedDate);
        const income = dayItems.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
        const expense = dayItems.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

        return { items: dayItems, totalIncome: income, totalExpense: expense };
    }, [transactions, selectedDate]);

    return (
        <BottomSheet open={open} onClose={onClose} title="Daily Overview">
            <div className="daily-dashboard">
                <div className="daily-calendar-wrap">
                    <CalendarPicker value={selectedDate} onChange={setSelectedDate} />
                </div>

                <div className="daily-summary">
                    <div className="daily-summary-box">
                        <span className="daily-summary-label">Income</span>
                        <span className="daily-summary-value daily-summary-value--income">
                            +{sym}{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="daily-summary-box">
                        <span className="daily-summary-label">Expense</span>
                        <span className="daily-summary-value daily-summary-value--expense">
                            -{sym}{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="daily-list hide-scrollbar">
                    <h3 className="daily-list-title">Transactions</h3>
                    {items.length === 0 ? (
                        <p className="daily-empty">No transactions on this date.</p>
                    ) : (
                        <div className="daily-items">
                            {items.map(item => (
                                <TransactionCard
                                    key={item.id}
                                    item={item}
                                    compact
                                    onEdit={() => onEdit(item)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </BottomSheet>
    );
}
