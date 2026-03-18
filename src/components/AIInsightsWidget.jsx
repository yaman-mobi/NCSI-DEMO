import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';
import { useAuth } from '../context/AuthContext';

const INSIGHTS_BY_INTEREST = {
  'International trade': [
    { id: '1', title: 'Trade surplus widened in Q4 2024', metric: '+2.1%', trend: 'up', query: 'Show trade and balance of payments for Oman' },
    { id: '2', title: 'China leads export partners', metric: '24.8%', trend: 'neutral', query: 'International trade statistics Oman by partner' },
  ],
  'Education': [
    { id: '3', title: 'Literacy rate above 95%', metric: '96.1%', trend: 'up', query: 'Education statistics by governorate' },
    { id: '4', title: 'Higher education enrolment up', metric: '+4.2%', trend: 'up', query: 'Education enrolment by level Oman' },
  ],
  'Labour market': [
    { id: '5', title: 'Unemployment at 2.1%', metric: '2.1%', trend: 'down', query: 'Labour force survey Oman 2024' },
    { id: '6', title: 'Employment growth in services', metric: '+3.2%', trend: 'up', query: 'Employment by sector Oman' },
  ],
  default: [
    { id: '7', title: 'Population growth steady', metric: '4.7M', trend: 'up', query: 'Show population by governorate' },
    { id: '8', title: 'GDP growth 2.7% in 2024', metric: '2.7%', trend: 'up', query: 'GDP growth trends Oman' },
  ],
};

function getInsights(interests) {
  const first = (interests || [])[0];
  const key = Object.keys(INSIGHTS_BY_INTEREST).find((k) => first?.toLowerCase().includes(k.toLowerCase()));
  return INSIGHTS_BY_INTEREST[key] || INSIGHTS_BY_INTEREST.default;
}

export default function AIInsightsWidget() {
  const [activeId, setActiveId] = useState(null);
  const { currentPersona } = usePersona();
  const { profile } = useAuth();
  const interests = profile?.interests || currentPersona?.interests || [];
  const insights = getInsights(interests);

  return (
    <div className="rounded-2xl border border-portal-border/80 bg-gradient-to-br from-white to-portal-ai-bg/30 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#a624d2]/15 to-[#3a70d8]/15">
            <svg className="h-4 w-4 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#161616]">AI Insights</h3>
            <p className="text-[11px] text-portal-gray">Personalized for your interests</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Live</span>
      </div>
      <div className="mt-3 space-y-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            onMouseEnter={() => setActiveId(insight.id)}
            onMouseLeave={() => setActiveId(null)}
            className={`rounded-xl border p-3 transition-all ${
              activeId === insight.id ? 'border-portal-blue/50 bg-portal-ai-bg/50 shadow-sm' : 'border-slate-100 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-[#161616]">{insight.title}</p>
                <p className={`mt-0.5 text-lg font-bold ${insight.trend === 'up' ? 'text-emerald-600' : insight.trend === 'down' ? 'text-amber-600' : 'text-portal-navy'}`}>
                  {insight.metric}
                </p>
              </div>
              <Link
                to="/ai-assistant"
                state={{ initialQuery: insight.query }}
                className="shrink-0 rounded-lg border border-portal-border/80 bg-white px-2.5 py-1.5 text-[11px] font-medium text-portal-blue transition hover:bg-portal-ai-bg hover:border-portal-blue/50"
              >
                Ask AI
              </Link>
            </div>
          </div>
        ))}
      </div>
      <Link
        to="/ai-assistant"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-portal-border bg-slate-50/50 py-2.5 text-xs font-medium text-portal-blue hover:bg-portal-ai-bg/50"
      >
        Explore with AI Assistant
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  );
}
