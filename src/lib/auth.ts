import { supabase } from './supabase';
import type { User } from './supabase';

// Simple password hashing (in production, use bcrypt or similar)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const passwordHash = await hashPassword(credentials.password);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', credentials.username)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !data) {
        console.error('Login query error:', error);
        return { user: null, error: 'Invalid username or password' };
      }

      // Store user in localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(data[0]));
      
      return { user: data[0], error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error: 'Login failed. Please try again.' };
    }
  },

  async register(userData: RegisterData): Promise<{ user: User | null; error: string | null }> {
    try {
      const passwordHash = await hashPassword(userData.password);
      
      // Check if username or email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username, email')
        .or(`username.eq.${userData.username},email.eq.${userData.email}`);

      if (checkError) {
        console.error('Error checking existing users:', checkError);
        return { user: null, error: 'Registration failed. Please try again.' };
      }

      if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (existingUser.username === userData.username) {
          return { user: null, error: 'Username already exists' };
        }
        if (existingUser.email === userData.email) {
          return { user: null, error: 'Email already exists' };
        }
      }

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username: userData.username,
            email: userData.email,
            full_name: userData.fullName,
            password_hash: passwordHash,
          }
        ])
        .select()
        .single();

      if (error || !data) {
        console.error('Registration error:', error);
        return { user: null, error: 'Registration failed. Please try again.' };
      }

      // Store user in localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(data[0]));
      
      return { user: data[0], error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, error: 'Registration failed. Please try again.' };
    }
  },

  // Update user-level connection/settings fields in the users table
  async updateUserConnections(userId: string, updates: Record<string, any>): Promise<{ user: User | null; error: any | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user connections:', error);
        return { user: null, error };
      }
      return { user: data, error: null };
    } catch (err) {
      console.error('Unexpected error updating user connections:', err);
      return { user: null, error: err };
    }
  },

  logout(): void {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
};