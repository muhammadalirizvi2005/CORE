import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface LoginCredentials { email: string; password: string; }
export interface RegisterData { email: string; password: string; fullName: string; }

// Synchronous snapshot helpers backed by localStorage for existing components.
const readCachedUser = (): User | null => {
  try { const raw = localStorage.getItem('currentUser'); return raw ? JSON.parse(raw) : null; } catch { return null; }
};

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message || 'Login failed');
    try { localStorage.setItem('currentUser', JSON.stringify(data.user)); } catch {}
    return data.user as User;
  },
  async register({ email, password, fullName }: RegisterData): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error || !data.user) throw new Error(error?.message || 'Registration failed');
    try { localStorage.setItem('currentUser', JSON.stringify(data.user)); } catch {}
    return data.user as User;
  },
  async logout(): Promise<void> {
    await supabase.auth.signOut();
    try { localStorage.removeItem('currentUser'); } catch {}
  },
  // Async fresh read
  async getCurrentUserAsync(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user ?? readCachedUser();
  },
  // Legacy sync getter used by existing components
  getCurrentUser(): User | null {
    return readCachedUser();
  },
  isAuthenticated(): boolean {
    return !!readCachedUser();
  },
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) {
        try { localStorage.setItem('currentUser', JSON.stringify(session.user)); } catch {}
      } else {
        try { localStorage.removeItem('currentUser'); } catch {}
      }
      callback(session?.user ?? readCachedUser());
    });
  },
  // Persist integration/linking flags and metadata to users table
  async updateUserConnections(userId: string, updates: Partial<{ canvas_base_url: string | null; canvas_connected: boolean; calendar_url: string | null; calendar_connected: boolean; email_web_url: string | null; }>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
  },
  // Fetch integration/linking flags and metadata from users table
  async fetchUserConnections(userId: string): Promise<{ canvas_base_url: string | null; canvas_connected: boolean; calendar_url: string | null; calendar_connected: boolean; email_web_url: string | null; }> {
    const { data, error } = await supabase
      .from('users')
      .select('canvas_base_url, canvas_connected, calendar_url, calendar_connected, email_web_url')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return {
      canvas_base_url: (data as any)?.canvas_base_url ?? null,
      canvas_connected: Boolean((data as any)?.canvas_connected),
      calendar_url: (data as any)?.calendar_url ?? null,
      calendar_connected: Boolean((data as any)?.calendar_connected),
      email_web_url: (data as any)?.email_web_url ?? null,
    };
  }
};