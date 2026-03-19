import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getReport,
  updateReport,
  addSection,
  updateSection,
  deleteSection,
  addComment,
  resolveComment,
  createReport,
  lockSection,
  unlockSection,
} from '../lib/reportStorage';
import { exportToPDF, exportToPPTX } from '../lib/reportExport';
import { generateReportSummary } from '../lib/reportSummary';
import { addRecentViewed } from '../lib/recommendations';
import { CHART_DATASETS, CHART_GOVERNORATES_DATA } from '../data/omanMockData';
import { IconSparkle, IconLock, IconComment } from '../components/Icons';
import TopBar from '../components/TopBar';
import InsightCards from '../components/InsightCards';
import RecommendedForYou from '../components/RecommendedForYou';
import UpperBar from '../components/UpperBar';

const STORAGE_KEY = 'ncsi_smart_portal_reports';
const PRESENCE_KEY = 'ncsi_report_presence';

const REPORT_GENERATION_STEPS = [
  'Analyzing your prompt',
  'Structuring report outline',
  'Generating executive summary',
  'Creating key findings',
  'Building data tables',
  'Rendering charts',
  'Finalizing report',
];

const CHART_UPDATE_STEPS = [
  'Analyzing chart request',
  'Updating visualization',
];

/** Copy text to clipboard; works in secure and insecure contexts */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

/** Detect if prompt is asking to change a chart; return { sectionId, newContent } or null */
function parseChartChangePrompt(prompt, sections) {
  const p = (prompt || '').toLowerCase().trim();
  if (!p || !sections?.length) return null;
  const chartSections = sections
    .map((s) => ({ section: s }))
    .filter(({ section }) => section.type === 'chart' || (typeof section.content === 'string' && section.content.startsWith('__CHART__')));
  if (chartSections.length === 0) return null;
  const isChartRelated = /\b(change|switch|convert|make|show)\b.*\b(chart|graph)\b/.test(p) || /\b(bar|line|pie|area|scatter|funnel)\s*(chart)?\b/.test(p);
  if (!isChartRelated) return null;
  const firstChart = chartSections[0];
  const newContent = parseChartPromptForSection(prompt);
  if (newContent) return { sectionId: firstChart.section.id, newContent };
  return null;
}

/** Generate content for a single section (for per-section regenerate) – Oman localized */
function mockRegenerateSection(sectionTitle, customPrompt) {
  const p = (customPrompt || sectionTitle || '').toLowerCase();
  if (p.includes('summary') || p.includes('overview')) {
    return 'This section summarises key statistics for the Sultanate of Oman from the National Centre for Statistics & Information (NCSI). Data from the Labour Force Survey, Census 2020, and monthly economic indicators show continued progress in labour market indicators and economic diversification. Oman Vision 2040 targets guide medium-term policy across all governorates.';
  }
  if (p.includes('finding') || p.includes('result')) {
    return '• Unemployment at 2.1% (2024), among the lowest in the GCC (NCSI Labour Force Survey).\n• Real GDP growth stabilised around 2% with non-oil sector expansion.\n• Population growth positive across all 11 governorates; Muscat and Al Batinah South lead in concentration.\n• CPI inflation (base 2019) contained at 0.8% YoY (January 2025).\n• Open Data Watch ranked Oman first in West Asia for open data.';
  }
  if (p.includes('recommend')) {
    return '• Continue monitoring labour market indicators by governorate using NCSI Labour Force Survey data.\n• Expand open data releases (NCSI SMART Portal) to support research and policy.\n• Align statistical outputs with Oman Vision 2040 and SDG reporting.\n• Strengthen sub-national estimates for Muscat, Dhofar, and Al Batinah for evidence-based planning.';
  }
  if (p.includes('population') || p.includes('demographic')) {
    return 'Population estimates for the Sultanate of Oman are produced by NCSI using Census 2020 and vital statistics. The majority of the population is concentrated in Muscat, Al Batinah North and South, and Dhofar. Growth rates vary by governorate; NCSI publishes annual estimates in OMR and by age and gender.';
  }
  // Default: produce a realistic Oman-flavoured paragraph instead of a generic placeholder
  return `This section provides an updated narrative for "${sectionTitle}" using NCSI open data and recent releases. Labour Force Survey results for 2023–2024 point to stable unemployment around 2–2.2% with higher participation among Omani youth, while national accounts show non‑oil activities contributing more than two‑thirds of real GDP growth. Population estimates confirm continued concentration in Muscat and the Al Batinah governorates, with Dhofar acting as a secondary hub in the south. Unless otherwise noted, figures are drawn from NCSI statistical bulletins, Census 2020, and the Central Bank of Oman.`;
}

/** Generate a full report: title, overview, key findings, table, charts, recommendations – Oman localized */
function mockGenerateSections(prompt) {
  const p = prompt.toLowerCase();
  const isLabour = p.includes('labour') || p.includes('labor') || p.includes('employment') || p.includes('unemployment');
  const isEconomy = p.includes('gdp') || p.includes('economic') || p.includes('growth');
  const isPopulation = p.includes('population') || p.includes('census') || p.includes('demographic');
  const title =
    isLabour ? 'Labour Market Trends in the Sultanate of Oman (2020–2024)' :
    isEconomy ? 'Economic Outlook – Sultanate of Oman' :
    isPopulation ? 'Population and Demographics – Sultanate of Oman' :
    `Report: ${prompt.slice(0, 50)}${prompt.length > 50 ? '…' : ''}`;

  const overview = `This report presents key statistics and trends for the Sultanate of Oman based on data from the National Centre for Statistics & Information (NCSI), the Central Bank of Oman (CBO), and other official sources. The analysis covers the period 2020–2024 and includes demographic, labour market, and economic indicators aligned with Oman Vision 2040. All monetary values are in OMR unless otherwise stated.`;

  const keyFindings = `• Unemployment rate (NCSI Labour Force Survey) declined to 2.1% in 2024, among the lowest in the GCC.\n• Population growth remained positive across all 11 governorates; Muscat, Al Batinah South, and Dhofar show the highest concentrations.\n• Real GDP growth recovered from the 2020 contraction and stabilised around 2% in 2024, with non-oil sector contribution rising.\n• CPI inflation (base year 2019) remained contained at 0.8% (YoY) as of January 2025.\n• Oman ranked first in West Asia in the Open Data Watch report, supporting evidence-based policy.`;

  const tableContent = JSON.stringify([
    ['Indicator', '2022', '2023', '2024', 'Source'],
    ['Unemployment rate (%)', '2.3', '2.2', '2.1', 'NCSI LFS'],
    ['GDP growth (real, %)', '4.3', '1.2', '2.1', 'NCSI'],
    ['Population (million)', '4.5', '4.6', '4.7', 'NCSI'],
    ['CPI (annual % change)', '1.2', '0.9', '0.8', 'NCSI'],
    ['—', '—', '—', '—', 'LFS = Labour Force Survey'],
  ]);

  const recommendations = `• Continue monitoring labour market indicators by governorate using NCSI Labour Force Survey data.\n• Expand open data releases via the NCSI SMART Portal to support research and policy.\n• Align statistical outputs with Oman Vision 2040 and SDG reporting requirements.\n• Strengthen sub-national estimates for Muscat, Dhofar, and Al Batinah for evidence-based planning.`;

  const methodology = 'This analysis uses official statistics from NCSI, the Central Bank of Oman, and related government sources. Time series are aligned to official reference years; seasonal and calendar adjustments are illustrative for this PoC. In production, all transformations would be fully documented and reproducible.';

  const risks = 'Key risks and considerations include uncertainty around global demand, oil prices, and labour market participation, particularly for youth. Users should consult the full metadata in the NCSI data portal when interpreting results.';

  const sources = JSON.stringify([
    ['Source', 'Description'],
    ['NCSI Labour Force Survey', 'Employment and unemployment indicators'],
    ['NCSI National Accounts', 'GDP by activity and expenditure'],
    ['NCSI Census 2020', 'Population and demographics'],
    ['Central Bank of Oman', 'Balance of Payments and monetary indicators'],
  ]);

  return [
    { title, content: '__TITLE_ONLY__', type: 'title', sortOrder: 0, sectionHeader: null },
    { title: 'Executive Summary', content: overview, type: 'text', sortOrder: 1, sectionHeader: 'KEY METRICS OVERVIEW' },
    { title: 'Key findings', content: keyFindings, type: 'text', sortOrder: 2, sectionHeader: 'PERFORMANCE OVERVIEW' },
    { title: 'Summary table', content: `__TABLE__|${tableContent}`, type: 'table', sortOrder: 3, sectionHeader: 'DATA SUMMARY' },
    { title: 'Population by governorate (million) – Sultanate of Oman', content: '__CHART__|bar|governorates', type: 'chart', sortOrder: 4, sectionHeader: 'POPULATION BY GOVERNORATE' },
    { title: isLabour ? 'Unemployment rate (%) – Oman' : 'GDP growth (%) – Oman', content: isLabour ? '__CHART__|line|unemployment' : '__CHART__|line|gdpGrowth', type: 'chart', sortOrder: 5, sectionHeader: 'PERFORMANCE OVERVIEW' },
    { title: 'Methodology & assumptions', content: methodology, type: 'text', sortOrder: 6, sectionHeader: 'METHODOLOGY' },
    { title: 'Data sources', content: `__TABLE__|${sources}`, type: 'table', sortOrder: 7, sectionHeader: 'SOURCES' },
    { title: 'Risks & considerations', content: risks, type: 'text', sortOrder: 8, sectionHeader: 'RISK ASSESSMENT' },
    { title: 'Recommendations', content: recommendations, type: 'text', sortOrder: 9, sectionHeader: null },
  ];
}

export default function ReportBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [showPromptBar, setShowPromptBar] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationSteps, setGenerationSteps] = useState(REPORT_GENERATION_STEPS);
  const [rightPanel, setRightPanel] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [editorRole, setEditorRole] = useState('Data Analyst');
  const [showShare, setShowShare] = useState(false);
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [presence, setPresence] = useState({}); // { [sectionId]: { name, updatedAt } } from other users
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const canvasRef = useRef(null);
  const [draggingSectionId, setDraggingSectionId] = useState(null);
  const [dragOverSectionId, setDragOverSectionId] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadReport = useCallback(() => {
    if (!id) return;
    if (id === 'new') {
      const r = createReport();
      navigate(`/report/${r.id}`, { replace: true });
      setReport(r);
      return;
    }
    const r = getReport(id);
    setReport(r || null);
    if (r) {
      setPrompt(r.prompt || '');
      addRecentViewed({ type: 'report', id: r.id });
    }
  }, [id, navigate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Collaboration: sync report when another tab updates localStorage
  const reportIdRef = useRef(id);
  reportIdRef.current = id;
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === PRESENCE_KEY && e.newValue != null) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.reportId === reportIdRef.current && data.userName !== editorRole)
            setPresence((prev) => {
              const next = {};
              for (const sid of Object.keys(prev)) {
                if (prev[sid].name !== data.userName) next[sid] = prev[sid];
              }
              next[data.sectionId] = { name: data.userName, updatedAt: data.updatedAt };
              return next;
            });
        } catch (_) {}
        return;
      }
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      const rid = reportIdRef.current;
      if (!rid || rid === 'new') return;
      try {
        const reports = JSON.parse(e.newValue);
        const updated = reports.find((r) => r.id === rid);
        if (updated) setReport(updated);
      } catch (_) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [editorRole]);

  // Broadcast presence when active section changes
  useEffect(() => {
    if (!id || id === 'new' || !activeSectionId) return;
    const payload = { reportId: id, sectionId: activeSectionId, userName: editorRole, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem(PRESENCE_KEY, JSON.stringify(payload));
    } catch (_) {}
  }, [id, activeSectionId, editorRole]);

  const persistReport = useCallback(() => {
    if (!report) return;
    updateReport(report.id, { title: report.title, prompt: report.prompt, sections: report.sections, comments: report.comments, published: report.published });
    setReport(getReport(report.id));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [report]);

  const handleTitleChange = (title) => {
    setReport((r) => (r ? { ...r, title } : r));
  };

  const handleGenerate = () => {
    if (!prompt.trim() || !report) return;
    const sections = report.sections || [];
    const chartChange = sections.length > 0 ? parseChartChangePrompt(prompt, sections) : null;
    if (chartChange) {
      setGenerationSteps(CHART_UPDATE_STEPS);
      setGenerationStep(0);
      setGenerating(true);
      const duration = 800;
      const stepInterval = duration / CHART_UPDATE_STEPS.length;
      let step = 0;
      const stepTimer = setInterval(() => {
        step += 1;
        setGenerationStep(step);
        if (step >= CHART_UPDATE_STEPS.length) clearInterval(stepTimer);
      }, stepInterval);
      setTimeout(() => {
        clearInterval(stepTimer);
        updateSection(report.id, chartChange.sectionId, { content: chartChange.newContent });
        setReport(getReport(report.id));
        setGenerating(false);
        setShowPromptBar(false);
        showToast('Chart updated to match your request.');
      }, duration);
      return;
    }
    setGenerationSteps(REPORT_GENERATION_STEPS);
    setGenerationStep(0);
    setGenerating(true);
    const duration = 4000;
    const stepInterval = duration / REPORT_GENERATION_STEPS.length;
    let step = 0;
    const stepTimer = setInterval(() => {
      step += 1;
      setGenerationStep(Math.min(step, REPORT_GENERATION_STEPS.length - 1));
      if (step >= REPORT_GENERATION_STEPS.length) clearInterval(stepTimer);
    }, stepInterval);
    setTimeout(() => {
      clearInterval(stepTimer);
      const newSections = mockGenerateSections(prompt);
      const firstTitle = newSections.find((s) => s.type === 'title')?.title;
      const nextSections = newSections.map((s, i) => ({
        id: `sec-${Date.now()}-${i}`,
        title: s.title,
        content: s.content,
        sortOrder: i,
        type: s.type || 'text',
        sectionHeader: s.sectionHeader ?? null,
        layoutWidth:
          s.type === 'title' ? 'full' :
          s.type === 'text' ? 'full' :
          s.type === 'table' ? 'half' :
          s.type === 'chart' ? 'half' : 'full',
        layoutHeight: 'auto',
      }));
      updateReport(report.id, {
        prompt,
        title: firstTitle || report.title,
        sections: nextSections,
      });
      setReport(getReport(report.id));
      setGenerating(false);
      setShowPromptBar(false);
    }, duration);
  };

  const handleAddSection = (type = 'text') => {
    if (!report) return;
    const title = type === 'title' ? 'Section title' : type === 'chart' ? 'Chart' : type === 'table' ? 'Data table' : 'New section';
    const layoutWidth =
      type === 'title' ? 'full' :
      type === 'text' ? 'full' :
      type === 'chart' ? 'half' :
      type === 'table' ? 'half' : 'full';
    const content =
      type === 'title' ? '__TITLE_ONLY__' :
      type === 'chart' ? '__CHART__|bar|governorates' :
      type === 'table' ? `__TABLE__|${JSON.stringify([['Column 1', 'Column 2'], ['A', 'B']])}` : '';
    addSection(report.id, { title, content, type, layoutWidth, layoutHeight: 'auto' });
    setReport(getReport(report.id));
  };

  const handleUpdateSection = (sectionId, updates) => {
    if (!report) return;
    updateSection(report.id, sectionId, updates);
    setReport(getReport(report.id));
  };

  const handleDeleteSection = (sectionId) => {
    if (!report) return;
    deleteSection(report.id, sectionId);
    setReport(getReport(report.id));
    if (activeSectionId === sectionId) setActiveSectionId(null);
  };

  const handleAddComment = (sectionId, content) => {
    if (!report) return;
    addComment(report.id, { sectionId, content, author: editorRole });
    setReport(getReport(report.id));
  };

  const handleResolveComment = (commentId) => {
    if (!report) return;
    resolveComment(report.id, commentId);
    setReport(getReport(report.id));
  };

  const handlePublish = () => {
    if (!report) return;
    updateReport(report.id, { published: true });
    setReport(getReport(report.id));
    showToast('Report published to the portal. It will appear under Published on the Reports page.');
  };

  const handleRegenerateSection = useCallback((sectionId, customPrompt) => {
    if (!report) return Promise.resolve();
    const section = report.sections?.find((s) => s.id === sectionId);
    if (!section) return Promise.resolve();
    const isChart = section.type === 'chart' || (typeof section.content === 'string' && section.content.startsWith('__CHART__'));
    const isTable = section.type === 'table' || (typeof section.content === 'string' && section.content.startsWith('__TABLE__'));
    const conversion = customPrompt?.trim() ? parseConversionPrompt(customPrompt) : null;

    // Table → Chart: "convert to chart", "make it a chart"
    if (isTable && conversion?.toChart) {
      const chartContent = parseChartPromptForSection(customPrompt) || '__CHART__|bar|governorates';
      const spec = parseChartContent(chartContent);
      const titleByDataset = {
        governorates: 'Population by governorate (million) – Sultanate of Oman',
        employment: 'Employment by governorate (thousands) – Sultanate of Oman',
        unemployment: 'Unemployment rate (%) – Oman',
        gdpGrowth: 'GDP growth (%) – Oman',
      };
      const newTitle = titleByDataset[spec?.datasetKey] ?? 'Chart – Sultanate of Oman';
      return new Promise((resolve) => {
        setTimeout(() => {
          updateSection(report.id, sectionId, { content: chartContent, type: 'chart', title: newTitle });
          setReport(getReport(report.id));
          showToast('Table converted to chart.');
          resolve();
        }, 800);
      });
    }

    // Chart → Table: "convert to table", "make it a table"
    if (isChart && conversion?.toTable) {
      const spec = parseChartContent(section.content) || { type: 'bar', datasetKey: 'governorates' };
      const rows = chartDataToTableRows(spec.datasetKey);
      const tableContent = `__TABLE__|${JSON.stringify(rows)}`;
      const newTitle = (section.title || 'Chart').replace(/\s*[–-]\s*Sultanate of Oman\s*$/i, '') + ' – Table';
      return new Promise((resolve) => {
        setTimeout(() => {
          updateSection(report.id, sectionId, { content: tableContent, type: 'table', title: newTitle });
          setReport(getReport(report.id));
          showToast('Chart converted to table.');
          resolve();
        }, 800);
      });
    }

    // Chart type/dataset change (existing)
    if (isChart && customPrompt?.trim()) {
      const newContent = parseChartPromptForSection(customPrompt);
      if (newContent) {
        const spec = parseChartContent(newContent);
        const titleByDataset = {
          governorates: 'Population by governorate (million) – Sultanate of Oman',
          employment: 'Employment by governorate (thousands) – Sultanate of Oman',
          unemployment: 'Unemployment rate (%) – Oman',
          gdpGrowth: 'GDP growth (%) – Oman',
        };
        const newTitle = titleByDataset[spec?.datasetKey] ?? section.title;
        return new Promise((resolve) => {
          setTimeout(() => {
            updateSection(report.id, sectionId, { content: newContent, title: newTitle });
            setReport(getReport(report.id));
            showToast('Chart updated to match your request.');
            resolve();
          }, 800);
        });
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const newContent = mockRegenerateSection(section.title, customPrompt);
        updateSection(report.id, sectionId, { content: newContent });
        setReport(getReport(report.id));
        resolve();
      }, 1200);
    });
  }, [report, showToast]);

  /** Mock paraphrase: rephrase text for demo (rich content editor feature). */
  const handleParaphrase = useCallback((sectionId) => {
    const section = report?.sections?.find((s) => s.id === sectionId);
    if (!section || typeof section.content !== 'string') return;
    const c = section.content;
    const paraphrased = c
      .replace(/\bkey\b/gi, 'principal')
      .replace(/\bgrowth\b/gi, 'expansion')
      .replace(/\brate\b/gi, 'level')
      .replace(/\bdeclined\b/gi, 'decreased')
      .replace(/\bstabilised\b/gi, 'stabilized')
      .replace(/\bamong\b/gi, 'one of');
    if (paraphrased === c) {
      showToast('Paraphrase applied (no changes needed).');
    } else {
      updateSection(report.id, sectionId, { content: paraphrased });
      setReport(getReport(report.id));
      showToast('Section paraphrased.');
    }
  }, [report, showToast]);

  const handleGrammarCheck = useCallback(() => {
    showToast('Grammar check complete. No issues found.');
  }, [showToast]);

  const handleSpellCheck = useCallback(() => {
    showToast('Spell check complete. No errors found.');
  }, [showToast]);

  const handleReorderSections = useCallback((sourceId, targetId) => {
    if (!report || !sourceId || !targetId || sourceId === targetId) return;
    const current = report.sections || [];
    const sourceIndex = current.findIndex((s) => s.id === sourceId);
    const targetIndex = current.findIndex((s) => s.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const next = [...current];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    const withSortOrder = next.map((s, idx) => ({ ...s, sortOrder: idx }));
    updateReport(report.id, { sections: withSortOrder });
    setReport(getReport(report.id));
  }, [report]);

  const handleSummarize = useCallback(() => {
    if (!report || (report.sections || []).length === 0) {
      showToast('Add some content first, then summarize.');
      return;
    }
    setSummarizing(true);
    setShowSummaryModal(true);
    setSummaryResult(null);
    generateReportSummary(report).then((res) => {
      setSummaryResult(res);
      setSummarizing(false);
    });
  }, [report, showToast]);

  if (!report && id && id !== 'new') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-portal-gray">Report not found.</p>
        <button type="button" onClick={() => navigate('/reports')} className="ml-4 font-medium text-portal-blue-primary hover:underline focus:outline-none focus:ring-2 focus:ring-portal-blue-primary focus:ring-offset-2 rounded">Back to Reports</button>
      </div>
    );
  }

  const sections = report?.sections || [];

  return (
    <div className="flex min-h-screen w-full flex-col bg-portal-bg-section">
      <UpperBar />
      <TopBar />
      <div className="flex h-[calc(100vh-3.5rem)] flex-col" id="main-content">
      {/* Main header – report title + Live/role controls */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-portal-border bg-white px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="rounded p-2 text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy focus:outline-none focus:ring-2 focus:ring-portal-blue-primary focus:ring-offset-1"
            aria-label="Back to reports"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <svg className="h-5 w-5 text-portal-gray" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          <input
            value={report?.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={persistReport}
            className="max-w-[240px] border-0 bg-transparent font-display text-base font-bold tracking-[-0.5px] text-portal-navy-dark focus:outline-none"
            placeholder="Untitled Report"
            aria-label="Report title"
          />
          {/* Live + role selector – next to title */}
          <div className="flex items-center gap-2 rounded-lg border border-portal-border-light bg-portal-bg-section/60 px-3 py-1.5">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden />
            <span className="text-xs font-medium text-portal-navy">Live</span>
            <div className="flex -space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white text-[9px] font-bold text-portal-blue-primary shadow-sm" title="Data Analyst">A</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-portal-card-teal text-[9px] font-bold text-[#085d3a] shadow-sm" title="Senior Researcher">R</span>
            </div>
            <select
              value={editorRole}
              onChange={(e) => setEditorRole(e.target.value)}
              className="rounded border-0 bg-transparent py-0.5 pr-5 text-xs font-medium text-portal-navy focus:outline-none focus:ring-0"
              aria-label="Editor role"
            >
              <option value="Data Analyst" className="bg-white text-portal-navy-dark">Data Analyst</option>
              <option value="Senior Researcher" className="bg-white text-portal-navy-dark">Senior Researcher</option>
            </select>
          </div>
        </div>
        {sections.length === 0 && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
                className="flex items-center gap-1.5 rounded border border-portal-navy bg-white px-3 py-2 text-sm font-medium text-portal-blue-primary hover:bg-portal-bg-section focus:outline-none focus:ring-2 focus:ring-portal-blue-primary focus:ring-offset-1"
                aria-expanded={showAddSectionMenu}
                aria-haspopup="true"
                aria-label="Add section"
              >
                + Add Section
              </button>
              {showAddSectionMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAddSectionMenu(false)} aria-hidden />
                  <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-portal-border bg-white py-1 shadow-lg" role="menu" aria-label="Add section">
                    <button type="button" role="menuitem" onClick={() => { handleAddSection('text'); setShowAddSectionMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-portal-navy-dark hover:bg-portal-bg-section">Text</button>
                    <button type="button" role="menuitem" onClick={() => { handleAddSection('title'); setShowAddSectionMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-portal-navy-dark hover:bg-portal-bg-section">Title</button>
                    <button type="button" role="menuitem" onClick={() => { handleAddSection('table'); setShowAddSectionMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-portal-navy-dark hover:bg-portal-bg-section">Table</button>
                    <button type="button" role="menuitem" onClick={() => { handleAddSection('chart'); setShowAddSectionMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-portal-navy-dark hover:bg-portal-bg-section">Chart</button>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setShowPromptBar(true); setShowAddSectionMenu(false); }}
              className="flex items-center gap-1.5 rounded bg-gradient-to-r from-[#a624d2] to-[#3a70d8] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
            >
              <IconSparkle className="h-5 w-5" /> AI Generate
            </button>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRightPanel(rightPanel === 'outline' ? null : 'outline')}
            className={`flex items-center gap-2 rounded p-2 ${rightPanel === 'outline' ? 'bg-portal-ai-bg text-portal-blue-primary' : 'text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy'}`}
            title="Sections outline"
            aria-label="Toggle sections outline panel"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h7" /></svg>
            <span className="text-sm font-medium">Outline</span>
          </button>
          <button
            type="button"
            onClick={() => setRightPanel(rightPanel === 'comments' ? null : 'comments')}
            className={`flex items-center gap-2 rounded p-2 ${rightPanel === 'comments' ? 'bg-portal-ai-bg text-portal-blue-primary' : 'text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy'}`}
            title="Comments"
            aria-label="Toggle comments panel"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
            <span className="text-sm font-medium">Comments</span>
          </button>
          <button
            type="button"
            onClick={persistReport}
            className="flex items-center gap-2 rounded p-2 text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy focus:outline-none focus:ring-2 focus:ring-portal-blue-primary focus:ring-offset-1"
            title={saved ? 'Saved' : 'Save'}
            aria-label={saved ? 'Saved' : 'Save report'}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
            <span className="text-sm font-medium">{saved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            type="button"
            onClick={handleSummarize}
            disabled={summarizing || (report?.sections || []).length === 0}
            className="flex items-center gap-2 rounded-lg border border-transparent bg-gradient-to-r from-[#a624d2]/10 to-[#3a70d8]/10 px-3 py-2 text-portal-navy hover:from-[#a624d2]/20 hover:to-[#3a70d8]/20 disabled:opacity-50 disabled:hover:from-[#a624d2]/10 disabled:hover:to-[#3a70d8]/10"
            title="AI Summarize report"
            aria-label="AI Summarize report"
          >
            {summarizing ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#a624d2] border-t-transparent" />
            ) : (
              <IconSparkle className="h-5 w-5 text-[#a624d2]" />
            )}
            <span className="text-sm font-medium">{summarizing ? 'Summarizing…' : 'AI Summarize'}</span>
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="flex items-center gap-2 rounded p-2 text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy"
            title="Publish"
            aria-label="Publish report"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            <span className="text-sm font-medium">Publish</span>
          </button>
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="flex items-center gap-2 rounded p-2 text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy"
            title="Share"
            aria-label="Share report"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
            <span className="text-sm font-medium">Share</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowExportMenu(!showExportMenu); setShowAddSectionMenu(false); }}
              disabled={exporting || sections.length === 0}
              className="flex items-center gap-2 rounded p-2 text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-portal-blue-primary focus:ring-offset-1"
              title="Export"
              aria-expanded={showExportMenu}
              aria-haspopup="true"
              aria-label="Export report"
            >
              {exporting ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-portal-blue-primary border-t-transparent" aria-hidden /> : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4z"/></svg>
              )}
              <span className="text-sm font-medium">Export</span>
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} aria-hidden />
                <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-portal-border bg-white py-1 shadow-lg" role="menu" aria-label="Export options">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      setExporting(true);
                      const ok = await exportToPDF(report, (report?.title || 'NCSI-Report').replace(/[^a-z0-9]/gi, '_'));
                      setShowExportMenu(false);
                      setExporting(false);
                      if (ok) showToast('PDF downloaded.');
                      else showToast('Export failed. Try again.');
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-portal-navy-dark hover:bg-portal-bg-section"
                  >
                    Export as PDF
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      setExporting(true);
                      const ok = await exportToPPTX(report, (report?.title || 'NCSI-Report').replace(/[^a-z0-9]/gi, '_'));
                      setShowExportMenu(false);
                      setExporting(false);
                      if (ok) showToast('PPTX downloaded.');
                      else showToast('Export failed. Try again.');
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-portal-navy-dark hover:bg-portal-bg-section"
                  >
                    Export as PPTX
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      if (!report) return;
                      const baseUrl = `${window.location.origin}${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}`;
                      const payload = { title: report.title, sections: report.sections || [] };
                      const data = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                      const src = `${baseUrl}/report/embed?data=${data}`;
                      const snippet = `<iframe src="${src}" style="width:100%;height:800px;border:0;" title="NCSI report"></iframe>`;
                      const ok = await copyToClipboard(snippet);
                      showToast(ok ? 'Iframe embed code copied to clipboard.' : 'Could not copy iframe. Please copy manually.');
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-portal-navy-dark hover:bg-portal-bg-section"
                  >
                    Copy iframe embed
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      {/* Presence: show when another person is editing a section */}
      {Object.keys(presence).length > 0 && (
        <div className="flex shrink-0 items-center gap-2 px-6 py-1.5 bg-amber-50 border-b border-amber-200/60 text-sm">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" aria-hidden />
          {Object.entries(presence).map(([sectionId, info], idx) => {
            const sec = sections.find((s) => s.id === sectionId);
            const sectionTitle = sec?.title || 'a section';
            return (
              <span key={sectionId}>
                {idx > 0 && <span className="text-amber-400 mx-1">·</span>}
                <span className="text-amber-800"><strong>{info.name}</strong> is editing {sectionTitle}</span>
              </span>
            );
          })}
        </div>
      )}

      {showShare && report && (
        <ShareReportDialog
          report={report}
          onClose={() => setShowShare(false)}
        />
      )}

      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !summarizing && setShowSummaryModal(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-portal-border bg-white/95 p-6 shadow-2xl backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#a624d2] to-[#3a70d8] text-white">
                  <IconSparkle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold tracking-[-0.4px] text-portal-navy-dark">AI Executive Summary</h3>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-portal-gray">
                    Generated from this report&apos;s latest content
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !summarizing && setShowSummaryModal(false)}
                className="rounded-full p-1.5 text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy"
                aria-label="Close summary"
              >
                ×
              </button>
            </div>
            {summarizing && !summaryResult && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-portal-border bg-gradient-to-r from-[#a624d2]/5 to-[#3a70d8]/5 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#a624d2] to-[#3a70d8] text-white">
                  <IconSparkle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-portal-navy-dark">AI is analyzing your report…</p>
                  <p className="text-xs text-portal-gray">Extracting key points and generating an executive brief</p>
                </div>
                <span className="ml-auto h-5 w-5 animate-spin rounded-full border-2 border-[#a624d2] border-t-transparent" />
              </div>
            )}
            {summaryResult && (
              <div className="mt-5 space-y-4">
                <p className="text-sm leading-relaxed text-[#161616]">
                  {summaryResult.summary}
                </p>
                {summaryResult.bullets?.length > 0 && (
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-portal-gray">
                      Key points
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-portal-gray">
                      {summaryResult.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[11px] text-portal-gray">
                Drafted by AI · Review before publishing
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!summaryResult) return;
                    const text = [
                      summaryResult.summary ?? '',
                      ...(summaryResult.bullets ?? []),
                    ]
                      .filter(Boolean)
                      .join('\n\n• ');
                    const ok = await copyToClipboard(text);
                    showToast(ok ? 'Executive summary copied to clipboard.' : 'Could not copy summary. Please copy manually.');
                  }}
                  className="rounded-full border border-portal-border bg-white px-3 py-1.5 text-xs font-medium text-portal-navy hover:bg-portal-bg-section"
                >
                  Copy summary
                </button>
                <button
                  type="button"
                  onClick={() => setShowSummaryModal(false)}
                  className="rounded-full bg-portal-blue px-4 py-1.5 text-sm font-medium text-white hover:bg-[#004a75]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex flex-1 overflow-hidden">
        {generating && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm" role="status" aria-live="polite" aria-label="Generating content">
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-portal-border bg-white px-10 py-8 shadow-2xl animate-fade-in-up">
              {/* Animated gradient orb */}
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#a624d2] via-[#6d42ff] to-[#3a70d8] opacity-90 animate-ai-pulse" />
                <div className="absolute inset-0 h-16 w-16 rounded-full bg-gradient-to-br from-[#a624d2] via-[#6d42ff] to-[#3a70d8] opacity-50 blur-xl animate-ai-pulse" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <IconSparkle className="h-7 w-7 text-white drop-shadow-sm animate-pulse" style={{ animationDuration: '1.2s' }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-portal-navy-dark">AI is generating your report</p>
                <p className="mt-1 text-xs text-portal-gray">This usually takes a few seconds</p>
              </div>
              {/* Progress bar */}
              <div className="w-full max-w-xs">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-portal-bg-section">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#a624d2] to-[#3a70d8] transition-all duration-500 ease-out"
                    style={{ width: `${((generationStep + 1) / generationSteps.length) * 100}%` }}
                  />
                </div>
              </div>
              {/* Steps list */}
              <ul className="w-full max-w-sm space-y-2">
                {generationSteps.map((step, i) => {
                  const isComplete = i < generationStep;
                  const isCurrent = i === generationStep;
                  return (
                    <li
                      key={step}
                      className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                        isComplete ? 'text-portal-navy-dark' : isCurrent ? 'text-portal-blue-primary font-medium' : 'text-portal-gray'
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        isComplete
                          ? 'bg-emerald-500/20 text-emerald-600'
                          : isCurrent
                          ? 'bg-portal-blue-primary/20 text-portal-blue-primary animate-pulse'
                          : 'bg-portal-bg-section text-portal-gray'
                      }`}>
                        {isComplete ? (
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className={isCurrent ? 'animate-pulse' : ''}>{step}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
        {/* Canvas – portal theme (matches landing bg) */}
        <div
          className="flex-1 overflow-auto p-6"
          style={{
            backgroundColor: 'var(--portal-bg-section, #f5f6f8)',
            backgroundImage: 'radial-gradient(circle, var(--portal-border, #e7e7e8) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div className="mx-auto max-w-[1100px]">
            {report?.prompt && (
              <div className="mb-4 rounded-lg border border-portal-border-light bg-amber-50/80 px-4 py-2">
                <p className="text-xs font-medium text-portal-navy-dark">
                  <span className="text-portal-gray">Prompt used to generate this report:</span>{' '}
                  <span className="italic">&quot;{report.prompt}&quot;</span>
                </p>
              </div>
            )}
            {sections.length === 0 && (
              <div className="rounded-[10px] border-2 border-dashed border-portal-border bg-white p-16 text-center">
                <p className="text-base font-medium text-portal-gray">
                  No sections yet. Use <strong className="text-portal-navy">AI Generate</strong> or <strong className="text-portal-navy">+ Add Section</strong> above to get started.
                </p>
                <p className="mt-2 text-sm text-portal-gray-muted">
                  AI Generate creates a full report from a prompt; Add Section lets you build manually.
                </p>
              </div>
            )}
            {sections.length > 0 && (
              <>
                <div ref={canvasRef} className="rounded-[10px] bg-white p-8 shadow-card">
                {/* Report title – NCSI landing style (font-display, tracking) */}
                <div className="mb-6 flex items-center gap-3">
                  <h1 className="font-display text-[30px] font-extrabold leading-[40px] tracking-[-0.5px] text-portal-navy-dark">
                    {report?.title || 'Untitled Report'}
                  </h1>
                  <span className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-portal-border bg-portal-bg-section text-portal-gray" title="Collaboration">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  </span>
                </div>
                {/* Main canvas grid */}
                <div className="flex-1">
                <div className="grid grid-cols-12 gap-5">
                  {sections.map((sec, idx) => {
                    const widthClass =
                      sec.layoutWidth === 'half'
                        ? 'col-span-12 md:col-span-6'
                        : sec.layoutWidth === 'third'
                        ? 'col-span-12 md:col-span-6 lg:col-span-4'
                        : 'col-span-12';
                    const isDropTarget = dragOverSectionId === sec.id && draggingSectionId !== sec.id;
                    return (
                    <div
                      key={sec.id}
                      className={`relative ${widthClass} transition-shadow ${
                        isDropTarget ? 'ring-2 ring-portal-blue-primary/40' : ''
                      }`}
                      onDragEnter={(e) => {
                        if (!draggingSectionId || draggingSectionId === sec.id) return;
                        e.preventDefault();
                        setDragOverSectionId(sec.id);
                      }}
                      onDragOver={(e) => {
                        if (!draggingSectionId || draggingSectionId === sec.id) return;
                        e.preventDefault();
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        if (dragOverSectionId === sec.id) setDragOverSectionId(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!draggingSectionId || draggingSectionId === sec.id) return;
                        handleReorderSections(draggingSectionId, sec.id);
                        setDraggingSectionId(null);
                        setDragOverSectionId(null);
                      }}
                    >
                      <ReportSectionCard
                        section={sec}
                        sectionIndex={idx}
                        isActive={activeSectionId === sec.id}
                        onActivate={() => setActiveSectionId(sec.id)}
                        onUpdate={(updates) => handleUpdateSection(sec.id, updates)}
                        onDelete={() => handleDeleteSection(sec.id)}
                        onRegenerate={handleRegenerateSection}
                        onParaphrase={handleParaphrase}
                        onGrammarCheck={handleGrammarCheck}
                        onSpellCheck={handleSpellCheck}
                        onChangeLayout={(layoutUpdates) => handleUpdateSection(sec.id, layoutUpdates)}
                        draggable
                        onDragStart={() => setDraggingSectionId(sec.id)}
                        onDragEnd={() => setDraggingSectionId(null)}
                        isDragging={draggingSectionId === sec.id}
                        commentCount={(report?.comments || []).filter((c) => c.sectionId === sec.id && !c.resolved).length}
                        onAddComment={() => {
                          setActiveSectionId(sec.id);
                          setRightPanel('comments');
                        }}
                        editorRole={editorRole}
                        onLock={() => lockSection(report.id, sec.id, editorRole)}
                        onUnlock={() => unlockSection(report.id, sec.id)}
                        isLockedByOther={sec.lockedBy && sec.lockedBy !== editorRole}
                        lockedByName={sec.lockedBy || null}
                        presenceInfo={presence[sec.id]}
                      />
                    </div>
                  );})}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button type="button" onClick={() => { handleAddSection('text'); setShowAddSectionMenu(false); }} className="rounded border border-portal-navy bg-white px-3 py-1.5 text-sm font-medium text-portal-blue-primary hover:bg-portal-bg-section">+ Text</button>
                  <button type="button" onClick={() => { handleAddSection('title'); setShowAddSectionMenu(false); }} className="rounded border border-portal-navy bg-white px-3 py-1.5 text-sm font-medium text-portal-blue-primary hover:bg-portal-bg-section">+ Title</button>
                  <button type="button" onClick={() => { handleAddSection('table'); setShowAddSectionMenu(false); }} className="rounded border border-portal-navy bg-white px-3 py-1.5 text-sm font-medium text-portal-blue-primary hover:bg-portal-bg-section">+ Table</button>
                  <button type="button" onClick={() => { handleAddSection('chart'); setShowAddSectionMenu(false); }} className="rounded border border-portal-navy bg-white px-3 py-1.5 text-sm font-medium text-portal-blue-primary hover:bg-portal-bg-section">+ Chart</button>
                </div>
                </div>
                </div>
                <div className="mt-6">
                  <RecommendedForYou context="report-builder" compact />
                </div>
              </>
            )}
          </div>
        </div>

        {rightPanel === 'outline' && (
          <aside className="w-72 shrink-0 border-l border-portal-border bg-white shadow-lg">
            <div className="flex h-12 items-center justify-between border-b border-portal-border px-4">
              <span className="font-display text-base font-bold tracking-[-0.5px] text-portal-navy-dark">Sections outline</span>
              <button type="button" onClick={() => setRightPanel(null)} className="rounded p-1 text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy">×</button>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
              <ol className="space-y-2 text-xs">
                {sections.map((sec, idx) => {
                  const isActiveOutline = activeSectionId === sec.id;
                  const typeLabel =
                    sec.type === 'title' ? 'Title' :
                    sec.type === 'chart' ? 'Chart' :
                    sec.type === 'table' ? 'Table' : 'Text';
                  return (
                    <li
                      key={sec.id}
                      className={`group flex items-center rounded-md border px-2 py-1.5 cursor-pointer transition-colors ${
                        isActiveOutline
                          ? 'border-portal-blue-primary bg-portal-ai-bg/80'
                          : 'border-transparent hover:border-portal-border hover:bg-portal-bg-section/80'
                      }`}
                      onClick={() => setActiveSectionId(sec.id)}
                    >
                      <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-portal-bg-section text-[10px] font-semibold text-portal-gray">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-portal-navy-dark">
                          {sec.title || 'Untitled section'}
                        </p>
                        <p className="truncate text-[10px] uppercase tracking-[0.16em] text-portal-gray">
                          {typeLabel}
                        </p>
                      </div>
                      <div className="ml-1 flex flex-col items-center justify-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          title="Move up"
                          className="rounded p-0.5 text-[10px] text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx === 0) return;
                            const targetId = sections[idx - 1].id;
                            handleReorderSections(sec.id, targetId);
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          className="rounded p-0.5 text-[10px] text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx === sections.length - 1) return;
                            const targetId = sections[idx + 1].id;
                            handleReorderSections(sec.id, targetId);
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
        )}

        {rightPanel === 'comments' && (
          <aside className="w-80 shrink-0 border-l border-portal-border bg-white shadow-lg">
            <div className="flex h-12 items-center justify-between border-b border-portal-border px-4">
              <span className="font-display text-base font-bold tracking-[-0.5px] text-portal-navy-dark">Comments</span>
              <button type="button" onClick={() => setRightPanel(null)} className="rounded p-1 text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy">×</button>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
              {(report?.comments || []).map((c) => (
                <div key={c.id} className={`mb-4 rounded-lg border p-3 transition-all ${c.resolved ? 'border-portal-border-light bg-portal-bg-section/50 opacity-75' : 'border-portal-border bg-white shadow-sm'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-portal-navy">{c.author}</p>
                    <span className="text-[10px] text-portal-gray">{c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-portal-navy-dark">{c.content}</p>
                  {!c.resolved && (
                    <button type="button" onClick={() => handleResolveComment(c.id)} className="mt-2 rounded px-2 py-1 text-xs font-medium text-portal-blue-primary hover:bg-portal-bg-section">Resolve</button>
                  )}
                  {c.resolved && <span className="mt-1 inline-block text-[10px] text-green-600">Resolved</span>}
                </div>
              ))}
              <AddCommentForm
                sectionId={activeSectionId}
                onSubmit={(content) => {
                  handleAddComment(activeSectionId, content);
                }}
              />
            </div>
          </aside>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-14 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-portal-border bg-white px-4 py-2 text-sm font-medium text-portal-navy-dark shadow-lg">
          {toast}
        </div>
      )}

      {/* Bottom status bar – NCSI navy strip (matches TopBar) */}
      <div className="flex h-8 shrink-0 items-center justify-between bg-portal-navy px-6 text-[10px] text-white/90">
        <div className="flex items-center gap-3">
          <span>{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
          {activeSectionId && (
            <span>· Selected: {sections.find((s) => s.id === activeSectionId)?.title || '—'}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {generating && <span>Generating…</span>}
          <span className="font-medium">NCSI SMART Portal</span>
        </div>
      </div>

      {/* Floating AI prompt dock – matches AI Assistant page style */}
      {showPromptBar && (
        <div className="fixed bottom-14 left-0 right-0 z-50 flex justify-center px-4">
          <div className="w-full max-w-xl">
            <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 focus-within:bg-white/95 focus-within:shadow-[0_8px_32px_rgba(0,82,135,0.12)] focus-within:border-portal-blue/30">
              <div className="flex items-end gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerate(); } }}
                    placeholder="e.g. Labour market trends in Oman 2020–2024, GDP by governorate, Population and demographics"
                    rows={2}
                    className="min-h-[52px] w-full resize-none bg-transparent py-2.5 text-[15px] text-[#161616] placeholder:text-portal-gray/90 focus:outline-none disabled:opacity-60"
                  />
                  <p className="mt-1 text-[10px] text-portal-gray">⌘+Enter to generate</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 pb-1">
                  <button
                    type="button"
                    onClick={() => setShowPromptBar(false)}
                    className="rounded-full px-3 py-1.5 text-sm text-portal-gray hover:bg-portal-bg-section hover:text-portal-navy"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating || !prompt.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#a624d2] to-[#3a70d8] text-white shadow-lg shadow-purple-500/25 transition hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {generating ? (
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <IconSparkle className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function OmanBarChart({ data, unit = 'million' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const maxVal = Math.max(...data.map((d) => d.value));
  const w = 420;
  const h = 180;
  const barH = 18;
  const gap = 6;
  const labelW = 120;
  const barW = w - labelW - 40;
  const handleMouseMove = (e, i) => {
    setHoveredIndex(i);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };
  return (
    <div ref={containerRef} className="relative min-h-[140px] w-full">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="min-h-[140px]" preserveAspectRatio="xMidYMid meet">
        {data.map((d, i) => {
          const x = labelW;
          const y = i * (barH + gap) + 4;
          const width = (d.value / maxVal) * barW;
          const isHovered = hoveredIndex === i;
          return (
            <g
              key={d.name}
              onMouseEnter={(e) => handleMouseMove(e, i)}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <text x={0} y={y + barH - 4} className="fill-[#161616] text-xs" style={{ fontFamily: 'system-ui' }}>{d.name}</text>
              <rect
                x={x}
                y={y}
                width={width}
                height={barH - 2}
                rx={3}
                fill={isHovered ? '#133c8b' : '#005287'}
                className="transition-all duration-150"
              />
              <text x={x + width + 6} y={y + barH - 4} className="fill-portal-gray text-xs" style={{ fontFamily: 'system-ui' }}>{d.value}</text>
            </g>
          );
        })}
      </svg>
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-portal-border bg-white px-3 py-2 text-xs font-medium shadow-lg"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 8, transform: 'translateY(-100%)' }}
        >
          <div className="text-portal-navy-dark">{data[hoveredIndex].name}</div>
          <div className="mt-0.5 text-portal-blue-primary font-semibold">{data[hoveredIndex].value} {unit}</div>
        </div>
      )}
    </div>
  );
}

function OmanLineChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  if (!data || data.length === 0) return <p className="text-sm text-portal-gray">No data</p>;
  const values = data.map((d) => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const w = 420;
  const h = 160;
  const pad = { left: 40, right: 20, top: 10, bottom: 30 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const step = data.length <= 1 ? 1 : data.length - 1;
  const points = data.map((d, i) => {
    const x = pad.left + (i / step) * chartW;
    const y = pad.top + chartH - ((d.value - minV) / range) * chartH;
    return `${x},${y}`;
  }).join(' ');
  const labelKey = data[0] && 'year' in data[0] ? 'year' : 'name';
  const handleMouseMove = (e, i) => {
    setHoveredIndex(i);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };
  return (
    <div ref={containerRef} className="relative min-h-[120px] w-full">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="min-h-[120px]" preserveAspectRatio="xMidYMid meet">
        <polyline points={points} fill="none" stroke="#005287" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad.left + (i / step) * chartW;
          const y = pad.top + chartH - ((d.value - minV) / range) * chartH;
          const isHovered = hoveredIndex === i;
          return (
            <g
              key={d[labelKey] ?? i}
              onMouseEnter={(e) => handleMouseMove(e, i)}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r={isHovered ? 6 : 4} fill={isHovered ? '#133c8b' : '#005287'} className="transition-all duration-150" />
              <text x={x} y={h - 6} textAnchor="middle" className="fill-portal-gray text-xs" style={{ fontFamily: 'system-ui' }}>{d[labelKey] ?? i}</text>
            </g>
          );
        })}
      </svg>
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-portal-border bg-white px-3 py-2 text-xs font-medium shadow-lg"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 8, transform: 'translateY(-100%)' }}
        >
          <div className="text-portal-navy-dark">{data[hoveredIndex][labelKey] ?? hoveredIndex}</div>
          <div className="mt-0.5 text-portal-blue-primary font-semibold">{data[hoveredIndex].value}%</div>
        </div>
      )}
    </div>
  );
}

function OmanAreaChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-portal-gray">No data</p>;
  const values = data.map((d) => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const w = 420;
  const h = 160;
  const pad = { left: 40, right: 20, top: 10, bottom: 30 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const step = data.length <= 1 ? 1 : data.length - 1;
  const points = data.map((d, i) => {
    const x = pad.left + (i / step) * chartW;
    const y = pad.top + chartH - ((d.value - minV) / range) * chartH;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `${pad.left},${h - pad.bottom} ${points} ${pad.left + chartW},${h - pad.bottom}`;
  const labelKey = data[0] && 'year' in data[0] ? 'year' : 'name';
  return (
    <div className="relative min-h-[120px] w-full">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="min-h-[120px]" preserveAspectRatio="xMidYMid meet">
        <polygon points={areaPoints} fill="rgba(0,82,135,0.25)" stroke="#005287" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={points} fill="none" stroke="#005287" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad.left + (i / step) * chartW;
          const y = pad.top + chartH - ((d.value - minV) / range) * chartH;
          return (
            <g key={d[labelKey] ?? i}>
              <circle cx={x} cy={y} r={4} fill="#005287" />
              <text x={x} y={h - 6} textAnchor="middle" className="fill-portal-gray text-xs" style={{ fontFamily: 'system-ui' }}>{d[labelKey] ?? i}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function OmanPieChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-portal-gray">No data</p>;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p className="text-sm text-portal-gray">No data</p>;
  const colors = ['#005287', '#133c8b', '#1a5a9e', '#0d6ba3', '#2a7ab8', '#3d8fc9'];
  let acc = 0;
  const segments = data.map((d, i) => {
    const pct = d.value / total;
    const start = acc;
    acc += pct;
    return { ...d, start, end: acc, pct, color: colors[i % colors.length] };
  });
  const cx = 210;
  const cy = 90;
  const r = 70;
  const toPath = (start, end) => {
    const a1 = start * 2 * Math.PI - Math.PI / 2;
    const a2 = end * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const large = end - start > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };
  return (
    <div className="relative min-h-[120px] w-full">
      <svg width="100%" viewBox="0 0 420 180" className="min-h-[120px]" preserveAspectRatio="xMidYMid meet">
        {segments.map((s, i) => (
          <path key={s.name} d={toPath(s.start, s.end)} fill={s.color} stroke="white" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {segments.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-portal-navy-dark">{s.name}</span>
            <span className="text-portal-gray">{(s.pct * 100).toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function OmanScatterChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-portal-gray">No data</p>;
  const values = data.map((d) => d.value);
  const maxV = Math.max(...values);
  const w = 420;
  const h = 160;
  const pad = { left: 40, right: 20, top: 10, bottom: 30 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const labelKey = data[0] && 'year' in data[0] ? 'year' : 'name';
  return (
    <div className="relative min-h-[120px] w-full">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="min-h-[120px]" preserveAspectRatio="xMidYMid meet">
        {data.map((d, i) => {
          const x = pad.left + ((i + 1) / (data.length + 1)) * chartW;
          const y = pad.top + chartH - (d.value / (maxV || 1)) * chartH;
          return (
            <g key={d[labelKey] ?? i}>
              <circle cx={x} cy={y} r={6} fill="#005287" />
              <text x={x} y={h - 6} textAnchor="middle" className="fill-portal-gray text-xs" style={{ fontFamily: 'system-ui' }}>{d[labelKey] ?? i}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function OmanFunnelChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-portal-gray">No data</p>;
  const maxVal = Math.max(...data.map((d) => d.value));
  const w = 420;
  const h = 180;
  const barH = 18;
  const gap = 6;
  const labelW = 120;
  const barW = w - labelW - 40;
  return (
    <div className="relative min-h-[140px] w-full">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="min-h-[140px]" preserveAspectRatio="xMidYMid meet">
        {data.map((d, i) => {
          const width = (d.value / maxVal) * barW;
          const y = i * (barH + gap) + 4;
          return (
            <g key={d.name}>
              <rect x={labelW} y={y} width={width} height={barH - 2} rx={3} fill="#005287" />
              <text x={0} y={y + barH - 4} className="fill-[#161616] text-xs" style={{ fontFamily: 'system-ui' }}>{d.name}</text>
              <text x={labelW + width + 6} y={y + barH - 4} className="fill-portal-gray text-xs" style={{ fontFamily: 'system-ui' }}>{d.value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function parseChartContent(content) {
  if (typeof content !== 'string' || !content.startsWith('__CHART__|')) return null;
  const parts = content.slice('__CHART__|'.length).split('|');
  return { type: parts[0] || 'bar', datasetKey: parts[1] || 'governorates' };
}

/** Parse AI prompt for chart type change; returns new __CHART__|type|datasetKey or null */
function parseChartPromptForSection(prompt) {
  const p = (prompt || '').toLowerCase().trim();
  if (!p) return null;
  const wantLine = /\bline\b/.test(p) || /\btrend\b/.test(p) || /\bover time\b/.test(p) || /\btime series\b/.test(p);
  const wantBar = /\bbar\b/.test(p) || /\bby governorate\b/.test(p) || /\bpopulation\b/.test(p) || /\bcomparison\b/.test(p);
  const wantPie = /\bpie\b/.test(p) || /\bproportion\b/.test(p) || /\bshare\b/.test(p) || /\bpercentage\b/.test(p);
  const wantArea = /\barea\b/.test(p) || /\bstacked\b/.test(p) || /\bcumulative\b/.test(p);
  const wantScatter = /\bscatter\b/.test(p) || /\bcorrelation\b/.test(p) || /\bxy\b/.test(p);
  const wantFunnel = /\bfunnel\b/.test(p) || /\bpipeline\b/.test(p);
  const wantUnemployment = /\bunemployment\b/.test(p);
  const wantGdp = /\bgdp\b/.test(p) || /\bgrowth\b/.test(p);
  const wantEmployment = /\bemployment\b/.test(p) || /\bemploy(ed|ees)?\b/.test(p) || /\bjobs?\b/.test(p) || /\blabour\b/.test(p) || /\blabor\b/.test(p);
  const wantPopulation = /\bpopulation\b/.test(p);
  let type = 'bar';
  let datasetKey = 'governorates';
  if (wantPie) type = 'pie';
  else if (wantArea) type = 'area';
  else if (wantScatter) type = 'scatter';
  else if (wantFunnel) type = 'funnel';
  else if (wantLine) type = 'line';
  else if (wantBar) type = 'bar';
  if (wantUnemployment) datasetKey = 'unemployment';
  else if (wantGdp) datasetKey = 'gdpGrowth';
  else if (wantEmployment) datasetKey = 'employment';
  else if (wantPopulation) datasetKey = 'governorates';
  return `__CHART__|${type}|${datasetKey}`;
}

const CHART_TYPES = [
  { type: 'bar', ds: 'governorates', label: 'Bar' },
  { type: 'line', ds: 'governorates', label: 'Line' },
  { type: 'area', ds: 'governorates', label: 'Area' },
  { type: 'pie', ds: 'governorates', label: 'Pie' },
  { type: 'scatter', ds: 'governorates', label: 'Scatter' },
  { type: 'funnel', ds: 'governorates', label: 'Funnel' },
];

const CHART_DATASET_OPTIONS = [
  { key: 'governorates', label: 'Population' },
  { key: 'employment', label: 'Employment' },
  { key: 'unemployment', label: 'Unemployment' },
  { key: 'gdpGrowth', label: 'GDP Growth' },
];

function ChartTypeIcon({ type }) {
  const w = 20;
  const h = 14;
  if (type === 'bar') return (
    <svg width={w} height={h} viewBox="0 0 20 14" className="opacity-80">
      <rect x="1" y="8" width="3" height="5" rx="1" fill="currentColor" />
      <rect x="6" y="4" width="3" height="9" rx="1" fill="currentColor" />
      <rect x="11" y="6" width="3" height="7" rx="1" fill="currentColor" />
      <rect x="16" y="2" width="3" height="11" rx="1" fill="currentColor" />
    </svg>
  );
  if (type === 'line') return (
    <svg width={w} height={h} viewBox="0 0 20 14" className="opacity-80">
      <polyline points="1,12 5,8 10,6 15,4 19,2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (type === 'area') return (
    <svg width={w} height={h} viewBox="0 0 20 14" className="opacity-80">
      <path d="M1 12 L5 8 L10 6 L15 4 L19 2 L19 14 L1 14 Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
  if (type === 'pie') return (
    <svg width={w} height={h} viewBox="0 0 20 14" className="opacity-80">
      <path d="M10 2 A8 8 0 0 1 16 10 L10 10 Z" fill="currentColor" />
      <path d="M10 10 A8 8 0 0 1 4 6 L10 10 Z" fill="currentColor" fillOpacity="0.6" />
      <path d="M10 10 L4 6 A8 8 0 0 1 10 2 Z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
  if (type === 'scatter') return (
    <svg width={w} height={h} viewBox="0 0 20 14" className="opacity-80">
      <circle cx="4" cy="10" r="2" fill="currentColor" />
      <circle cx="10" cy="6" r="2" fill="currentColor" />
      <circle cx="16" cy="4" r="2" fill="currentColor" />
    </svg>
  );
  if (type === 'funnel') return (
    <svg width={w} height={h} viewBox="0 0 20 14" className="opacity-80">
      <rect x="2" y="1" width="16" height="3" rx="1" fill="currentColor" />
      <rect x="4" y="5" width="12" height="3" rx="1" fill="currentColor" fillOpacity="0.8" />
      <rect x="6" y="9" width="8" height="3" rx="1" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
  return null;
}

function parseTableContent(content) {
  if (typeof content !== 'string' || !content.startsWith('__TABLE__|')) return null;
  try {
    const json = content.slice('__TABLE__|'.length);
    const rows = JSON.parse(json);
    return Array.isArray(rows) ? rows : null;
  } catch (_) {
    return null;
  }
}

/** Parse prompt for table↔chart conversion; returns { toChart: true } or { toTable: true } or null */
function parseConversionPrompt(prompt) {
  const p = (prompt || '').toLowerCase().trim();
  if (!p) return null;
  const toChart = /\b(convert|change|make|turn|show)\b.*\b(chart|graph)\b/.test(p) || /\b(chart|graph)\b/.test(p) || /\b(make|convert)\s+(it\s+)?a\s+chart\b/.test(p);
  const toTable = /\b(convert|change|make|turn|show)\b.*\b(table|tabular)\b/.test(p) || /\b(table|tabular)\b/.test(p) || /\b(make|convert)\s+(it\s+)?a\s+table\b/.test(p);
  if (toChart && !toTable) return { toChart: true };
  if (toTable && !toChart) return { toTable: true };
  return null;
}

/** Convert chart data to table rows for chart→table conversion */
function chartDataToTableRows(datasetKey) {
  const data = CHART_DATASETS[datasetKey] || CHART_GOVERNORATES_DATA;
  if (!data || data.length === 0) return [['Category', 'Value'], ['—', '—']];
  const labelKey = data[0] && 'year' in data[0] ? 'year' : 'name';
  const header = [labelKey.charAt(0).toUpperCase() + labelKey.slice(1), 'Value'];
  const rows = data.map((d) => [String(d[labelKey] ?? ''), d.value]);
  return [header, ...rows];
}

/** Format options for text/title sections */
const FONT_SIZES = [
  { value: 'sm', label: 'Small', short: 'S' },
  { value: 'base', label: 'Medium', short: 'M' },
  { value: 'lg', label: 'Large', short: 'L' },
];

const TEXT_COLORS = [
  { value: 'navy', label: 'Navy', color: '#161616' },
  { value: 'blue', label: 'Blue', color: '#005287' },
  { value: 'gray', label: 'Gray', color: '#6b7280' },
  { value: 'green', label: 'Green', color: '#085d3a' },
];

function getFormatClasses(format) {
  if (!format || Object.keys(format).length === 0) return '';
  const sizeClass = format.fontSize === 'sm' ? 'text-sm' : format.fontSize === 'lg' ? 'text-lg' : 'text-base';
  const colorClass = format.color === 'blue' ? 'text-portal-blue' : format.color === 'gray' ? 'text-portal-gray' : format.color === 'green' ? 'text-[#085d3a]' : 'text-portal-navy-dark';
  return `${sizeClass} ${colorClass}`;
}

function FormatToolbar({ format, onChange, onSave }) {
  const fontSize = format?.fontSize || 'base';
  const color = format?.color || 'navy';
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-portal-border bg-white px-4 py-2.5 shadow-premium">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-portal-gray-muted">Size</span>
        <div className="flex items-center gap-0.5 rounded-lg bg-portal-bg-section/80 p-0.5">
          {FONT_SIZES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => { onChange({ ...format, fontSize: f.value }); onSave?.(); }}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${fontSize === f.value ? 'bg-white text-portal-blue shadow-sm' : 'text-portal-gray-muted hover:text-portal-navy'}`}
              title={f.label}
            >
              {f.short}
            </button>
          ))}
        </div>
      </div>
      <div className="h-5 w-px bg-portal-border" />
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-portal-gray-muted">Color</span>
        <div className="flex items-center gap-1.5">
          {TEXT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => { onChange({ ...format, color: c.value }); onSave?.(); }}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-all ${color === c.value ? 'border-portal-blue shadow-md ring-2 ring-portal-blue/20' : 'border-transparent hover:border-portal-border'}`}
              style={{ backgroundColor: c.color }}
              title={c.label}
            >
              {color === c.value && (
                <svg className="h-3.5 w-3.5 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportSectionCard({
  section,
  sectionIndex = 0,
  isActive,
  onActivate,
  onUpdate,
  onDelete,
  onRegenerate,
  onParaphrase,
  onGrammarCheck,
  onSpellCheck,
  commentCount,
  onAddComment,
  editorRole,
  onLock,
  onUnlock,
  isLockedByOther,
  lockedByName,
  onChangeLayout,
  draggable,
  onDragStart,
  onDragEnd,
  isDragging,
  presenceInfo,
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [editContent, setEditContent] = useState(section.content);
  const [editFormat, setEditFormat] = useState(section.format || {});
  const [showRegenPrompt, setShowRegenPrompt] = useState(false);
  const [regenPrompt, setRegenPrompt] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const editAreaRef = useRef(null);

  useEffect(() => {
    setEditTitle(section.title);
    setEditContent(section.content);
    setEditFormat(section.format || {});
  }, [section.id, section.title, section.content, section.format]);

  const startEditing = () => {
    if (isLockedByOther) return;
    setEditing(true);
    onLock?.();
  };
  const saveAndUnlock = () => {
    onUpdate({ title: editTitle, content: editContent, format: Object.keys(editFormat).length ? editFormat : undefined });
    setEditing(false);
    onUnlock?.();
  };
  const applyFormatToSection = () => {
    onUpdate({ format: Object.keys(editFormat).length ? editFormat : undefined });
  };

  const isTitleOnly = section.content === '__TITLE_ONLY__';
  const chartSpec = parseChartContent(section.content);
  const isChart = section.type === 'chart' || chartSpec || section.content === '__CHART__';
  const tableRows = parseTableContent(section.content);
  const isTable = section.type === 'table' || tableRows;
  const sectionHeader = section.sectionHeader || null;
  const [isHovered, setIsHovered] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  const handleRegenerate = () => {
    if (!onRegenerate) return;
    setRegenerating(true);
    setShowRegenPrompt(false);
    onRegenerate(section.id, regenPrompt.trim() || undefined).then(() => {
      setRegenPrompt('');
      setRegenerating(false);
    });
  };

  const save = saveAndUnlock;

  /** Only save on blur when focus leaves the edit area entirely (not when moving to another input/button inside) */
  const handleEditBlur = useCallback((e) => {
    if (e.relatedTarget && editAreaRef.current?.contains(e.relatedTarget)) return;
    save();
  }, [save]);

  if (isTitleOnly) {
    const fmt = section.format || {};
    const fmtClasses = getFormatClasses(fmt);
    return (
      <div
        onClick={onActivate}
        className={`rounded-[10px] border-2 bg-white p-4 shadow-card ${isActive ? 'border-portal-blue-primary' : 'border-portal-border'}`}
      >
        {presenceInfo && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-600">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden />
            {presenceInfo.name} is editing
          </div>
        )}
        {editing ? (
          <div ref={editAreaRef} onClick={(e) => e.stopPropagation()}>
            <FormatToolbar format={editFormat} onChange={setEditFormat} onSave={applyFormatToSection} />
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEditBlur}
              className="w-full border-0 border-b border-portal-border-light bg-transparent font-display text-xl font-bold focus:outline-none"
              autoFocus
            />
          </div>
        ) : (
          <h2 className={`font-display font-bold ${fmtClasses || 'text-xl text-portal-navy-dark'}`} onDoubleClick={startEditing}>
            {section.title}
          </h2>
        )}
      </div>
    );
  }

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

  const heightClass =
    section.layoutHeight === 'short'
      ? 'min-h-[140px]'
      : section.layoutHeight === 'medium'
      ? 'min-h-[220px]'
      : section.layoutHeight === 'tall'
      ? 'min-h-[320px]'
      : '';

  return (
    <div
      onClick={onActivate}
      className={`rounded-[10px] border border-portal-border bg-white shadow-card overflow-hidden transition-all duration-150 ${heightClass} ${
        isActive ? 'ring-2 ring-portal-blue-primary shadow-md' : 'hover:shadow-md hover:border-portal-gray/30'
      } ${isDragging ? 'opacity-80 shadow-lg scale-[0.99]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={editAreaRef} onClick={(e) => editing && e.stopPropagation()}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            {draggable && (isHovered || isActive) && (
              <button
                type="button"
                title="Drag to reorder"
                className="inline-flex h-6 w-6 items-center justify-center rounded border border-portal-border bg-white text-portal-gray hover:text-portal-navy cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => e.stopPropagation()}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  onDragStart?.();
                }}
                onDragEnd={(e) => {
                  e.stopPropagation();
                  onDragEnd?.();
                }}
              >
                <svg className="h-3 w-3" viewBox="0 0 12 12" aria-hidden="true">
                  <circle cx="2" cy="2" r="1" />
                  <circle cx="6" cy="2" r="1" />
                  <circle cx="10" cy="2" r="1" />
                  <circle cx="2" cy="6" r="1" />
                  <circle cx="6" cy="6" r="1" />
                  <circle cx="10" cy="6" r="1" />
                </svg>
              </button>
            )}
            {editing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleEditBlur}
                className="w-full border-0 border-b border-portal-border-light bg-transparent font-display text-lg font-bold tracking-[-0.5px] text-portal-navy-dark focus:outline-none"
                autoFocus
              />
            ) : (
              <h3 className={`font-display font-bold leading-5 tracking-[-0.5px] ${getFormatClasses(section.format) || 'text-lg text-portal-navy-dark'}`} onDoubleClick={startEditing}>
                {section.title}
              </h3>
            )}
          </div>
          <div className={`relative flex items-center gap-1 shrink-0 transition-opacity duration-150 ${isHovered || isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {presenceInfo && (
              <span className="flex items-center gap-1 text-xs text-amber-600" title={`${presenceInfo.name} is editing this section`}>
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden />
                {presenceInfo.name} is editing
              </span>
            )}
            {lockedByName && isLockedByOther && (
              <span className="flex items-center gap-1 text-xs text-amber-600" title={`Locked by ${lockedByName}`}>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                Locked by {lockedByName}
              </span>
            )}
            {commentCount > 0 && (
              <button
                type="button"
                onClick={onAddComment}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-portal-border bg-white text-portal-blue-primary hover:bg-portal-ai-bg"
                title="Open comments for this section"
              >
                <IconComment className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); editing ? save() : startEditing(); }}
              disabled={isLockedByOther}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-portal-border bg-white text-portal-gray hover:text-portal-navy disabled:opacity-50 disabled:cursor-not-allowed"
              title={editing ? 'Save and exit edit' : 'Edit section'}
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-red-100 bg-white text-red-600 hover:bg-red-50"
              title="Delete section"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1z"/></svg>
            </button>
            {/* AI tools trigger */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowAiMenu((v) => !v); setShowLayoutMenu(false); }}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-portal-border bg-white text-portal-gray hover:text-portal-navy"
              title="AI tools"
            >
              <IconSparkle className="h-3.5 w-3.5" />
            </button>
            {/* Layout trigger */}
            {onChangeLayout && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowLayoutMenu((v) => !v); setShowAiMenu(false); }}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-portal-border bg-white text-portal-gray hover:text-portal-navy"
                title="Layout options"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="1" y="3" width="6" height="4" rx="1" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <rect x="1" y="9" width="4" height="4" rx="1" />
                  <rect x="7" y="9" width="4" height="4" rx="1" />
                </svg>
              </button>
            )}
            {showAiMenu && (
              <div
                className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-portal-border bg-white py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => { onParaphrase?.(section.id); setShowAiMenu(false); }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-portal-navy hover:bg-portal-bg-section"
                >
                  Paraphrase section
                </button>
                <button
                  type="button"
                  onClick={() => { onGrammarCheck?.(); setShowAiMenu(false); }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-portal-navy hover:bg-portal-bg-section"
                >
                  Grammar check
                </button>
                <button
                  type="button"
                  onClick={() => { onSpellCheck?.(); setShowAiMenu(false); }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-portal-navy hover:bg-portal-bg-section"
                >
                  Spell check
                </button>
              </div>
            )}
            {showLayoutMenu && onChangeLayout && (
              <div
                className="absolute right-0 top-8 z-20 mt-8 w-44 rounded-lg border border-portal-border bg-white py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => { onChangeLayout({ layoutWidth: 'full' }); setShowLayoutMenu(false); }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-portal-navy hover:bg-portal-bg-section"
                >
                  Full width
                </button>
                <button
                  type="button"
                  onClick={() => { onChangeLayout({ layoutWidth: 'half' }); setShowLayoutMenu(false); }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-portal-navy hover:bg-portal-bg-section"
                >
                  1/2 width
                </button>
                <button
                  type="button"
                  onClick={() => { onChangeLayout({ layoutWidth: 'third' }); setShowLayoutMenu(false); }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-portal-navy hover:bg-portal-bg-section"
                >
                  1/3 width
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Lock indicator – only when section is locked by another user */}
        <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-portal-gray">
          {lockedByName && isLockedByOther && (
            <span className="flex items-center gap-1.5 text-amber-600" title={`Locked by ${lockedByName}`}>
              <IconLock className="h-4 w-4" />
              <span>Locked by {lockedByName}</span>
            </span>
          )}
          {onRegenerate && !isTitleOnly && (
            <div className={`ml-auto flex items-center gap-1 transition-opacity duration-150 ${isHovered || isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {showRegenPrompt && (
                <div className="flex items-center gap-1.5 rounded-full border border-portal-border bg-white px-2 py-1 shadow-sm" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={regenPrompt}
                    onChange={(e) => setRegenPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRegenerate(); if (e.key === 'Escape') setShowRegenPrompt(false); }}
                    placeholder={isChart ? "e.g. Show as pie chart, convert to table" : isTable ? "e.g. Convert to chart, make it a chart" : "How should this section change?"}
                    className="h-7 w-40 border-0 bg-transparent text-[11px] text-portal-navy-dark placeholder:text-portal-gray focus:outline-none"
                    autoFocus
                  />
                  <button type="button" onClick={handleRegenerate} disabled={regenerating || !regenPrompt.trim()} className="flex h-6 w-6 items-center justify-center rounded-full bg-portal-blue-primary text-white hover:bg-portal-blue-dark disabled:opacity-50">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowRegenPrompt(!showRegenPrompt); }}
                disabled={regenerating}
                className="flex h-7 items-center justify-center rounded-full border border-portal-border bg-white px-2 text-[11px] font-medium text-portal-navy hover:bg-portal-ai-bg disabled:opacity-50"
                title="Regenerate with AI"
              >
                {regenerating ? <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-portal-blue-primary border-t-transparent" /> : <IconSparkle className="h-3.5 w-3.5 mr-1" />}
                {!regenerating && <span>Regenerate</span>}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pb-4">
      {editing ? (
        <>
          {!isChart && !isTable && (
            <FormatToolbar format={editFormat} onChange={setEditFormat} onSave={applyFormatToSection} />
          )}
          {isChart && (
            <div className="mb-3 space-y-4 rounded-xl border border-portal-border bg-white p-4 shadow-premium">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-portal-gray-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span className="text-sm font-semibold text-portal-navy-dark">Chart Settings</span>
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-portal-gray-muted">Editing chart for: {section.title}</p>
              <p className="mb-2 text-[11px] text-portal-gray-muted">Use Regenerate above to change chart type or convert to table (e.g. &quot;Show as pie chart&quot;, &quot;Convert to table&quot;).</p>

              {/* Manual chart type */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-portal-gray-muted">Chart type (manual)</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {CHART_TYPES.map(({ type }) => {
                    const spec = parseChartContent(editContent) || { type: 'bar', datasetKey: 'governorates' };
                    const currentDs = spec.datasetKey || 'governorates';
                    const val = `__CHART__|${type}|${currentDs}`;
                    const isActive = (parseChartContent(editContent) || {}).type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => { setEditContent(val); onUpdate({ content: val }); }}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-2.5 text-[11px] font-medium transition-all ${isActive ? 'border-portal-blue bg-portal-blue/10 text-portal-blue' : 'border-transparent bg-portal-bg-section/80 text-portal-navy hover:border-portal-border hover:bg-portal-blue/5'}`}
                      >
                        <ChartTypeIcon type={type} />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-portal-gray-muted">Dataset:</span>
                  {CHART_DATASET_OPTIONS.map((dsOpt) => {
                    const spec = parseChartContent(editContent) || { type: 'bar', datasetKey: 'governorates' };
                    const val = `__CHART__|${spec.type}|${dsOpt.key}`;
                    const isActive = (parseChartContent(editContent) || {}).datasetKey === dsOpt.key;
                    return (
                      <button
                        key={dsOpt.key}
                        type="button"
                        onClick={() => { setEditContent(val); onUpdate({ content: val }); }}
                        className={`rounded px-2 py-1 text-[11px] font-medium ${isActive ? 'bg-portal-blue text-white' : 'bg-portal-bg-section/80 text-portal-navy hover:bg-portal-blue/10'}`}
                      >
                        {dsOpt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {isTable && (
            <FormatToolbar format={editFormat} onChange={setEditFormat} onSave={applyFormatToSection} />
          )}
          {isTable && (
            <p className="mt-1 text-[11px] text-portal-gray-muted">JSON array of rows, e.g. [["Header1","Header2"],["A","B"]]</p>
          )}
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleEditBlur}
            className="mt-3 min-h-[80px] w-full rounded-xl border border-portal-border bg-white px-4 py-3 text-sm transition-all focus:border-portal-blue focus:outline-none focus:ring-2 focus:ring-portal-blue/10 font-mono"
            rows={4}
          />
        </>
      ) : isChart ? (
        <div className="mt-4 rounded-lg bg-portal-bg-section p-4">
          <p className="mb-2 text-xs font-medium text-portal-gray">{section.title} – NCSI sample data, Sultanate of Oman</p>
          {renderChart()}
        </div>
      ) : isTable && tableRows ? (
        <div className="mt-4 overflow-x-auto">
          <table className={`w-full border-collapse ${getFormatClasses(section.format) || 'text-sm'}`}>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border border-portal-border-light px-3 py-2 font-medium text-portal-navy-dark">{String(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <p className={`whitespace-pre-wrap leading-relaxed ${getFormatClasses(section.format) || 'text-sm text-portal-navy-dark'}`} onDoubleClick={startEditing}>
            {section.content}
          </p>
        </>
      )}
      </div>
      </div>
    </div>
  );
}

/** Encode report for URL (portable – works anywhere, no backend) */
function encodeReportForUrl(report) {
  const payload = { title: report.title, sections: report.sections || [] };
  const json = JSON.stringify(payload);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function ShareReportDialog({ report, onClose }) {
  const baseUrl = `${window.location.origin}${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}`;
  const link = `${baseUrl}/report/${report.id}`;
  const embedLink = `${baseUrl}/report/${report.id}/embed`;
  const portableData = encodeReportForUrl(report);
  const portableEmbedLink = `${baseUrl}/report/embed?data=${portableData}`;
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const copy = async () => {
    const ok = await copyToClipboard(link);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const openInNewTab = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-portal-border bg-white p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-display text-lg font-bold tracking-[-0.5px] text-portal-navy-dark">Share & collaborate</h3>
        <p className="mt-1 text-sm text-portal-gray">Share the edit link to collaborate, or the view-only embed for other websites.</p>
        <div className="mt-4">
          <p className="text-xs font-semibold text-portal-navy-dark mb-1">Edit link (full access – toolbar, co-edit)</p>
          <div className="flex gap-2">
            <input readOnly value={link} className="flex-1 rounded border border-portal-border-light px-3 py-2 text-sm min-w-0" />
            <button type="button" onClick={copy} className="rounded bg-portal-blue-primary px-4 py-2 text-sm font-medium text-white hover:bg-portal-blue-dark shrink-0">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <button type="button" onClick={openInNewTab} className="mt-3 w-full rounded border border-portal-blue-primary px-4 py-2 text-sm font-medium text-portal-blue-primary hover:bg-portal-bg-section">
          Open in new tab to collaborate
        </button>
        <div className="mt-4 pt-4 border-t border-portal-border">
          <p className="text-xs font-semibold text-portal-navy-dark mb-1">View-only embed – works anywhere</p>
          <p className="text-[11px] text-portal-gray mb-2">Portable link with report data in URL. Embed on any website, any origin – no backend needed.</p>
          <div className="flex gap-2">
            <input readOnly value={portableEmbedLink} className="flex-1 rounded border border-portal-border-light px-3 py-2 text-sm min-w-0" />
            <button
              type="button"
              onClick={async () => {
                const snippet = `<iframe src="${portableEmbedLink}" style="width:100%;height:800px;border:0;" title="NCSI report"></iframe>`;
                const ok = await copyToClipboard(snippet);
                if (ok) {
                  setEmbedCopied(true);
                  setTimeout(() => setEmbedCopied(false), 2000);
                }
              }}
              className="rounded bg-portal-blue-primary px-4 py-2 text-sm font-medium text-white hover:bg-portal-blue-dark shrink-0"
            >
              {embedCopied ? 'Copied' : 'Copy iframe'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => { window.open(portableEmbedLink, '_blank', 'noopener,noreferrer'); }}
            className="mt-2 text-xs font-medium text-portal-blue-primary hover:underline"
          >
            Open embed in new tab to test
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-4 text-sm font-medium text-portal-blue-primary">Close</button>
      </div>
    </div>
  );
}

function AddCommentForm({ sectionId, onSubmit }) {
  const [text, setText] = useState('');
  return (
    <div className="mt-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={sectionId ? 'Add a comment on this section...' : 'Add a comment...'}
        className="w-full rounded border border-portal-border-light p-2 text-sm focus:outline-none"
        rows={2}
      />
      <button
        type="button"
        onClick={() => {
          if (text.trim()) {
            onSubmit(text.trim());
            setText('');
          }
        }}
        className="mt-2 rounded bg-portal-blue-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-portal-blue-dark"
      >
        Send
      </button>
    </div>
  );
}

export {
  parseChartContent,
  parseTableContent,
  OmanBarChart,
  OmanLineChart,
  OmanAreaChart,
  OmanPieChart,
  OmanScatterChart,
  OmanFunnelChart,
};
