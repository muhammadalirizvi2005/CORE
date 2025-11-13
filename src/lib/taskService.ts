import { supabase } from './supabase';
import type { Task } from './database';

export const taskService = {
  async createTask(userId: string, taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    console.log('🟢 taskService.createTask called with:', { userId, taskData });
    
    const insertData = {
      ...taskData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('🟢 Data to insert:', insertData);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([insertData])
      .select('*')
      .single();

    console.log('🟢 Supabase response:', { data, error });

    if (error) {
      console.error('🔴 Supabase error creating task:', error);
      console.error('🔴 Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('🟢 Task created successfully:', data);
    return data;
  },

  async getTasks(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return data;
  },

  async updateTask(taskId: string, userId: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', userId) // Ensure user can only update their own tasks
      .select('*')
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return data;
  },

  async deleteTask(taskId: string, userId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId); // Ensure user can only delete their own tasks

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};