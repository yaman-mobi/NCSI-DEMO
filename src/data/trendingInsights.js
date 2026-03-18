import { MOCK_DATASETS } from './omanMockData';

export const TRENDING_INSIGHTS = [
  {
    id: 'trade-red-sea',
    title: 'Red Sea shipping disruptions and their impact on Oman trade flows',
    category: 'International Trade · Shipping Volumes',
    tag: 'Live',
    age: '2d ago',
    region: 'International trade',
    image: 'https://picsum.photos/seed/redsea/800/480',
    relatedDatasetIds: [8, 7],
    aiSummary:
      'AI summary: Simulated analysis suggests that rerouting vessels away from the Red Sea has temporarily increased shipping times and logistics costs, but Omani ports are capturing a greater share of regional trans‑shipment.',
  },
  {
    id: 'oil-prices',
    title: 'Global oil price volatility and its effect on fuel costs',
    category: 'Oil Prices · Energy Production',
    tag: 'Insight',
    age: '3d ago',
    region: 'Energy & oil',
    image: 'https://picsum.photos/seed/oil/800/480',
    relatedDatasetIds: [7, 10],
    aiSummary:
      'AI summary: Mock analysis indicates that while global benchmarks remain volatile, domestic fuel prices in Oman have been partially cushioned by fiscal measures and subsidy mechanisms.',
  },
  {
    id: 'food-inflation',
    title: 'Food price inflation and changes in household consumption patterns',
    category: 'Consumer Prices · Food Imports',
    tag: 'Inflation',
    age: '6d ago',
    region: 'Prices & inflation',
    image: 'https://picsum.photos/seed/food/800/480',
    relatedDatasetIds: [3],
    aiSummary:
      'AI summary: Based on simulated CPI data, food inflation has eased compared to 2022 peaks, with substitution towards locally produced items helping to stabilise expenditure for most households.',
  },
  {
    id: 'heat-waves',
    title: 'Extreme heat waves and rising energy demand for cooling',
    category: 'Electricity Production · Peak Demand',
    tag: 'Climate',
    age: '1w ago',
    region: 'Climate & environment',
    image: 'https://picsum.photos/seed/heat/800/480',
    relatedDatasetIds: [6],
    aiSummary:
      'AI summary: Demo insights show peak electricity demand rising faster in coastal governorates, underscoring the importance of efficiency measures and renewable capacity.',
  },
];

export function getTrendingInsightById(id) {
  const base = TRENDING_INSIGHTS.find((i) => i.id === id);
  if (!base) return null;
  const relatedDatasets = base.relatedDatasetIds
    .map((datasetId) => MOCK_DATASETS.find((d) => d.id === datasetId))
    .filter(Boolean);
  return { ...base, relatedDatasets };
}

