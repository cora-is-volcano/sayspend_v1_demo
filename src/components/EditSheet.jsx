import { useState, useRef } from 'react';
import BottomSheet from './BottomSheet';
import Chip from './Chip';
import NumberPad from './NumberPad';
import CalendarPicker from './CalendarPicker';
import { useTransactions } from '../store/transactions';
import './EditSheet.css';

const emptyItem = {
    name: '',
    amount: '',
    currency: 'USD',
    category: 'others',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    note: '',
};

export default function EditSheet({ open, onClose, item, onSave, onDelete }) {
    const { categories } = useTransactions();
    const isEdit = !!item?.id;
    const [form, setForm] = useState({ ...emptyItem, ...item });
    const [showCalendar, setShowCalendar] = useState(!isEdit);
    const [showNumpad, setShowNumpad] = useState(false);
    const amountRef = useRef(null);

    // Reset form when item changes
    if (item && item.id !== form.id) {
        setForm({ ...emptyItem, ...item });
    }

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
                        <div className="edit-currency-badge">
                            <span>{form.currency === 'USD' ? '🇺🇸' : form.currency === 'EUR' ? '🇪🇺' : '🇬🇧'}</span>
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
                                icon={cat.icon}
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
                        📅 {form.date} <span className="edit-currency-caret">{showCalendar ? '▴' : '▾'}</span>
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
    );
}
