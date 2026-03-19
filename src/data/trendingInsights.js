/**
 * Trending AI Insights – persona-based from "My profile data per persona" PDF.
 * Oman News Agency, Knoema, IMF, Times of Oman, MTCIT references.
 */

import { MOCK_DATASETS, DATASET_NAME_TO_ID } from './omanMockData';
import { getInsightsForPersona, TRENDING_INSIGHTS_BY_PERSONA } from './profileDataPerPersona';

/** Build relatedDatasets from relatedDatasetNames using MOCK_DATASETS */
function resolveRelatedDatasets(relatedDatasetNames = []) {
  const seen = new Set();
  return relatedDatasetNames
    .map((name) => {
      const id = DATASET_NAME_TO_ID[name];
      const d = id ? MOCK_DATASETS.find((x) => x.id === id) : MOCK_DATASETS.find((x) => (x.title || '').toLowerCase().includes(name.toLowerCase()));
      if (d && !seen.has(d.id)) {
        seen.add(d.id);
        return d;
      }
      if (!seen.has(name)) {
        seen.add(name);
        return { id: name, title: name, category: 'General', description: '', lastUpdated: '', source: 'NCSI' };
      }
      return null;
    })
    .filter(Boolean);
}

/** Convert PDF insight to portal format (for cards) */
function toCardFormat(insight) {
  const relatedDatasets = resolveRelatedDatasets(insight.relatedDatasetNames);
  const relatedDatasetIds = relatedDatasets.filter((d) => typeof d.id === 'number').map((d) => d.id);
  return {
    id: insight.id,
    title: insight.title,
    category: insight.category,
    tag: insight.tag,
    age: insight.age,
    region: insight.region,
    image: insight.image,
    relatedDatasetIds: relatedDatasetIds.length ? relatedDatasetIds : [1, 2, 3],
    aiSummary: insight.aiPerspective || insight.whatThisIsAbout,
    whatThisIsAbout: insight.whatThisIsAbout,
    aiPerspective: insight.aiPerspective,
    relatedDatasetNames: insight.relatedDatasetNames,
    sourceLinks: insight.sourceLinks,
    linkedPhoto: insight.linkedPhoto,
  };
}

/** Get trending insights for a persona (for LoggedInHomePage, AIInsightsWidget) */
export function getTrendingInsightsForPersona(persona) {
  const role = persona?.role || 'Economist';
  const insights = getInsightsForPersona(role);
  return insights.map(toCardFormat);
}

/** All insights flattened for backward compatibility / fallback */
export const TRENDING_INSIGHTS = (() => {
  const all = [];
  Object.values(TRENDING_INSIGHTS_BY_PERSONA).forEach((arr) => {
    arr.forEach((i) => {
      if (!all.find((x) => x.id === i.id)) all.push(i);
    });
  });
  return all.map(toCardFormat);
})();

/** Get a single insight by id (searches across all personas) */
export function getTrendingInsightById(id) {
  for (const arr of Object.values(TRENDING_INSIGHTS_BY_PERSONA)) {
    const found = arr.find((i) => i.id === id);
    if (found) {
      const card = toCardFormat(found);
      const relatedDatasets = resolveRelatedDatasets(found.relatedDatasetNames);
      return { ...card, relatedDatasets };
    }
  }
  return null;
}
