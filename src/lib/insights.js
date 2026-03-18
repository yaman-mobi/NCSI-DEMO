/**
 * Automated insight cards: mock AI-derived insights for datasets and reports.
 */

/**
 * @param {Object} dataset - { title, category, tags, description }
 * @returns {string[]} 2-3 bullet insights
 */
export function getInsightsForDataset(dataset) {
  if (!dataset) return [];
  const title = (dataset.title || '').toLowerCase();
  const category = (dataset.category || '').toLowerCase();
  const tags = (dataset.tags || []).map((t) => t.toLowerCase());

  const bullets = [];

  if (category === 'economy' || tags.includes('trade')) {
    bullets.push('Trade balance improved in 2024; current account surplus 1,240 OMR million.');
    bullets.push('GDP growth stabilised at 2.1% with non-oil sector expansion.');
  }
  if (tags.includes('census') || title.includes('census') || category === 'demographics') {
    bullets.push('Population growth positive across all 11 governorates; Muscat and Al Batinah South lead.');
    bullets.push('Census 2020 data supports regional planning and SDG indicators.');
  }
  if (category === 'labor market' || title.includes('labour') || title.includes('employment')) {
    bullets.push('Unemployment rate at 2.1% (2024), among the lowest in the GCC.');
    bullets.push('Labour Force Survey shows employment growth in services sector.');
  }
  if (category === 'education') {
    bullets.push('Gross enrolment in general education reached ~98% in 2023/24.');
    bullets.push('Enrolment highest in Muscat and Dhofar governorates.');
  }
  if (category === 'health') {
    bullets.push('Health facility coverage improved across governorates.');
    bullets.push('Vital statistics aligned with NCSI and Ministry of Health.');
  }

  if (bullets.length === 0) {
    bullets.push('Latest data available from NCSI; suitable for research and policy analysis.');
    bullets.push('Aligns with Oman Vision 2040 and open data standards.');
  }

  return bullets.slice(0, 3);
}

/**
 * @param {Object} report - { title, sections: Array<{ title, content, type }> }
 * @returns {string[]} 2-4 bullet insights
 */
export function getInsightsForReport(report) {
  if (!report) return [];
  const sections = report.sections || [];
  const textContent = sections
    .filter((s) => typeof s.content === 'string' && s.content.length > 20 && !s.content.startsWith('__'))
    .map((s) => s.content)
    .join(' ');

  const bullets = [];
  const lower = (report.title || '').toLowerCase() + ' ' + textContent.toLowerCase();

  if (lower.includes('unemployment') || lower.includes('labour')) {
    bullets.push('Unemployment declined to 2.1% in 2024 (NCSI Labour Force Survey).');
  }
  if (lower.includes('gdp') || lower.includes('growth')) {
    bullets.push('Real GDP growth stabilised around 2% with non-oil sector contribution rising.');
  }
  if (lower.includes('population') || lower.includes('census') || lower.includes('demographic')) {
    bullets.push('Population growth positive across governorates; Muscat and Al Batinah South lead.');
  }
  if (lower.includes('inflation') || lower.includes('cpi')) {
    bullets.push('CPI inflation contained at 0.8% YoY (January 2025, base 2019).');
  }
  if (bullets.length === 0) {
    bullets.push('Report draws on NCSI and official sources; aligned with Oman Vision 2040.');
  }

  return bullets.slice(0, 4);
}
