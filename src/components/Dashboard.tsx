import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Flame, BarChart3, Users, Timer, BookOpen, Settings } from 'lucide-react';
import { authService } from '../lib/auth';
import { databaseService } from '../lib/database';

export function Dashboard() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingDeadlines: 0,
    currentGPA: 0,
    wellnessStreak: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Load user statistics
      const [tasks, courses, wellnessEntries] = await Promise.all([
        databaseService.getTasks(user.id),
        databaseService.getCourses(user.id),
        databaseService.getWellnessEntries(user.id, 7)
      ]);

      const completedTasks = tasks.filter(task => task.completed).length;
      const upcomingDeadlines = tasks.filter(task => 
        task.due_date && new Date(task.due_date) > new Date() && 
        new Date(task.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ).length;

      const avgGPA = courses.length > 0 
        ? courses.reduce((sum, course) => sum + (course.current_grade || 0), 0) / courses.length 
        : 0;

      setStats({
        totalTasks: tasks.length,
        completedTasks,
        upcomingDeadlines,
        currentGPA: avgGPA,
        wellnessStreak: wellnessEntries.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const quickActions = [
    { icon: CheckSquare, label: 'Add Task', color: 'bg-blue-500', href: '/tasks' },
    { icon: Timer, label: 'Start Pomodoro', color: 'bg-red-500', href: '/pomodoro' },
    { icon: Brain, label: 'Wellness Check', color: 'bg-green-500', href: '/wellness' },
    { icon: BookOpen, label: 'Add Grade', color: 'bg-purple-500', href: '/grades' },
    { icon: Users, label: 'Study Groups', color: 'bg-orange-500', href: '/groups' },
    { icon: BarChart3, label: 'View Analytics', color: 'bg-indigo-500', href: '/analytics' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name || 'Student'}! 👋
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Complete math homework</span>
              <span className="text-xs text-gray-500 ml-auto">Due tomorrow</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Study for chemistry exam</span>
              <span className="text-xs text-gray-500 ml-auto">Due Friday</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Submit project proposal</span>
              <span className="text-xs text-gray-500 ml-auto">Due next week</span>
            </div>
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