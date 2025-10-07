import React from 'react';
import { Calendar, Heart, BarChart3, Users, Zap } from 'lucide-react';

// Custom Brain Logo Component
const BrainLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4C6.5 13 6 14.5 6 16c0 3.5 2.5 6 6 6s6-2.5 6-6c0-1.5-.5-3-1.5-4C17.5 11 18 9.5 18 8c0-3.5-2.5-6-6-6z"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M9 8c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z"
      fill="white"
    />
    <path
      d="M9 16c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z"
      fill="white"
    />
    <circle cx="10.5" cy="8" r="0.5" fill="currentColor" />
    <circle cx="13.5" cy="8" r="0.5" fill="currentColor" />
    <circle cx="10.5" cy="16" r="0.5" fill="currentColor" />
    <circle cx="13.5" cy="16" r="0.5" fill="currentColor" />
  </svg>
);

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">CORE</span>
              <br />
              Your College Life, Organized
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Centralize deadlines, classes, and wellness in one beautiful hub. 
              Stay productive without burning out.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
          Everything you need to thrive in college
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Calendar,
              title: 'Centralized Dashboard',
              description: 'All your deadlines, tasks, and events in one place with Today and This Week views.',
              color: 'text-blue-600'
            },
            {
              icon: BookOpen,
              title: 'Smart Task Management',
              description: 'Organize assignments by class, priority, and deadline. Sync with Canvas and Google Calendar.',
              color: 'text-purple-600'
            },
            {
              icon: Heart,
              title: 'Wellness Check-ins',
              description: 'Mood tracking, burnout prevention, and gentle reminders to take care of yourself.',
              color: 'text-green-600'
            },
            {
              icon: BarChart3,
              title: 'Progress Analytics',
              description: 'Track completion streaks, weekly progress, and productivity patterns.',
              color: 'text-orange-600'
            },
            {
              icon: Zap,
              title: 'AI Study Planner',
              description: 'Smart task prioritization based on urgency, difficulty, and your energy levels.',
              color: 'text-yellow-600'
            },
            {
              icon: Users,
              title: 'Group Collaboration',
              description: 'Work together on shared assignments and group projects seamlessly.',
              color: 'text-indigo-600'
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <feature.icon className={`h-10 w-10 ${feature.color} mb-4`} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your college experience?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of students using CORE to find their perfect productivity-wellness balance.</p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Your Journey
          </button>
        </div>
      </div>
    </div>
  );
}