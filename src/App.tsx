import React, { useState } from 'react';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      <main className="pt-16">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;