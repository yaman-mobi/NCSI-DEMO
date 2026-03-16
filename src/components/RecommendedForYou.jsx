import { Link } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';
import { getSmartRecommendations } from '../lib/recommendations';

/**
 * Smart "Recommended for you" block. Use context to adapt what to show.
 * @param {string} context - 'landing' | 'datasets' | 'reports' | 'ai-assistant' | 'report-builder'
 * @param {{ reportId?: string, maxDatasets?: number, maxReports?: number, compact?: boolean, onQueryClick?: (q: string) => void }} props
 */
export default function RecommendedForYou({
  context = 'landing',
  reportId,
  maxDatasets = 4,
  maxReports = 2,
  compact = false,
  onQueryClick,
}) {
  const { currentPersona, activeEvent } = usePersona();
  const persona = currentPersona
    ? { role: currentPersona.role, region: currentPersona.region, interests: currentPersona.interests || [] }
    : null;
  const rec = persona ? getSmartRecommendations(persona, activeEvent || 'none', context, { reportId }) : null;

  if (!rec || (rec.datasets.length === 0 && rec.reports.length === 0 && rec.queries.length === 0 && !rec.recent?.length)) {
    return null;
  }

  const reason = rec.eventReason || rec.reason;
  const datasets = (rec.datasets || []).slice(0, maxDatasets);
  const reports = (rec.reports || []).slice(0, maxReports);
  const queries = (rec.queries || []).slice(0, 3);
  const recent = rec.recent || [];

  const isAssistant = context === 'ai-assistant';
  const shellClass = compact
    ? 'rounded-xl border border-portal-border bg-portal-bg-section p-3'
    : 'w-full border-t border-portal-border-light bg-white px-[100px] py-4';

  // For the AI Assistant, skip the separate "Recommended prompts" strip
  if (isAssistant) {
    return null;
  }

  // Generic: slim AI strip with 2–3 high-signal recommendations
  const showRecent = recent.length > 0 && (context === 'datasets' || context === 'reports');

  return (
    <section className={shellClass} aria-label="Recommended for you">
      <div className={compact ? '' : 'mx-auto flex w-full max-w-[1240px] flex-col gap-2'}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-ai-gradient-from/25 to-ai-gradient-to/25">
              <svg className="h-4 w-4 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6l3 3m4-3a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-xs font-semibold tracking-[-0.15px] text-portal-navy">
                Recommended next steps
              </h2>
              {reason && <p className="mt-0.5 text-[11px] text-portal-gray line-clamp-1">{reason}</p>}
            </div>
          </div>
          {showRecent && (
            <span className="hidden text-[11px] text-portal-gray-muted md:inline">
              Including a few items you recently viewed.
            </span>
          )}
        </div>

        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {datasets.length > 0 &&
            context !== 'report-builder' &&
            datasets.slice(0, 4).map((d, index) => (
              <Link
                key={`ds-${d.id}-${index}`}
                to={`/datasets?category=${encodeURIComponent(d.category)}`}
                className="group flex items-center gap-3 rounded-2xl border border-portal-border-light bg-portal-bg-section/80 px-3 py-2 text-[11px] text-portal-navy hover:border-portal-blue/60 hover:bg-white"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium">{d.title}</p>
                  <p className="text-[10px] text-portal-gray-muted">Dataset · {d.category}</p>
                </div>
              </Link>
            ))}

          {reports.length > 0 &&
            (context === 'reports' || context === 'landing' || context === 'report-builder') &&
            reports.slice(0, Math.max(0, 4 - datasets.length)).map((r, index) => (
              <Link
                key={`rp-${r.id}-${index}`}
                to={`/report/${r.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-portal-border-light bg-portal-bg-section/80 px-3 py-2 text-[11px] text-portal-navy hover:border-portal-blue/60 hover:bg-white"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium">{r.title || 'Untitled report'}</p>
                  <p className="text-[10px] text-portal-gray-muted">
                    Report · {r.published ? 'Published' : 'Draft'}
                  </p>
                </div>
              </Link>
            ))}

          {showRecent &&
            recent.slice(0, 2).map((r) => {
              const isReport = Array.isArray(r.sections);
              const to = isReport
                ? `/report/${r.id}`
                : `/datasets?category=${encodeURIComponent(r.category || '')}`;
              return (
                <Link
                  key={(r.id || '') + (isReport ? 'r' : 'd')}
                  to={to}
                  className="group relative flex items-center gap-3 rounded-2xl border border-portal-border-light bg-portal-bg-section/80 px-3 py-2 text-[11px] text-portal-navy hover:border-portal-blue/60 hover:bg-white"
                >
                  <span className="absolute right-2 top-2 rounded-full bg-portal-blue/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-portal-blue">
                    Recent
                  </span>
                  <div className="min-w-0 flex-1 pr-14">
                    <p className="line-clamp-1 font-medium">{r.title || 'Recent item'}</p>
                    <p className="text-[10px] text-portal-gray-muted">
                      {isReport ? 'Report' : 'Dataset'}
                      {r.category && !isReport ? ` · ${r.category}` : ''}
                    </p>
                  </div>
                </Link>
              );
            })}
        </div>

        {context === 'report-builder' && datasets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {datasets.slice(0, 3).map((d) => (
              <Link
                key={d.id}
                to={`/datasets?category=${encodeURIComponent(d.category)}`}
                className="rounded-full border border-portal-border-light bg-portal-bg-section px-3 py-1 text-[10px] font-medium text-portal-blue hover:border-portal-blue/50"
              >
                Related dataset: {d.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

