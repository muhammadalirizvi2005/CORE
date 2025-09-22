import React, { useState } from 'react';
import { Heart, Brain, Coffee, Moon, Activity, TrendingUp } from 'lucide-react';

export function WellnessTracker() {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [stressLevel, setStressLevel] = useState<number>(3);

  const moodOptions = [
    { emoji: '😊', label: 'Great', value: 'great' },
    { emoji: '🙂', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😟', label: 'Stressed', value: 'stressed' },
    { emoji: '😫', label: 'Overwhelmed', value: 'overwhelmed' },
  ];

  const wellnessTips = [
    {
      title: 'Take a Break',
      description: 'You\'ve been studying for 2 hours. Time for a 15-minute break!',
      icon: Coffee,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Hydration Check',
      description: 'Remember to drink water regularly throughout the day.',
      icon: Activity,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Sleep Reminder',
      description: 'Aim for 7-9 hours of sleep tonight for better focus tomorrow.',
      icon: Moon,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Mindful Moment',
      description: 'Try a 5-minute breathing exercise to reduce stress.',
      icon: Brain,
      color: 'bg-green-100 text-green-800'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wellness Tracker</h1>
        <p className="text-gray-600 mt-1">Monitor your mental health and maintain balance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Check-in */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Check-in */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Daily Mood Check-in
            </h2>
            
            <p className="text-gray-600 mb-6">How are you feeling today?</p>
            
            <div className="grid grid-cols-5 gap-3 mb-6">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedMood === mood.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium text-gray-700">{mood.label}</div>
                </button>
              ))}
            </div>

            {selectedMood && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  {selectedMood === 'great' && "Awesome! Keep up the positive energy!"}
                  {selectedMood === 'good' && "Great to hear! You're doing well."}
                  {selectedMood === 'okay' && "That's perfectly normal. Take things one step at a time."}
                  {selectedMood === 'stressed' && "Remember, it's okay to feel stressed. Try some deep breathing."}
                  {selectedMood === 'overwhelmed' && "You're not alone. Consider reaching out for support or taking a break."}
                </p>
              </div>
            )}
          </div>

          {/* Stress Level */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 text-purple-500 mr-2" />
              Stress Level
            </h2>
            
            <p className="text-gray-600 mb-6">Rate your current stress level (1-10)</p>
            
            <div className="mb-4">
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>1 - Very Low</span>
                <span className="font-medium text-gray-900">{stressLevel}/10</span>
                <span>10 - Very High</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              stressLevel <= 3 ? 'bg-green-50 text-green-800' :
              stressLevel <= 6 ? 'bg-yellow-50 text-yellow-800' :
              'bg-red-50 text-red-800'
            }`}>
              <p className="text-sm">
                {stressLevel <= 3 && "Your stress level looks manageable. Keep up the good work!"}
                {stressLevel > 3 && stressLevel <= 6 && "Moderate stress is normal. Consider some relaxation techniques."}
                {stressLevel > 6 && "High stress detected. Please prioritize self-care and consider seeking support."}
              </p>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              Weekly Wellness Trends
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">7.2</div>
                <div className="text-sm text-gray-600">Avg Mood Score</div>
                <div className="text-xs text-green-600 mt-1">↗ +0.5 from last week</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">4.1</div>
                <div className="text-sm text-gray-600">Avg Stress Level</div>
                <div className="text-xs text-red-600 mt-1">↗ +0.3 from last week</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">6</div>
                <div className="text-sm text-gray-600">Check-ins This Week</div>
                <div className="text-xs text-purple-600 mt-1">Great consistency!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Tips & Resources */}
        <div className="space-y-6">
          {/* Personalized Tips */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Personalized Tips</h3>
            
            <div className="space-y-4">
              {wellnessTips.map((tip, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${tip.color}`}>
                      <tip.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{tip.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Campus Resources</h3>
            
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium text-gray-900">Student Counseling Center</h4>
                <p className="text-xs text-gray-500">Free confidential support</p>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium text-gray-900">Crisis Text Line</h4>
                <p className="text-xs text-gray-500">Text HOME to 741741</p>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium text-gray-900">Wellness Workshops</h4>
                <p className="text-xs text-gray-500">Weekly stress management sessions</p>
              </div>
            </div>
          </div>

          {/* Emergency */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Need immediate help?</h4>
            <p className="text-sm text-red-700 mb-3">If you're having thoughts of self-harm, please reach out immediately.</p>
            <button className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
              Get Help Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}