import { useState, useEffect, useRef } from 'react';
import './BottomSheet.css';

export default function BottomSheet({ open, onClose, title, children }) {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const prevOpenRef = useRef(false);

    // Track open → closed transitions with an animation delay
    /* eslint-disable react-hooks/set-state-in-effect -- intentional: must mount DOM synchronously before animating */
    useEffect(() => {
        if (open && !prevOpenRef.current) {
            // Opening: mount immediately, animate on next frame
            setVisible(true);
            const raf1 = requestAnimationFrame(() => {
                const raf2 = requestAnimationFrame(() => setAnimating(true));
                return () => cancelAnimationFrame(raf2);
            });
            prevOpenRef.current = true;
            return () => cancelAnimationFrame(raf1);
        }

        if (!open && prevOpenRef.current) {
            // Closing: animate out, then unmount after transition
            setAnimating(false);
            prevOpenRef.current = false;
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [open]);
    /* eslint-enable react-hooks/set-state-in-effect */

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
