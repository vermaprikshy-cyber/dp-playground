import React, { useState, useEffect } from 'react';
import { AlgorithmDetail } from './types';
import { fetchAlgorithms, fetchHealth } from './lib/api';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Catalogue } from './pages/Catalogue';
import { Workspace } from './pages/Workspace';
import { LearnDP } from './pages/LearnDP';
import { About } from './pages/About';
import { AlertCircle, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [algorithms, setAlgorithms] = useState<AlgorithmDetail[]>([]);
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string>('knapsack_01');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workerReady, setWorkerReady] = useState<boolean>(false);

  useEffect(() => {
    // Initial fetch of algorithms catalog and health status
    Promise.all([
      fetchAlgorithms(),
      fetchHealth().catch(() => ({ status: 'unknown', worker_ready: false })),
    ])
      .then(([algos, health]) => {
        setAlgorithms(algos);
        setWorkerReady(health.worker_ready ?? true);
        if (algos.length > 0 && !algos.some((a) => a.id === selectedAlgorithmId)) {
          setSelectedAlgorithmId(algos[0].id);
        }
      })
      .catch((err) => {
        setError(err.message || 'Could not connect to Dynamic Programming API backend.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSelectAlgorithm = (id: string) => {
    setSelectedAlgorithmId(id);
    setCurrentTab('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeAlgorithm =
    algorithms.find((a) => a.id === selectedAlgorithmId) || algorithms[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} workerReady={workerReady} />

      <div style={{ flex: 1 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '0.75rem', color: '#64748b' }}>
            <Loader2 size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Connecting to Dynamic Programming Engine...</span>
          </div>
        ) : error ? (
          <div className="container" style={{ paddingTop: '3rem', maxWidth: '600px' }}>
            <div className="error-banner">
              <AlertCircle size={20} />
              <div>
                <strong>Connection Error:</strong>
                <p style={{ marginTop: '4px', fontSize: '0.85rem' }}>{error}</p>
                <p style={{ marginTop: '4px', fontSize: '0.8rem', color: '#7f1d1d' }}>
                  Make sure the FastAPI backend is running on port 8000 (<code>uvicorn app.main:app --port 8000</code>).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'home' && (
              <Home
                algorithms={algorithms}
                onSelectAlgorithm={handleSelectAlgorithm}
                onExplore={() => setCurrentTab('catalogue')}
              />
            )}

            {currentTab === 'catalogue' && (
              <Catalogue
                algorithms={algorithms}
                onSelectAlgorithm={handleSelectAlgorithm}
              />
            )}

            {currentTab === 'workspace' && activeAlgorithm && (
              <Workspace
                algorithm={activeAlgorithm}
                onNavigateCatalogue={() => setCurrentTab('catalogue')}
              />
            )}

            {currentTab === 'learn' && <LearnDP />}

            {currentTab === 'about' && <About />}
          </>
        )}
      </div>

      <footer
        style={{
          borderTop: '1px solid var(--border-light)',
          background: '#ffffff',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748b',
          marginTop: 'auto',
        }}
      >
        <div className="container">
          Dynamic Programming Playground • React + TypeScript + FastAPI + C++ Engine
        </div>
      </footer>
    </div>
  );
};

export default App;
