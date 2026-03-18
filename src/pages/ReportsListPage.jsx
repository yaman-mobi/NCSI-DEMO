import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadReports, createReport, seedDemoReportIfEmpty } from '../lib/reportStorage';
import RecommendedForYou from '../components/RecommendedForYou';
import InsightCards from '../components/InsightCards';
import { addRecentViewed } from '../lib/recommendations';

/** Extract a short excerpt from the first text section for preview */
function getReportExcerpt(report, maxLen = 120) {
  const sections = report?.sections || [];
  const firstText = sections.find((s) => s.type === 'text' && typeof s.content === 'string' && !s.content.startsWith('__'));
  if (!firstText?.content) return null;
  const text = firstText.content.replace(/\n/g, ' ').trim();
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

/** Report card styled like a document */
function ReportCard({ report, isDraft, onNavigate }) {
  const excerpt = getReportExcerpt(report);
  const sectionCount = (report?.sections || []).length;
  const date = report?.updatedAt ? new Date(report.updatedAt) : null;

  return (
    <Link
      to={`/report/${report.id}`}
      onClick={onNavigate}
      className="group block"
    >
      <article className="relative overflow-hidden rounded-lg border border-portal-border bg-white shadow-sm transition-all hover:shadow-md hover:border-portal-blue/30">
        {/* Document-style left accent */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isDraft ? 'bg-portal-gray' : 'bg-emerald-500'}`} />
        <div className="pl-5 pr-4 py-4">
          {/* Badge */}
          <div className="flex items-start justify-between gap-2">
            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isDraft ? 'bg-portal-bg-section text-portal-gray' : 'bg-emerald-50 text-emerald-700'}`}>
              {isDraft ? 'Draft' : 'Published'}
            </span>
            <span className="text-xs text-portal-gray group-hover:text-portal-blue transition-colors">
              {isDraft ? 'Edit →' : 'View →'}
            </span>
          </div>
          {/* Title – report-style heading */}
          <h3 className="mt-2 font-display text-base font-bold leading-snug text-portal-navy-dark line-clamp-2">
            {report.title || 'Untitled Report'}
          </h3>
          {/* Excerpt – document preview */}
          {excerpt && (
            <p className="mt-2 text-[12px] leading-relaxed text-portal-gray line-clamp-2">
              {excerpt}
            </p>
          )}
          {/* Footer metadata */}
          <div className="mt-3 flex items-center gap-3 text-[11px] text-portal-gray-muted">
            {sectionCount > 0 && <span>{sectionCount} section{sectionCount !== 1 ? 's' : ''}</span>}
            {date && <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function ReportsListPage() {
  const [reports, setReports] = useState([]);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'drafts'
  const navigate = useNavigate();

  useEffect(() => {
    seedDemoReportIfEmpty();
    setReports(loadReports());
  }, []);

  const handleCreate = () => {
    setCreating(true);
    const report = createReport();
    setCreating(false);
    setReports(loadReports());
    navigate(`/report/${report.id}`);
  };

  const published = reports.filter((r) => r.published);
  const drafts = reports.filter((r) => !r.published);

  const hasPublished = published.length > 0;
  const hasDrafts = drafts.length > 0;

  return (
    <div className="px-[100px] py-8">
      <div className="mx-auto max-w-[900px]">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[30px] font-extrabold tracking-[-0.5px] text-[#161616]">
            Reports
          </h1>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="rounded bg-gradient-to-r from-[#a624d2] to-[#3a70d8] px-6 py-3 text-base font-medium text-white hover:opacity-95 disabled:opacity-70"
          >
            {creating ? 'Creating…' : '+ Create report'}
          </button>
        </div>
        <p className="mt-2 text-base font-medium text-portal-gray">
          Collaborative report authoring with AI. Create drafts, co-edit with your team, and publish to the portal.
        </p>

        <div className="mt-6">
          <RecommendedForYou context="reports" compact />
        </div>

        {/* Tabs: Published / Drafts */}
        {(hasPublished || hasDrafts) && (
          <div className="mt-8">
            <div className="flex gap-1 rounded-lg border border-portal-border bg-portal-bg-section p-1 w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('published')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'published'
                    ? 'bg-white text-portal-navy shadow-sm'
                    : 'text-portal-gray hover:text-portal-navy'
                }`}
              >
                Published {hasPublished && `(${published.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('drafts')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'drafts'
                    ? 'bg-white text-portal-navy shadow-sm'
                    : 'text-portal-gray hover:text-portal-navy'
                }`}
              >
                Drafts {hasDrafts && `(${drafts.length})`}
              </button>
            </div>

            {/* Tab content */}
            <div className="mt-6">
              {activeTab === 'published' && (
                <>
                  <p className="text-sm text-portal-gray mb-4">Reports published to the portal. Visible to authorized users.</p>
                  {published.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {published.map((r) => (
                        <ReportCard key={r.id} report={r} isDraft={false} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-portal-border bg-portal-bg-section/50 py-12 text-center">
                      <p className="text-portal-gray">No published reports yet. Publish a draft when it&apos;s ready.</p>
                    </div>
                  )}
                  {/* AI insights for first published report – compact */}
                  {published.length > 0 && (
                    <div className="mt-6">
                      <InsightCards type="report" report={published[0]} />
                    </div>
                  )}
                </>
              )}

              {activeTab === 'drafts' && (
                <>
                  <p className="text-sm text-portal-gray mb-4">In progress. Use AI Generate, collaborate, then Publish when ready.</p>
                  {drafts.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {drafts.map((r) => (
                        <ReportCard
                          key={r.id}
                          report={r}
                          isDraft
                          onNavigate={() => addRecentViewed({ type: 'report', id: r.id })}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-portal-border bg-portal-bg-section/50 py-12 text-center">
                      <p className="text-portal-gray">No drafts. Create a report to get started.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {reports.length === 0 && (
          <div className="mt-16 rounded-xl border-2 border-dashed border-portal-border bg-portal-bg-section p-12 text-center">
            <p className="text-portal-gray">No reports yet. Create one to start collaborative authoring with AI.</p>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="mt-6 rounded bg-portal-blue px-6 py-3 text-white font-medium hover:bg-[#004a75]"
            >
              Create your first report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
