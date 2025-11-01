import React, { useEffect, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { WellnessTracker } from './components/WellnessTracker';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { Navbar } from './components/Navbar';

export type ViewType = 'landing' | 'dashboard' | 'tasks' | 'wellness' | 'analytics' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    const apply = (t: string) => {
      const root = document.documentElement;
      if (t === 'dark') {
        root.classList.add('dark');
      } else if (t === 'light') {
        root.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) root.classList.add('dark'); else root.classList.remove('dark');
      }
    };
    apply(savedTheme);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const t = localStorage.getItem('theme') || 'auto';
      if (t === 'auto') {
        const prefersDark = media.matches;
        const root = document.documentElement;
        if (prefersDark) root.classList.add('dark'); else root.classList.remove('dark');
      }
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={handleAuth} />;
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskManager />;
      case 'wellness':
        return <WellnessTracker />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated && currentView === 'landing') {
    return renderCurrentView();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      <main className="pt-16">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;