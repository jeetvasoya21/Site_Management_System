/**
 * Authentication Context
 * Manages authentication state and actions
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return 'Site_Engineer';
  return role.trim().replace(/\s+/g, '_');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const session = authService.getSession();
    if (session && session.token && session.user) {
      const normalizedUser = {
        ...session.user,
        role: normalizeRole(session.user.role),
      };
      setUser(normalizedUser);
      setToken(session.token);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Sign up
  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = authService.signup(name, email, password);
      if (result.success) {
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const message = 'An error occurred during signup';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (email, code) => {
    setLoading(true);
    setError(null);
    try {
      const result = authService.verifyEmail(email, code);
      if (result.success) {
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const message = 'An error occurred during verification';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Resend verification code
  const resendVerificationCode = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const result = authService.resendVerificationCode(email);
      if (result.success) {
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const message = 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with role
  const login = useCallback(async (email, password, rememberMe = false, role = 'Site_Engineer') => {
    setLoading(true);
    setError(null);
    try {
      const result = authService.login(email, password, rememberMe);
      if (result.success) {
        // Assign selected role to user
        const userWithRole = { ...result.user, role: normalizeRole(role) };
        setUser(userWithRole);
        setToken(result.token);
        setIsAuthenticated(true);
        return { ...result, user: userWithRole };
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const message = 'An error occurred during login';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      authService.logout();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setError(null);
      return { success: true, message: 'Logged out successfully' };
    } catch (err) {
      const message = 'An error occurred during logout';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Request password reset
  const requestPasswordReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const result = authService.requestPasswordReset(email);
      return result;
    } catch (err) {
      const message = 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (resetToken, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const result = authService.resetPassword(resetToken, newPassword);
      if (result.success) {
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const message = 'An error occurred during password reset';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const result = authService.updateProfile(user.id, updates);
      if (result.success) {
        setUser(result.user);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const message = 'An error occurred during profile update';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const result = authService.changePassword(user.id, currentPassword, newPassword);
      if (result.success) {
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const message = 'An error occurred during password change';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete account
  const deleteAccount = useCallback(async (password) => {
    setLoading(true);
    setError(null);
    try {
      const result = authService.deleteAccount(user.id, password);
      if (result.success) {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const message = 'An error occurred during account deletion';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    signup,
    verifyEmail,
    resendVerificationCode,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
