import { getInsightsForDataset, getInsightsForReport } from '../lib/insights';

/**
 * Automated insight cards – AI-derived bullets for a dataset or report.
 * @param {{ type: 'dataset' | 'report', dataset?: Object, report?: Object }} props
 */
export default function InsightCards({ type, dataset, report }) {
  const insights = type === 'dataset' ? getInsightsForDataset(dataset) : getInsightsForReport(report);
  if (!insights || insights.length === 0) return null;

  return (
    <div className="rounded-xl border border-portal-ai-bg bg-gradient-to-br from-portal-ai-bg/80 to-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-portal-blue/10">
          <svg className="h-4 w-4 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-portal-blue-dark/90">AI insights</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {insights.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#161616]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-portal-blue" aria-hidden />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
