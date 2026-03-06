import { getCategoryIcon } from '../lib/categoryIcons';
import { CURRENCIES } from '../store/settings';
import './TransactionCard.css';

export default function TransactionCard({ item, onEdit, onDelete, compact }) {
    const isIncome = item.type === 'income';
    const sign = isIncome ? '+' : '-';
    const currencySymbol = CURRENCIES.find(c => c.code === item.currency)?.symbol ?? '$';

    return (
        <div className={`tx-card ${compact ? 'tx-card--compact' : ''}`}>
            <div className="tx-card-body" onClick={() => onEdit?.(item)}>
                <div className="tx-card-icon" style={{ background: isIncome ? 'var(--chip-mint)' : 'var(--chip-lavender)' }}>
                    {getCategoryIcon(item.category, 20)}
                </div>
                <div className="tx-card-info">
                    <span className="tx-card-date">{item.date}</span>
                    <div className="tx-card-row">
                        <span className="tx-card-cat-icon">{getCategoryIcon(item.category, 13)}</span>
                        <span className="tx-card-name truncate">{item.name || item.merchant || 'Untitled'}</span>
                        <span className={`tx-card-amount ${isIncome ? 'tx-card-amount--income' : ''}`}>
                            {sign} {currencySymbol}{Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
            <div className="tx-card-actions">
                <button className="tx-action-btn tx-action-edit" onClick={() => onEdit?.(item)} aria-label="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
                <button className="tx-action-btn tx-action-delete" onClick={() => onDelete?.(item.id)} aria-label="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
