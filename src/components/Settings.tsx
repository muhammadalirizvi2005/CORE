import React, { useState } from 'react';
import { authService } from '../lib/auth';
import { User, Bell, Calendar, Palette, Shield, HelpCircle, LogOut } from 'lucide-react';
import { Modal } from './Modal';
import { getStoredTheme, setTheme as applyAppTheme, ThemeMode } from '../lib/theme';

interface SettingsProps {
  currentUser: string;
  onLogout: () => void;
}

export function Settings({ currentUser, onLogout }: SettingsProps) {
  type Notifications = {
    taskReminders: boolean;
    wellnessCheckins: boolean;
    deadlineAlerts: boolean;
    weeklyReports: boolean;
  };

  const [notifications, setNotifications] = useState<Notifications>({
    taskReminders: true,
    wellnessCheckins: true,
    deadlineAlerts: true,
    weeklyReports: false,
  });

  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  // Keep local UI state in sync with the centralized theme implementation.
  React.useEffect(() => {
    setTheme(getStoredTheme());
    const handler = (e: any) => {
      try {
        const t = e?.detail?.theme || getStoredTheme();
        setTheme(t as ThemeMode);
      } catch {
        setTheme(getStoredTheme());
      }
    };
    window.addEventListener('theme-changed', handler as EventListener);
    return () => window.removeEventListener('theme-changed', handler as EventListener);
  }, []);

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const dispatchToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
  };

  // Modal flow state (used instead of window.prompt)
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState('');
  const [modalPlaceholder, setModalPlaceholder] = React.useState('');
  const [modalInitial, setModalInitial] = React.useState('');
  const [modalHandler, setModalHandler] = React.useState<((v: string) => void) | null>(null);

  const openModal = (title: string, placeholder: string, initial: string, handler: (v: string) => void) => {
    setModalTitle(title);
    setModalPlaceholder(placeholder);
    setModalInitial(initial);
    setModalHandler(() => handler);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalHandler(null);
  };

  // Profile persistence
  type Profile = {
    name: string;
    email: string;
    university: string;
    graduationYear: string;
  };

  const [profile, setProfile] = React.useState<Profile>(() => ({
    name: currentUser || '',
    email: `${currentUser?.toLowerCase() || ''}@university.edu`,
    university: localStorage.getItem('profile_university') || 'State University',
    graduationYear: localStorage.getItem('profile_graduationYear') || '2025',
  }));

  const saveProfile = () => {
    localStorage.setItem('profile_name', profile.name);
    localStorage.setItem('profile_email', profile.email);
    localStorage.setItem('profile_university', profile.university);
    localStorage.setItem('profile_graduationYear', profile.graduationYear);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Profile saved', type: 'success' } }));
  };

  // Canvas persisted connections (use state so UI updates immediately)
  const [canvasBaseUrl, setCanvasBaseUrl] = React.useState<string | null>(null);
  const [canvasConnected, setCanvasConnected] = React.useState<boolean>(false);

  // Course platform links
  type CourseLink = {
    id: string;
    name: string;
    url: string;
    platform: string;
  };

  const [courseLinks, setCourseLinks] = React.useState<CourseLink[]>(() => {
    const saved = localStorage.getItem('courseLinks');
    return saved ? JSON.parse(saved) : [];
  });

  const addCourseLink = (name: string, url: string, platform: string) => {
    const newLink: CourseLink = {
      id: Date.now().toString(),
      name,
      url,
      platform
    };
    const updated = [...courseLinks, newLink];
    setCourseLinks(updated);
    localStorage.setItem('courseLinks', JSON.stringify(updated));
    dispatchToast('Course link added', 'success');
  };

  const removeCourseLink = (id: string) => {
    const updated = courseLinks.filter(link => link.id !== id);
    setCourseLinks(updated);
    localStorage.setItem('courseLinks', JSON.stringify(updated));
    dispatchToast('Course link removed', 'success');
  };

  const [addLinkModalOpen, setAddLinkModalOpen] = React.useState(false);
  const [newLinkName, setNewLinkName] = React.useState('');
  const [newLinkUrl, setNewLinkUrl] = React.useState('');
  const [newLinkPlatform, setNewLinkPlatform] = React.useState('Moodle');

  const handleCanvasSubmit = (input: string) => {
    if (!input) return closeModal();
    const url = input.startsWith('http') ? input : `https://${input}`;
    try {
      const u = new URL(url);
      if (!u.hostname.includes('instructure.com') && !u.hostname.includes('canvas.')) {
        dispatchToast('That does not look like a valid Canvas domain.', 'error');
        return;
      }
      const saved = `https://${u.hostname}`;
      localStorage.setItem('canvasBaseUrl', saved);
      setCanvasBaseUrl(saved);
      // persist to Supabase users table if logged in
      const user = authService.getCurrentUser();
      if (user) {
        authService.updateUserConnections(user.id, { canvas_base_url: saved, canvas_connected: true })
          .then(() => dispatchToast('Canvas connection saved', 'success'))
          .catch((err) => {
            console.error('Error saving canvas connection to Supabase:', err);
            dispatchToast('Saved locally but failed to persist to server', 'error');
          });
      } else {
        dispatchToast('Canvas connection saved locally', 'success');
      }
      closeModal();
    } catch {
      dispatchToast('Please enter a valid URL.', 'error');
    }
  };

  const openCanvas = () => {
    const oauthServer = import.meta.env.VITE_OAUTH_SERVER;
    const user = authService.getCurrentUser();
    if (oauthServer && user && canvasBaseUrl) {
      const startUrl = `${oauthServer.replace(/\/$/, '')}/oauth/canvas/start?state=${encodeURIComponent(user.id)}&canvas_base=${encodeURIComponent(canvasBaseUrl)}`;
      dispatchToast('Redirecting to Canvas to complete connection...', 'info');
      window.location.href = startUrl;
      return;
    }

    // fallback: ask user for their Canvas domain
    openModal('Connect Canvas', 'your-school.instructure.com', '', handleCanvasSubmit);
  };

  const disconnectCanvas = () => {
    localStorage.removeItem('canvasBaseUrl');
    setCanvasBaseUrl(null);
    const user = authService.getCurrentUser();
    if (user) {
      authService.updateUserConnections(user.id, { canvas_base_url: null, canvas_connected: false })
        .then(() => dispatchToast('Canvas disconnected', 'success'))
        .catch((err) => {
          console.error('Error clearing canvas connection on server:', err);
          dispatchToast('Disconnected locally but failed to update server', 'error');
        });
    } else {
      dispatchToast('Canvas disconnected locally', 'info');
    }
  };

  const getCanvasBaseUrl = (): string | null => {
    const saved = localStorage.getItem('canvasBaseUrl');
    return saved && saved.startsWith('http') ? saved : null;
  };

  // Load notifications, profile, and connection URLs from localStorage on mount
  React.useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch {
        // ignore parse errors
      }
    }

    // Load profile fields if saved
    const savedName = localStorage.getItem('profile_name');
    const savedEmail = localStorage.getItem('profile_email');
    const savedUni = localStorage.getItem('profile_university');
    const savedGrad = localStorage.getItem('profile_graduationYear');
    setProfile((prev: Profile) => ({
      name: savedName || prev.name,
      email: savedEmail || prev.email,
      university: savedUni || prev.university,
      graduationYear: savedGrad || prev.graduationYear,
    }));

    // Load persisted Canvas connection (local)
    const savedCanvas = localStorage.getItem('canvasBaseUrl');
    setCanvasBaseUrl(savedCanvas && (savedCanvas.startsWith('http') ? savedCanvas : null));

    // If logged in, hydrate from server so users don't need to relink
    const u = authService.getCurrentUser();
    if (u) {
      authService.fetchUserConnections(u.id)
        .then((conns) => {
          // Update local state and localStorage to keep Navbar and other components in sync
          setCanvasConnected(Boolean(conns.canvas_connected));
          if (conns.canvas_base_url) {
            localStorage.setItem('canvasBaseUrl', conns.canvas_base_url);
            setCanvasBaseUrl(conns.canvas_base_url);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user connections:', err);
        });
    }

    // Handle OAuth callback query flags, show toast and refresh connections
    const params = new URLSearchParams(window.location.search);
    const oauthResult = params.get('oauth');
    if (oauthResult === 'canvas_success') {
      dispatchToast('Canvas connected', 'success');
      if (u) {
        authService.fetchUserConnections(u.id)
          .then((conns) => {
            setCanvasConnected(Boolean(conns.canvas_connected));
            if (conns.canvas_base_url) {
              localStorage.setItem('canvasBaseUrl', conns.canvas_base_url);
              setCanvasBaseUrl(conns.canvas_base_url);
            }
          })
          .catch(() => {});
      }
      // Clean up the query param
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Render modal component and pass handlers
  const renderModal = () => (
    <Modal
      title={modalTitle}
      initialValue={modalInitial}
      open={modalOpen}
      onClose={closeModal}
      placeholder={modalPlaceholder}
      onSubmit={(v: string) => {
        if (modalHandler) modalHandler(v);
      }}
    />
  );

  // Persist notifications whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Customize your CORE experience</p>
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
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
              <input
                type="text"
                value={profile.university}
                onChange={(e) => setProfile(prev => ({ ...prev, university: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
              <select
                value={profile.graduationYear}
                onChange={(e) => setProfile(prev => ({ ...prev, graduationYear: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>2025</option>
                <option>2026</option>
                <option>2027</option>
                <option>2028</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <button onClick={saveProfile} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
            Integration & Resources
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Canvas LMS</h3>
                  <p className="text-sm text-gray-600">Import assignments and due dates automatically</p>
                </div>
                {canvasConnected || getCanvasBaseUrl() ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">Connected</span>
                    <button
                      onClick={openCanvas}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={disconnectCanvas}
                      className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openCanvas}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
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
          </div>
        </div>

        {/* Course Platform Links */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                Course Platform Links
              </h2>
              <p className="text-sm text-gray-600 mt-1">Add links to Moodle, Blackboard, or other course platforms</p>
            </div>
            <button
              onClick={() => setAddLinkModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + Add Link
            </button>
          </div>
          
          <div className="space-y-3">
            {courseLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No course platform links added yet</p>
                <p className="text-xs text-gray-400">Add links to Moodle, Blackboard, or other platforms</p>
              </div>
            ) : (
              courseLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{link.name}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{link.platform}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">{link.url}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openExternal(link.url)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => removeCourseLink(link.id)}
                      className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
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
                    onClick={() => { setTheme(themeOption as ThemeMode); applyAppTheme(themeOption); }}
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
            <button onClick={() => dispatchToast('Privacy & Security is coming soon', 'info')} className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center">
              <Shield className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Privacy & Security</h3>
                <p className="text-sm text-gray-600">Manage your data and privacy settings</p>
              </div>
            </button>
            
            <button onClick={() => openExternal('mailto:support@core.app')} className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center">
              <HelpCircle className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Help & Support</h3>
                <p className="text-sm text-gray-600">Get help and contact support</p>
              </div>
            </button>
            
            <button 
              onClick={onLogout}
              className="w-full text-left p-3 hover:bg-red-50 rounded-lg flex items-center text-red-600"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <div>
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-sm text-red-500">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
        {renderModal()}
        
        {/* Add Course Link Modal */}
        {addLinkModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Course Platform Link</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                  <input
                    type="text"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    placeholder="e.g., Computer Science 101"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <select
                    value={newLinkPlatform}
                    onChange={(e) => setNewLinkPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Moodle">Moodle</option>
                    <option value="Blackboard">Blackboard</option>
                    <option value="Google Classroom">Google Classroom</option>
                    <option value="Brightspace">Brightspace</option>
                    <option value="Schoology">Schoology</option>
                    <option value="Sakai">Sakai</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course URL</label>
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://moodle.university.edu/course/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    if (newLinkName && newLinkUrl) {
                      const url = newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`;
                      addCourseLink(newLinkName, url, newLinkPlatform);
                      setNewLinkName('');
                      setNewLinkUrl('');
                      setNewLinkPlatform('Moodle');
                      setAddLinkModalOpen(false);
                    } else {
                      dispatchToast('Please fill in all fields', 'error');
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Link
                </button>
                <button
                  onClick={() => {
                    setNewLinkName('');
                    setNewLinkUrl('');
                    setNewLinkPlatform('Moodle');
                    setAddLinkModalOpen(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}