import { create } from 'zustand';
import api from '../services/api';

const fallbackResponse = (err, fallbackMessage) => ({
  success: false,
  message: err.response?.data?.message || fallbackMessage,
  errors: err.response?.data?.errors || [],
});

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/auth/me');
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
        initialized: true,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true,
      });
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', payload);
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
        initialized: true,
      });
      return data;
    } catch (err) {
      const failure = fallbackResponse(err, 'An error occurred during signup');
      set({ loading: false, error: failure.message });
      return failure;
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
        initialized: true,
      });
      return data;
    } catch (err) {
      const failure = fallbackResponse(err, 'An error occurred during login');
      set({ loading: false, error: failure.message });
      return failure;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/logout');
    } catch {
      // Cookie cleanup still happens client-side via state reset.
    }

    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      initialized: true,
      error: null,
    });

    return { success: true, message: 'Logged out successfully' };
  },

  refreshSession: async () => {
    try {
      const { data } = await api.post('/auth/refresh-token');
      set({
        user: data.user || get().user,
        isAuthenticated: true,
        initialized: true,
      });
      return data;
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        initialized: true,
      });
      throw err;
    }
  },

  updateProfile: async (updates) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put('/auth/profile', updates);
      set((state) => ({
        user: { ...state.user, ...data.user },
        loading: false,
      }));
      return data;
    } catch (err) {
      const failure = fallbackResponse(err, 'An error occurred during profile update');
      set({ loading: false, error: failure.message });
      return failure;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
      set({ user: data.user, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      const failure = fallbackResponse(err, 'An error occurred during password change');
      set({ loading: false, error: failure.message });
      return failure;
    }
  },

  clearError: () => set({ error: null }),
}));
