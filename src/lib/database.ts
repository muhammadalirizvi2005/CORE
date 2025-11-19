import { supabase } from './supabase';

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
  // Helper to log supabase errors with operation context
  _logAndThrow(op: string, error: any) {
    if (error) {
      console.error(`Supabase error [${op}]:`, error);
      throw error;
    }
  },
  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    this._logAndThrow('getTasks', error);
    return data || [];
  },

  async createTask(userId: string, task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: userId }])
      .select()
      .single();

    this._logAndThrow('createTask', error);
    return data;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    this._logAndThrow('updateTask', error);
    return data;
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    this._logAndThrow('deleteTask', error);
  },

  // Courses
  async getCourses(userId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    this._logAndThrow('getCourses', error);
    return data || [];
  },

  async createCourse(userId: string, course: Omit<Course, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Course> {
    console.log('🟢 databaseService.createCourse called with:', { userId, course });
    
    const insertData = { ...course, user_id: userId };
    console.log('🟢 Data to insert:', insertData);
    
    const { data, error } = await supabase
      .from('courses')
      .insert([insertData])
      .select()
      .single();

    console.log('🟢 Supabase response:', { data, error });
    
    if (error) {
      console.error('🔴 Supabase error creating course:', error);
      console.error('🔴 Error details:', JSON.stringify(error, null, 2));
    }

    this._logAndThrow('createCourse', error);
    console.log('🟢 Course created successfully:', data);
    return data;
  },

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();

    this._logAndThrow('updateCourse', error);
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

    this._logAndThrow('getAssignments', error);
    return data || [];
  },

  async createAssignment(userId: string, assignment: Omit<Assignment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Assignment> {
    console.log('🟢 databaseService.createAssignment called with:', { userId, assignment });
    
    const insertData = { ...assignment, user_id: userId };
    console.log('🟢 Data to insert:', insertData);
    
    const { data, error } = await supabase
      .from('assignments')
      .insert([insertData])
      .select()
      .single();

    console.log('🟢 Supabase response:', { data, error });
    
    if (error) {
      console.error('🔴 Supabase error creating assignment:', error);
      console.error('🔴 Error details:', JSON.stringify(error, null, 2));
    }

    this._logAndThrow('createAssignment', error);
    console.log('🟢 Assignment created successfully:', data);
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

    this._logAndThrow('getWellnessEntries', error);
    return data || [];
  },

  async createWellnessEntry(userId: string, entry: Omit<WellnessEntry, 'id' | 'user_id' | 'created_at'>): Promise<WellnessEntry> {
    console.log('🟢 databaseService.createWellnessEntry called with:', { userId, entry });
    
    const insertData = { ...entry, user_id: userId };
    console.log('🟢 Data to insert:', insertData);
    
    const { data, error } = await supabase
      .from('wellness_entries')
      .insert([insertData])
      .select()
      .single();

    console.log('🟢 Supabase response:', { data, error });
    
    if (error) {
      console.error('🔴 Supabase error creating wellness entry:', error);
      console.error('🔴 Error details:', JSON.stringify(error, null, 2));
    }

    this._logAndThrow('createWellnessEntry', error);
    console.log('🟢 Wellness entry created successfully:', data);
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

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching today wellness entry:', error);
      throw error;
    }
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

    this._logAndThrow('getPomodoroSessions', error);
    return data || [];
  },

  async createPomodoroSession(userId: string, session: Omit<PomodoroSession, 'id' | 'user_id' | 'created_at'>): Promise<PomodoroSession> {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert([{ ...session, user_id: userId }])
      .select()
      .single();

    this._logAndThrow('createPomodoroSession', error);
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

    this._logAndThrow('getStudyGroups', error);

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

    this._logAndThrow('createStudyGroup', error);
    return data;
  },

  async joinStudyGroup(userId: string, groupId: string): Promise<void> {
    const { error } = await supabase
      .from('study_group_members')
      .insert([{ user_id: userId, group_id: groupId }]);

    this._logAndThrow('joinStudyGroup', error);
  },

  async leaveStudyGroup(userId: string, groupId: string): Promise<void> {
    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId);

    this._logAndThrow('leaveStudyGroup', error);
  },

  async getUserStudyGroups(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('study_group_members')
      .select('group_id')
      .eq('user_id', userId);

    this._logAndThrow('getUserStudyGroups', error);
    return (data || []).map(member => member.group_id);
  }
};