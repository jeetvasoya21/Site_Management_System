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
    role: 'Site_Engineer',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    const error = validateFormField(field, formData[field]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
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

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Validate confirm password
    const matchError = validatePasswordsMatch(
      formData.password,
      formData.confirmPassword
    );
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

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );

    if (result.success) {
      setToast({
        type: 'success',
        message: 'Account created successfully!',
      });

      setTimeout(() => {
        navigate('/login');
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
      {/* Background glow effects matching Dashboard's premium feel */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#7c3aed]/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md mb-2">
            Site<span className="text-primary-500">OS</span>
          </h1>
          <p className="text-slate-400">Create your account</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4">
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* Form Container with Glassmorphism matching the Dashboard Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl shadow-black/40 p-8 space-y-6"
        >
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
            placeholder="developer@siteos.in"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className={`w-full px-4 h-10 appearance-none bg-slate-900 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors ${
                errors.role
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-800 focus:border-primary-500 hover:border-slate-700'
              }`}
            >
              <option value="Admin" className="bg-slate-900 text-slate-100">Admin</option>
              <option value="Project_Manager" className="bg-slate-900 text-slate-100">Project Manager</option>
              <option value="Site_Engineer" className="bg-slate-900 text-slate-100">Site Engineer</option>
              <option value="Worker" className="bg-slate-900 text-slate-100">Worker</option>
            </select>
            {errors.role && (
              <p className="text-sm text-rose-500">{errors.role}</p>
            )}
          </div>

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
                  setErrors((prev) => ({ ...prev, terms: '' }));
                }
              }}
              className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-950 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-slate-400">
              I agree to the{' '}
              <a href="#" className="text-primary-500 hover:text-primary-400 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-500 hover:text-primary-400 transition-colors">
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
            className="w-full mt-4 bg-primary-600 hover:bg-primary-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
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
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-1.5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
