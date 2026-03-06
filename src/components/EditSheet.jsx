import { useState, useRef, useEffect } from 'react';
import BottomSheet from './BottomSheet';
import Chip from './Chip';
import NumberPad from './NumberPad';
import CalendarPicker from './CalendarPicker';
import { useTransactions } from '../store/transactions';
import { CURRENCIES } from '../store/settings';
import { CalendarDays } from 'lucide-react';
import { getCategoryIcon } from '../lib/categoryIcons';
import './EditSheet.css';

const emptyItem = {
    name: '',
    amount: '',
    currency: 'USD',
    category: 'others',
    type: 'expense',
    date: '',
    merchant: '',
    note: '',
};

export default function EditSheet({ open, onClose, item, onSave, onDelete }) {
    const { categories } = useTransactions();
    const isEdit = !!item?.id;
    const [form, setForm] = useState({ ...emptyItem, ...(item || {}) });
    const [showCalendar, setShowCalendar] = useState(!isEdit);
    const [showNumpad, setShowNumpad] = useState(false);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const amountRef = useRef(null);

    // Reset all state whenever the sheet opens or switches to a different item
    useEffect(() => {
        if (open) {
            const base = { ...emptyItem, ...(item || {}) };
            // For new items (no item.date), default to today
            if (!base.date) {
                base.date = new Date().toISOString().split('T')[0];
            }
            setForm(base);
            setShowCalendar(!item?.id);
            setShowNumpad(false);
            setShowCurrencyPicker(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, item?.id]);

    function updateField(key, val) {
        setForm(prev => ({ ...prev, [key]: val }));
    }

    function handleNumInput(digit) {
        const current = String(form.amount);
        if (current.includes('.') && current.split('.')[1]?.length >= 2) return;
        updateField('amount', current === '0' ? digit : current + digit);
    }

    function handleNumDelete() {
        const current = String(form.amount);
        if (current.length <= 1) updateField('amount', '0');
        else updateField('amount', current.slice(0, -1));
    }

    function handleNumDot() {
        const current = String(form.amount);
        if (!current.includes('.')) updateField('amount', current + '.');
    }

    function handleConfirm() {
        onSave?.({
            ...form,
            amount: parseFloat(form.amount) || 0,
        });
        onClose?.();
    }

    function handleDelete() {
        onDelete?.(form.id);
        onClose?.();
    }

    return (
        <>
            <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Edit item info' : 'Add new item'}>
                <div className="edit-form" onClick={() => setShowNumpad(false)}>
                    {/* Item Name */}
                    <div className="edit-field">
                        <label className="edit-label">Item name</label>
                        <input
                            className="edit-input"
                            placeholder="e.g. Coffee at Starbucks"
                            value={form.name}
                            onChange={e => updateField('name', e.target.value)}
                        />
                    </div>

                    {/* Amount */}
                    <div className="edit-field">
                        <label className="edit-label">Amount</label>
                        <div
                            className={`edit-amount-row ${showNumpad ? 'edit-amount-row--active' : ''}`}
                            ref={amountRef}
                            onClick={(e) => { e.stopPropagation(); setShowNumpad(true); }}
                        >
                            <span className="edit-amount-value">
                                {form.amount || '0'}
                            </span>
                            <div
                                className="edit-currency-badge"
                                onClick={e => { e.stopPropagation(); setShowCurrencyPicker(true); }}
                            >
                                <span className="edit-currency-flag">
                                    {CURRENCIES.find(c => c.code === form.currency)?.flag ?? ''}
                                </span>
                                <span>{form.currency}</span>
                                <span className="edit-currency-caret">▾</span>
                            </div>
                        </div>
                    </div>

                    {/* Type */}
                    <div className="edit-field">
                        <label className="edit-label">Type</label>
                        <div className="edit-chips">
                            {['expense', 'income', 'transfer'].map(t => (
                                <Chip
                                    key={t}
                                    label={t.charAt(0).toUpperCase() + t.slice(1)}
                                    selected={form.type === t}
                                    onToggle={() => updateField('type', t)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="edit-field">
                        <label className="edit-label">Categories</label>
                        <div className="edit-chips">
                            {categories.map(cat => (
                                <Chip
                                    key={cat.id}
                                    icon={getCategoryIcon(cat.id, 13)}
                                    label={cat.label}
                                    selected={form.category === cat.id}
                                    onToggle={() => updateField('category', cat.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="edit-field">
                        <button
                            className="edit-date-toggle"
                            onClick={() => setShowCalendar(prev => !prev)}
                            type="button"
                        >
                            <CalendarDays size={15} strokeWidth={1.75} /> {form.date} <span className="edit-currency-caret">{showCalendar ? '▴' : '▾'}</span>
                        </button>
                        {showCalendar && (
                            <CalendarPicker value={form.date} onChange={d => updateField('date', d)} />
                        )}
                    </div>

                    {/* Number Pad — only visible when amount is focused */}
                    {showNumpad && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <NumberPad onInput={handleNumInput} onDelete={handleNumDelete} onDot={handleNumDot} />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="edit-actions">
                        <button className="edit-confirm-btn" onClick={handleConfirm}>
                            Confirm
                        </button>
                        {isEdit && (
                            <button className="edit-delete-btn" onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </BottomSheet>

            <BottomSheet open={showCurrencyPicker} onClose={() => setShowCurrencyPicker(false)} title="Select Currency">
                <div className="currency-list">
                    {CURRENCIES.map(c => (
                        <button
                            key={c.code}
                            className={`currency-item ${form.currency === c.code ? 'currency-item--selected' : ''}`}
                            onClick={() => {
                                updateField('currency', c.code);
                                setShowCurrencyPicker(false);
                            }}
                        >
                            <span className="currency-flag-icon">{c.flag}</span>
                            <div className="currency-info">
                                <span className="currency-name">{c.name}</span>
                                <span className="currency-code-badge">{c.code} · {c.symbol}</span>
                            </div>
                            {form.currency === c.code && (
                                <svg className="currency-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </BottomSheet>
        </>
    );
}
