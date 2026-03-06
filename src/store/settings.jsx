import { createContext, useContext, useState, useEffect } from 'react';

const SETTINGS_KEY = 'sayspend_settings';

export const CURRENCIES = [
    { code: 'USD', name: 'US Dollar',          symbol: '$',   flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro',               symbol: '€',   flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound',      symbol: '£',   flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen',       symbol: '¥',   flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan',       symbol: '¥',   flag: '🇨🇳' },
    { code: 'HKD', name: 'Hong Kong Dollar',   symbol: 'HK$', flag: '🇭🇰' },
    { code: 'CAD', name: 'Canadian Dollar',    symbol: 'CA$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$',  flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc',        symbol: 'Fr',  flag: '🇨🇭' },
    { code: 'SGD', name: 'Singapore Dollar',   symbol: 'S$',  flag: '🇸🇬' },
    { code: 'KRW', name: 'South Korean Won',   symbol: '₩',   flag: '🇰🇷' },
    { code: 'INR', name: 'Indian Rupee',       symbol: '₹',   flag: '🇮🇳' },
    { code: 'MXN', name: 'Mexican Peso',       symbol: 'MX$', flag: '🇲🇽' },
    { code: 'BRL', name: 'Brazilian Real',     symbol: 'R$',  flag: '🇧🇷' },
    { code: 'SEK', name: 'Swedish Krona',      symbol: 'kr',  flag: '🇸🇪' },
    { code: 'NOK', name: 'Norwegian Krone',    symbol: 'kr',  flag: '🇳🇴' },
    { code: 'DKK', name: 'Danish Krone',       symbol: 'kr',  flag: '🇩🇰' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
    { code: 'THB', name: 'Thai Baht',          symbol: '฿',   flag: '🇹🇭' },
    { code: 'MYR', name: 'Malaysian Ringgit',  symbol: 'RM',  flag: '🇲🇾' },
];

const defaultSettings = {
    currency: 'USD',
    monthlyIncome: 0,
    budgetLimit: 0,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
        } catch {
            return defaultSettings;
        }
    });

    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    function updateSettings(updates) {
        setSettings(prev => ({ ...prev, ...updates }));
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
    return ctx;
}
