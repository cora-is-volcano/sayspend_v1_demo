import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sayspend_transactions';
const MESSAGES_KEY = 'sayspend_messages';

const defaultCategories = [
  { id: 'food', label: 'Food & Dining', icon: '🍽️' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'gift', label: 'Gift', icon: '🎁' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'exchange', label: 'Exchange', icon: '💱' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'essentials', label: 'Daily Essentials', icon: '🏠' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'health', label: 'Health', icon: '💊' },
  { id: 'income', label: 'Income', icon: '💰' },
  { id: 'others', label: 'Others', icon: '📦' },
];

// Simulated AI responses for different voice inputs
const demoResponses = [
  {
    text: "Got it! I found 3 items from your recording:",
    items: [
      { name: 'Starbucks Coffee', amount: 5.80, currency: 'USD', category: 'food', type: 'expense', merchant: 'Starbucks', date: '__TODAY__' },
      { name: 'Lunch at Chipotle', amount: 12.50, currency: 'USD', category: 'food', type: 'expense', merchant: 'Chipotle', date: '__TODAY__' },
      { name: 'Uber ride', amount: 15.00, currency: 'USD', category: 'transport', type: 'expense', merchant: 'Uber', date: '__TODAY__' },
    ]
  },
  {
    text: "Here's what I picked up — 2 items:",
    items: [
      { name: 'Grocery shopping', amount: 67.30, currency: 'USD', category: 'essentials', type: 'expense', merchant: 'Whole Foods', date: '__TODAY__' },
      { name: 'Netflix subscription', amount: 15.99, currency: 'USD', category: 'entertainment', type: 'expense', merchant: 'Netflix', date: '__TODAY__' },
    ]
  },
  {
    text: "Recorded! Found 2 transactions:",
    items: [
      { name: 'Salary deposit', amount: 4500.00, currency: 'USD', category: 'income', type: 'income', merchant: 'Employer', date: '__TODAY__' },
      { name: 'Rent payment', amount: 1800.00, currency: 'USD', category: 'essentials', type: 'expense', merchant: 'Landlord', date: '__TODAY__' },
    ]
  },
  {
    text: "Got it! Here are 3 items:",
    items: [
      { name: 'Movie tickets', amount: 24.00, currency: 'USD', category: 'entertainment', type: 'expense', merchant: 'AMC', date: '__TODAY__' },
      { name: 'Popcorn & drinks', amount: 18.50, currency: 'USD', category: 'food', type: 'expense', merchant: 'AMC', date: '__TODAY__' },
      { name: 'Parking', amount: 8.00, currency: 'USD', category: 'transport', type: 'expense', merchant: 'ParkMobile', date: '__TODAY__' },
    ]
  },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState(() => loadFromStorage(STORAGE_KEY, []));
  const [messages, setMessages] = useState(() => loadFromStorage(MESSAGES_KEY, []));
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  const addTransaction = useCallback((tx) => {
    const newTx = { ...tx, id: tx.id || generateId(), createdAt: new Date().toISOString() };
    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  }, []);

  const updateTransaction = useCallback((id, updates) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  const addMessage = useCallback((msg) => {
    const newMsg = { ...msg, id: generateId(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  }, []);

  const getNextDemoResponse = useCallback(() => {
    const response = demoResponses[demoIndex % demoResponses.length];
    setDemoIndex(prev => prev + 1);
    const today = new Date().toISOString().split('T')[0];
    // Add unique IDs and resolve date placeholders
    return {
      ...response,
      items: response.items.map(item => ({
        ...item,
        id: generateId(),
        date: item.date === '__TODAY__' ? today : item.date,
      }))
    };
  }, [demoIndex]);

  const saveAllItems = useCallback((items) => {
    const newTxs = items.map(item => ({
      ...item,
      id: item.id || generateId(),
      createdAt: new Date().toISOString(),
    }));
    setTransactions(prev => [...newTxs, ...prev]);
    return newTxs;
  }, []);

  const removeMessageItem = useCallback((msgId, itemId) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== msgId || !msg.items) return msg;
      return { ...msg, items: msg.items.filter(item => item.id !== itemId) };
    }));
  }, []);

  return (
    <TransactionContext.Provider value={{
      transactions,
      messages,
      categories: defaultCategories,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addMessage,
      getNextDemoResponse,
      saveAllItems,
      removeMessageItem,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be inside TransactionProvider');
  return ctx;
}
