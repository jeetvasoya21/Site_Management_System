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

// Normalize DB user shape: DB returns user_id, but the app reads user.id everywhere
const normalizeUser = (raw) => {
  if (!raw) return null;
  return {
    ...raw,
    id: String(raw.id ?? raw.user_id),       // always expose .id
    user_id: raw.user_id ?? raw.id,           // keep original for backwards compat
    role: normalizeRole(raw.role),
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(normalizeUser(currentUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const signup = useCallback(async (name, email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signup(name, email, password, role);
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (err) {
      const message = 'An error occurred during signup';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, rememberMe = false, selectedRole = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(email, password, selectedRole);
      if (result.success) {
        const normalizedUser = normalizeUser(result.user);
        // Also update session storage with normalized user (includes .id)
        sessionStorage.setItem('siteos_user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        setIsAuthenticated(true);
        return result;
      }
      setError(result.message);
      return result;
    } catch (err) {
      const message = 'An error occurred during login';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const resetPassword = useCallback(async (email, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.resetPassword(email, newPassword);
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (err) {
      const message = 'An error occurred during password reset';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
