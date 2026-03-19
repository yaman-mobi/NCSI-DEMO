import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getReport } from '../lib/reportStorage';
import { CHART_DATASETS, CHART_GOVERNORATES_DATA } from '../data/omanMockData';
import {
  parseChartContent,
  parseTableContent,
  OmanBarChart,
  OmanLineChart,
  OmanAreaChart,
  OmanPieChart,
  OmanScatterChart,
  OmanFunnelChart,
} from './ReportBuilderPage';

function getFormatClasses(format) {
  if (!format || Object.keys(format).length === 0) return '';
  const sizeClass = format.fontSize === 'sm' ? 'text-sm' : format.fontSize === 'lg' ? 'text-lg' : 'text-base';
  const colorClass = format.color === 'blue' ? 'text-portal-blue' : format.color === 'gray' ? 'text-portal-gray' : format.color === 'green' ? 'text-[#085d3a]' : 'text-portal-navy-dark';
  return `${sizeClass} ${colorClass}`;
}

function EmbedSection({ section }) {
  const isTitleOnly = section.content === '__TITLE_ONLY__';
  const chartSpec = parseChartContent(section.content);
  const isChart = section.type === 'chart' || chartSpec || section.content === '__CHART__';
  const tableRows = parseTableContent(section.content);
  const isTable = section.type === 'table' || tableRows;
  const fmt = section.format || {};
  const fmtClasses = getFormatClasses(fmt);

  const renderChart = () => {
    const spec = chartSpec || { type: 'bar', datasetKey: 'governorates' };
    const data = CHART_DATASETS[spec.datasetKey] || CHART_GOVERNORATES_DATA;
    const barUnit = spec.datasetKey === 'employment' ? 'thousands' : 'million';
    if (spec.type === 'line') return <OmanLineChart data={data} />;
    if (spec.type === 'area') return <OmanAreaChart data={data} />;
    if (spec.type === 'pie') return <OmanPieChart data={data} />;
    if (spec.type === 'scatter') return <OmanScatterChart data={data} />;
    if (spec.type === 'funnel') return <OmanFunnelChart data={data} />;
    return <OmanBarChart data={data} unit={barUnit} />;
  };

  if (isTitleOnly) {
    return (
      <div className="rounded-[10px] border-2 border-portal-border bg-white p-4 shadow-card">
        <h2 className={`font-display font-bold ${fmtClasses || 'text-xl text-portal-navy-dark'}`}>
          {section.title}
        </h2>
      </div>
    );
  }

  const widthClass =
    section.layoutWidth === 'half'
      ? 'col-span-12 md:col-span-6'
      : section.layoutWidth === 'third'
      ? 'col-span-12 md:col-span-6 lg:col-span-4'
      : 'col-span-12';

  return (
    <div className={`${widthClass}`}>
      <div className="rounded-[10px] border border-portal-border bg-white p-4 shadow-card overflow-hidden">
        {section.sectionHeader && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-portal-gray-muted mb-2">
            {section.sectionHeader}
          </p>
        )}
        <h3 className={`font-display font-bold leading-5 tracking-[-0.5px] ${fmtClasses || 'text-lg text-portal-navy-dark'} mb-2`}>
          {section.title}
        </h3>
        {isChart && renderChart()}
        {isTable && tableRows && (
          <table className={`w-full border-collapse ${fmtClasses || 'text-sm'}`}>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border border-portal-border-light px-3 py-2 font-medium text-portal-navy-dark">
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isChart && !isTable && typeof section.content === 'string' && !section.content.startsWith('__') && (
          <p className={`whitespace-pre-wrap leading-relaxed ${fmtClasses || 'text-sm text-portal-navy-dark'}`}>
            {section.content}
          </p>
        )}
      </div>
    </div>
  );
}

/** Decode report from URL-safe base64 (works anywhere, no backend) */
function decodeReportFromData(data) {
  if (!data || typeof data !== 'string') return null;
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json);
    return parsed && (parsed.sections || parsed.title) ? parsed : null;
  } catch (_) {
    return null;
  }
}

export default function ReportEmbedPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dataParam = searchParams.get('data');
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (dataParam) {
      setReport(decodeReportFromData(dataParam));
      return;
    }
    if (id) {
      setReport(getReport(id));
    }
  }, [id, dataParam]);

  if (!id && !dataParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-portal-bg-section p-4">
        <p className="text-portal-gray">Report ID or data required.</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-portal-bg-section p-4">
        <p className="text-portal-gray">Report not found.</p>
      </div>
    );
  }

  const sections = (report.sections || [])
    .filter((s) => s.content !== '__TITLE_ONLY__') // skip title placeholder; we show report.title above
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div
      className="min-h-screen overflow-auto p-6"
      style={{
        backgroundColor: 'var(--portal-bg-section, #f5f6f8)',
        backgroundImage: 'radial-gradient(circle, var(--portal-border, #e7e7e8) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-[10px] bg-white p-8 shadow-card">
          <h1 className="font-display text-[30px] font-extrabold leading-[40px] tracking-[-0.5px] text-portal-navy-dark mb-6">
            {report.title || 'Untitled Report'}
          </h1>
          {sections.length === 0 ? (
            <p className="text-portal-gray">No content in this report.</p>
          ) : (
            <div className="grid grid-cols-12 gap-5">
              {sections.map((sec) => (
                <EmbedSection key={sec.id} section={sec} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
