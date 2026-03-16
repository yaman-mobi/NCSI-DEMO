import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const greeting = getTimeGreeting();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message || 'Login failed');
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-portal-bg-section via-portal-ai-bg/40 to-white relative overflow-hidden">
      {/* Ambient AI gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-ai-gradient-from/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-portal-blue/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="rounded-2xl border border-portal-border bg-white/95 backdrop-blur-sm shadow-xl shadow-portal-navy/10 overflow-hidden">
            {/* AI-themed header with gradient */}
            <div className="relative bg-gradient-to-br from-portal-navy via-portal-blue-deep to-portal-blue overflow-hidden">
              <div className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-r from-ai-gradient-from/20 via-transparent to-ai-gradient-to/20 animate-gradient-shift opacity-60" />
              <div className="relative px-8 py-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 animate-ai-pulse">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Smart Portal</span>
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight">{greeting}</h1>
                <p className="mt-1 text-sm text-white/90">
                  Sign in and we&apos;ll restore your personalized experience: AI-curated datasets, role-based content, and your Smart Assistant context.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2.5 text-xs backdrop-blur-sm">
                  <span className="rounded-lg bg-gradient-to-r from-ai-gradient-from to-ai-gradient-to px-2 py-0.5 font-semibold text-white shadow-lg">AI</span>
                  <span className="text-white/95">Your feed and recommendations are tailored to your profile.</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
                  <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-portal-navy-dark">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark placeholder:text-portal-gray-placeholder focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none transition-shadow"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-portal-navy-dark">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark placeholder:text-portal-gray-placeholder focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none transition-shadow"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-portal-blue to-portal-blue-dark py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-portal-blue focus:ring-offset-2 transition-all"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing you in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-sm text-portal-gray">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-portal-blue hover:text-portal-blue-dark hover:underline">Create your AI profile</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
