import { create } from 'zustand';
import { authClient } from '../lib/auth-client';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isOffline: false,
  isLoading: false,
  error: null,

  /**
   * Initialize auth state — call once on app mount.
   * Restores existing session.
   */
  initialize: async () => {
    set({ isLoading: true });
    try {
      console.log('[Auth] Checking connection to backend...');
      // Simple connectivity check to backend health endpoint
      const isOnline = await Promise.race([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/health`)
          .then((r) => r.ok)
          .catch(() => false),
        new Promise((resolve) => setTimeout(() => resolve(false), 2000))
      ]);

      if (!isOnline) {
        console.warn('[Auth] Backend is offline. Enabling Demo Mode.');
        set({ isOffline: true });
        
        // Restore demo session if it exists
        const isDemoLoggedIn = localStorage.getItem('ootdash_demo_session') === 'true';
        const demoEmail = localStorage.getItem('ootdash_demo_email') || 'demo@ootdash.local';
        
        if (isDemoLoggedIn) {
          set({
            user: { email: demoEmail, id: 'demo-uuid-1234', name: 'Demo User', gender: 'Pria', birthDate: '1995-01-01' },
            session: { token: 'demo-token', user: { email: demoEmail } },
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
        return;
      }

      console.log('[Auth] Fetching session from Better Auth...');
      const { data, error } = await authClient.getSession();
      
      if (error) {
        console.error('[Auth] Better Auth session fetch failed:', error);
        set({ isLoading: false });
        return;
      }

      if (data) {
        set({
          user: data.user,
          session: data.session,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('[Auth] Initialization error:', err.message);
      set({ isLoading: false, error: err.message });
    }
  },

  /**
   * Sign up with email, password, and custom profile fields.
   */
  signUp: async (email, password, name = 'User', birthDate = '2000-01-01', gender = 'Unisex') => {
    set({ isLoading: true, error: null });

    if (get().isOffline) {
      await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate delay
      localStorage.setItem('ootdash_demo_session', 'true');
      localStorage.setItem('ootdash_demo_email', email);
      const mockUser = { email, id: 'demo-uuid-1234', name, birthDate, gender };
      set({
        user: mockUser,
        session: { token: 'demo-token', user: mockUser },
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true, user: mockUser };
    }

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        birthDate,
        gender,
      });

      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true, user: data.user };
    } catch (err) {
      set({ error: err.message || 'Gagal mendaftar', isLoading: false });
      return { success: false, error: err.message || 'Gagal mendaftar' };
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
      const mockUser = { email, id: 'demo-uuid-1234', name: 'Demo User', gender: 'Pria', birthDate: '1995-01-01' };
      set({
        user: mockUser,
        session: { token: 'demo-token', user: mockUser },
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true };
    }

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        // If it's the demo account and login failed (probably not registered yet in new Neon db), try auto-registering
        if (email === 'test@ootdash.local' && password === 'test1234') {
          console.log('[Auth] Test user not found. Attempting auto-registration...');
          const signUpRes = await authClient.signUp.email({
            email,
            password,
            name: 'Test User',
            gender: 'Pria',
            birthDate: '1995-01-01',
          });
          if (signUpRes.error) {
            throw signUpRes.error;
          }
          set({
            user: signUpRes.data.user,
            session: signUpRes.data.session,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        }
        throw error;
      }

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      set({ error: err.message || 'Gagal masuk', isLoading: false });
      return { success: false, error: err.message || 'Gagal masuk' };
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
      const { error } = await authClient.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message || 'Gagal keluar', isLoading: false });
    }
  },

  getAccessToken: () => {
    // Better Auth automatically manages sessions in cookies, so we don't manually track an access token
    return null;
  },

  clearError: () => set({ error: null }),
}));
