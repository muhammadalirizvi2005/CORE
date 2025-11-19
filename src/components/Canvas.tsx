import { useState, useEffect } from 'react';
import { ExternalLink, BookOpen, FileText, Calendar, AlertCircle } from 'lucide-react';

export function Canvas() {
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load Canvas URL from localStorage
    const savedUrl = localStorage.getItem('canvasBaseUrl');
    if (savedUrl && savedUrl.startsWith('http')) {
      setCanvasUrl(savedUrl);
      setIsConnected(true);
    }
  }, []);

  const openCanvas = () => {
    if (canvasUrl) {
      window.open(canvasUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const openCanvasSection = (path: string) => {
    if (canvasUrl) {
      window.open(`${canvasUrl}${path}`, '_blank', 'noopener,noreferrer');
    }
  };

  const goToSettings = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'settings' } }));
  };

  if (!isConnected || !canvasUrl) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Canvas</h1>
          <p className="text-gray-600 mt-1">Access your Canvas courses and assignments</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Canvas</h2>
            <p className="text-gray-600 mb-6">
              To access your Canvas courses, assignments, and grades, you need to connect your Canvas account first.
            </p>
            <button
              onClick={goToSettings}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Settings to Connect Canvas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Canvas</h1>
        <p className="text-gray-600 mt-1">Quick access to your Canvas learning management system</p>
      </div>

      {/* Connected Status */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-green-500 rounded-full h-3 w-3 mr-3"></div>
          <div>
            <p className="font-medium text-green-900">Connected to Canvas</p>
            <p className="text-sm text-green-700">{canvasUrl}</p>
          </div>
        </div>
        <button
          onClick={goToSettings}
          className="text-sm text-green-700 hover:text-green-900 underline"
        >
          Change in Settings
        </button>
      </div>

      {/* Main Canvas Button */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Open Canvas Dashboard</h2>
            <p className="text-blue-100">Access all your courses, assignments, and announcements</p>
          </div>
          <button
            onClick={openCanvas}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <span>Open Canvas</span>
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => openCanvasSection('/courses')}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">My Courses</h3>
          <p className="text-sm text-gray-600">View all your enrolled courses</p>
        </button>

        <button
          onClick={() => openCanvasSection('/?view=calendar')}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <Calendar className="h-8 w-8 text-green-600" />
            <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Calendar</h3>
          <p className="text-sm text-gray-600">Check upcoming due dates</p>
        </button>

        <button
          onClick={() => openCanvasSection('/?view=assignments')}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <FileText className="h-8 w-8 text-purple-600" />
            <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Assignments</h3>
          <p className="text-sm text-gray-600">View all assignments</p>
        </button>

        <button
          onClick={() => openCanvasSection('/conversations')}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Inbox</h3>
          <p className="text-sm text-gray-600">Check your messages</p>
        </button>
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Tip: Sync Your Grades</h3>
            <p className="text-sm text-blue-800">
              You can automatically sync your Canvas grades to the Grades tab. Just click the "Sync Canvas" button in the Grades section!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
