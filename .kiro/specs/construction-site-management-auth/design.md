# Design Document: Production-Ready Authentication System

## Overview

This document specifies the technical design for a production-ready authentication and user management system for SiteOS Enterprise. The system implements secure user registration, login, password recovery, and account management using localStorage for frontend persistence.

## Architecture

### Authentication Flow

```
User Registration
├── Sign Up Form
├── Email Verification
├── Account Created
└── Redirect to Dashboard

User Login
├── Login Form
├── Credential Validation
├── JWT Token Generation
├── Session Storage
└── Redirect to Dashboard

Password Recovery
├── Forgot Password Form
├── Email Verification
├── Password Reset Form
├── Password Update
└── Redirect to Login
```

### Data Storage Architecture

```
localStorage
├── user: {
│   id, name, email, phone, role, 
│   createdAt, lastLogin, verified
│ }
├── token: JWT token string
├── tokenExpiry: timestamp
├── verificationCode: code for email verification
├── resetToken: token for password reset
└── sessionData: {
    rememberMe, loginTime, lastActivity
  }
```

### Security Architecture

```
User Input
├── Client-side Validation
├── XSS Prevention (sanitization)
├── CSRF Protection (token)
├── Password Hashing (bcrypt)
└── Secure Storage (localStorage)
```

## Components and Interfaces

### Authentication Pages

#### Sign Up Page
**Purpose**: Allow new users to create accounts

**Components**:
- Header with company branding
- Sign Up form with fields:
  - Full Name (text input)
  - Email (email input)
  - Password (password input with show/hide toggle)
  - Confirm Password (password input with show/hide toggle)
  - Terms & Conditions checkbox
- Password strength indicator
- Error messages below each field
- Submit button (disabled until valid)
- Link to Login page
- Link to Terms of Service

**Validation Rules**:
- Full Name: required, 2-50 characters
- Email: required, valid email format
- Password: required, min 8 chars, uppercase, lowercase, number, special char
- Confirm Password: must match Password
- Terms: must be checked

**Error Handling**:
- Display field-level errors
- Show password strength feedback
- Display generic error for duplicate email
- Show loading state during submission

#### Email Verification Page
**Purpose**: Verify user's email address

**Components**:
- Header with verification message
- Verification code input (6-digit code)
- Resend Code button
- Countdown timer (5 minutes)
- Back to Login link
- Error messages

**Validation Rules**:
- Code: required, 6 digits
- Code: must match generated code
- Code: must not be expired

**Error Handling**:
- Display invalid code error
- Show expired code message
- Allow resend with new code

#### Login Page
**Purpose**: Authenticate existing users

**Components**:
- Header with company branding
- Login form with fields:
  - Email (email input)
  - Password (password input with show/hide toggle)
  - Remember Me checkbox
- Submit button
- Forgot Password link
- Sign Up link
- Error messages
- Loading state

**Validation Rules**:
- Email: required, valid format
- Password: required, non-empty

**Error Handling**:
- Display "Invalid email or password" (generic for security)
- Show account locked message after 5 attempts
- Display loading state during verification

#### Forgot Password Page
**Purpose**: Initiate password reset process

**Components**:
- Header with reset message
- Email input field
- Submit button
- Back to Login link
- Success message after submission
- Error messages

**Validation Rules**:
- Email: required, valid format
- Email: must exist in system

**Error Handling**:
- Display generic message (for security)
- Show success message regardless

#### Password Reset Page
**Purpose**: Allow user to set new password

**Components**:
- Header with reset message
- New Password input (with show/hide toggle)
- Confirm Password input (with show/hide toggle)
- Password strength indicator
- Submit button
- Back to Login link
- Error messages

**Validation Rules**:
- New Password: min 8 chars, uppercase, lowercase, number, special char
- Confirm Password: must match New Password
- Token: must be valid and not expired

**Error Handling**:
- Display expired token message
- Show password strength feedback
- Display validation errors

#### Profile Page
**Purpose**: Display and manage user profile

**Components**:
- User information display:
  - Name
  - Email
  - Role
  - Phone
  - Account created date
  - Last login date
- Edit Profile button
- Change Password link
- Delete Account button
- Logout button

**Edit Profile Form**:
- Name input
- Phone input
- Submit button
- Cancel button
- Error messages

#### Change Password Page
**Purpose**: Allow user to change password

**Components**:
- Current Password input (with show/hide toggle)
- New Password input (with show/hide toggle)
- Confirm Password input (with show/hide toggle)
- Password strength indicator
- Submit button
- Cancel button
- Error messages

**Validation Rules**:
- Current Password: must match stored password
- New Password: min 8 chars, uppercase, lowercase, number, special char
- Confirm Password: must match New Password

**Error Handling**:
- Display "Current password incorrect" error
- Show password strength feedback
- Display validation errors

### UI Components

#### Form Input Component
**Props**:
```javascript
{
  label: string,
  type: 'text' | 'email' | 'password' | 'number',
  value: string,
  onChange: (value: string) => void,
  error: string,
  required: boolean,
  placeholder: string,
  hint: string,
  icon: ReactNode,
  disabled: boolean,
  showToggle: boolean (for password fields)
}
```

**Features**:
- Real-time validation
- Error display below field
- Success checkmark for valid fields
- Show/hide toggle for password fields
- Hint text below field
- Icon support
- Disabled state

#### Password Strength Indicator Component
**Props**:
```javascript
{
  password: string,
  showRequirements: boolean
}
```

**Features**:
- Visual strength meter (0-4 levels)
- Color coding (red, orange, yellow, green)
- Requirement checklist:
  - Minimum 8 characters
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character

#### Toast Notification Component
**Props**:
```javascript
{
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  duration: number (milliseconds),
  onClose: () => void
}
```

**Features**:
- Auto-dismiss after duration
- Manual close button
- Color-coded by type
- Slide-in animation
- Multiple notifications queue

#### Loading Spinner Component
**Props**:
```javascript
{
  size: 'sm' | 'md' | 'lg',
  text: string
}
```

**Features**:
- Animated spinner
- Optional loading text
- Overlay mode for full-page loading

### Authentication Service

#### AuthService
**Methods**:
```javascript
// Registration
signup(name, email, password) -> Promise<{success, message, userId}>
verifyEmail(code) -> Promise<{success, message}>
resendVerificationCode() -> Promise<{success, message}>

// Login
login(email, password) -> Promise<{success, message, token, user}>
logout() -> Promise<{success, message}>

// Password Recovery
requestPasswordReset(email) -> Promise<{success, message}>
resetPassword(token, newPassword) -> Promise<{success, message}>

// Session Management
getStoredToken() -> string | null
getStoredUser() -> object | null
isTokenValid() -> boolean
refreshToken() -> Promise<{success, token}>
clearSession() -> void

// Profile Management
updateProfile(updates) -> Promise<{success, message, user}>
changePassword(currentPassword, newPassword) -> Promise<{success, message}>
deleteAccount(password) -> Promise<{success, message}>
```

### Data Models

#### User
```javascript
{
  id: string (UUID),
  name: string,
  email: string,
  passwordHash: string (bcrypt hash),
  phone: string,
  role: 'Admin' | 'Project_Manager' | 'Site_Engineer' | 'Storekeeper',
  verified: boolean,
  createdAt: ISO 8601 timestamp,
  lastLogin: ISO 8601 timestamp,
  lastPasswordChange: ISO 8601 timestamp,
  accountLocked: boolean,
  lockUntil: ISO 8601 timestamp,
  failedLoginAttempts: number
}
```

#### Session
```javascript
{
  token: string (JWT),
  tokenExpiry: ISO 8601 timestamp,
  user: User object,
  rememberMe: boolean,
  loginTime: ISO 8601 timestamp,
  lastActivity: ISO 8601 timestamp
}
```

#### VerificationCode
```javascript
{
  code: string (6 digits),
  email: string,
  expiresAt: ISO 8601 timestamp,
  attempts: number,
  verified: boolean
}
```

#### PasswordReset
```javascript
{
  token: string (UUID),
  email: string,
  expiresAt: ISO 8601 timestamp,
  used: boolean
}
```

### Validation Rules

#### Email Validation
- Format: RFC 5322 standard
- Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Length: 5-254 characters
- Unique: must not exist in system

#### Password Validation
- Minimum length: 8 characters
- Must contain: uppercase letter (A-Z)
- Must contain: lowercase letter (a-z)
- Must contain: number (0-9)
- Must contain: special character (!@#$%^&*)
- Maximum length: 128 characters
- Cannot contain: username or email

#### Name Validation
- Minimum length: 2 characters
- Maximum length: 50 characters
- Allowed characters: letters, spaces, hyphens, apostrophes
- Pattern: `/^[a-zA-Z\s'-]{2,50}$/`

#### Phone Validation
- Format: International format or local format
- Pattern: `/^[\d\s\-\+\(\)]{10,20}$/`
- Optional field

### Error Handling

#### Authentication Errors
- Invalid credentials: "Invalid email or password"
- User not found: "Invalid email or password" (generic)
- Email not verified: "Please verify your email first"
- Account locked: "Account locked. Try again in 30 minutes"
- Token expired: "Session expired. Please log in again"
- Invalid token: "Invalid or expired link"

#### Validation Errors
- Required field: "This field is required"
- Invalid email: "Please enter a valid email address"
- Weak password: "Password does not meet requirements"
- Password mismatch: "Passwords do not match"
- Duplicate email: "Email already registered"

#### Server Errors
- Network error: "Unable to connect. Please check your connection"
- Server error: "Something went wrong. Please try again"
- Timeout: "Request timed out. Please try again"

### Security Measures

#### Password Security
- Hash passwords using bcrypt with salt rounds: 10
- Never store plain text passwords
- Never send passwords in URLs or logs
- Implement password strength requirements
- Prevent password reuse (last 5 passwords)

#### Token Security
- Use JWT with HS256 algorithm
- Token expiration: 24 hours
- Refresh token mechanism for extended sessions
- Store tokens in localStorage (not cookies for CORS)
- Validate token signature on every request

#### Input Security
- Sanitize all user input to prevent XSS
- Validate input on client and server
- Escape special characters in output
- Use Content Security Policy headers
- Implement CSRF protection with tokens

#### Session Security
- Implement session timeout after 24 hours
- Track last activity timestamp
- Invalidate session on logout
- Prevent session fixation attacks
- Implement secure session storage

#### Rate Limiting
- Max 5 login attempts per 15 minutes
- Max 3 password reset requests per hour
- Max 10 verification code requests per hour
- Lock account after 5 failed attempts for 30 minutes

### Responsive Design

#### Mobile (< 768px)
- Single column layout
- Full-width form inputs
- Larger touch targets (44px minimum)
- Simplified navigation
- Stacked buttons

#### Tablet (768px - 1024px)
- Two column layout where appropriate
- Optimized spacing
- Touch-friendly interface

#### Desktop (> 1024px)
- Multi-column layout
- Centered form containers (max-width: 500px)
- Hover states on interactive elements
- Keyboard navigation support

### Accessibility

#### WCAG 2.1 AA Compliance
- Semantic HTML structure
- ARIA labels for form inputs
- Keyboard navigation support
- Color contrast ratio: 4.5:1 for text
- Focus indicators on interactive elements
- Error messages linked to form fields
- Loading states announced to screen readers

#### Keyboard Navigation
- Tab through form fields
- Enter to submit forms
- Escape to close modals
- Arrow keys for dropdowns
- Space to toggle checkboxes

## Testing Strategy

### Unit Tests
- Validation functions
- Password strength checker
- Email format validator
- Token generation and validation
- Error message generation

### Integration Tests
- Sign up flow
- Email verification flow
- Login flow
- Password reset flow
- Profile update flow
- Session persistence

### End-to-End Tests
- Complete user registration journey
- Complete login journey
- Complete password recovery journey
- Session timeout and refresh
- Cross-browser compatibility

### Security Tests
- XSS prevention
- CSRF protection
- Password hashing verification
- Token expiration
- Rate limiting
- Account lockout

