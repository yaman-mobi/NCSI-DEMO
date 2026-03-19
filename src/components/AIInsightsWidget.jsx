import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';
import { useAuth } from '../context/AuthContext';
import { profileToPersona } from '../lib/personaUtils';
import { getTrendingInsightsForPersona } from '../data/trendingInsights';

/** Map PDF insight to widget format (title, metric, trend, query) */
function toWidgetInsight(insight, index) {
  const metrics = [
    '141,277', '325 vacancies', '12.1% YoY', '80,764',
    '4.0%', 'RO 1.3B', 'OMR 800M', '1.5%',
    '111.10', '5.88%', '17.0%', 'Open data',
    'Cross-domain', '80,764', '111.10', 'Before/after',
  ];
  const queries = [
    'Higher education enrollment and AI skills demand',
    'Labour market vacancies and graduate employment',
    'Tourism growth and hospitality study paths',
    'Female participation in higher education',
    'IMF Oman 2026 GDP and fiscal outlook',
    'Tax revenue and fiscal resilience',
    'Tourism investment and diversification',
    'Digital economy and AI indicators',
    'CPI inflation by basket category',
    'Graduate employment segmentation',
    'Labour market by age and gender',
    'Open data and AI analytics products',
    'Cross-domain statistical integration',
    'Gender and education disaggregation',
    'CPI basket-level analysis',
    'Regional tourism impact monitoring',
  ];
  const i = index % metrics.length;
  return {
    id: insight.id,
    title: insight.title,
    metric: metrics[i] || '—',
    trend: ['up', 'up', 'neutral', 'up'][index % 4],
    query: queries[i] || insight.title,
  };
}

function getInsights(persona, profile) {
  const effectivePersona = profile ? profileToPersona(profile) : persona;
  const insights = getTrendingInsightsForPersona(effectivePersona).slice(0, 4);
  return insights.map((ins, i) => toWidgetInsight(ins, i));
}

export default function AIInsightsWidget() {
  const [activeId, setActiveId] = useState(null);
  const { currentPersona } = usePersona();
  const { profile } = useAuth();
  const insights = getInsights(currentPersona, profile);

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
