import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Target, Award, Plus, CreditCard as Edit } from 'lucide-react';
import { databaseService, type Course, type Assignment } from '../lib/database';
import { authService } from '../lib/auth';
import { supabase } from '../lib/supabase';

export function GradeTracker() {
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    credits: 3,
    target_grade: 90,
    color: 'bg-blue-500'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        const [coursesData, assignmentsData] = await Promise.all([
          databaseService.getCourses(user.id),
          databaseService.getAssignments(user.id)
        ]);
        setCourses(coursesData);
        setAssignments(assignmentsData);
      }
    } catch (error) {
      console.error('Error loading grade data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      console.log('🔵 Starting course creation...');
      
      // Get fresh user session from Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔵 User data:', user);
      console.log('🔵 Auth error:', authError);
      
      if (!user) {
        alert('You must be logged in to create courses. Please sign in again.');
        throw new Error('You must be logged in');
      }
      
      if (!newCourse.name.trim()) {
        alert('Course name is required');
        return;
      }
      
      if (!newCourse.code.trim()) {
        alert('Course code is required');
        return;
      }

      const courseData = {
        name: newCourse.name,
        code: newCourse.code,
        credits: newCourse.credits,
        current_grade: 0,
        target_grade: newCourse.target_grade,
        color: newCourse.color
      };

      console.log('🔵 Course data to create:', courseData);
      console.log('🔵 User ID:', user.id);

      const createdCourse = await databaseService.createCourse(user.id, courseData);
      console.log('🔵 Course created successfully:', createdCourse);
      
      setCourses(prev => [...prev, createdCourse]);
      setShowAddCourse(false);
      setNewCourse({
        name: '',
        code: '',
        credits: 3,
        target_grade: 90,
        color: 'bg-blue-500'
      });
      alert('Course created successfully!');
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Course created successfully', type: 'success' } }));
    } catch (error) {
      console.error('🔴 Error creating course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
      alert(`ERROR: ${errorMessage}\n\nCheck console for details.`);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: errorMessage, type: 'error' } }));
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !editingCourseId) return;

      const updates = {
        name: newCourse.name,
        code: newCourse.code,
        credits: newCourse.credits,
        target_grade: newCourse.target_grade,
        color: newCourse.color
      };

      const updated = await databaseService.updateCourse(editingCourseId, updates);
      setCourses(prev => prev.map(c => c.id === editingCourseId ? updated : c));
      setEditingCourseId(null);
      setShowAddCourse(false);
      setNewCourse({ name: '', code: '', credits: 3, target_grade: 90, color: 'bg-blue-500' });
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const getCourseAssignments = (courseId: string) => {
    return assignments.filter(assignment => assignment.course_id === courseId);
  };

  const calculateGPA = (courses: Course[]) => {
    const totalPoints = courses.reduce((sum, course) => sum + (course.current_grade / 100 * 4 * course.credits), 0);
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exam': return '📝';
      case 'homework': return '📚';
      case 'project': return '🔬';
      case 'quiz': return '❓';
      case 'participation': return '🗣️';
      default: return '📋';
    }
  };

  const currentGPA = calculateGPA(courses);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grade Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor your academic progress and stay on track</p>
        </div>
        
        <button
          onClick={() => setShowAddCourse(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Add Course</span>
        </button>
      </div>

      {/* GPA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Current GPA</p>
              <p className="text-3xl font-bold text-blue-900">{currentGPA.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Credits</p>
              <p className="text-3xl font-bold text-green-900">{courses.reduce((sum, course) => sum + course.credits, 0)}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Courses</p>
              <p className="text-3xl font-bold text-purple-900">{courses.length}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Dean's List</p>
              <p className="text-lg font-bold text-orange-900">{currentGPA >= 3.5 ? 'Eligible' : 'Not Yet'}</p>
            </div>
            <Award className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 mb-4">No courses added yet.</p>
            <button
              onClick={() => setShowAddCourse(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Course
            </button>
          </div>
        ) : (
        courses.map((course) => {
          const courseAssignments = getCourseAssignments(course.id);
          return (
          <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            {/* Course Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${course.color}`}></div>
                  <h3 className="font-bold text-gray-900">{course.code}</h3>
                  <span className="text-sm text-gray-500">({course.credits} credits)</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{course.name}</p>
              </div>
              
              <button onClick={() => {
                setEditingCourseId(course.id);
                setNewCourse({ name: course.name, code: course.code, credits: course.credits, target_grade: course.target_grade, color: course.color });
                setShowAddCourse(true);
              }} className="text-gray-400 hover:text-gray-600">
                <Edit className="h-4 w-4" />
              </button>
            </div>

            {/* Grade Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Current Grade</span>
                <span className={`text-lg font-bold ${getGradeColor(course.current_grade)}`}>
                  {course.current_grade.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${course.color}`}
                  style={{ width: `${course.current_grade}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Target: {course.target_grade}%</span>
                <span>{course.current_grade >= course.target_grade ? '🎯 On Track' : '📈 Need Improvement'}</span>
              </div>
            </div>

            {/* Recent Assignments */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Assignments</h4>
              <div className="space-y-2">
                {courseAssignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{getCategoryIcon(assignment.category)}</span>
                      <span className="text-gray-600 truncate">{assignment.name}</span>
                    </div>
                    <span className={`font-medium ${getGradeColor((assignment.score / assignment.max_score) * 100)}`}>
                      {`${assignment.score}/${assignment.max_score}`}
                    </span>
                  </div>
                ))}
              </div>
              
              {courseAssignments.length > 3 && (
                <button
                  onClick={() => {
                    // Future: Navigate to detailed view
                    console.log('View all assignments for course:', course.id);
                  }}
                  className="text-blue-600 text-xs mt-2 hover:text-blue-700"
                >
                  View all {courseAssignments.length} assignments
                </button>
              )}
            </div>
          </div>
          );
        }))}
      </div>

      {/* Grade Distribution Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Grade Distribution</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Grade Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Grades</h3>
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${course.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{course.code}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${getGradeColor(course.current_grade)}`}>
                      {course.current_grade.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      ({((course.current_grade / 100) * 4).toFixed(2)} GPA)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semester Goals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Semester Goals</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">Target GPA</span>
                  <span className="text-blue-700 font-bold">3.7</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(currentGPA / 3.7) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  {currentGPA >= 3.7 ? 'Goal achieved! 🎉' : `${(3.7 - currentGPA).toFixed(2)} points to go`}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dean's List (3.5+)</span>
                  <span className={currentGPA >= 3.5 ? 'text-green-600' : 'text-gray-400'}>
                    {currentGPA >= 3.5 ? '✅' : '⏳'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Magna Cum Laude (3.7+)</span>
                  <span className={currentGPA >= 3.7 ? 'text-green-600' : 'text-gray-400'}>
                    {currentGPA >= 3.7 ? '✅' : '⏳'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Summa Cum Laude (3.9+)</span>
                  <span className={currentGPA >= 3.9 ? 'text-green-600' : 'text-gray-400'}>
                    {currentGPA >= 3.9 ? '✅' : '⏳'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Course</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                <input
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CS 301"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Advanced Algorithms"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, credits: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Grade</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCourse.target_grade}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, target_grade: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => { setShowAddCourse(false); setEditingCourseId(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingCourseId ? handleUpdateCourse : handleCreateCourse}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCourseId ? 'Update Course' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}