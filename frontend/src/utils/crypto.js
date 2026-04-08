/**
 * Cryptography Utilities
 * Password hashing, token generation, and encryption functions
 */

import { v4 as uuidv4 } from 'uuid';

// Simple password hashing (in production, use bcrypt on backend)
// For frontend, we'll use a simple hash for demonstration
export const hashPassword = (password) => {
  // This is a simple hash for frontend demonstration
  // In production, passwords should NEVER be hashed on frontend
  // Always hash on backend with bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

// Compare password with hash (simple comparison for frontend)
export const comparePassword = (password, hash) => {
  return hashPassword(password) === hash;
};

// Generate JWT token (simple implementation for frontend)
export const generateToken = (userId, expiresIn = 86400000) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn / 1000,
  }));
  const signature = btoa(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
};

// Validate token
export const validateToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch (error) {
    return false;
  }
};

// Decode token
export const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    return JSON.parse(atob(parts[1]));
  } catch (error) {
    return null;
  }
};

// Generate verification code (6 digits)
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate password reset token
export const generateResetToken = () => {
  return uuidv4();
};

// Simple encryption for localStorage (not secure, for demonstration only)
export const encryptData = (data, key = 'siteos-secret') => {
  try {
    const jsonString = JSON.stringify(data);
    let encrypted = '';
    for (let i = 0; i < jsonString.length; i++) {
      encrypted += String.fromCharCode(jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

// Simple decryption for localStorage (not secure, for demonstration only)
export const decryptData = (encrypted, key = 'siteos-secret') => {
  try {
    const decrypted = atob(encrypted);
    let jsonString = '';
    for (let i = 0; i < decrypted.length; i++) {
      jsonString += String.fromCharCode(decrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Generate UUID
export const generateId = () => {
  return uuidv4();
};
