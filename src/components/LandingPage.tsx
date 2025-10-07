import React from 'react';
import { Calendar, Heart, BarChart3, Users, Zap, BookOpen } from 'lucide-react';

// Custom Brain Logo Component
const BrainLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Brain outline with rounded lobes */}
    <path
      d="M20 35C20 25 28 15 40 15C45 15 50 17 53 20C56 17 61 15 66 15C78 15 86 25 86 35C86 40 84 45 81 48C84 52 86 57 86 63C86 73 78 83 66 83C61 83 56 81 53 78C50 81 45 83 40 83C28 83 20 73 20 63C20 57 22 52 25 48C22 45 20 40 20 35Z"
      fill="#10B981"
      stroke="#0D9488"
      strokeWidth="2"
    />
    
    {/* Inner brain pattern - left hemisphere */}
    <path
      d="M25 35C25 30 30 25 37 25C42 25 47 28 47 35C47 42 42 47 37 47C30 47 25 42 25 35Z"
      fill="white"
      opacity="0.9"
    />
    
    {/* Inner brain pattern - right hemisphere */}
    <path
      d="M59 35C59 30 64 25 71 25C76 25 81 28 81 35C81 42 76 47 71 47C64 47 59 42 59 35Z"
      fill="white"
      opacity="0.9"
    />
    
    {/* Lower brain sections */}
    <path
      d="M25 63C25 58 30 53 37 53C42 53 47 56 47 63C47 70 42 75 37 75C30 75 25 70 25 63Z"
      fill="white"
      opacity="0.9"
    />
    
    <path
      d="M59 63C59 58 64 53 71 53C76 53 81 56 81 63C81 70 76 75 71 75C64 75 59 70 59 63Z"
      fill="white"
      opacity="0.9"
    />
    
    {/* Central connecting line */}
    <line x1="50" y1="20" x2="50" y2="80" stroke="#0D9488" strokeWidth="2" opacity="0.6"/>
    
    {/* Small detail dots */}
    <circle cx="37" cy="35" r="2" fill="#10B981"/>
    <circle cx="71" cy="35" r="2" fill="#10B981"/>
    <circle cx="37" cy="63" r="2" fill="#10B981"/>
    <circle cx="71" cy="63" r="2" fill="#10B981"/>
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