import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const QUICK_PROMPTS = [
  'Show population by governorate',
  'GDP growth trends',
  'Key economic indicators',
  'Trade and Balance of Payments',
];

export default function FloatingAIButton() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const isAIPage = location.pathname === '/ai-assistant';

  if (isAIPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-3">
      {expanded && (
        <div className="animate-fade-in-up flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-premium-lg backdrop-blur-xl">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Ask AI</p>
          {QUICK_PROMPTS.map((prompt) => (
            <Link
              key={prompt}
              to="/ai-assistant"
              state={{ initialQuery: prompt }}
              onClick={() => setExpanded(false)}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-all hover:border-portal-blue/40 hover:bg-portal-ai-bg/60 hover:text-portal-blue"
            >
              {prompt}
            </Link>
          ))}
          <Link
            to="/ai-assistant"
            onClick={() => setExpanded(false)}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a624d2] to-[#3a70d8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-95"
          >
            Open AI Assistant
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      )}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#a624d2] to-[#3a70d8] text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-xl"
        aria-label={expanded ? 'Close AI assistant' : 'Open AI assistant'}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>
    </div>
  );
}
