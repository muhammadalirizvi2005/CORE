import { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Flame, BarChart3, Timer, BookOpen, Brain, Clock, ExternalLink } from 'lucide-react';
import { authService } from '../lib/auth';
import { databaseService } from '../lib/database';
import type { User } from '@supabase/supabase-js';

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  priority: string;
}

interface Assignment {
  id: string;
  name: string;
  due_date: string | null;
  course_id: string;
}

export function Dashboard() {
  const [user] = useState<User | null>(authService.getCurrentUser());
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingDeadlines: 0,
    currentGPA: 0,
    wellnessStreak: 0
  });
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Load user statistics
      const [tasks, courses, wellnessEntries, assignments] = await Promise.all([
        databaseService.getTasks(user.id),
        databaseService.getCourses(user.id),
        databaseService.getWellnessEntries(user.id, 30),
        databaseService.getAssignments(user.id)
      ]);

      const completedTasks = tasks.filter(task => task.completed).length;
      const now = new Date();
      const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const upcomingDeadlines = tasks.filter(task => 
        task.due_date && new Date(task.due_date) > now && 
        new Date(task.due_date) <= oneWeekFromNow
      ).length;

      // Get upcoming tasks (not completed, has due date, sorted by due date)
      const upcoming = tasks
        .filter(task => !task.completed && task.due_date && new Date(task.due_date) > now)
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5);
      
      setUpcomingTasks(upcoming);

      // Get upcoming assignments from Canvas
      const upcomingCanvasAssignments = assignments
        .filter(assignment => assignment.due_date && new Date(assignment.due_date) > now)
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5);
      
      setUpcomingAssignments(upcomingCanvasAssignments);

      const avgGPA = courses.length > 0 
        ? courses.reduce((sum, course) => sum + (course.current_grade || 0), 0) / courses.length 
        : 0;

      // Calculate wellness streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const hasEntry = wellnessEntries.some(entry => entry.entry_date === dateStr);
        
        if (hasEntry) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      setStats({
        totalTasks: tasks.length,
        completedTasks,
        upcomingDeadlines,
        currentGPA: avgGPA,
        wellnessStreak: streak
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const quickActions = [
    { icon: CheckSquare, label: 'Add Task', color: 'bg-blue-500', view: 'tasks' },
    { icon: Timer, label: 'Start Pomodoro', color: 'bg-red-500', view: 'pomodoro' },
    { icon: Brain, label: 'Wellness Check', color: 'bg-green-500', view: 'wellness' },
    { icon: BookOpen, label: 'Add Grade', color: 'bg-purple-500', view: 'grades' },
    { icon: BarChart3, label: 'View Analytics', color: 'bg-indigo-500', view: 'analytics' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Here's your productivity overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due This Week</p>
              <p className="text-2xl font-bold text-orange-600">{stats.upcomingDeadlines}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current GPA</p>
              <p className="text-2xl font-bold text-purple-600">{stats.currentGPA.toFixed(1)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wellness Streak</p>
              <p className="text-2xl font-bold text-green-600">{stats.wellnessStreak} days</p>
            </div>
            <Flame className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                try {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: { view: action.view } }));
                } catch {
                  // fallback to hash navigation
                  window.location.hash = `#${action.view}`;
                }
              }}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={`${action.color} p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-900">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Tasks and Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upcoming Tasks */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Upcoming Tasks</h3>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'canvas' } }))}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No upcoming tasks</p>
                <p className="text-xs text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' : 
                    task.priority === 'medium' ? 'bg-yellow-500' : 
                    'bg-blue-500'
                  }`}></div>
                  <span className="text-sm text-gray-700 flex-1">{task.title}</span>
                  {task.due_date && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Canvas Assignments */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Canvas Assignments</h3>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'grades' } }))}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No upcoming assignments</p>
                <p className="text-xs text-gray-400">
                  {localStorage.getItem('canvasBaseUrl') 
                    ? 'Sync Canvas in Grades to see assignments' 
                    : 'Connect Canvas in Settings'}
                </p>
              </div>
            ) : (
              upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <BookOpen className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{assignment.name}</span>
                  {assignment.due_date && (
                    <span className="text-xs text-gray-500 flex items-center flex-shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(assignment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
          <div className="space-y-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'canvas' } }))}
              className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-sm font-medium text-blue-800">Open Canvas</span>
              <ExternalLink className="h-4 w-4 text-blue-600" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'pomodoro' } }))}
              className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span className="text-sm font-medium text-red-800">Start Focus Session</span>
              <Timer className="h-4 w-4 text-red-600" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'wellness' } }))}
              className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-sm font-medium text-green-800">Wellness Check-in</span>
              <Brain className="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Wellness Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-800">Average mood this week</span>
              <span className="text-sm font-bold text-green-600">Good 😊</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-800">Stress level trend</span>
              <span className="text-sm font-bold text-blue-600">Decreasing 📉</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-800">Focus sessions completed</span>
              <span className="text-sm font-bold text-purple-600">12 this week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}