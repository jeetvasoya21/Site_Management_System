/**
 * Authentication Service
 * Handles user login and session management with backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class AuthService {
  async login(email, password, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }

      if (data.user) {
        sessionStorage.setItem('siteos_user', JSON.stringify(data.user));
      }

      return { success: true, user: data.user, message: data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  async signup(name, email, password, role, phone = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role, phone }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.error || 'Signup failed' };
      }

      return { success: true, user: data.user, message: data.message };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  async resetPassword(email, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Password reset failed',
          limitReached: data.limitReached || false,
        };
      }

      return {
        success: true,
        message: data.message,
        resetsRemaining: data.resetsRemaining,
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  logout() {
    sessionStorage.removeItem('siteos_user');
    localStorage.removeItem('siteos_user'); // Clear legacy localstorage
  }

  getCurrentUser() {
    try {
      const user = sessionStorage.getItem('siteos_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
}

export default new AuthService();
