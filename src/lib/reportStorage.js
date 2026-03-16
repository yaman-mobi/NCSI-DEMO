const STORAGE_KEY = 'ncsi_smart_portal_reports';
const DEMO_SEED_KEY = 'ncsi_smart_portal_demo_seeded';

export function loadReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

/** Seed demo reports for first-time demo (only runs once per browser). Includes one draft + one published for "Published" section. */
export function seedDemoReportIfEmpty() {
  if (localStorage.getItem(DEMO_SEED_KEY)) return;
  const reports = loadReports();
  if (reports.length > 0) {
    localStorage.setItem(DEMO_SEED_KEY, '1');
    return;
  }
  // Draft report – for Maker/Checker and AI Generate demo
  const demo = createReport();
  updateReport(demo.id, {
    title: 'Labour Market Trends in the Sultanate of Oman (2020–2024)',
    prompt: 'Labour market trends in Oman 2020–2024',
    sections: [
      { id: 'sec-demo-1', title: 'Labour Market Trends in the Sultanate of Oman (2020–2024)', content: '__TITLE_ONLY__', type: 'title', sortOrder: 0, sectionHeader: null },
      { id: 'sec-demo-2', title: 'Executive Summary', content: 'This report presents key statistics and trends for the Sultanate of Oman based on data from the National Centre for Statistics & Information (NCSI). The analysis covers 2020–2024 and includes labour market indicators aligned with Oman Vision 2040.', type: 'text', sortOrder: 1, sectionHeader: 'KEY METRICS' },
      { id: 'sec-demo-3', title: 'Key findings', content: '• Unemployment rate (NCSI Labour Force Survey) declined to 2.1% in 2024.\n• Real GDP growth stabilised around 2% in 2024.\n• Oman ranked first in West Asia in the Open Data Watch report.', type: 'text', sortOrder: 2, sectionHeader: null },
      { id: 'sec-demo-4', title: 'Unemployment rate (%) – Oman', content: '__CHART__|line|unemployment', type: 'chart', sortOrder: 3, sectionHeader: null },
    ],
    published: false,
  });
  // Published report – so "Published" section is visible in demo (PDF: "show how an authorized user publishes the final report to the portal")
  const publishedId = crypto.randomUUID?.() || `r-pub-${Date.now()}`;
  const publishedReport = {
    id: publishedId,
    shareLinkId: `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: 'Census 2020 Summary – Sultanate of Oman',
    prompt: 'National Census released – summary by governorate and demographics',
    sections: [
      { id: 'sec-pub-1', title: 'Census 2020 Summary – Sultanate of Oman', content: '__TITLE_ONLY__', type: 'title', sortOrder: 0, sectionHeader: null },
      { id: 'sec-pub-2', title: 'Overview', content: 'The 2020 National Census provides comprehensive population and housing data for the Sultanate of Oman. Data is published by NCSI and available via the NCSI eCensus Portal and Data Portal.', type: 'text', sortOrder: 1, sectionHeader: null },
      { id: 'sec-pub-3', title: 'Population by governorate (million)', content: '__CHART__|bar|governorates', type: 'chart', sortOrder: 2, sectionHeader: null },
    ],
    comments: [],
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerRole: 'Senior Researcher',
  };
  const all = loadReports();
  all.push(publishedReport);
  saveReports(all);
  localStorage.setItem(DEMO_SEED_KEY, '1');
}

export function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function getReport(id) {
  const reports = loadReports();
  return reports.find((r) => r.id === id) || null;
}

export function createReport() {
  const id = crypto.randomUUID?.() || `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const shareLinkId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const report = {
    id,
    shareLinkId,
    title: 'Untitled Report',
    prompt: '',
    sections: [],
    comments: [],
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerRole: 'Data Analyst',
  };
  const reports = loadReports();
  reports.unshift(report);
  saveReports(reports);
  return report;
}

export function updateReport(id, updates) {
  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  reports[idx] = { ...reports[idx], ...updates, updatedAt: new Date().toISOString() };
  saveReports(reports);
  return reports[idx];
}

export function addSection(reportId, section) {
  const report = getReport(reportId);
  if (!report) return null;
  const secId = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newSec = {
    id: secId,
    title: section.title || 'New Section',
    content: section.content ?? '',
    sortOrder: (report.sections || []).length,
    type: section.type || 'text',
    sectionHeader: section.sectionHeader ?? null,
    // layout defaults for responsive grid
    layoutWidth: section.layoutWidth || 'full', // 'full' | 'half' | 'third'
    layoutHeight: section.layoutHeight || 'auto', // 'auto' | 'short' | 'medium' | 'tall'
  };
  report.sections = [...(report.sections || []), newSec];
  report.updatedAt = new Date().toISOString();
  const reports = loadReports().map((r) => (r.id === reportId ? report : r));
  saveReports(reports);
  return newSec;
}

export function updateSection(reportId, sectionId, updates) {
  const report = getReport(reportId);
  if (!report) return null;
  report.sections = (report.sections || []).map((s) =>
    s.id === sectionId ? { ...s, ...updates } : s
  );
  report.updatedAt = new Date().toISOString();
  const reports = loadReports().map((r) => (r.id === reportId ? report : r));
  saveReports(reports);
  return report;
}

/** Lock a section for editing (e.g. by current user). Section gets lockedBy, lockedAt. */
export function lockSection(reportId, sectionId, lockedBy) {
  return updateSection(reportId, sectionId, {
    lockedBy: lockedBy || null,
    lockedAt: lockedBy ? new Date().toISOString() : null,
  });
}

/** Unlock a section. */
export function unlockSection(reportId, sectionId) {
  return updateSection(reportId, sectionId, { lockedBy: null, lockedAt: null });
}

export function deleteSection(reportId, sectionId) {
  const report = getReport(reportId);
  if (!report) return null;
  report.sections = (report.sections || []).filter((s) => s.id !== sectionId);
  report.updatedAt = new Date().toISOString();
  const reports = loadReports().map((r) => (r.id === reportId ? report : r));
  saveReports(reports);
  return report;
}

export function addComment(reportId, payload) {
  const report = getReport(reportId);
  if (!report) return null;
  const comment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sectionId: payload.sectionId || null,
    content: payload.content,
    author: payload.author || 'User',
    resolved: false,
    createdAt: new Date().toISOString(),
  };
  report.comments = [...(report.comments || []), comment];
  report.updatedAt = new Date().toISOString();
  const reports = loadReports().map((r) => (r.id === reportId ? report : r));
  saveReports(reports);
  return comment;
}

export function resolveComment(reportId, commentId) {
  const report = getReport(reportId);
  if (!report) return null;
  report.comments = (report.comments || []).map((c) =>
    c.id === commentId ? { ...c, resolved: true } : c
  );
  report.updatedAt = new Date().toISOString();
  const reports = loadReports().map((r) => (r.id === reportId ? report : r));
  saveReports(reports);
  return report;
}
