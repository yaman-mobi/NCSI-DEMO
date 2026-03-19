import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePersona } from '../context/PersonaContext';

const LANGUAGES = ['English', 'Arabic'];
/** 4 personas from PDF "My profile data per persona" */
const ROLES = ['University Student', 'Economist', 'Data Analyst', 'Statistician'];
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

const ROLE_TO_PERSONA_ID = {
  'University Student': 'university-student',
  Economist: 'economist',
  'Data Analyst': 'data-analyst',
  Statistician: 'statistician',
};

function getTipForRole(role) {
  if (!role) return null;
  const tips = {
    'Economic Analyst': "We'll surface trade, BoP, and economic indicators first.",
    Economist: "We'll surface trade, BoP, and economic indicators first.",
    'University Student': 'Census, education, and demographics will be prioritized.',
    'Data Analyst': 'CPI, labour segmentation, tourism KPIs. Build dashboards and pipelines.',
    Statistician: 'Population, CPI basket, labour force. Cross-domain analysis.',
    'Data Scientist': "You'll see datasets and export options tailored to analysis.",
    'Policy Researcher': 'Policy-relevant indicators and reports will be highlighted.',
    'Business Executive': 'Key economic and sector data will appear in your feed.',
    Journalist: 'Latest releases and story-ready statistics will be featured.',
    'Government Official': 'Official statistics and regional data will be prioritized.',
  };
  return tips[role] || 'Your feed will adapt to your selected interests.';
}

function getTipForRegion(region) {
  if (!region) return null;
  return `Data and reports for ${region} and national context will be emphasized.`;
}

export default function PreferencesDialog({ open, onClose }) {
  const { user, profile, updateProfile } = useAuth();
  const { personas, setCurrentPersonaId } = usePersona();
  const [language, setLanguage] = useState(profile?.language || 'English');
  const [role, setRole] = useState(profile?.role_occupation || '');
  const [region, setRegion] = useState(profile?.region || '');
  const [interests, setInterests] = useState(profile?.interests || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setLanguage(profile.language || 'English');
      setRole(profile.role_occupation || '');
      setRegion(profile.region || '');
      setInterests(profile.interests || []);
    }
  }, [open, profile]);

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!role || !region || interests.length === 0) return;
    setLoading(true);
    updateProfile({ language, role_occupation: role, region, interests });
    const personaId = ROLE_TO_PERSONA_ID[role];
    if (personaId && personas.some((p) => p.id === personaId)) {
      setCurrentPersonaId(personaId);
    } else {
      setCurrentPersonaId(personas[0]?.id ?? null);
    }
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    onClose();
  };

  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'there';
  const roleTip = getTipForRole(role);
  const regionTip = getTipForRegion(region);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-portal-navy/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={loading ? undefined : onClose}
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-title"
      >
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-portal-border bg-white shadow-2xl shadow-portal-navy/20"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center px-8 py-16">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-portal-bg-section" />
                <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-portal-blue" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-portal-blue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mt-6 font-display text-lg font-bold text-portal-navy">
                Setting up your personalized environment
              </h3>
              <p className="mt-2 text-sm text-portal-gray">
                Applying your preferences and tailoring datasets, insights, and AI suggestions…
              </p>
              <p className="mt-4 text-xs text-portal-gray-muted">This will only take a moment</p>
            </div>
          ) : (
            <>
              <div className="relative bg-gradient-to-br from-portal-navy via-portal-blue-deep to-portal-blue overflow-hidden">
                <div className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-r from-ai-gradient-from/15 via-transparent to-ai-gradient-to/15 animate-gradient-shift opacity-80" />
                <div className="relative flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </span>
                    <div>
                      <h2 id="preferences-title" className="font-display text-xl font-bold tracking-tight text-white">
                        Preferences
                      </h2>
                      <p className="mt-0.5 text-sm text-white/90">
                        Customize your experience, {firstName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleApply} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-portal-navy-dark">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-portal-navy-dark">
                    Role / Occupation
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none"
                  >
                    <option value="">Select your role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {roleTip && (
                    <p className="mt-2 flex items-start gap-2 rounded-lg border border-portal-border/60 bg-portal-ai-bg/60 px-3 py-2 text-xs text-portal-navy-dark">
                      <span className="mt-0.5 shrink-0 text-ai-gradient-from">◆</span>
                      {roleTip}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-portal-navy-dark">
                    Region / Geography
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-portal-border bg-portal-bg-section/50 px-4 py-2.5 text-portal-navy-dark focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none"
                  >
                    <option value="">Select your region</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {regionTip && (
                    <p className="mt-2 flex items-start gap-2 rounded-lg border border-portal-border/60 bg-portal-ai-bg/60 px-3 py-2 text-xs text-portal-navy-dark">
                      <span className="mt-0.5 shrink-0 text-ai-gradient-from">◆</span>
                      {regionTip}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-portal-navy-dark">
                    Interests (select one or more)
                  </label>
                  <p className="mt-0.5 text-xs text-portal-gray">
                    The AI will prioritize datasets and content matching these topics.
                  </p>
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
                      {interests.length} selected — we'll tailor your feed and AI suggestions to these.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-portal-border bg-white py-3 text-sm font-medium text-portal-navy hover:bg-portal-bg-section"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!role || !region || interests.length === 0}
                    className="flex-1 rounded-xl bg-gradient-to-r from-portal-blue to-portal-blue-dark py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-portal-blue focus:ring-offset-2 transition-all"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
