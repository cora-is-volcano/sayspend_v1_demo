import './NumberPad.css';

export default function NumberPad({ onInput, onDelete, onDot }) {
    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['.', '0', '⌫'],
    ];

    function handleKey(key) {
        if (key === '⌫') onDelete?.();
        else if (key === '.') onDot?.();
        else onInput?.(key);
    }

    return (
        <div className="numpad">
            {keys.flat().map((key) => (
                <button
                    key={key}
                    className={`numpad-key ${key === '⌫' ? 'numpad-key--delete' : ''}`}
                    onClick={() => handleKey(key)}
                    type="button"
                >
                    {key}
                </button>
            ))}
        </div>
    );
}
