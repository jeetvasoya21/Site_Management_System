/**
 * Login Page
 * User authentication with email, password, and role selection
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormInput from '../components/auth/FormInput';
import Toast from '../components/auth/Toast';
import { validateFormField } from '../utils/validation';
import { Loader, Shield, Users, Hammer, HardHat } from 'lucide-react';

const ROLES = [
  {
    id: 'Admin',
    label: 'Admin',
    description: 'Full system access',
    icon: Shield,
    color: 'bg-rose-500/10 border-rose-500',
  },
  {
    id: 'Project_Manager',
    label: 'Project Manager',
    description: 'Manage projects & finance',
    icon: Users,
    color: 'bg-blue-500/10 border-blue-500',
  },
  {
    id: 'Site_Engineer',
    label: 'Site Manager',
    description: 'Manage workers, tasks & inventory',
    icon: Hammer,
    color: 'bg-amber-500/10 border-amber-500',
  },
  {
    id: 'Worker',
    label: 'Worker',
    description: 'View attendance & salary',
    icon: HardHat,
    color: 'bg-emerald-500/10 border-emerald-500',
  },
];

export default function AuthLogin() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Site_Engineer',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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

    const emailError = validateFormField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validateFormField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;

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

    const result = await login(formData.email, formData.password, formData.rememberMe, formData.role);

    if (result.success) {
      setToast({
        type: 'success',
        message: `Login successful as ${formData.role.replace('_', ' ')}!`,
      });

      setTimeout(() => {
        navigate(formData.role === 'Worker' ? '/worker' : '/');
      }, 1000);
    } else {
      setToast({
        type: 'error',
        message: result.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-500 mb-2">SiteOS</h1>
          <p className="text-slate-400">Construction Site Management</p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Credentials Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-50">Login Credentials</h2>
            
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

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-400 cursor-pointer">
                Remember me
              </label>
            </div>
          </div>

          {/* Role Selection Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-50">Select Your Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ROLES.map((roleOption) => {
                const Icon = roleOption.icon;
                const isSelected = formData.role === roleOption.id;
                
                return (
                  <button
                    key={roleOption.id}
                    type="button"
                    onClick={() => handleInputChange('role', roleOption.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `${roleOption.color} border-current`
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={24} className={isSelected ? 'text-current' : 'text-slate-400'} />
                      <div>
                        <p className={`font-medium ${isSelected ? 'text-current' : 'text-slate-50'}`}>
                          {roleOption.label}
                        </p>
                        <p className="text-sm text-slate-400">{roleOption.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-3 text-center">
          <Link
            to="/forgot-password"
            className="block text-amber-500 hover:text-amber-400 text-sm font-medium"
          >
            Forgot Password?
          </Link>
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber-500 hover:text-amber-400 font-medium">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-500 text-center mb-2">
            Demo Mode: Use any email and password to login
          </p>
          <p className="text-xs text-slate-500 text-center">
            Select a role to see features available for that role
          </p>
        </div>
      </div>
    </div>
  );
}
