import React from 'react';
import { TrendingUp, Target, Clock, Award, Calendar, BarChart3 } from 'lucide-react';

export function Analytics() {
  const weeklyData = [
    { day: 'Mon', completed: 8, total: 10 },
    { day: 'Tue', completed: 6, total: 8 },
    { day: 'Wed', completed: 9, total: 12 },
    { day: 'Thu', completed: 7, total: 9 },
    { day: 'Fri', completed: 5, total: 7 },
    { day: 'Sat', completed: 3, total: 4 },
    { day: 'Sun', completed: 4, total: 5 },
  ];

  const achievements = [
    { title: '7-Day Streak', description: 'Completed tasks daily for a week', earned: true },
    { title: 'Early Bird', description: 'Completed 5 tasks before noon', earned: true },
    { title: 'Wellness Warrior', description: 'Did wellness check-ins for 5 days', earned: false },
    { title: 'Priority Master', description: 'Completed all high-priority tasks', earned: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your productivity patterns and celebrate achievements</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            label: 'Current Streak', 
            value: '7 days', 
            change: '+2 from last week',
            icon: Target, 
            color: 'text-green-600 bg-green-50',
            changeColor: 'text-green-600'
          },
          { 
            label: 'Tasks Completed', 
            value: '42', 
            change: '+15% this week',
            icon: Award, 
            color: 'text-blue-600 bg-blue-50',
            changeColor: 'text-blue-600'
          },
          { 
            label: 'Avg Daily Tasks', 
            value: '6.2', 
            change: '+0.8 from last week',
            icon: BarChart3, 
            color: 'text-purple-600 bg-purple-50',
            changeColor: 'text-purple-600'
          },
          { 
            label: 'Time Saved', 
            value: '3.2 hrs', 
            change: 'Better planning',
            icon: Clock, 
            color: 'text-orange-600 bg-orange-50',
            changeColor: 'text-orange-600'
          },
        ].map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="h-6 w-6" />
              </div>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-gray-600 text-sm">{metric.label}</p>
              <p className={`text-xs mt-1 ${metric.changeColor}`}>{metric.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Progress Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h2>
          
          <div className="space-y-4">
            {weeklyData.map((day, index) => {
              const completionRate = (day.completed / day.total) * 100;
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${completionRate}%` }}
                    >
                      <span className="text-white text-xs font-medium">
                        {day.completed}/{day.total}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-right">
                    {Math.round(completionRate)}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 Insight</h3>
            <p className="text-sm text-blue-800">
              Your productivity peaks on Monday and Wednesday. Consider scheduling important tasks on these days!
            </p>
          </div>
        </div>

        {/* Achievements & Categories */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 text-yellow-500 mr-2" />
              Achievements
            </h3>
            
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    achievement.earned
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      achievement.earned ? 'bg-yellow-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-yellow-800' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-xs ${
                        achievement.earned ? 'text-yellow-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Task Categories</h3>
            
            <div className="space-y-4">
              {[
                { category: 'Classes', completed: 18, total: 22, color: 'bg-blue-500' },
                { category: 'Work', completed: 8, total: 10, color: 'bg-purple-500' },
                { category: 'Extracurricular', completed: 6, total: 8, color: 'bg-green-500' },
                { category: 'Personal', completed: 4, total: 5, color: 'bg-orange-500' },
              ].map((item, index) => {
                const percentage = (item.completed / item.total) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{item.category}</span>
                      <span className="text-gray-600">{item.completed}/{item.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Analytics */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              Time Patterns
            </h3>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Most Productive Time</p>
                <p className="text-lg font-bold text-purple-600">9:00 - 11:00 AM</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Average Task Duration</p>
                <p className="text-lg font-bold text-purple-600">45 minutes</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Break Frequency</p>
                <p className="text-lg font-bold text-purple-600">Every 2 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}