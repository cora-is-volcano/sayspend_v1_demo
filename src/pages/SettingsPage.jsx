import { useState } from 'react';
import { useTheme } from '../store/theme';
import { useSettings, CURRENCIES } from '../store/settings';
import BottomSheet from '../components/BottomSheet';
import './SettingsPage.css';

export default function SettingsPage({ onBack }) {
    const { theme, toggleTheme } = useTheme();
    const { settings, updateSettings } = useSettings();
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const isDark = theme === 'dark';

    const selectedCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];

    return (
        <div className="settings-page">
            <header className="settings-header">
                {onBack && (
                    <button className="settings-back-btn" onClick={onBack} aria-label="Back">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                )}
                <h1 className="settings-title">Settings</h1>
            </header>

            <div className="settings-content hide-scrollbar">
                {/* Profile Card */}
                <div className="settings-profile-card">
                    <div className="settings-avatar">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="settings-profile-info">
                        <span className="settings-profile-name">SaySpend User</span>
                        <span className="settings-profile-email">user@sayspend.app</span>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="settings-section">
                    <h3 className="settings-section-label">Appearance</h3>
                    <div className="settings-row" onClick={toggleTheme}>
                        <div className="settings-row-left">
                            <div className="settings-row-icon">
                                {isDark ? '🌙' : '☀️'}
                            </div>
                            <div className="settings-row-text">
                                <span className="settings-row-title">Dark Mode</span>
                                <span className="settings-row-desc">
                                    {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                                </span>
                            </div>
                        </div>
                        <div className={`settings-toggle ${isDark ? 'settings-toggle--on' : ''}`}>
                            <div className="settings-toggle-knob" />
                        </div>
                    </div>
                </div>

                {/* General Section */}
                <div className="settings-section">
                    <h3 className="settings-section-label">General</h3>
                    <div className="settings-row" onClick={() => setCurrencyOpen(true)}>
                        <div className="settings-row-left">
                            <div className="settings-row-icon">💰</div>
                            <div className="settings-row-text">
                                <span className="settings-row-title">Default Currency</span>
                                <span className="settings-row-desc">
                                    {selectedCurrency.flag} {selectedCurrency.code} — {selectedCurrency.name}
                                </span>
                            </div>
                        </div>
                        <span className="settings-row-chevron">›</span>
                    </div>
                    <div className="settings-row">
                        <div className="settings-row-left">
                            <div className="settings-row-icon">🔔</div>
                            <div className="settings-row-text">
                                <span className="settings-row-title">Notifications</span>
                                <span className="settings-row-desc">Manage alerts</span>
                            </div>
                        </div>
                        <span className="settings-row-chevron">›</span>
                    </div>
                    <div className="settings-row">
                        <div className="settings-row-left">
                            <div className="settings-row-icon">📊</div>
                            <div className="settings-row-text">
                                <span className="settings-row-title">Export Data</span>
                                <span className="settings-row-desc">CSV, PDF</span>
                            </div>
                        </div>
                        <span className="settings-row-chevron">›</span>
                    </div>
                </div>

                {/* About Section */}
                <div className="settings-section">
                    <h3 className="settings-section-label">About</h3>
                    <div className="settings-row">
                        <div className="settings-row-left">
                            <div className="settings-row-icon">ℹ️</div>
                            <div className="settings-row-text">
                                <span className="settings-row-title">Version</span>
                                <span className="settings-row-desc">1.0.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Currency Picker */}
            <BottomSheet open={currencyOpen} onClose={() => setCurrencyOpen(false)} title="Select Currency">
                <div className="currency-list">
                    {CURRENCIES.map(c => (
                        <button
                            key={c.code}
                            className={`currency-item ${settings.currency === c.code ? 'currency-item--selected' : ''}`}
                            onClick={() => {
                                updateSettings({ currency: c.code });
                                setCurrencyOpen(false);
                            }}
                        >
                            <span className="currency-flag">{c.flag}</span>
                            <div className="currency-info">
                                <span className="currency-name">{c.name}</span>
                                <span className="currency-code-badge">{c.code} · {c.symbol}</span>
                            </div>
                            {settings.currency === c.code && (
                                <svg className="currency-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </BottomSheet>
        </div>
    );
}
