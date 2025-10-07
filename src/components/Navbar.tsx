import React from 'react';
import { Home, CheckSquare, Heart, BarChart3, Settings, LogOut, ChevronDown, Clock, Users, GraduationCap } from 'lucide-react';
import type { ViewType } from '../App';

// Custom Brain Logo Component
const BrainLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4C6.5 13 6 14.5 6 16c0 3.5 2.5 6 6 6s6-2.5 6-6c0-1.5-.5-3-1.5-4C17.5 11 18 9.5 18 8c0-3.5-2.5-6-6-6z"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M9 8c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z"
      fill="white"
    />
    <path
      d="M9 16c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z"
      fill="white"
    />
    <circle cx="10.5" cy="8" r="0.5" fill="currentColor" />
    <circle cx="13.5" cy="8" r="0.5" fill="currentColor" />
    <circle cx="10.5" cy="16" r="0.5" fill="currentColor" />
    <circle cx="13.5" cy="16" r="0.5" fill="currentColor" />
  </svg>
);

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  currentUser: string;
  onLogout: () => void;
}

export function Navbar({ currentView, onViewChange, currentUser, onLogout }: NavbarProps) {
  const navItems = [
    { id: 'dashboard' as ViewType, icon: Home, label: 'Dashboard' },
    { id: 'tasks' as ViewType, icon: CheckSquare, label: 'Tasks' },
    { id: 'pomodoro' as ViewType, icon: Clock, label: 'Pomodoro' },
    { id: 'wellness' as ViewType, icon: Heart, label: 'Wellness' },
    { id: 'study-groups' as ViewType, icon: Users, label: 'Study Groups' },
    { id: 'grades' as ViewType, icon: GraduationCap, label: 'Grades' },
    { id: 'analytics' as ViewType, icon: BarChart3, label: 'Analytics' },
    { id: 'settings' as ViewType, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <BrainLogo className="h-8 w-8 text-green-500" />
            <span className="text-xl font-bold text-gray-900">CORE</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Profile */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {currentUser}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{currentUser}</p>
                <p className="text-xs text-gray-500">Student Account</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => onViewChange('settings')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 px-2 py-3">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium min-w-0 flex-shrink-0 transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}