import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isOffline: false,

  /**
   * Initialize auth state — call once on app mount.
   * Restores existing session and subscribes to auth changes.
   */
  initialize: async () => {
    try {
      console.log('[Auth] Checking connection to Supabase...');
      // Simple connectivity check with 1.5s timeout
      const isOnline = await Promise.race([
        fetch('http://127.0.0.1:54321/auth/v1/health')
          .then(() => true)
          .catch(() => false),
        new Promise((resolve) => setTimeout(() => resolve(false), 1500))
      ]);

      if (!isOnline) {
        console.warn('[Auth] Supabase is offline. Enabling Demo Mode.');
        set({ isOffline: true });
        
        // Restore demo session if it exists
        const isDemoLoggedIn = localStorage.getItem('ootdash_demo_session') === 'true';
        const demoEmail = localStorage.getItem('ootdash_demo_email') || 'demo@ootdash.local';
        
        if (isDemoLoggedIn) {
          set({
            user: { email: demoEmail, id: 'demo-uuid-1234' },
            session: { access_token: 'demo-access-token', user: { email: demoEmail } },
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
        return;
      }

      console.log('[Auth] getSession started');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('[Auth] getSession finished:', { session, error });
      
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
          // Skip state updates if we've switched to offline mode in the meantime
          if (get().isOffline) return;
          
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

    if (get().isOffline) {
      await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate delay
      localStorage.setItem('ootdash_demo_session', 'true');
      localStorage.setItem('ootdash_demo_email', email);
      const mockUser = { email, id: 'demo-uuid-1234' };
      set({
        user: mockUser,
        session: { access_token: 'demo-access-token', user: mockUser },
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true, user: mockUser };
    }

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

    if (get().isOffline) {
      await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate delay
      localStorage.setItem('ootdash_demo_session', 'true');
      localStorage.setItem('ootdash_demo_email', email);
      const mockUser = { email, id: 'demo-uuid-1234' };
      set({
        user: mockUser,
        session: { access_token: 'demo-access-token', user: mockUser },
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true };
    }

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

    if (get().isOffline) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      localStorage.removeItem('ootdash_demo_session');
      localStorage.removeItem('ootdash_demo_email');
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false
      });
      return;
    }

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
