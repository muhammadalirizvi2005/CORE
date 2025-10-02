import React, { useState } from 'react';
import { Users, Plus, Calendar, MapPin, Clock, Star, MessageCircle, Video } from 'lucide-react';

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: number;
  maxMembers: number;
  nextSession: Date;
  location: string;
  isOnline: boolean;
  rating: number;
  tags: string[];
  creator: string;
  joined: boolean;
}

export function StudyGroups() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'joined' | 'available'>('all');

  const mockGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'CS 201 Data Structures Study Group',
      subject: 'Computer Science',
      description: 'Weekly study sessions for Data Structures. We cover assignments, practice problems, and exam prep.',
      members: 8,
      maxMembers: 12,
      nextSession: new Date(2024, 0, 16, 18, 0),
      location: 'Library Room 204',
      isOnline: false,
      rating: 4.8,
      tags: ['Algorithms', 'Programming', 'Exam Prep'],
      creator: 'Sarah Chen',
      joined: true
    },
    {
      id: '2',
      name: 'Organic Chemistry Mastery',
      subject: 'Chemistry',
      description: 'Tackle organic chemistry together! Mechanism practice, reaction predictions, and lab prep.',
      members: 6,
      maxMembers: 8,
      nextSession: new Date(2024, 0, 17, 19, 30),
      location: 'Online (Zoom)',
      isOnline: true,
      rating: 4.9,
      tags: ['Mechanisms', 'Lab Prep', 'Problem Solving'],
      creator: 'Mike Rodriguez',
      joined: false
    },
    {
      id: '3',
      name: 'Calculus II Problem Solving',
      subject: 'Mathematics',
      description: 'Integration techniques, series, and applications. Friendly group with patient explanations.',
      members: 5,
      maxMembers: 10,
      nextSession: new Date(2024, 0, 18, 16, 0),
      location: 'Math Building Room 301',
      isOnline: false,
      rating: 4.6,
      tags: ['Integration', 'Series', 'Applications'],
      creator: 'Emma Thompson',
      joined: true
    },
    {
      id: '4',
      name: 'Spanish Conversation Circle',
      subject: 'Languages',
      description: 'Practice Spanish conversation in a supportive environment. All levels welcome!',
      members: 12,
      maxMembers: 15,
      nextSession: new Date(2024, 0, 19, 17, 0),
      location: 'Student Center Lounge',
      isOnline: false,
      rating: 4.7,
      tags: ['Conversation', 'Culture', 'All Levels'],
      creator: 'Carlos Mendez',
      joined: false
    }
  ];

  const filteredGroups = mockGroups.filter(group => {
    if (filter === 'joined') return group.joined;
    if (filter === 'available') return !group.joined && group.members < group.maxMembers;
    return true;
  });

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Computer Science': 'bg-blue-100 text-blue-800',
      'Chemistry': 'bg-green-100 text-green-800',
      'Mathematics': 'bg-purple-100 text-purple-800',
      'Languages': 'bg-orange-100 text-orange-800',
      'Physics': 'bg-red-100 text-red-800',
      'Biology': 'bg-teal-100 text-teal-800'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600 mt-1">Find your study tribe and learn together</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Groups' },
              { key: 'joined', label: 'My Groups' },
              { key: 'available', label: 'Available' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredGroups.length} groups found
          </div>
        </div>
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{group.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubjectColor(group.subject)}`}>
                    {group.subject}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    {group.rating}
                  </div>
                </div>
              </div>
              
              {group.joined && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Joined
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4">{group.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {group.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {group.members}/{group.maxMembers} members
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Next: {group.nextSession.toLocaleDateString()} at {group.nextSession.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                {group.isOnline ? <Video className="h-4 w-4 mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                {group.location}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Created by {group.creator}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              {group.joined ? (
                <>
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Leave
                  </button>
                </>
              ) : (
                <button 
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    group.members >= group.maxMembers
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  disabled={group.members >= group.maxMembers}
                >
                  {group.members >= group.maxMembers ? 'Full' : 'Join Group'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Groups Joined</p>
              <p className="text-2xl font-bold text-blue-900">2</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Study Hours</p>
              <p className="text-2xl font-bold text-green-900">24</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Sessions Attended</p>
              <p className="text-2xl font-bold text-purple-900">12</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-orange-900">4.8</p>
            </div>
            <Star className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Study Group</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Physics 101 Study Group"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Computer Science</option>
                  <option>Mathematics</option>
                  <option>Chemistry</option>
                  <option>Physics</option>
                  <option>Biology</option>
                  <option>Languages</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what your group will focus on..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Members</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    defaultValue="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>In-Person</option>
                    <option>Online</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}