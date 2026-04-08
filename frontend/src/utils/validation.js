/**
 * Validation Utilities
 * Email, password, name, and phone validation functions
 */

// Email validation using RFC 5322 pattern
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length >= 5 && email.length <= 254;
};

// Password validation - must have uppercase, lowercase, number, special char, min 8 chars
export const validatePassword = (password) => {
  if (password.length < 8 || password.length > 128) return false;
  if (!/[A-Z]/.test(password)) return false; // uppercase
  if (!/[a-z]/.test(password)) return false; // lowercase
  if (!/[0-9]/.test(password)) return false; // number
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false; // special char
  return true;
};

// Get password strength (0-4)
export const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  return strength;
};

// Get password strength label
export const getPasswordStrengthLabel = (strength) => {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return labels[strength] || 'Very Weak';
};

// Get password strength color
export const getPasswordStrengthColor = (strength) => {
  const colors = ['text-rose-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-emerald-500'];
  return colors[strength] || 'text-rose-500';
};

// Check password requirements
export const getPasswordRequirements = (password) => {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

// Name validation
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  return nameRegex.test(name);
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) return true; // optional field
  const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
  return phoneRegex.test(phone);
};

// Form field validation
export const validateFormField = (fieldName, value) => {
  switch (fieldName) {
    case 'email':
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email address';
      return '';
    
    case 'password':
      if (!value) return 'Password is required';
      if (!validatePassword(value)) {
        return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
      }
      return '';
    
    case 'confirmPassword':
      return ''; // validated separately
    
    case 'name':
      if (!value) return 'Full name is required';
      if (!validateName(value)) return 'Name must be 2-50 characters (letters, spaces, hyphens, apostrophes only)';
      return '';
    
    case 'phone':
      if (!validatePhone(value)) return 'Please enter a valid phone number';
      return '';
    
    case 'currentPassword':
      if (!value) return 'Current password is required';
      return '';
    
    default:
      return '';
  }
};

// Validate passwords match
export const validatePasswordsMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate form data
export const validateFormData = (formData, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    const error = validateFormField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

// Check if form has errors
export const hasFormErrors = (errors) => {
  return Object.values(errors).some(error => error !== '');
};
