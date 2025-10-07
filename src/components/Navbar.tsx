import React from 'react';
import { Home, CheckSquare, Heart, BarChart3, Settings, LogOut, ChevronDown, Clock, Users, GraduationCap } from 'lucide-react';
import type { ViewType } from '../App';

// Custom Brain Logo Component
const BrainLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Brain outline with rounded lobes */}
    <path
      d="M20 35C20 25 28 15 40 15C45 15 50 17 53 20C56 17 61 15 66 15C78 15 86 25 86 35C86 40 84 45 81 48C84 52 86 57 86 63C86 73 78 83 66 83C61 83 56 81 53 78C50 81 45 83 40 83C28 83 20 73 20 63C20 57 22 52 25 48C22 45 20 40 20 35Z"
      fill="#10B981"
      stroke="#0D9488"
      strokeWidth="2"
    />
    
    {/* Inner brain pattern - left hemisphere */}
    <path
      d="M25 35C25 30 30 25 37 25C42 25 47 28 47 35C47 42 42 47 37 47C30 47 25 42 25 35Z"
      fill="white"
      opacity="0.9"
    />
    
    {/* Inner brain pattern - right hemisphere */}
    <path
      d="M59 35C59 30 64 25 71 25C76 25 81 28 81 35C81 42 76 47 71 47C64 47 59 42 59 35Z"
      fill="white"
      opacity="0.9"
    />
    
    {/* Lower brain sections */}
    <path
      d="M25 63C25 58 30 53 37 53C42 53 47 56 47 63C47 70 42 75 37 75C30 75 25 70 25 63Z"
      fill="white"
      opacity="0.9"
    />
    
    <path
      d="M59 63C59 58 64 53 71 53C76 53 81 56 81 63C81 70 76 75 71 75C64 75 59 70 59 63Z"
      fill="white"
      opacity="0.9"
    />
    
    {/* Central connecting line */}
    <line x1="50" y1="20" x2="50" y2="80" stroke="#0D9488" strokeWidth="2" opacity="0.6"/>
    
    {/* Small detail dots */}
    <circle cx="37" cy="35" r="2" fill="#10B981"/>
    <circle cx="71" cy="35" r="2" fill="#10B981"/>
    <circle cx="37" cy="63" r="2" fill="#10B981"/>
    <circle cx="71" cy="63" r="2" fill="#10B981"/>
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