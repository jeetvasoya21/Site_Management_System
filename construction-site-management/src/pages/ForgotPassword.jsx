/**
 * Forgot Password Page
 * Request password reset via email
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormInput from '../components/auth/FormInput';
import Toast from '../components/auth/Toast';
import { validateFormField } from '../utils/validation';
import { Loader, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { requestPasswordReset, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleBlur = () => {
    const emailError = validateFormField('email', email);
    if (emailError) {
      setError(emailError);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateFormField('email', email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const result = await requestPasswordReset(email);

    if (result.success) {
      setToast({
        type: 'success',
        message: 'If email exists, reset link will be sent',
      });
      setSubmitted(true);

      // Store reset token for demo purposes
      if (result.resetToken) {
        sessionStorage.setItem('resetToken', result.resetToken);
      }

      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);
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
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-full mb-4">
            <Mail className="text-amber-500" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Reset Password</h1>
          <p className="text-slate-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
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
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              onBlur={handleBlur}
              error={error}
              required
              placeholder="you@example.com"
              hint="We'll send a password reset link to this email"
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full">
              <Mail className="text-emerald-500" size={32} />
            </div>
            <p className="text-slate-50 font-medium">Check your email</p>
            <p className="text-slate-400 text-sm">
              We've sent a password reset link to <span className="text-amber-500">{email}</span>
            </p>
          </div>
        )}

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
