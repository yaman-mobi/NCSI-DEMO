import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const firstName = fullName.trim().split(/\s+/)[0] || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (err) {
      setError(err.message || 'Registration failed');
      return;
    }
    navigate('/onboarding', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-portal-ai-bg/50 via-white to-portal-bg-section relative overflow-hidden">
      {/* Soft AI gradient orbs */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-ai-gradient-from/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-ai-gradient-to/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="rounded-2xl border border-portal-border bg-white/95 backdrop-blur-sm shadow-xl shadow-portal-navy/10 overflow-hidden">
            {/* AI gradient header */}
            <div className="relative bg-gradient-to-br from-ai-gradient-from to-ai-gradient-to overflow-hidden bg-[length:200%_200%] animate-gradient-shift">
              <div className="absolute inset-0 bg-black/5" />
              <div className="relative px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/90">Step 1 of 2</span>
                  </div>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">AI-powered</span>
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight mt-3">Create your AI profile</h1>
                <p className="mt-1 text-sm text-white/90">
                  Join the NCSI SMART Portal. Next, we&apos;ll learn your role and interests so the AI can personalize your experience.
                </p>
                {firstName && (
                  <p className="mt-3 text-sm font-medium text-white/95">
                    Hi {firstName}, your data will shape your feed and Smart Assistant.
                  </p>
                )}
                <ul className="mt-4 space-y-2.5 text-xs text-white/95">
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">✓</span>
                    AI-curated datasets and reports based on your interests
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">✓</span>
                    Contextual content when news or census events occur
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">✓</span>
                    Smart Assistant tailored to your role and region
                  </li>
                </ul>
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
                <label htmlFor="reg-fullName" className="block text-sm font-medium text-portal-navy-dark">Full name</label>
                <input
                  id="reg-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ahmed Al-Rashdi"
                  className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark placeholder:text-portal-gray-placeholder focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none transition-shadow"
                />
                <p className="mt-1 text-xs text-portal-gray">We&apos;ll use this to personalize your greeting and reports.</p>
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-portal-navy-dark">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark placeholder:text-portal-gray-placeholder focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none transition-shadow"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-portal-navy-dark">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark placeholder:text-portal-gray-placeholder focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none transition-shadow"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-ai-gradient-from to-ai-gradient-to py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ai-gradient-from focus:ring-offset-2 transition-all"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Creating your profile…
                  </span>
                ) : (
                  'Continue to personalization'
                )}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-sm text-portal-gray">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-portal-blue hover:text-portal-blue-dark hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
