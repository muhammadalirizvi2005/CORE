import React, { useState } from 'react';
import { User, Bell, Calendar, Palette, Shield, HelpCircle, LogOut } from 'lucide-react';

export function Settings() {
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    wellnessCheckins: true,
    deadlineAlerts: true,
    weeklyReports: false,
  });

  const [theme, setTheme] = useState('light');

  const applyTheme = (t: string) => {
    localStorage.setItem('theme', t);
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else if (t === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark'); else root.classList.remove('dark');
    }
  };

  React.useEffect(() => {
    const saved = localStorage.getItem('theme') || 'auto';
    setTheme(saved);
  }, []);

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getCanvasBaseUrl = (): string | null => {
    const saved = localStorage.getItem('canvasBaseUrl');
    return saved && saved.startsWith('https://') ? saved : null;
  };

  const promptForCanvasUrl = (): string | null => {
    const input = window.prompt('Enter your Canvas URL (e.g., https://your-school.instructure.com):');
    if (!input) return null;
    const url = input.startsWith('http') ? input : `https://${input}`;
    try {
      const u = new URL(url);
      if (!u.hostname.includes('instructure.com') && !u.hostname.includes('canvas.')) {
        alert('That does not look like a valid Canvas domain.');
        return null;
      }
      localStorage.setItem('canvasBaseUrl', `https://${u.hostname}`);
      return `https://${u.hostname}`;
    } catch {
      alert('Please enter a valid URL.');
      return null;
    }
  };

  const openCanvas = () => {
    const base = getCanvasBaseUrl() || promptForCanvasUrl();
    if (base) openExternal(`${base}/login`);
  };

  const getEmailWebUrl = (): string | null => {
    const saved = localStorage.getItem('emailWebUrl');
    return saved && saved.startsWith('https://') ? saved : null;
  };

  const promptForEmailWebUrl = (): string | null => {
    const input = window.prompt('Enter your email web URL (e.g., https://mail.google.com or https://outlook.office.com):');
    if (!input) return null;
    const url = input.startsWith('http') ? input : `https://${input}`;
    try {
      const u = new URL(url);
      localStorage.setItem('emailWebUrl', `${u.protocol}//${u.hostname}`);
      return `${u.protocol}//${u.hostname}`;
    } catch {
      alert('Please enter a valid URL.');
      return null;
    }
  };

  const openEmail = () => {
    const base = getEmailWebUrl() || promptForEmailWebUrl();
    if (base) openExternal(base);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Customize your StudyHub experience</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 text-gray-600 mr-2" />
            Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Jane Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="jane.smith@university.edu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
              <input
                type="text"
                defaultValue="State University"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>2025</option>
                <option>2026</option>
                <option>2027</option>
                <option>2028</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Save Profile
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 text-gray-600 mr-2" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            {[
              { key: 'taskReminders', label: 'Task Reminders', description: 'Get notified about upcoming deadlines' },
              { key: 'wellnessCheckins', label: 'Wellness Check-ins', description: 'Daily reminders to track your mood and stress' },
              { key: 'deadlineAlerts', label: 'Deadline Alerts', description: 'Urgent notifications for approaching deadlines' },
              { key: 'weeklyReports', label: 'Weekly Reports', description: 'Summary of your productivity and wellness' },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <h3 className="font-medium text-gray-900">{setting.label}</h3>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[setting.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications(prev => ({
                      ...prev,
                      [setting.key]: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar & Career Integration */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 text-gray-600 mr-2" />
            Calendar & Career Integration
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Google Calendar</h3>
                  <p className="text-sm text-gray-600">Sync tasks and deadlines with your Google Calendar</p>
                </div>
                <button
                  onClick={() => openExternal('https://calendar.google.com')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Canvas LMS</h3>
                  <p className="text-sm text-gray-600">Import assignments and due dates automatically</p>
                </div>
                <button
                  onClick={openCanvas}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Handshake</h3>
                  <p className="text-sm text-gray-600">Discover jobs and internships through your university</p>
                </div>
                <button
                  onClick={() => openExternal('https://app.joinhandshake.com')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Open
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-sm text-gray-600">Open your email provider (Gmail, Outlook, etc.)</p>
                </div>
                <button
                  onClick={openEmail}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Palette className="h-5 w-5 text-gray-600 mr-2" />
            Appearance
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="flex space-x-4">
                {['light', 'dark', 'auto'].map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => { setTheme(themeOption); applyTheme(themeOption); }}
                    className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                      theme === themeOption
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {themeOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Other Settings</h2>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center">
              <Shield className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Privacy & Security</h3>
                <p className="text-sm text-gray-600">Manage your data and privacy settings</p>
              </div>
            </button>
            
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center">
              <HelpCircle className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Help & Support</h3>
                <p className="text-sm text-gray-600">Get help and contact support</p>
              </div>
            </button>
            
            <button className="w-full text-left p-3 hover:bg-red-50 rounded-lg flex items-center text-red-600">
              <LogOut className="h-5 w-5 mr-3" />
              <div>
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-sm text-red-500">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}