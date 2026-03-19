/**
 * Smart recommendations engine: persona + event + context + recent activity.
 * Used by RecommendedForYou component across the portal.
 * "For You" datasets from "My profile data per persona" PDF.
 */

import { MOCK_DATASETS, FOR_YOU_ID_TO_MOCK_ID } from '../data/omanMockData';
import { getForYouDatasetsForPersona } from '../data/profileDataPerPersona';
import { loadReports } from './reportStorage';

const RECENT_VIEWED_KEY = 'ncsi_smart_portal_recent';
const MAX_RECENT = 20;

export function getRecentViewed() {
  try {
    const raw = localStorage.getItem(RECENT_VIEWED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (_) {}
  return [];
}

export function addRecentViewed(item) {
  const items = getRecentViewed();
  const next = [{ ...item, viewedAt: new Date().toISOString() }, ...items.filter((i) => i.id !== item.id || i.type !== item.type)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(next));
  } catch (_) {}
}

/**
 * @param {Object} persona - { role, region, interests }
 * @param {string} activeEvent - 'none' | 'tariff' | 'census'
 * @param {string} context - 'landing' | 'datasets' | 'reports' | 'ai-assistant' | 'report-builder'
 * @param {{ reportId?: string, excludeDatasetIds?: string[] }} options
 */
export function getSmartRecommendations(persona, activeEvent, context, options = {}) {
  const role = persona?.role || '';
  const region = persona?.region || '';
  const interests = persona?.interests || [];
  const recent = getRecentViewed();
  const reports = typeof loadReports === 'function' ? loadReports() : [];

  const result = {
    datasets: [],
    reports: [],
    queries: [],
    reason: '',
    eventReason: '',
  };

  // Event-based reason (for display)
  if (activeEvent === 'tariff') result.eventReason = 'US Tariff change — relevant for trade and balance of payments';
  else if (activeEvent === 'census') result.eventReason = 'National Census released — relevant for demographics and your region';

  // Role + "For You" datasets from PDF – PRIMARY source; datasets must change per persona
  const forYouDatasets = getForYouDatasetsForPersona(role);
  if (forYouDatasets.length > 0) {
    // Map PDF datasets to display format; prefer MOCK_DATASETS when we have a match for full metadata
    result.datasets = forYouDatasets.map((d) => {
      const mockId = FOR_YOU_ID_TO_MOCK_ID[d.id];
      const mock = mockId ? MOCK_DATASETS.find((x) => x.id === mockId) : null;
      return mock
        ? { ...mock, whyRelevant: d.whyRelevant }
        : { id: d.id, title: d.title, category: (d.tags && d.tags[0]) ? d.tags[0] : 'General', description: d.whyRelevant, whyRelevant: d.whyRelevant, tags: d.tags || [] };
    });
  }

  // Role-specific labels and queries
  if (role === 'Economic Analyst' || role === 'Economist') {
    result.reason = 'Recommended for Economic Analysts';
    if (result.datasets.length === 0) {
      result.datasets = MOCK_DATASETS.filter((d) => d.category === 'Economy' || (d.tags || []).includes('trade'));
    }
    result.queries = ['Show trade and Balance of Payments data for Oman', 'GDP growth trends in Oman 2020–2024', 'Key economic indicators for Oman'];
    result.reports = reports.filter((r) => (r.title || '').toLowerCase().includes('labour') || (r.title || '').toLowerCase().includes('economic')).slice(0, 3);
  } else if (role === 'University Student') {
    result.reason = 'Recommended for Students';
    if (result.datasets.length === 0) {
      result.datasets = MOCK_DATASETS.filter(
        (d) => d.category === 'Education' || d.category === 'Demographics' || (d.tags || []).includes('census')
      );
    }
    result.queries = ['Census 2020 data by governorate and demographics', 'Education statistics by region', 'Population by governorate'];
    result.reports = reports.filter((r) => (r.title || '').toLowerCase().includes('census') || (r.title || '').toLowerCase().includes('population')).slice(0, 3);
  } else if (role === 'Data Analyst') {
    result.reason = 'Recommended for Data Analysts';
    if (result.datasets.length === 0) {
      result.datasets = MOCK_DATASETS.filter((d) => d.category === 'Economy' || d.category === 'Labor Market' || (d.tags || []).includes('cpi'));
    }
    result.queries = ['Build inflation dashboards with CPI data', 'Labour market segmentation by age and gender', 'Tourism KPIs and visitor metrics'];
    result.reports = reports.slice(0, 3);
  } else if (role === 'Statistician') {
    result.reason = 'Recommended for Statisticians';
    if (result.datasets.length === 0) {
      result.datasets = MOCK_DATASETS.filter((d) => d.category === 'Demographics' || d.category === 'Labor Market' || d.category === 'Vital Statistics');
    }
    result.queries = ['Population demographics by governorate', 'CPI basket structure and methodology', 'Cross-domain statistical integration'];
    result.reports = reports.slice(0, 3);
  } else {
    result.reason = 'Recommended for you';
    if (result.datasets.length === 0) {
      const byInterest = interests.length
        ? MOCK_DATASETS.filter((d) => {
            const cat = (d.category || '').toLowerCase();
            const title = (d.title || '').toLowerCase();
            return interests.some((i) => cat.includes(i.toLowerCase()) || title.includes(i.toLowerCase()));
          })
        : MOCK_DATASETS.slice(0, 6);
      result.datasets = byInterest;
    }
    result.queries = ['What is the unemployment rate in Oman for 2024?', 'Show me GDP growth trends', 'Compare population across governorates'];
    result.reports = reports.slice(0, 3);
  }

  // For AI Assistant context, align with Chatbot Scenarios (Map, Economy, Tourism, Infrastructure, Energy)
  if (context === 'ai-assistant') {
    result.reason = 'Suggested prompts tailored to your persona';
    result.datasets = []; // we show prompt shortcuts instead of dataset cards in the assistant
    result.reports = [];
    result.queries = [
      'Show me a map of Oman by governorate to see where the population is most concentrated',
      'How is Oman\'s economy performing lately? I want to know if it\'s a good time to invest',
      'Which sectors are currently prohibited for foreign investment?',
      'What are the current tourism trends in Oman, and where are most visitors coming from?',
      'Which regions have the highest population concentration and the most active transportation networks?',
      'What does the data say about industrial energy consumption in Oman?',
    ];
  }

  // Dedupe and limit
  result.datasets = result.datasets.filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i).slice(0, 6);
  if (options.excludeDatasetIds?.length) {
    result.datasets = result.datasets.filter((d) => !options.excludeDatasetIds.includes(d.id));
  }
  result.reports = result.reports.slice(0, 3);
  result.queries = result.queries.slice(0, 4);

  // Recent activity: add "Because you viewed X" for datasets/reports
  if (recent.length > 0 && context !== 'landing') {
    const fromRecent = recent.slice(0, 3).map((r) => {
      if (r.type === 'dataset') {
        const d = MOCK_DATASETS.find((x) => x.id === r.id);
        return d ? { ...d, _reason: 'You recently viewed' } : null;
      }
      if (r.type === 'report') {
        const rep = reports.find((x) => x.id === r.id);
        return rep ? { ...rep, _reason: 'You recently viewed' } : null;
      }
      return null;
    }).filter(Boolean);
    if (fromRecent.length > 0) result.recent = fromRecent;
  }

  return result;
}
