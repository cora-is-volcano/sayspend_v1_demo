import './Chip.css';

export default function Chip({ label, icon, selected, onToggle, dismissible, onClick }) {
    return (
        <button
            className={`chip ${selected ? 'chip--selected' : ''}`}
            onClick={onClick || onToggle}
            aria-pressed={selected}
        >
            {icon && <span className="chip-icon">{icon}</span>}
            <span className="chip-label">{label}</span>
            {dismissible && selected && (
                <span className="chip-dismiss" onClick={(e) => { e.stopPropagation(); onToggle?.(); }}>×</span>
            )}
        </button>
    );
}
