/**
 * Reset Password Page
 * Set new password with reset token
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormInput from '../components/auth/FormInput';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import Toast from '../components/auth/Toast';
import { validateFormField, validatePasswordsMatch } from '../utils/validation';
import { Loader } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, loading } = useAuth();

  const [resetToken, setResetToken] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Get reset token from URL or session storage
    const tokenFromUrl = searchParams.get('token');
    const tokenFromSession = sessionStorage.getItem('resetToken');
    const token = tokenFromUrl || tokenFromSession;

    if (!token) {
      setToast({
        type: 'error',
        message: 'Invalid or expired reset link',
      });
      setTimeout(() => {
        navigate('/forgot-password');
      }, 2000);
    } else {
      setResetToken(token);
    }
  }, [searchParams, navigate]);

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

    const result = await resetPassword(resetToken, formData.newPassword);

    if (result.success) {
      setToast({
        type: 'success',
        message: 'Password reset successfully!',
      });

      setTimeout(() => {
        sessionStorage.removeItem('resetToken');
        navigate('/login');
      }, 1500);
    } else {
      setToast({
        type: 'error',
        message: result.message,
      });
    }
  };

  if (!resetToken) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Set New Password</h1>
          <p className="text-slate-400">Enter your new password below</p>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-slate-400 hover:text-slate-300 text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
