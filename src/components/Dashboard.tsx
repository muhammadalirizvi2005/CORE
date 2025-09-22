import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, Plus, BookOpen, Briefcase, Users, Coffee, Image, X } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: 'class' | 'work' | 'extracurricular' | 'personal';
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  completed: boolean;
}

export function Dashboard() {
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState('default');

  const wallpapers = [
    { id: 'default', name: 'Default', preview: 'bg-gray-50' },
    { id: 'gradient-blue', name: 'Ocean Breeze', preview: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100' },
    { id: 'gradient-purple', name: 'Purple Dreams', preview: 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100' },
    { id: 'gradient-green', name: 'Forest Fresh', preview: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100' },
    { id: 'gradient-warm', name: 'Sunset Glow', preview: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100' },
    { id: 'gradient-cool', name: 'Arctic Mist', preview: 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50' },
    { id: 'minimal-dark', name: 'Minimal Dark', preview: 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900' },
    { id: 'study-vibes', name: 'Study Vibes', preview: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50' },
  ];

  const getWallpaperClass = (wallpaperId: string) => {
    const wallpaper = wallpapers.find(w => w.id === wallpaperId);
    return wallpaper ? wallpaper.preview : 'bg-gray-50';
  };

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Computer Science Assignment 3',
      category: 'class',
      priority: 'high',
      dueDate: new Date(2024, 0, 15),
      completed: false,
    },
    {
      id: '2',
      title: 'Study for Biology Midterm',
      category: 'class',
      priority: 'high',
      dueDate: new Date(2024, 0, 16),
      completed: false,
    },
    {
      id: '3',
      title: 'Complete internship application',
      category: 'work',
      priority: 'medium',
      dueDate: new Date(2024, 0, 18),
      completed: false,
    },
    {
      id: '4',
      title: 'Club meeting preparation',
      category: 'extracurricular',
      priority: 'low',
      dueDate: new Date(2024, 0, 17),
      completed: false,
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'class': return <BookOpen className="h-4 w-4" />;
      case 'work': return <Briefcase className="h-4 w-4" />;
      case 'extracurricular': return <Users className="h-4 w-4" />;
      default: return <Coffee className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isDarkWallpaper = selectedWallpaper === 'minimal-dark';

  return (
    <div className={`min-h-screen transition-all duration-500 ${getWallpaperClass(selectedWallpaper)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkWallpaper ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <p className={`mt-1 ${isDarkWallpaper ? 'text-gray-300' : 'text-gray-600'}`}>Welcome back, Jane! You have 4 tasks due this week.</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <button
            onClick={() => setShowWallpaperModal(true)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkWallpaper 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            } shadow-sm`}
            title="Change wallpaper"
          >
            <Image className="h-5 w-5" />
          </button>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'today' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              This Week
            </button>
          </div>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Tasks Due Today', value: '3', icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'This Week', value: '8', icon: Calendar, color: 'text-green-600 bg-green-50' },
          { label: 'High Priority', value: '2', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Completed Today', value: '5', icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
        ].map((stat, index) => (
          <div key={index} className={`p-6 rounded-xl shadow-sm backdrop-blur-sm ${
            isDarkWallpaper ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/80'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkWallpaper ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${isDarkWallpaper ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Tasks */}
        <div className={`lg:col-span-2 rounded-xl shadow-sm p-6 backdrop-blur-sm ${
          isDarkWallpaper ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/80'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkWallpaper ? 'text-white' : 'text-gray-900'}`}>
            {viewMode === 'today' ? "Today's Tasks" : "This Week's Tasks"}
          </h2>
          
          <div className="space-y-4">
            {mockTasks.map((task) => (
              <div key={task.id} className={`flex items-center space-x-4 p-4 border rounded-lg hover:shadow-sm transition-all ${
                isDarkWallpaper 
                  ? 'border-gray-600 hover:bg-gray-700/50' 
                  : 'border-gray-200 hover:bg-gray-50/50'
              }`}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                
                <div className={`p-2 rounded-lg ${getPriorityColor(task.category)}`}>
                  {getCategoryIcon(task.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${isDarkWallpaper ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                  <p className={`text-xs mt-1 ${isDarkWallpaper ? 'text-gray-400' : 'text-gray-500'}`}>
                    Due {task.dueDate.toLocaleDateString()}
                  </p>
                </div>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wellness & Quick Actions */}
        <div className="space-y-6">
          {/* Wellness Check */}
          <div className={`p-6 rounded-xl backdrop-blur-sm ${
            isDarkWallpaper 
              ? 'bg-gray-800/80 border border-gray-700' 
              : 'bg-gradient-to-br from-green-50 to-blue-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkWallpaper ? 'text-white' : 'text-gray-900'}`}>Wellness Check</h3>
            <p className={`text-sm mb-4 ${isDarkWallpaper ? 'text-gray-400' : 'text-gray-600'}`}>How are you feeling today?</p>
            
            <div className="flex space-x-2 mb-4">
              {['😊', '😐', '😔', '😴', '🤯'].map((emoji, index) => (
                <button
                  key={index}
                  className={`p-3 rounded-lg transition-colors shadow-sm ${
                    isDarkWallpaper 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                </button>
              ))}
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkWallpaper ? 'bg-gray-700' : 'bg-white'
            }`}>
              <p className={`text-sm font-medium mb-2 ${isDarkWallpaper ? 'text-gray-300' : 'text-gray-700'}`}>💡 Daily Tip</p>
              <p className={`text-xs ${isDarkWallpaper ? 'text-gray-400' : 'text-gray-600'}`}>
                Remember to take a 10-minute break every hour. Your brain will thank you!
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`p-6 rounded-xl shadow-sm backdrop-blur-sm ${
            isDarkWallpaper ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/80'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkWallpaper ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
            
            <div className="space-y-3">
              <button className={`w-full text-left p-3 rounded-lg transition-colors border ${
                isDarkWallpaper 
                  ? 'border-gray-600 hover:bg-gray-700' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <p className={`font-medium ${isDarkWallpaper ? 'text-white' : 'text-gray-900'}`}>🔗 Sync with Canvas</p>
                <p className={`text-xs ${isDarkWallpaper ? 'text-gray-400' : 'text-gray-500'}`}>Import assignments automatically</p>
              </button>
              
              <button className={`w-full text-left p-3 rounded-lg transition-colors border ${
                isDarkWallpaper 
                  ? 'border-gray-600 hover:bg-gray-700' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <p className={`font-medium ${isDarkWallpaper ? 'text-white' : 'text-gray-900'}`}>📅 Connect Google Calendar</p>
                <p className={`text-xs ${isDarkWallpaper ? 'text-gray-400' : 'text-gray-500'}`}>Keep everything in sync</p>
              </button>
              
              <button className={`w-full text-left p-3 rounded-lg transition-colors border ${
                isDarkWallpaper 
                  ? 'border-gray-600 hover:bg-gray-700' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <p className={`font-medium ${isDarkWallpaper ? 'text-white' : 'text-gray-900'}`}>🤖 AI Study Planner</p>
                <p className={`text-xs ${isDarkWallpaper ? 'text-gray-400' : 'text-gray-500'}`}>Get personalized recommendations</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallpaper Selection Modal */}
      {showWallpaperModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Choose Your Wallpaper</h2>
              <button
                onClick={() => setShowWallpaperModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {wallpapers.map((wallpaper) => (
                <button
                  key={wallpaper.id}
                  onClick={() => {
                    setSelectedWallpaper(wallpaper.id);
                    setShowWallpaperModal(false);
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedWallpaper === wallpaper.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-24 rounded-lg mb-3 ${wallpaper.preview}`} />
                  <p className={`text-sm font-medium ${
                    wallpaper.id === 'minimal-dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {wallpaper.name}
                  </p>
                  {selectedWallpaper === wallpaper.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Choose a wallpaper that helps you stay focused and motivated during your study sessions!
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}