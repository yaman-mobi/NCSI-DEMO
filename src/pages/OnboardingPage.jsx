import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = ['English', 'Arabic'];
const ROLES = [
  'Economic Analyst',
  'University Student',
  'Data Scientist',
  'Policy Researcher',
  'Business Executive',
  'Journalist',
  'Government Official',
];
const REGIONS = ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Ibri', 'Other'];
const INTERESTS = [
  'International Trade',
  'Social Trends',
  'Energy & Oil',
  'Tourism',
  'Education',
  'Technology',
  'Finance',
  'Healthcare',
  'Demographics',
  'Infrastructure',
];

function getTipForRole(role) {
  if (!role) return null;
  const tips = {
    'Economic Analyst': 'We’ll surface trade, BoP, and economic indicators first.',
    'University Student': 'Census, education, and demographics will be prioritized.',
    'Data Scientist': 'You’ll see datasets and export options tailored to analysis.',
    'Policy Researcher': 'Policy-relevant indicators and reports will be highlighted.',
    'Business Executive': 'Key economic and sector data will appear in your feed.',
    'Journalist': 'Latest releases and story-ready statistics will be featured.',
    'Government Official': 'Official statistics and regional data will be prioritized.',
  };
  return tips[role] || 'Your feed will adapt to your selected interests.';
}

function getTipForRegion(region) {
  if (!region) return null;
  return `Data and reports for ${region} and national context will be emphasized.`;
}

export default function OnboardingPage() {
  const { user, profile, updateProfile, hasCompletedOnboarding } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(profile?.language || 'English');
  const [role, setRole] = useState(profile?.role_occupation || '');
  const [region, setRegion] = useState(profile?.region || '');
  const [interests, setInterests] = useState(profile?.interests || []);
  const [loading, setLoading] = useState(false);

  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'there';
  const roleTip = getTipForRole(role);
  const regionTip = getTipForRegion(region);
  const progress = [language, role, region, interests.length > 0].filter(Boolean).length / 4;

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role || !region || interests.length === 0) return;
    setLoading(true);
    updateProfile({ language, role_occupation: role, region, interests });
    setLoading(false);
    navigate('/', { replace: true });
  };

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  if (hasCompletedOnboarding) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-portal-bg-section via-portal-ai-bg/30 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-portal-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-ai-gradient-from/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg animate-fade-in-up">
          <div className="rounded-2xl border border-portal-border bg-white/95 backdrop-blur-sm shadow-xl shadow-portal-navy/10 overflow-hidden">
            {/* Header: Step 2 + AI learning you */}
            <div className="relative bg-gradient-to-br from-portal-navy via-portal-blue-deep to-portal-blue overflow-hidden">
              <div className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-r from-ai-gradient-from/15 via-transparent to-ai-gradient-to/15 animate-gradient-shift opacity-80" />
              <div className="relative px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/85">Step 2 of 2</span>
                  </div>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">AI personalization</span>
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight mt-3">
                  Help us personalize for you, {firstName}
                </h1>
                <p className="mt-1 text-sm text-white/90">
                  The AI will use these preferences to tailor your feed, featured datasets, and Smart Assistant responses.
                </p>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-medium text-white/70 uppercase tracking-wider mb-1">
                    <span>Profile completion</span>
                    <span>{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ai-gradient-from to-ai-gradient-to transition-all duration-500 ease-out"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2.5 text-xs backdrop-blur-sm">
                  <span className="rounded-lg bg-white/20 px-2 py-0.5 font-semibold">Personalization</span>
                  <span className="text-white/95">Your choices drive the portal’s layout, featured content, and AI responses.</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-portal-navy-dark">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-portal-navy-dark">Role / Occupation</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none"
                >
                  <option value="">Select your role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {roleTip && (
                  <p className="mt-2 flex items-start gap-2 rounded-lg bg-portal-ai-bg/60 border border-portal-border/60 px-3 py-2 text-xs text-portal-navy-dark">
                    <span className="text-ai-gradient-from shrink-0 mt-0.5">◆</span>
                    {roleTip}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-portal-navy-dark">Region / Geography</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none"
                >
                  <option value="">Select your region</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {regionTip && (
                  <p className="mt-2 flex items-start gap-2 rounded-lg bg-portal-ai-bg/60 border border-portal-border/60 px-3 py-2 text-xs text-portal-navy-dark">
                    <span className="text-ai-gradient-from shrink-0 mt-0.5">◆</span>
                    {regionTip}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-portal-navy-dark">Interests (select one or more)</label>
                <p className="mt-0.5 text-xs text-portal-gray">The AI will prioritize datasets and content matching these topics.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        interests.includes(interest)
                          ? 'bg-gradient-to-r from-portal-blue to-portal-blue-dark text-white shadow-md'
                          : 'border border-portal-border bg-white text-portal-gray hover:border-portal-blue/50 hover:text-portal-blue hover:bg-portal-ai-bg/50'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                {interests.length > 0 && (
                  <p className="mt-2 text-xs text-portal-gray">
                    {interests.length} selected — we’ll tailor your feed and AI suggestions to these.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !role || !region || interests.length === 0}
                className="w-full rounded-xl bg-gradient-to-r from-portal-blue to-portal-blue-dark py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-portal-blue focus:ring-offset-2 transition-all"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Saving your preferences…
                  </span>
                ) : (
                  'Start my personalized experience'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
