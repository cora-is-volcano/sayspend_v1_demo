import { useState, useRef, useEffect, useCallback } from 'react';
import { useTransactions } from '../store/transactions';
import TransactionCard from '../components/TransactionCard';
import EditSheet from '../components/EditSheet';
import DailyDashboard from '../components/DailyDashboard';
import './HomePage.css';

export default function HomePage({ isRecording, onStopRecording }) {
    const { messages, addMessage, getNextDemoResponse, saveAllItems, updateTransaction, deleteTransaction, removeMessageItem } = useTransactions();
    const chatRef = useRef(null);
    const [editItem, setEditItem] = useState(null);
    const [dashboardOpen, setDashboardOpen] = useState(false);
    const [playingMsgId, setPlayingMsgId] = useState(null);
    const playTimerRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    // When recording stops, simulate voice flow
    useEffect(() => {
        if (onStopRecording && !isRecording) {
            // Check if we just stopped recording (handled by parent)
        }
    }, [isRecording, onStopRecording]);

    const handleSendVoice = useCallback((duration) => {
        // Add user voice message
        addMessage({
            type: 'user-voice',
            duration,
            text: getRandomUserText(),
        });

        // Simulate AI processing delay
        setTimeout(() => {
            const response = getNextDemoResponse();
            // Auto-save all items to transactions store
            saveAllItems(response.items);
            addMessage({
                type: 'ai-response',
                text: response.text,
                items: response.items,
            });
        }, 1200);
    }, [addMessage, getNextDemoResponse]);

    // Expose handleSendVoice to parent
    useEffect(() => {
        window.__sayspend_sendVoice = handleSendVoice;
        return () => { delete window.__sayspend_sendVoice; };
    }, [handleSendVoice]);

    function handleItemDelete(msgId, itemId) {
        deleteTransaction(itemId);
        removeMessageItem(msgId, itemId);
    }

    function handleEditSave(updatedItem) {
        // Update in transactions store
        updateTransaction(updatedItem.id, updatedItem);
        // Also update in messages
        setEditItem(null);
    }

    function handleEditDelete(itemId) {
        deleteTransaction(itemId);
        setEditItem(null);
    }

    function togglePlay(msgId, duration) {
        if (playingMsgId === msgId) {
            // Stop playing
            setPlayingMsgId(null);
            clearTimeout(playTimerRef.current);
        } else {
            // Start playing
            setPlayingMsgId(msgId);
            clearTimeout(playTimerRef.current);
            playTimerRef.current = setTimeout(() => {
                setPlayingMsgId(null);
            }, duration * 1000);
        }
    }

    const isEmpty = messages.length === 0;

    return (
        <div className="home-page">
            {/* Header */}
            <header className="home-header">
                <div className="home-header-left">
                    <h1 className="home-title">All Money Spent</h1>
                    <span className="home-subtitle">×</span>
                </div>
                <button
                    className="home-stats-btn"
                    aria-label="Daily Overview"
                    onClick={() => setDashboardOpen(true)}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </button>
            </header>

            {/* Chat Container */}
            <div className="home-chat hide-scrollbar" ref={chatRef}>
                {isEmpty ? (
                    <div className="home-empty">
                        <div className="home-empty-icon">🎙️</div>
                        <p className="home-empty-text">
                            Hold the button below and start add your bookkeeping journey! ✨
                        </p>
                    </div>
                ) : (
                    <div className="home-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`msg msg--${msg.type}`}>
                                {msg.type === 'user-voice' && (
                                    <div className="msg-bubble msg-bubble--user">
                                        <p className="msg-text">{msg.text}</p>
                                        <div className="msg-meta">
                                            <button
                                                className={`msg-duration-btn ${playingMsgId === msg.id ? 'msg-duration-btn--playing' : ''}`}
                                                onClick={() => togglePlay(msg.id, msg.duration)}
                                                aria-label={playingMsgId === msg.id ? "Stop playback" : "Play original audio"}
                                            >
                                                {playingMsgId === msg.id ? (
                                                    <div className="msg-play-anim">
                                                        <span className="msg-bar"></span>
                                                        <span className="msg-bar"></span>
                                                        <span className="msg-bar"></span>
                                                    </div>
                                                ) : (
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M5 3l14 9-14 9V3z" />
                                                    </svg>
                                                )}
                                                <span>{msg.duration}s</span>
                                            </button>
                                            <span className="msg-time">{formatTime(msg.timestamp)}</span>
                                        </div>
                                    </div>
                                )}
                                {msg.type === 'ai-response' && (
                                    <div className="msg-ai">
                                        <p className="msg-ai-text">{msg.text}</p>
                                        <div className="msg-items">
                                            {msg.items?.map(item => (
                                                <TransactionCard
                                                    key={item.id}
                                                    item={item}
                                                    compact
                                                    onEdit={() => setEditItem(item)}
                                                    onDelete={() => handleItemDelete(msg.id, item.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Recording indicator */}
                        {isRecording && (
                            <div className="msg msg--recording">
                                <div className="msg-bubble msg-bubble--user msg-bubble--recording">
                                    <div className="recording-indicator">
                                        <span className="recording-dot" />
                                        <span className="recording-text">Recording...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Sheet */}
            <EditSheet
                open={!!editItem}
                onClose={() => setEditItem(null)}
                item={editItem}
                onSave={handleEditSave}
                onDelete={handleEditDelete}
            />

            {/* Daily Dashboard */}
            <DailyDashboard
                open={dashboardOpen}
                onClose={() => setDashboardOpen(false)}
                onEdit={(item) => {
                    setDashboardOpen(false); // Close dashboard to show edit
                    setTimeout(() => setEditItem(item), 300); // Wait for transition
                }}
            />
        </div>
    );
}

function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
}

const userTexts = [
    "I had coffee and bought some groceries, also took an Uber home",
    "Got lunch at Chipotle and a latte at Starbucks",
    "Paid rent and got my salary today, also Netflix renewed",
    "Went to the movies, got popcorn and paid for parking",
];
let textIndex = 0;
function getRandomUserText() {
    const text = userTexts[textIndex % userTexts.length];
    textIndex++;
    return text;
}
