import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { WellnessTracker } from './components/WellnessTracker';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { Navbar } from './components/Navbar';

export type ViewType = 'landing' | 'login' | 'dashboard' | 'tasks' | 'wellness' | 'analytics' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  const handleGetStarted = () => {
    setCurrentView('login');
  };

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setCurrentView('landing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'login':
        return <LoginForm onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />;
      case 'tasks':
        return <TaskManager />;
      case 'wellness':
        return <WellnessTracker />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings currentUser={currentUser} onLogout={handleLogout} />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return renderCurrentView();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="pt-16">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;