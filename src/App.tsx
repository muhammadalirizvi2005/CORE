import React, { useState } from 'react';
import { useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { WellnessTracker } from './components/WellnessTracker';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { PomodoroTimer } from './components/PomodoroTimer';
import { StudyGroups } from './components/StudyGroups';
import { GradeTracker } from './components/GradeTracker';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { authService } from './lib/auth';
import type { User } from './lib/supabase';

export type ViewType = 'landing' | 'login' | 'dashboard' | 'tasks' | 'wellness' | 'analytics' | 'settings' | 'pomodoro' | 'study-groups' | 'grades';

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
    // Listen for app-level navigation events dispatched by child components
    const onNavigate = (e: any) => {
      try {
        const view = e?.detail?.view as ViewType | undefined;
        if (view) setCurrentView(view);
      } catch {}
    };
    window.addEventListener('navigate', onNavigate as EventListener);
    return () => window.removeEventListener('navigate', onNavigate as EventListener);
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
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'study-groups':
        return <StudyGroups />;
      case 'grades':
        return <GradeTracker />;
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
      <ToastContainer />
      <main className="pt-16">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;