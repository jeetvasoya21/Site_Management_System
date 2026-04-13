/**
 * Forgot Password Page
 * Reset password by providing email + new password
 * Allows max 2 self-resets per user; after that, user must contact Admin
 * Styled identically to the Login page (AuthLogin.jsx)
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormInput from '../components/auth/FormInput';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import Toast from '../components/auth/Toast';
import { validateFormField, validatePasswordsMatch } from '../utils/validation';
import { Loader, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetsRemaining, setResetsRemaining] = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    if (field === 'email') {
      const error = validateFormField('email', formData.email);
      if (error) setErrors((prev) => ({ ...prev, email: error }));
    } else if (field === 'newPassword') {
      const error = validateFormField('password', formData.newPassword);
      if (error) setErrors((prev) => ({ ...prev, newPassword: error }));
    } else if (field === 'confirmPassword') {
      const error = validatePasswordsMatch(formData.newPassword, formData.confirmPassword);
      if (error) setErrors((prev) => ({ ...prev, confirmPassword: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailError = validateFormField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validateFormField('password', formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    const matchError = validatePasswordsMatch(formData.newPassword, formData.confirmPassword);
    if (matchError) newErrors.confirmPassword = matchError;

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

    const result = await resetPassword(formData.email, formData.newPassword);

    if (result.success) {
      setResetSuccess(true);
      setResetsRemaining(result.resetsRemaining);
      setToast({
        type: 'success',
        message: result.message,
      });

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      // Check if limit was reached
      if (result.limitReached) {
        setLimitReached(true);
      }
      setToast({
        type: 'error',
        message: result.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background glow effects matching Login page */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#7c3aed]/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header — identical to Login page */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md mb-2">
            Site<span className="text-primary-500">OS</span>
          </h1>
          <p className="text-slate-400">Recover Your Password</p>
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

        {/* Limit Reached — Contact Admin */}
        {limitReached ? (
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-red-500/30 shadow-xl shadow-black/40 p-8 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full border border-red-500/20">
              <ShieldAlert className="text-red-400" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-red-400">Reset Limit Reached</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              You have already used your <span className="text-white font-medium">2 allowed password resets</span>.
              <br />
              Please contact the <span className="text-primary-400 font-semibold">System Administrator</span> to change your password.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Contact Admin at</p>
              <p className="text-sm text-primary-400 font-medium">admin@siteos.in</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-primary-500 font-semibold py-2.5 px-6 rounded-xl transition-all duration-300"
            >
              Back to Login
            </Link>
          </div>
        ) : resetSuccess ? (
          /* Success State */
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-emerald-500/30 shadow-xl shadow-black/40 p-8 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="text-emerald-400" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-emerald-400">Password Changed!</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your password has been successfully updated.
              {resetsRemaining !== null && (
                <>
                  <br />
                  <span className="text-primary-400 font-medium">
                    {resetsRemaining} reset(s) remaining
                  </span>
                </>
              )}
            </p>
            <p className="text-slate-500 text-xs">Redirecting to login...</p>
          </div>
        ) : (
          /* Reset Form — same card styling as Login page */
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl shadow-black/40 p-8 space-y-8"
          >
            {/* Account Verification Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
                Account Verification
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
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* New Password Section */}
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#7c3aed] rounded-full"></span>
                Set New Password
              </h2>

              <div className="space-y-4">
                <div>
                  <FormInput
                    label="New Password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(value) => handleInputChange('newPassword', value)}
                    onBlur={() => handleBlur('newPassword')}
                    error={errors.newPassword}
                    required
                    placeholder="••••••••"
                    showToggle
                  />
                  {formData.newPassword && (
                    <div className="mt-3">
                      <PasswordStrengthIndicator password={formData.newPassword} />
                    </div>
                  )}
                </div>

                <FormInput
                  label="Confirm New Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(value) => handleInputChange('confirmPassword', value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={errors.confirmPassword}
                  required
                  placeholder="••••••••"
                  showToggle
                />
              </div>

              {/* Reset limit notice */}
              <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  ⚠️ You can reset your password a maximum of <span className="font-semibold text-primary-400">2 times</span>.
                  After that, please contact the Admin.
                </p>
              </div>
            </div>

            {/* Submit Button — same style as Login page */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Links — same style as Login page */}
        {!limitReached && !resetSuccess && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors"
            >
              ← Back to Login
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
        )}
      </div>
    </div>
  );
}
