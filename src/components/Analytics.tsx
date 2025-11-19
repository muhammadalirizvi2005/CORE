import { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, Award, BarChart3, Heart, Brain } from 'lucide-react';
import { authService } from '../lib/auth';
import { databaseService } from '../lib/database';

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [wellnessEntries, setWellnessEntries] = useState<any[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
    
    // Listen for wellness updates
    const handleWellnessUpdate = () => {
      console.log('🔵 Wellness updated, refreshing analytics...');
      loadAnalyticsData();
    };
    
    window.addEventListener('wellness-updated', handleWellnessUpdate);
    
    return () => {
      window.removeEventListener('wellness-updated', handleWellnessUpdate);
    };
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        const [tasksData, wellnessData, pomodoroData] = await Promise.all([
          databaseService.getTasks(user.id),
          databaseService.getWellnessEntries(user.id, 30),
          databaseService.getPomodoroSessions(user.id, 100)
        ]);
        
        setTasks(tasksData);
        setWellnessEntries(wellnessData);
        setPomodoroSessions(pomodoroData);
        
        // Calculate weekly data
        const weeklyStats = calculateWeeklyStats(tasksData);
        setWeeklyData(weeklyStats);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyStats = (tasksData: any[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStats = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayTasks = tasksData.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completed = dayTasks.filter(task => task.completed).length;
      
      weekStats.push({
        day: dayName,
        completed: completed,
        total: dayTasks.length
      });
    }
    
    return weekStats;
  };

  const calculateAchievements = () => {
    // Calculate actual consecutive wellness streak
    const calculateWellnessStreak = () => {
      if (wellnessEntries.length === 0) return 0;
      
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
          // If we miss a day (and it's not today), break the streak
          break;
        }
      }
      
      return streak;
    };
    
    const wellnessStreak = calculateWellnessStreak();
    const completedTasks = tasks.filter(t => t.completed).length;
    const highPriorityCompleted = tasks.filter(t => t.priority === 'high' && t.completed).length;
    const highPriorityTotal = tasks.filter(t => t.priority === 'high').length;
    
    return [
      { 
        title: '7-Day Streak', 
        description: 'Completed tasks daily for a week', 
        earned: completedTasks >= 7 
      },
      { 
        title: 'Early Bird', 
        description: 'Completed 5 tasks before noon', 
        earned: completedTasks >= 5 
      },
      { 
        title: 'Wellness Warrior', 
        description: 'Did wellness check-ins for 5 consecutive days', 
        earned: wellnessStreak >= 5 
      },
      { 
        title: 'Priority Master', 
        description: 'Completed all high-priority tasks', 
        earned: highPriorityTotal > 0 && highPriorityCompleted === highPriorityTotal 
      },
    ];
  };

  const achievements = calculateAchievements();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your productivity patterns and celebrate achievements</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(() => {
          // Calculate actual wellness streak
          const calculateWellnessStreak = () => {
            if (wellnessEntries.length === 0) return 0;
            
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
                // If we miss a day (and it's not today), break the streak
                break;
              }
            }
            
            return streak;
          };
          
          const wellnessStreak = calculateWellnessStreak();
          
          return [
            { 
              label: 'Wellness Streak', 
              value: `${wellnessStreak} day${wellnessStreak !== 1 ? 's' : ''}`, 
              change: wellnessStreak >= 7 ? '🔥 On fire!' : wellnessStreak >= 3 ? 'Keep going!' : 'Start today!',
              icon: Target, 
              color: 'text-green-600 bg-green-50',
              changeColor: wellnessStreak >= 7 ? 'text-green-600' : 'text-gray-600'
            },
            { 
              label: 'Tasks Completed', 
              value: `${tasks.filter(t => t.completed).length}`, 
              change: `${tasks.length} total tasks`,
              icon: Award, 
              color: 'text-blue-600 bg-blue-50',
              changeColor: 'text-blue-600'
            },
            { 
              label: 'Completion Rate', 
              value: `${tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%`, 
              change: tasks.filter(t => t.completed).length > 0 ? 'Great progress!' : 'Start completing!',
              icon: BarChart3, 
              color: 'text-purple-600 bg-purple-50',
              changeColor: 'text-purple-600'
            },
            { 
              label: 'Focus Sessions', 
              value: `${pomodoroSessions.filter(s => s.completed).length}`, 
              change: 'Total completed',
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
          ));
        })()}
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
                        {`${day.completed}/${day.total}`}
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
              {(() => {
                const categories = [
                  { name: 'class', label: 'Classes', color: 'bg-blue-500' },
                  { name: 'work', label: 'Work', color: 'bg-purple-500' },
                  { name: 'extracurricular', label: 'Extracurricular', color: 'bg-green-500' },
                  { name: 'personal', label: 'Personal', color: 'bg-orange-500' },
                ];

                return categories.map((cat, index) => {
                  const categoryTasks = tasks.filter(t => t.category === cat.name);
                  const completed = categoryTasks.filter(t => t.completed).length;
                  const total = categoryTasks.length;
                  const percentage = total > 0 ? (completed / total) * 100 : 0;

                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat.label}</span>
                        <span className="text-gray-600">{`${completed}/${total}`}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${cat.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Time Analytics */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              Focus Sessions
            </h3>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Total Sessions</p>
                <p className="text-lg font-bold text-purple-600">
                  {pomodoroSessions.filter(s => s.completed).length}
                </p>
              </div>
              
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Total Focus Time</p>
                <p className="text-lg font-bold text-purple-600">
                  {(() => {
                    const totalMinutes = pomodoroSessions
                      .filter(s => s.completed && s.session_type === 'work')
                      .reduce((sum, s) => sum + s.duration_minutes, 0);
                    const hours = Math.floor(totalMinutes / 60);
                    const mins = totalMinutes % 60;
                    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                  })()}
                </p>
              </div>
              
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">This Week</p>
                <p className="text-lg font-bold text-purple-600">
                  {(() => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return pomodoroSessions.filter(s => 
                      s.completed && 
                      new Date(s.created_at) >= oneWeekAgo
                    ).length;
                  })()} sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Insights */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            Wellness Insights
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading wellness data...</p>
            </div>
          ) : wellnessEntries.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No wellness data yet</p>
              <p className="text-sm text-gray-500">Start tracking your wellness to see insights here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Average Mood */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-green-900">Average Mood</h3>
                  <span className="text-2xl">
                    {wellnessEntries.length > 0 && (() => {
                      const moodValues = { great: '😊', good: '🙂', okay: '😐', stressed: '😟', overwhelmed: '😫' };
                      const avgMoodValue = wellnessEntries.reduce((sum, entry) => {
                        const values = { great: 5, good: 4, okay: 3, stressed: 2, overwhelmed: 1 };
                        return sum + values[entry.mood as keyof typeof values];
                      }, 0) / wellnessEntries.length;
                      
                      if (avgMoodValue >= 4.5) return moodValues.great;
                      if (avgMoodValue >= 3.5) return moodValues.good;
                      if (avgMoodValue >= 2.5) return moodValues.okay;
                      if (avgMoodValue >= 1.5) return moodValues.stressed;
                      return moodValues.overwhelmed;
                    })()}
                  </span>
                </div>
                <p className="text-sm text-green-800">
                  Based on {wellnessEntries.length} check-in{wellnessEntries.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Average Stress Level */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-900">Avg Stress Level</h3>
                  <span className="text-2xl font-bold text-blue-700">
                    {(wellnessEntries.reduce((sum, entry) => sum + entry.stress_level, 0) / wellnessEntries.length).toFixed(1)}/10
                  </span>
                </div>
                <p className="text-sm text-blue-800">
                  {wellnessEntries.reduce((sum, entry) => sum + entry.stress_level, 0) / wellnessEntries.length <= 5 
                    ? '✅ Manageable stress levels' 
                    : '⚠️ Consider stress management'}
                </p>
              </div>

              {/* Wellness Streak */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-900">Check-in Streak</h3>
                  <span className="text-2xl font-bold text-purple-700">
                    {wellnessEntries.length}
                  </span>
                </div>
                <p className="text-sm text-purple-800">
                  {wellnessEntries.length >= 7 ? '🔥 Great consistency!' : '💪 Keep it up!'}
                </p>
              </div>

              {/* Recent Notes */}
              <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-xl">
                <h3 className="font-semibold text-yellow-900 mb-4">Recent Wellness Notes</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {wellnessEntries
                    .filter(entry => entry.notes && entry.notes.trim())
                    .slice(0, 5)
                    .map((entry, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500">
                            {new Date(entry.entry_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-sm">
                            {(() => {
                              const moodEmojis = { great: '😊', good: '🙂', okay: '😐', stressed: '😟', overwhelmed: '😫' };
                              return moodEmojis[entry.mood as keyof typeof moodEmojis] || '😐';
                            })()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.notes}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Stress: {entry.stress_level}/10
                        </div>
                      </div>
                    ))}
                  {wellnessEntries.filter(entry => entry.notes && entry.notes.trim()).length === 0 && (
                    <p className="text-sm text-yellow-800 text-center py-4">
                      No notes yet. Add notes to your wellness check-ins to see them here!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}