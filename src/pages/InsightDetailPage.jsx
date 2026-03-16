import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { getTrendingInsightById } from '../data/trendingInsights';

export default function InsightDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const insight = useMemo(() => getTrendingInsightById(id), [id]);

  if (!insight) {
    return (
      <main id="main-content" className="bg-portal-bg-section/40" role="main">
        <div className="mx-auto max-w-[960px] px-4 py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 text-sm font-medium text-portal-blue hover:text-portal-blue-dark"
          >
            ← Back
          </button>
          <h1 className="font-display text-2xl font-bold text-portal-navy">Insight not found</h1>
          <p className="mt-2 text-sm text-portal-gray">
            This AI insight is no longer available. Please return to your home page to explore the latest topics.
          </p>
        </div>
      </main>
    );
  }

  const { title, category, tag, age, region, image, aiSummary, relatedDatasets = [] } = insight;

  return (
    <main id="main-content" className="bg-portal-bg-section/40" role="main">
      <div className="mx-auto max-w-[1120px] px-4 pb-12 pt-6 md:px-6 lg:px-0">
          {/* Hero */}
          <section className="overflow-hidden rounded-3xl border border-portal-border bg-black/90 text-white shadow-xl">
            <div className="relative flex flex-col md:flex-row">
              <div className="relative flex-1">
                <img
                  src={image}
                  alt=""
                  className="h-full w-full object-cover opacity-70"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black via-black/60 to-transparent" />
              </div>
              <div className="relative flex flex-1 flex-col justify-between gap-4 p-6 md:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-emerald-400/15 px-2 py-1 font-semibold uppercase tracking-[0.16em] text-emerald-300">
                      {tag}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/80">
                      {region}
                    </span>
                    <span className="text-[11px] text-white/70">{age}</span>
                  </div>
                  <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-[30px]">
                    {title}
                  </h1>
                  <p className="mt-2 text-sm text-white/85">{category}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/20"
                  >
                    ← Back to home
                  </button>
                  <Link
                    to="/ai-assistant"
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-ai-gradient-from to-ai-gradient-to px-3 py-1.5 text-[11px] font-semibold text-white shadow-md hover:opacity-95"
                  >
                    Ask AI about this topic
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* AI summary + body */}
          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
            <article className="rounded-2xl border border-portal-border bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-portal-navy">What this insight is about</h2>
              <p className="mt-2 text-sm text-portal-gray">
                This page simulates how the NCSI Smart Portal could combine narrative context, charts, and AI-generated
                summaries around a live event or topic. In a full implementation, this section would be populated from
                curated editorial content and live data feeds.
              </p>
              <p className="mt-3 text-sm text-portal-gray">
                For demo purposes, treat the paragraphs below as placeholder copy that you can adapt depending on the
                audience (e.g., an economic analyst, a university student, or a policy maker). The AI summary on the
                right-hand side can then highlight 2–3 key messages and suggest which datasets to explore next.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-portal-gray">
                <li>
                  Call out the high-level narrative: what has changed, why it matters for Oman, and which sectors or
                  governorates are most affected.
                </li>
                <li>
                  Provide a short data story that points to official indicators (trade, CPI, labour market, environment,
                  etc.) without overwhelming the user with tables.
                </li>
                <li>
                  Invite the user to dive deeper via datasets, reports, or the AI Assistant rather than keeping this as
                  a static article.
                </li>
              </ul>
              <p className="mt-4 text-sm text-portal-gray">
                You can use this page as a talking point in demos: start with the story, then jump into the linked
                datasets and ask the AI Assistant to build charts, maps, or quick briefings tailored to the current
                persona.
              </p>
            </article>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-portal-ai-bg bg-gradient-to-br from-portal-ai-bg/90 to-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-ai-gradient-from/20 to-ai-gradient-to/20">
                    <svg className="h-4 w-4 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-portal-blue-dark/80">
                      AI perspective
                    </p>
                    <p className="text-xs text-portal-gray">Demo-only narrative generated for this topic.</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-portal-navy-dark">{aiSummary}</p>
                <p className="mt-3 text-xs text-portal-gray-muted">
                  This is mock content designed to showcase how AI could summarise the key story in a few sentences. In
                  production, it would be grounded on the datasets listed below.
                </p>
              </div>

              {relatedDatasets.length > 0 && (
                <div className="rounded-2xl border border-portal-border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-sm font-bold text-portal-navy">
                      Related official datasets
                    </h2>
                    <Link
                      to="/datasets"
                      className="text-xs font-medium text-portal-blue hover:text-portal-blue-dark"
                    >
                      Browse all datasets
                    </Link>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {relatedDatasets.map((d) => (
                      <li
                        key={d.id}
                        className="rounded-xl border border-portal-border-light bg-portal-bg-section/60 px-3 py-2 text-xs hover:border-portal-blue/40 hover:bg-white transition-colors"
                      >
                        <p className="text-sm font-semibold text-portal-navy">{d.title}</p>
                        <p className="mt-0.5 text-[11px] text-portal-gray-muted">
                          {d.category} · Last updated {d.lastUpdated}
                        </p>
                        <p className="mt-0.5 text-[11px] text-portal-gray line-clamp-2">{d.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl border border-dashed border-portal-border bg-portal-bg-section/70 p-4 text-xs text-portal-gray">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-portal-gray-muted">
                  Try with AI
                </p>
                <p className="mt-1 text-portal-navy">
                  Use these as starting prompts in the AI Assistant to explore this topic with charts, tables, or
                  narrative summaries.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-portal-blue">
                    Summarise this event in 3 bullet points for decision makers in Oman.
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-portal-blue">
                    Show a chart using the related datasets to quantify the impact.
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-portal-blue">
                    Generate 2–3 report titles I could create about this topic.
                  </span>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
  );
}
