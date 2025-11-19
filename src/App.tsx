import { useState, useEffect } from 'react';
// (duplicate useEffect import removed)
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { WellnessTracker } from './components/WellnessTracker';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { PomodoroTimer } from './components/PomodoroTimer';
import { GradeTracker } from './components/GradeTracker';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { AIChatbot } from './components/AIChatbot';
import { authService } from './lib/auth';
import type { User } from '@supabase/supabase-js';

export type ViewType = 'landing' | 'login' | 'dashboard' | 'tasks' | 'wellness' | 'analytics' | 'settings' | 'pomodoro' | 'grades';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());

  useEffect(() => {
    // Initialize auth snapshot
    const user = authService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setCurrentView('dashboard');
    }
    const navHandler = (e: any) => {
      const view = e?.detail?.view as ViewType | undefined;
      if (view) setCurrentView(view);
    };
    window.addEventListener('navigate', navHandler as EventListener);
    const sub = authService.onAuthStateChange(u => {
      setCurrentUser(u);
      setIsAuthenticated(!!u);
      if (!u) setCurrentView('landing');
    });
    return () => {
      window.removeEventListener('navigate', navHandler as EventListener);
      // Supabase v2 returns { data: { subscription } }
      (sub as any)?.data?.subscription?.unsubscribe?.();
    };
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
        return <Dashboard />;
      case 'tasks':
        return <TaskManager />;
      case 'wellness':
        return <WellnessTracker />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings currentUser={(currentUser?.user_metadata as any)?.full_name || ''} onLogout={handleLogout} />;
      case 'pomodoro':
        return <PomodoroTimer />;
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
    // Remove fixed light background so CSS variable based theming can control it.
    <div className="min-h-screen">
      <Navbar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        currentUser={(currentUser?.user_metadata as any)?.full_name || ''}
        onLogout={handleLogout}
      />
      <ToastContainer />
      <AIChatbot />
      <main className="pt-16">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;