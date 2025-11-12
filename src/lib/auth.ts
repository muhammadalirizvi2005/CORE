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
  }
};