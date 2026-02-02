import { useState } from 'react';
import { RequestProvider, useRequests } from './context/RequestContext';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import ViewToggle from './components/ViewToggle';
import RequestModal from './components/RequestModal';
import './styles/global.css';
import './App.css';

function AppContent() {
  const { viewMode, loading, error } = useRequests();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header glass-panel">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">📝 同事需求管理系統</h1>
            <button
              className="glass-button glass-button-primary add-request-btn"
              onClick={() => setIsFormOpen(true)}
            >
              ＋ 新增需求
            </button>
          </div>
          <ViewToggle />
        </div>
      </header>

      <main className="app-main">
        <section className="content">
          {loading && (
            <div className="loading-state">
              <span>載入中...</span>
            </div>
          )}

          {error && (
            <div className="error-state glass-card">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!loading && (
            viewMode === 'kanban' ? <KanbanBoard /> : <ListView />
          )}
        </section>
      </main>

      <RequestModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <RequestProvider>
      <AppContent />
    </RequestProvider>
  );
}

export default App;
