import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react';
import { Modal } from './Modal';
import { databaseService } from '../lib/database';
import { authService } from '../lib/auth';

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [sessions, setSessions] = useState(0);
  const [customTimes, setCustomTimes] = useState({
    work: 25,
    shortBreak: 5,
    longBreak: 15
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);

  const dispatchToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
  };

  const openExternal = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const modes = {
    work: { duration: customTimes.work * 60, label: 'Focus Time', icon: Brain, color: 'bg-red-500' },
    shortBreak: { duration: customTimes.shortBreak * 60, label: 'Short Break', icon: Coffee, color: 'bg-green-500' },
    longBreak: { duration: customTimes.longBreak * 60, label: 'Long Break', icon: Coffee, color: 'bg-blue-500' }
  };

  useEffect(() => {
    // persist sessions count
    try {
      localStorage.setItem('pomodoro_sessions', String(sessions));
    } catch {}
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      setIsActive(false);
      
      // Save completed session to database
      saveSession(true);
      
      if (mode === 'work') {
        setSessions(prev => prev + 1);
        // Auto-switch to break
        const nextMode = sessions > 0 && (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(modes[nextMode].duration);
      } else {
        // Break finished, switch to work
        setMode('work');
        setTimeLeft(modes.work.duration);
      }
      
      // Play notification sound (browser notification)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${modes[mode].label} completed!`, {
          body: mode === 'work' ? 'Time for a break!' : 'Ready to focus?',
          icon: '/vite.svg'
        });
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, sessions]);

  // Load persisted pomodoro settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pomodoro_customTimes');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomTimes(prev => ({ ...prev, ...parsed }));
      }
      const savedSessions = localStorage.getItem('pomodoro_sessions');
      if (savedSessions) setSessions(Number(savedSessions) || 0);
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist custom times whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('pomodoro_customTimes', JSON.stringify(customTimes));
    } catch {}
    // update timeLeft when durations change to reflect current mode
    const durations = {
      work: customTimes.work * 60,
      shortBreak: customTimes.shortBreak * 60,
      longBreak: customTimes.longBreak * 60,
    } as const;
    setTimeLeft(durations[mode]);
  }, [customTimes, mode]);

  const saveSession = async (completed: boolean) => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        await databaseService.createPomodoroSession(user.id, {
          session_type: mode,
          duration_minutes: modes[mode].duration / 60,
          completed,
          task_id: null
        });
      }
    } catch (error) {
      console.error('Error saving pomodoro session:', error);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].duration);
    
    // Save incomplete session if there was progress
    if (timeLeft < modes[mode].duration) {
      saveSession(false);
    }
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pomodoro Timer</h1>
        <p className="text-gray-600 mt-1">Stay focused with the proven Pomodoro Technique</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Mode Selector */}
            <div className="flex justify-center space-x-2 mb-8">
              {Object.entries(modes).map(([key, modeData]) => (
                <button
                  key={key}
                  onClick={() => switchMode(key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    mode === key
                      ? `${modeData.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <modeData.icon className="h-4 w-4 inline mr-2" />
                  {modeData.label}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="relative mb-8">
              <div className="w-64 h-64 mx-auto relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className={`transition-all duration-1000 ${
                      mode === 'work' ? 'text-red-500' :
                      mode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Session {sessions + 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleTimer}
                className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
                  isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="h-5 w-5 inline mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 inline mr-2" />
                    Start
                  </>
                )}
              </button>
              
              <button
                onClick={resetTimer}
                className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="h-5 w-5 inline mr-2" />
                Reset
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Timer Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customTimes.work}
                    onChange={(e) => setCustomTimes(prev => ({ ...prev, work: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={customTimes.shortBreak}
                    onChange={(e) => setCustomTimes(prev => ({ ...prev, shortBreak: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customTimes.longBreak}
                    onChange={(e) => setCustomTimes(prev => ({ ...prev, longBreak: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats & Tips */}
        <div className="space-y-6">
          {/* Session Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Sessions</span>
                <span className="text-2xl font-bold text-blue-600">{sessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Focus Time</span>
                <span className="text-lg font-semibold text-green-600">
                  {Math.floor(sessions * customTimes.work / 60)}h {(sessions * customTimes.work) % 60}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Streak</span>
                <span className="text-lg font-semibold text-orange-600">3 days</span>
              </div>
            </div>
          </div>

          {/* Pomodoro Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Pomodoro Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700">Focus on one task during each session</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-700">Take breaks seriously - step away from your desk</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p className="text-gray-700">After 4 sessions, take a longer 15-30 minute break</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <p className="text-gray-700">Turn off notifications during focus time</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => openExternal('https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">🎵 Focus Playlist</div>
                <div className="text-sm text-gray-500">Open Spotify focus music</div>
              </button>
              <button
                onClick={() => {
                  setDndEnabled(v => {
                    const next = !v;
                    dispatchToast(next ? 'Do Not Disturb enabled' : 'Do Not Disturb disabled', 'info');
                    return next;
                  });
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">📱 Do Not Disturb</div>
                <div className="text-sm text-gray-500">Toggle distraction blocking (local only)</div>
              </button>
              <button
                onClick={() => setShowQuickNoteModal(true)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">📝 Quick Note</div>
                <div className="text-sm text-gray-500">Jot down a quick thought</div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Note Modal */}
      <Modal
        title="Quick Note"
        placeholder="Write a short note..."
        initialValue=""
        open={showQuickNoteModal}
        onClose={() => setShowQuickNoteModal(false)}
        onSubmit={(v: string) => {
          try {
            const saved = JSON.parse(localStorage.getItem('quick_notes') || '[]');
            saved.unshift({ text: v, created_at: new Date().toISOString() });
            localStorage.setItem('quick_notes', JSON.stringify(saved));
            dispatchToast('Note saved', 'success');
          } catch (err) {
            console.error('Error saving quick note:', err);
            dispatchToast('Failed to save note', 'error');
          }
          setShowQuickNoteModal(false);
        }}
      />
    </div>
  );
}