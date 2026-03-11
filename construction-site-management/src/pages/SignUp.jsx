/**
 * Sign Up Page
 * User registration with email and password
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormInput from '../components/auth/FormInput';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import Toast from '../components/auth/Toast';
import { validateFormField, validatePasswordsMatch } from '../utils/validation';
import { Loader } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    const error = validateFormField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    const nameError = validateFormField('name', formData.name);
    if (nameError) newErrors.name = nameError;

    // Validate email
    const emailError = validateFormField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate password
    const passwordError = validateFormField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;

    // Validate confirm password
    const matchError = validatePasswordsMatch(formData.password, formData.confirmPassword);
    if (matchError) newErrors.confirmPassword = matchError;

    // Validate terms
    if (!formData.termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({
        type: 'error',
        message: 'Please fix the errors above',
      });
      return;
    }

    const result = await signup(formData.name, formData.email, formData.password);

    if (result.success) {
      setToast({
        type: 'success',
        message: 'Account created! Please verify your email.',
      });
      
      // Store email for verification page
      sessionStorage.setItem('verificationEmail', formData.email);
      
      setTimeout(() => {
        navigate('/verify-email');
      }, 1500);
    } else {
      setToast({
        type: 'error',
        message: result.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-500 mb-2">SiteOS</h1>
          <p className="text-slate-400">Create your account</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-6">
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            onBlur={() => handleBlur('name')}
            error={errors.name}
            required
            placeholder="John Doe"
          />

          <FormInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            required
            placeholder="you@example.com"
          />

          <div>
            <FormInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              required
              placeholder="••••••••"
              showToggle
            />
            {formData.password && (
              <div className="mt-3">
                <PasswordStrengthIndicator password={formData.password} />
              </div>
            )}
          </div>

          <FormInput
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(value) => handleInputChange('confirmPassword', value)}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
            required
            placeholder="••••••••"
            showToggle
          />

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={formData.termsAccepted}
              onChange={(e) => {
                handleInputChange('termsAccepted', e.target.checked);
                if (e.target.checked && errors.terms) {
                  setErrors(prev => ({ ...prev, terms: '' }));
                }
              }}
              className="mt-1 w-4 h-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-slate-400">
              I agree to the{' '}
              <a href="#" className="text-amber-500 hover:text-amber-400">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-amber-500 hover:text-amber-400">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-rose-500">{errors.terms}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
