import { supabase } from './supabase';
import type { User } from './supabase';

// Types for database entities
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'class' | 'work' | 'extracurricular' | 'personal';
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  completed: boolean;
  course_code: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code: string;
  credits: number;
  current_grade: number;
  target_grade: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  user_id: string;
  name: string;
  category: 'exam' | 'homework' | 'project' | 'quiz' | 'participation';
  score: number;
  max_score: number;
  weight: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface WellnessEntry {
  id: string;
  user_id: string;
  mood: 'great' | 'good' | 'okay' | 'stressed' | 'overwhelmed';
  stress_level: number;
  notes: string;
  entry_date: string;
  created_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  session_type: 'work' | 'shortBreak' | 'longBreak';
  duration_minutes: number;
  completed: boolean;
  task_id: string | null;
  created_at: string;
}

export interface StudyGroup {
  id: string;
  creator_id: string;
  name: string;
  subject: string;
  description: string;
  max_members: number;
  location: string;
  is_online: boolean;
  next_session: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  member_count?: number;
  is_member?: boolean;
  creator_name?: string;
}

// Database service functions
export const databaseService = {
  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createTask(userId: string, task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  // Courses
  async getCourses(userId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCourse(userId: string, course: Omit<Course, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert([{ ...course, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Assignments
  async getAssignments(userId: string, courseId?: string): Promise<Assignment[]> {
    let query = supabase
      .from('assignments')
      .select('*')
      .eq('user_id', userId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createAssignment(userId: string, assignment: Omit<Assignment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .insert([{ ...assignment, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Wellness Entries
  async getWellnessEntries(userId: string, limit = 30): Promise<WellnessEntry[]> {
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createWellnessEntry(userId: string, entry: Omit<WellnessEntry, 'id' | 'user_id' | 'created_at'>): Promise<WellnessEntry> {
    const { data, error } = await supabase
      .from('wellness_entries')
      .insert([{ ...entry, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTodayWellnessEntry(userId: string): Promise<WellnessEntry | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  // Pomodoro Sessions
  async getPomodoroSessions(userId: string, limit = 100): Promise<PomodoroSession[]> {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createPomodoroSession(userId: string, session: Omit<PomodoroSession, 'id' | 'user_id' | 'created_at'>): Promise<PomodoroSession> {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert([{ ...session, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Study Groups
  async getStudyGroups(): Promise<StudyGroup[]> {
    const { data, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        study_group_members(count),
        users!study_groups_creator_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(group => ({
      ...group,
      member_count: group.study_group_members?.[0]?.count || 0,
      creator_name: group.users?.full_name || 'Unknown'
    }));
  },

  async createStudyGroup(userId: string, group: Omit<StudyGroup, 'id' | 'creator_id' | 'created_at' | 'updated_at'>): Promise<StudyGroup> {
    const { data, error } = await supabase
      .from('study_groups')
      .insert([{ ...group, creator_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async joinStudyGroup(userId: string, groupId: string): Promise<void> {
    const { error } = await supabase
      .from('study_group_members')
      .insert([{ user_id: userId, group_id: groupId }]);

    if (error) throw error;
  },

  async leaveStudyGroup(userId: string, groupId: string): Promise<void> {
    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId);

    if (error) throw error;
  },

  async getUserStudyGroups(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('study_group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(member => member.group_id);
  }
};