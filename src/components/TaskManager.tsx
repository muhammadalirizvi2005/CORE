import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { databaseService, type Task } from '../lib/database';
import { authService } from '../lib/auth';

export function TaskManager() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'class' | 'work' | 'extracurricular' | 'personal'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'class' as Task['category'],
    priority: 'medium' as Task['priority'],
    due_date: '',
    course_code: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        const userTasks = await databaseService.getTasks(user.id);
        setTasks(userTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !newTask.title.trim()) return;

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        category: newTask.category,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        course_code: newTask.course_code,
        completed: false
      };

      const createdTask = await databaseService.createTask(user.id, taskData);
      setTasks(prev => [createdTask, ...prev]);
      setShowAddModal(false);
      setNewTask({
        title: '',
        description: '',
        category: 'class',
        priority: 'medium',
        due_date: '',
        course_code: ''
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await databaseService.updateTask(taskId, { completed });
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await databaseService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'work': return 'bg-purple-100 text-purple-800';
      case 'extracurricular': return 'bg-green-100 text-green-800';
      case 'personal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-600 mt-1">Organize and track all your assignments and deadlines</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Task</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'class', label: 'Classes' },
              { key: 'work', label: 'Work' },
              { key: 'extracurricular', label: 'Extracurricular' },
              { key: 'personal', label: 'Personal' },
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
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No tasks found.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Task
            </button>
          </div>
        ) : (
        filteredTasks.map((task) => (
          <div key={task.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => toggleTaskComplete(task.id, e.target.checked)}
                className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority} priority
                    </span>
                  </div>
                </div>
                
                {task.course_code && (
                  <p className="text-sm text-blue-600 font-medium mb-2">{task.course_code}</p>
                )}
                
                <p className="text-gray-600 mb-4">{task.description}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}</span>
                  <Clock className="h-4 w-4 ml-4 mr-1" />
                  <span>{task.due_date ? `${Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left` : 'No deadline'}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Edit
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Add Task Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="class">Class</option>
                    <option value="work">Work</option>
                    <option value="extracurricular">Extracurricular</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Code (optional)</label>
                <input
                  type="text"
                  value={newTask.course_code}
                  onChange={(e) => setNewTask(prev => ({ ...prev, course_code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CS 201"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}