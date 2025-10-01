import React, { useState } from 'react';
import { useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { WellnessTracker } from './components/WellnessTracker';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { Navbar } from './components/Navbar';
import { authService } from './lib/auth';
import type { User } from './lib/supabase';

export type ViewType = 'landing' | 'login' | 'dashboard' | 'tasks' | 'wellness' | 'analytics' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());

  useEffect(() => {
    // Check for existing authentication on app load
    const user = authService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setCurrentView('dashboard');
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentView('login');
  };

  const handleLogin = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'login':
        return <LoginForm onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard currentUser={currentUser?.full_name || ''} />;
      case 'tasks':
        return <TaskManager />;
      case 'wellness':
        return <WellnessTracker />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings currentUser={currentUser?.full_name || ''} onLogout={handleLogout} />;
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
        currentUser={currentUser?.full_name || ''}
        onLogout={handleLogout}
      />
      <main className="pt-16">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;