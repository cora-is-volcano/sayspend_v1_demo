import { useState, useRef, useCallback } from 'react';
import { TransactionProvider, useTransactions } from './store/transactions';
import { ThemeProvider } from './store/theme';
import { SettingsProvider } from './store/settings';
import BottomNav from './components/BottomNav';
import EditSheet from './components/EditSheet';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function AppContent() {
  const [page, setPage] = useState('home');
  const [isRecording, setIsRecording] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const recordStartTime = useRef(null);
  const { addTransaction } = useTransactions();

  const handleRecordStart = useCallback(() => {
    setIsRecording(true);
    recordStartTime.current = Date.now();

    // Auto-navigate to home when recording starts
    setPage('home');
  }, []);

  const handleRecordEnd = useCallback(() => {
    if (!isRecording) return;
    setIsRecording(false);

    const duration = Math.round((Date.now() - (recordStartTime.current || Date.now())) / 1000);
    const finalDuration = Math.max(duration, 2); // minimum 2s

    // Trigger the voice send in HomePage
    setTimeout(() => {
      window.__sayspend_sendVoice?.(finalDuration);
    }, 100);
  }, [isRecording]);

  // Pointer events for press-and-hold
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    handleRecordStart();

    const onPointerUp = () => {
      handleRecordEnd();
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
    };

    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
  }, [handleRecordStart, handleRecordEnd]);

  function handleAddSave(item) {
    addTransaction(item);
    setAddOpen(false);
  }

  // Bottom nav tabs — settings is reached from within profile
  const navPages = ['home', 'history', 'profile'];

  return (
    <div className="app-shell">
      {page === 'home' && <HomePage isRecording={isRecording} />}
      {page === 'history' && <HistoryPage />}
      {page === 'profile' && <ProfilePage onNavigate={setPage} />}
      {page === 'settings' && <SettingsPage onBack={() => setPage('profile')} />}

      {navPages.includes(page) || page === 'settings' ? (
        <BottomNav
          activePage={page}
          onNavigate={setPage}
          isRecording={isRecording}
          onRecord={handlePointerDown}
          onAdd={() => setAddOpen(true)}
        />
      ) : null}

      {/* Manual Add Sheet */}
      <EditSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        item={null}
        onSave={handleAddSave}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <TransactionProvider>
          <AppContent />
        </TransactionProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
