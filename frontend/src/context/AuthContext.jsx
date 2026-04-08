import { createContext, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);
  const register = useAuthStore((state) => state.register);
  const loginAction = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const value = useMemo(() => ({
    user,
    token: null,
    loading: loading || !initialized,
    error,
    isAuthenticated,
    signup: async (name, email, password, role = 'Site_Engineer', phone = '') =>
      register({ name, email, password, role, phone }),
    verifyEmail: async () => ({ success: true, message: 'Email verification is not enabled.' }),
    resendVerificationCode: async () => ({ success: true, message: 'Email verification is not enabled.' }),
    login: async (email, password, _rememberMe = false, role) => {
      const response = await loginAction({ email, password });
      if (response.success && role && response.user?.role !== role) {
        await logout();
        return {
          success: false,
          message: `This account is registered as ${response.user?.role}.`,
        };
      }
      return response;
    },
    logout,
    requestPasswordReset: async () => ({ success: false, message: 'Password reset is not enabled yet.' }),
    resetPassword: async () => ({ success: false, message: 'Password reset is not enabled yet.' }),
    updateProfile,
    changePassword,
    deleteAccount: async () => ({ success: false, message: 'Account deletion is not enabled yet.' }),
  }), [
    changePassword,
    error,
    initialized,
    isAuthenticated,
    loading,
    loginAction,
    logout,
    register,
    updateProfile,
    user,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
