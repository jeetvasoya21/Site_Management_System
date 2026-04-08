/**
 * Email Verification Page
 * Verify email with code
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../../components/forms/FormInput';
import Toast from '../../components/forms/Toast';
import { Loader, Clock } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationCode, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/signup');
    }
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    const result = await verifyEmail(email, code);

    if (result.success) {
      setToast({
        type: 'success',
        message: 'Email verified successfully!',
      });

      setTimeout(() => {
        sessionStorage.removeItem('verificationEmail');
        navigate('/login');
      }, 1500);
    } else {
      setToast({
        type: 'error',
        message: result.message,
      });
      setCode('');
    }
  };

  const handleResend = async () => {
    const result = await resendVerificationCode(email);

    if (result.success) {
      setToast({
        type: 'success',
        message: 'Verification code sent to your email',
      });
      setTimeLeft(300);
      setCanResend(false);
      setCode('');
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
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Verify Email</h1>
          <p className="text-slate-400">
            We sent a verification code to<br />
            <span className="text-amber-500 font-medium">{email}</span>
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
        <form onSubmit={handleVerify} className="space-y-4">
          <FormInput
            label="Verification Code"
            type="text"
            value={code}
            onChange={setCode}
            error={error}
            required
            placeholder="000000"
            hint="Enter the 6-digit code from your email"
          />

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Clock size={16} />
            <span>Code expires in: <span className="text-amber-500 font-medium">{formatTime(timeLeft)}</span></span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-amber-500 hover:text-amber-400 font-medium disabled:opacity-50"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-slate-400 text-sm">
              Didn't receive the code? Try again in {formatTime(timeLeft)}
            </p>
          )}
        </div>

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
