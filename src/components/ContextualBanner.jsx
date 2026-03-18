import { usePersona } from '../context/PersonaContext';
import { useAuth } from '../context/AuthContext';
import { profileToPersona } from '../lib/personaUtils';
import { Link } from 'react-router-dom';

export default function ContextualBanner() {
  const { currentPersona, activeEvent } = usePersona();
  const { profile, isAuthenticated } = useAuth();
  const effectivePersona = isAuthenticated && profile ? profileToPersona(profile) : currentPersona;

  if (!activeEvent || activeEvent === 'none') return null;

  const personaName = effectivePersona?.name || effectivePersona?.role || 'this persona';
  const isAnalystRole = effectivePersona?.role === 'Economic Analyst';
  const isStudentRole = effectivePersona?.role === 'University Student';

  if (activeEvent === 'tariff') {
    return (
      <div className="mx-auto max-w-[1240px] px-[100px] py-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
            <div>
              <p className="font-display font-bold text-[#161616]">Contextual update: US Tariff change</p>
              <p className="text-sm text-portal-gray">
                Relevant to your role — we’ve highlighted trade datasets and Balance of Payments reports.
                <span className="ml-1 text-xs text-portal-gray-muted">
                  You’re seeing this because you’re viewing as {personaName} and the event &quot;US Tariff change&quot; is active.
                </span>
              </p>
            </div>
          </div>
          <Link
            to="/datasets?highlight=trade"
            className="rounded bg-portal-navy px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3370]"
          >
            View trade &amp; BoP data
          </Link>
        </div>
      </div>
    );
  }

  if (activeEvent === 'census') {
    return (
      <div className="mx-auto max-w-[1240px] px-[100px] py-4">
        <div className="rounded-xl border border-portal-card-teal/50 bg-portal-card-teal/20 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-portal-card-teal text-[#0d9488]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div>
              <p className="font-display font-bold text-[#161616]">Contextual update: National Census released</p>
              <p className="text-sm text-portal-gray">
                {isStudentRole
                  ? 'Relevant to your interests — census data and reports for your region and demographics are highlighted.'
                  : 'Census data and reports are highlighted for this event.'}
                <span className="ml-1 text-xs text-portal-gray-muted">
                  You’re seeing this because you’re viewing as {personaName} and the event &quot;National Census released&quot; is active.
                </span>
              </p>
            </div>
          </div>
          <Link
            to="/datasets?highlight=census"
            className="rounded bg-portal-blue px-4 py-2 text-sm font-medium text-white hover:bg-[#004a75]"
          >
            View census data
          </Link>
        </div>
      </div>
    );
  }

  if (activeEvent === 'oil') {
    return (
      <div className="mx-auto max-w-[1240px] px-[100px] py-4">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L7 12a5 5 0 1010 0L12 2z" />
              </svg>
            </span>
            <div>
              <p className="font-display font-bold text-[#161616]">Contextual update: Oil price shock</p>
              <p className="text-sm text-portal-gray">
                Energy and revenue-related economic indicators have been prioritised for your analysis.
                <span className="ml-1 text-xs text-portal-gray-muted">
                  You’re seeing this because you’re viewing as {personaName} and the event &quot;Oil price shock&quot; is active.
                </span>
              </p>
            </div>
          </div>
          <Link
            to="/datasets?category=Economy"
            className="rounded bg-portal-navy px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3370]"
          >
            View economic indicators
          </Link>
        </div>
      </div>
    );
  }

  if (activeEvent === 'education') {
    return (
      <div className="mx-auto max-w-[1240px] px-[100px] py-4">
        <div className="rounded-xl border border-portal-card-teal/60 bg-portal-card-teal/20 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-portal-card-teal text-[#0d9488]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v7" />
              </svg>
            </span>
            <div>
              <p className="font-display font-bold text-[#161616]">Contextual update: Education reform announced</p>
              <p className="text-sm text-portal-gray">
                Education and outcomes statistics have been highlighted for your persona and region.
                <span className="ml-1 text-xs text-portal-gray-muted">
                  You’re seeing this because you’re viewing as {personaName} and the event &quot;Education reform announced&quot; is active.
                </span>
              </p>
            </div>
          </div>
          <Link
            to="/datasets?category=Education"
            className="rounded bg-portal-blue px-4 py-2 text-sm font-medium text-white hover:bg-[#004a75]"
          >
            View education data
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
