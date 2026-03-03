import { useState, useEffect } from 'react';
import './BottomSheet.css';

export default function BottomSheet({ open, onClose, title, children }) {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setAnimating(true));
            });
        } else {
            setAnimating(false);
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!visible) return null;

    return (
        <div className={`sheet-backdrop ${animating ? 'sheet-backdrop--open' : ''}`} onClick={onClose}>
            <div
                className={`sheet-container ${animating ? 'sheet-container--open' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="sheet-handle" />
                <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
                {title && <h2 className="sheet-title">{title}</h2>}
                <div className="sheet-content hide-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
