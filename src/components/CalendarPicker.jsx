import { useState, useMemo } from 'react';
import './CalendarPicker.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPicker({ value, onChange }) {
    const selected = value ? new Date(value + 'T00:00:00') : new Date();
    const [viewYear, setViewYear] = useState(selected.getFullYear());
    const [viewMonth, setViewMonth] = useState(selected.getMonth());

    const { days, startDay } = useMemo(() => {
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        return {
            days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
            startDay: firstDay,
        };
    }, [viewYear, viewMonth]);

    function prev() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }

    function next() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }

    function selectDay(day) {
        const m = String(viewMonth + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        onChange?.(`${viewYear}-${m}-${d}`);
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div className="cal">
            <div className="cal-header">
                <span className="cal-month-label">
                    {selected.getDate()} {MONTHS[viewMonth].substring(0, 3)}, {String(viewYear).substring(2)} {DAYS[new Date(viewYear, viewMonth, selected.getDate() <= days.length ? selected.getDate() : 1).getDay()] + (selected.getDate() <= days.length ? '' : '')}
                </span>
                <div className="cal-nav">
                    <button className="cal-nav-btn" onClick={prev}>‹</button>
                    <button className="cal-nav-btn" onClick={next}>›</button>
                </div>
            </div>
            <div className="cal-weekdays">
                {DAYS.map(d => <span key={d} className="cal-weekday">{d}</span>)}
            </div>
            <div className="cal-grid">
                {Array.from({ length: startDay }).map((_, i) => <span key={`e${i}`} />)}
                {days.map(day => {
                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = dateStr === value;
                    const isToday = dateStr === todayStr;
                    return (
                        <button
                            key={day}
                            className={`cal-day ${isSelected ? 'cal-day--selected' : ''} ${isToday && !isSelected ? 'cal-day--today' : ''}`}
                            onClick={() => selectDay(day)}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
