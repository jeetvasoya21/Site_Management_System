/**
 * Reset Password Page
 * Redirects to the unified /forgot-password page which now handles the full flow
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new unified forgot-password page
    navigate('/forgot-password', { replace: true });
  }, [navigate]);

  return null;
}
