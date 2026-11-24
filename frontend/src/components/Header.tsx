import React from 'react';
import { Layers, BookOpen, Compass, Info } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  workerReady?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, workerReady = true }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('home');
          }}
          className="header-brand"
        >
          <Layers size={26} />
          <span>DP Playground</span>
        </a>

        <nav className="header-nav" aria-label="Main Navigation">
          <button
            onClick={() => onSelectTab('catalogue')}
            className={`nav-link ${currentTab === 'catalogue' ? 'active' : ''}`}
          >
            <Compass size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Algorithms
          </button>
          <button
            onClick={() => onSelectTab('workspace')}
            className={`nav-link ${currentTab === 'workspace' ? 'active' : ''}`}
          >
            <Layers size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Workspace
          </button>
          <button
            onClick={() => onSelectTab('learn')}
            className={`nav-link ${currentTab === 'learn' ? 'active' : ''}`}
          >
            <BookOpen size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Learn DP
          </button>
          <button
            onClick={() => onSelectTab('about')}
            className={`nav-link ${currentTab === 'about' ? 'active' : ''}`}
          >
            <Info size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            About
          </button>
        </nav>

        <div className="health-badge" title={workerReady ? 'FastAPI + C++ engine ready' : 'Connecting to engine...'}>
          <span className="health-dot" style={{ backgroundColor: workerReady ? '#0d9488' : '#eab308' }} />
          <span>{workerReady ? 'Engine Ready' : 'Connecting...'}</span>
        </div>
      </div>
    </header>
  );
};
