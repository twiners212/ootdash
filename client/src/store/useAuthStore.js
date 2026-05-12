import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check existing session
  error: null,

  /**
   * Initialize auth state — call once on app mount.
   * Restores existing session and subscribes to auth changes.
   */
  initialize: async () => {
    try {
      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session) {
        set({
          user: session.user,
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      // Subscribe to auth state changes (login, logout, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          set({
            user: session?.user || null,
            session: session || null,
            isAuthenticated: !!session,
          });
        }
      );

      // Store unsubscribe function for cleanup
      set({ _unsubscribe: subscription?.unsubscribe });
    } catch (err) {
      console.error('[Auth] Initialization error:', err.message);
      set({ isLoading: false, error: err.message });
    }
  },

  /**
   * Sign up with email and password.
   */
  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.session,
        isLoading: false,
      });

      return { success: true, user: data.user };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  /**
   * Sign in with email and password.
   */
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  /**
   * Sign out the current user.
   */
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  /**
   * Get the current access token for API calls.
   */
  getAccessToken: () => {
    const session = get().session;
    return session?.access_token || null;
  },

  clearError: () => set({ error: null }),
}));
