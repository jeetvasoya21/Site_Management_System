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
    color: 'bg-rose-500/10 border-rose-500/50',
  },
  {
    id: 'Project_Manager',
    label: 'Project Manager',
    description: 'Manage projects & finance',
    icon: Users,
    color: 'bg-sky-500/10 border-sky-500/50',
  },
  {
    id: 'Site_Engineer',
    label: 'Site Engineer',
    description: 'Manage workers, tasks & inventory',
    icon: Hammer,
    color: 'bg-primary-500/10 border-primary-500/50',
  },
  {
    id: 'Worker',
    label: 'Worker',
    description: 'View attendance & salary',
    icon: HardHat,
    color: 'bg-emerald-500/10 border-emerald-500/50',
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
    setFormData((prev) => ({ ...prev, [field]: value }));

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

    const result = await login(
      formData.email,
      formData.password,
      formData.rememberMe,
      formData.role
    );

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
      {/* Background glow effects matching Dashboard's premium feel */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#7c3aed]/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md mb-2">
            Site<span className="text-primary-500">OS</span>
          </h1>
          <p className="text-slate-400">Construction Site Management</p>
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
          className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl shadow-black/40 p-8 space-y-8"
        >
          {/* Credentials Section */}

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
              Login Credentials
            </h2>

            <div className="space-y-4">
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
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    handleInputChange('rememberMe', e.target.checked)
                  }
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-950 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-slate-400 cursor-pointer select-none"
                >
                  Remember my session
                </label>
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Role Selection Section */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#7c3aed] rounded-full"></span>
              Select Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ROLES.map((roleOption) => {
                const Icon = roleOption.icon;
                const isSelected = formData.role === roleOption.id;

                return (
                  <button
                    key={roleOption.id}
                    type="button"
                    onClick={() => handleInputChange('role', roleOption.id)}
                    className={`p-4 rounded-xl border transition-all text-left group ${
                      isSelected
                        ? `${roleOption.color} border-current shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        size={24}
                        className={`transition-colors ${
                          isSelected ? 'text-current' : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      />
                      <div>
                        <p
                          className={`font-medium transition-colors ${
                            isSelected ? 'text-current' : 'text-slate-300 group-hover:text-slate-200'
                          }`}
                        >
                          {roleOption.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {roleOption.description}
                        </p>
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
            className="w-full bg-primary-600 hover:bg-primary-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
               <>
                 <Loader size={18} className="animate-spin" />
                 Authenticating...
               </>
             ) : (
               'Secure Sign In'
             )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/forgot-password"
            className="text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors"
          >
            Recover Password
          </Link>
          <p className="text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary-500 hover:text-primary-400 font-medium transition-colors ml-1"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
