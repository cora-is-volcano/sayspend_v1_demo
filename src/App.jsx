import { useState, useRef, useCallback } from 'react';
import { TransactionProvider, useTransactions } from './store/transactions';
import BottomNav from './components/BottomNav';
import EditSheet from './components/EditSheet';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

function AppContent() {
  const [page, setPage] = useState('home');
  const [isRecording, setIsRecording] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const recordingTimer = useRef(null);
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

  return (
    <div className="app-shell">
      {page === 'home' && <HomePage isRecording={isRecording} />}
      {page === 'history' && <HistoryPage />}

      <BottomNav
        activePage={page}
        onNavigate={setPage}
        isRecording={isRecording}
        onRecord={handlePointerDown}
        onAdd={() => setAddOpen(true)}
      />

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
    <TransactionProvider>
      <AppContent />
    </TransactionProvider>
  );
}
