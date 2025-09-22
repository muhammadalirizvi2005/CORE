import React from 'react';
import { Home, CheckSquare, Heart, BarChart3, Settings, BookOpen } from 'lucide-react';
import type { ViewType } from '../App';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const navItems = [
    { id: 'dashboard' as ViewType, icon: Home, label: 'Dashboard' },
    { id: 'tasks' as ViewType, icon: CheckSquare, label: 'Tasks' },
    { id: 'wellness' as ViewType, icon: Heart, label: 'Wellness' },
    { id: 'analytics' as ViewType, icon: BarChart3, label: 'Analytics' },
    { id: 'settings' as ViewType, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">StudyHub</span>
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
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JS</span>
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