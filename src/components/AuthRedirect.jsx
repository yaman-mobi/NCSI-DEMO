import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SKIP_ONBOARDING_PATHS = ['/login', '/register', '/onboarding'];

export default function AuthRedirect({ children }) {
  const { user, hasCompletedOnboarding } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || hasCompletedOnboarding) return;
    if (SKIP_ONBOARDING_PATHS.some((p) => location.pathname === p)) return;
    navigate('/onboarding', { replace: true });
  }, [user, hasCompletedOnboarding, location.pathname, navigate]);

  return children;
}
