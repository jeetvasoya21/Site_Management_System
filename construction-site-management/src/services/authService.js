/**
 * Authentication Service
 * Handles user registration, login, password reset, and session management
 */

import {
  hashPassword,
  comparePassword,
  generateToken,
  validateToken,
  decodeToken,
  generateVerificationCode,
  generateResetToken,
  encryptData,
  decryptData,
  generateId,
} from '../utils/crypto';
import { validateEmail, sanitizeInput } from '../utils/validation';

const STORAGE_KEY = 'siteos_users';
const SESSION_KEY = 'siteos_session';
const VERIFICATION_KEY = 'siteos_verification';
const RESET_KEY = 'siteos_reset';

class AuthService {
  // Get all users from localStorage
  getAllUsers() {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) return [];
      return decryptData(encrypted) || [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Save users to localStorage
  saveUsers(users) {
    try {
      const encrypted = encryptData(users);
      localStorage.setItem(STORAGE_KEY, encrypted);
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  }

  // Get user by email
  getUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // Get user by ID
  getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId);
  }

  // Sign up new user
  signup(name, email, password) {
    try {
      // Validate inputs
      if (!name || !email || !password) {
        return { success: false, message: 'All fields are required' };
      }

      // Check if email already exists
      if (this.getUserByEmail(email)) {
        return { success: false, message: 'Email already registered' };
      }

      // Create new user
      const newUser = {
        id: generateId(),
        name: sanitizeInput(name),
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        phone: '',
        role: 'Site_Engineer', // Default role
        verified: false,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        lastPasswordChange: new Date().toISOString(),
        accountLocked: false,
        lockUntil: null,
        failedLoginAttempts: 0,
      };

      // Add user to storage
      const users = this.getAllUsers();
      users.push(newUser);
      this.saveUsers(users);

      // Generate verification code
      const verificationCode = generateVerificationCode();
      this.storeVerificationCode(email, verificationCode);

      return {
        success: true,
        message: 'Account created successfully. Please verify your email.',
        userId: newUser.id,
        verificationCode, // For demo purposes
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'An error occurred during signup' };
    }
  }

  // Store verification code
  storeVerificationCode(email, code) {
    try {
      const verifications = this.getVerifications();
      verifications[email] = {
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        attempts: 0,
        verified: false,
      };
      const encrypted = encryptData(verifications);
      localStorage.setItem(VERIFICATION_KEY, encrypted);
    } catch (error) {
      console.error('Error storing verification code:', error);
    }
  }

  // Get verifications
  getVerifications() {
    try {
      const encrypted = localStorage.getItem(VERIFICATION_KEY);
      if (!encrypted) return {};
      return decryptData(encrypted) || {};
    } catch (error) {
      console.error('Error getting verifications:', error);
      return {};
    }
  }

  // Verify email
  verifyEmail(email, code) {
    try {
      const verifications = this.getVerifications();
      const verification = verifications[email];

      if (!verification) {
        return { success: false, message: 'Verification code not found' };
      }

      if (new Date() > new Date(verification.expiresAt)) {
        return { success: false, message: 'Verification code expired' };
      }

      if (verification.code !== code) {
        verification.attempts++;
        if (verification.attempts >= 3) {
          delete verifications[email];
        }
        const encrypted = encryptData(verifications);
        localStorage.setItem(VERIFICATION_KEY, encrypted);
        return { success: false, message: 'Invalid verification code' };
      }

      // Mark user as verified
      const users = this.getAllUsers();
      const user = this.getUserByEmail(email);
      if (user) {
        user.verified = true;
        this.saveUsers(users);
      }

      // Remove verification code
      delete verifications[email];
      const encrypted = encryptData(verifications);
      localStorage.setItem(VERIFICATION_KEY, encrypted);

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'An error occurred during verification' };
    }
  }

  // Resend verification code
  resendVerificationCode(email) {
    try {
      const user = this.getUserByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const verificationCode = generateVerificationCode();
      this.storeVerificationCode(email, verificationCode);

      return {
        success: true,
        message: 'Verification code sent to your email',
        verificationCode, // For demo purposes
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'An error occurred' };
    }
  }

  // Login user
  login(email, password, rememberMe = false) {
    try {
      const user = this.getUserByEmail(email);

      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      if (user.accountLocked && new Date() < new Date(user.lockUntil)) {
        return { success: false, message: 'Account locked. Try again later.' };
      }

      // Skip email verification for now - allow login without verification
      // if (!user.verified) {
      //   return { success: false, message: 'Please verify your email first' };
      // }

      if (!comparePassword(password, user.passwordHash)) {
        user.failedLoginAttempts++;
        if (user.failedLoginAttempts >= 5) {
          user.accountLocked = true;
          user.lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
        }
        this.saveUsers(this.getAllUsers());
        return { success: false, message: 'Invalid email or password' };
      }

      // Reset failed attempts
      user.failedLoginAttempts = 0;
      user.accountLocked = false;
      user.lastLogin = new Date().toISOString();
      this.saveUsers(this.getAllUsers());

      // Generate token
      const token = generateToken(user.id);

      // Store session
      const session = {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          verified: user.verified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        rememberMe,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };

      const encrypted = encryptData(session);
      localStorage.setItem(SESSION_KEY, encrypted);

      return {
        success: true,
        message: 'Login successful',
        token,
        user: session.user,
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }

  // Logout user
  logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'An error occurred during logout' };
    }
  }

  // Get current session
  getSession() {
    try {
      const encrypted = localStorage.getItem(SESSION_KEY);
      if (!encrypted) return null;

      const session = decryptData(encrypted);
      if (!session) return null;

      // Check token validity
      if (!validateToken(session.token)) {
        this.logout();
        return null;
      }

      // Check session timeout (24 hours)
      const lastActivity = new Date(session.lastActivity);
      const now = new Date();
      if (now - lastActivity > 24 * 60 * 60 * 1000) {
        this.logout();
        return null;
      }

      // Update last activity
      session.lastActivity = new Date().toISOString();
      const newEncrypted = encryptData(session);
      localStorage.setItem(SESSION_KEY, newEncrypted);

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Request password reset
  requestPasswordReset(email) {
    try {
      const user = this.getUserByEmail(email);

      if (!user) {
        // Return generic message for security
        return { success: true, message: 'If email exists, reset link will be sent' };
      }

      const resetToken = generateResetToken();
      const resets = this.getResets();
      resets[resetToken] = {
        email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        used: false,
      };

      const encrypted = encryptData(resets);
      localStorage.setItem(RESET_KEY, encrypted);

      return {
        success: true,
        message: 'If email exists, reset link will be sent',
        resetToken, // For demo purposes
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, message: 'An error occurred' };
    }
  }

  // Get resets
  getResets() {
    try {
      const encrypted = localStorage.getItem(RESET_KEY);
      if (!encrypted) return {};
      return decryptData(encrypted) || {};
    } catch (error) {
      console.error('Error getting resets:', error);
      return {};
    }
  }

  // Reset password
  resetPassword(resetToken, newPassword) {
    try {
      const resets = this.getResets();
      const reset = resets[resetToken];

      if (!reset) {
        return { success: false, message: 'Invalid or expired reset link' };
      }

      if (new Date() > new Date(reset.expiresAt)) {
        delete resets[resetToken];
        const encrypted = encryptData(resets);
        localStorage.setItem(RESET_KEY, encrypted);
        return { success: false, message: 'Reset link expired' };
      }

      if (reset.used) {
        return { success: false, message: 'Reset link already used' };
      }

      // Update user password
      const users = this.getAllUsers();
      const user = this.getUserByEmail(reset.email);

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      user.passwordHash = hashPassword(newPassword);
      user.lastPasswordChange = new Date().toISOString();
      this.saveUsers(users);

      // Mark reset as used
      reset.used = true;
      const newEncrypted = encryptData(resets);
      localStorage.setItem(RESET_KEY, newEncrypted);

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'An error occurred during password reset' };
    }
  }

  // Update profile
  updateProfile(userId, updates) {
    try {
      const users = this.getAllUsers();
      const user = this.getUserById(userId);

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (updates.name) user.name = sanitizeInput(updates.name);
      if (updates.phone) user.phone = sanitizeInput(updates.phone);

      this.saveUsers(users);

      // Update session
      const session = this.getSession();
      if (session) {
        session.user = {
          ...session.user,
          name: user.name,
          phone: user.phone,
        };
        const encrypted = encryptData(session);
        localStorage.setItem(SESSION_KEY, encrypted);
      }

      return { success: true, message: 'Profile updated successfully', user };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'An error occurred during profile update' };
    }
  }

  // Change password
  changePassword(userId, currentPassword, newPassword) {
    try {
      const user = this.getUserById(userId);

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!comparePassword(currentPassword, user.passwordHash)) {
        return { success: false, message: 'Current password is incorrect' };
      }

      user.passwordHash = hashPassword(newPassword);
      user.lastPasswordChange = new Date().toISOString();
      this.saveUsers(this.getAllUsers());

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'An error occurred during password change' };
    }
  }

  // Delete account
  deleteAccount(userId, password) {
    try {
      const user = this.getUserById(userId);

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!comparePassword(password, user.passwordHash)) {
        return { success: false, message: 'Password is incorrect' };
      }

      const users = this.getAllUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index > -1) {
        users.splice(index, 1);
        this.saveUsers(users);
      }

      this.logout();

      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, message: 'An error occurred during account deletion' };
    }
  }
}

export default new AuthService();
