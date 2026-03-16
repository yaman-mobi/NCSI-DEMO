/**
 * Oman-localized mock data for NCSI SMART Portal demo.
 * Governorates, OMR, NCSI codes, and realistic indicators.
 */

export const OMAN_GOVERNORATES = [
  'Muscat', 'Dhofar', 'Musandam', 'Al Buraimi', 'Al Dakhiliyah',
  'Al Dhahirah', 'Al Sharqiyah North', 'Al Sharqiyah South', 'Al Batinah North', 'Al Batinah South',
];

// Datasets (Oman-focused titles, NCSI-style)
export const MOCK_DATASETS = [
  { id: 1, title: 'Population by Governorate (2020–2024)', category: 'Demographics', description: 'Annual population estimates and growth rates by governorate. Source: NCSI Census and population surveys.', lastUpdated: 'Dec 2024', format: 'CSV, XLSX', tags: ['census', 'population'], source: 'NCSI' },
  { id: 2, title: 'Labour Force Survey – Oman 2024', category: 'Labor Market', description: 'Employment, unemployment rates and labour force participation by governorate and sector.', lastUpdated: 'Nov 2024', format: 'PDF, XLSX', tags: [], source: 'NCSI' },
  { id: 3, title: 'Consumer Price Index (CPI) – Sultanate of Oman', category: 'Economy', description: 'Monthly CPI and inflation indicators. Base year 2019. OMR.', lastUpdated: 'Jan 2025', format: 'CSV, API', tags: [], source: 'NCSI' },
  { id: 4, title: 'Education Statistics by Governorate', category: 'Education', description: 'Enrolment, graduates and education indicators by level and region.', lastUpdated: 'Oct 2024', format: 'XLSX', tags: [], source: 'Ministry of Education' },
  { id: 5, title: 'Health Indicators – Oman', category: 'Health', description: 'Mortality, morbidity and health facility statistics by governorate.', lastUpdated: 'Sep 2024', format: 'PDF, CSV', tags: [], source: 'Ministry of Health' },
  { id: 6, title: 'Environmental Statistics – Sultanate of Oman', category: 'Environment', description: 'Emissions, waste and natural resource data. NCSI environmental accounts.', lastUpdated: 'Aug 2024', format: 'CSV', tags: [], source: 'NCSI' },
  { id: 7, title: 'Balance of Payments – Oman (OMR million)', category: 'Economy', description: 'Current account, capital flows and external position. Central Bank of Oman.', lastUpdated: 'Dec 2024', format: 'PDF, XLSX', tags: ['trade'], source: 'CBO' },
  { id: 8, title: 'International Trade Statistics – Oman', category: 'Economy', description: 'Imports, exports and trade balance by partner country. Customs data.', lastUpdated: 'Jan 2025', format: 'CSV, API', tags: ['trade'], source: 'NCSI' },
  { id: 9, title: 'Census 2020 Summary – Sultanate of Oman', category: 'Demographics', description: 'National census summary by governorate, age and gender.', lastUpdated: 'Jun 2024', format: 'PDF, XLSX', tags: ['census'], source: 'NCSI' },
  { id: 10, title: 'GDP by Governorate (Current Prices, OMR)', category: 'Economy', description: 'Gross domestic product at current prices by governorate.', lastUpdated: 'Dec 2024', format: 'XLSX', tags: [], source: 'NCSI' },
  { id: 11, title: 'Vital Statistics – Births and Deaths by Governorate', category: 'Vital Statistics', description: 'Birth and death registration data by governorate.', lastUpdated: 'Nov 2024', format: 'CSV', tags: [], source: 'NCSI' },
];

// Indicator cards – Oman-realistic values
export const MOCK_INDICATORS = [
  { label: 'Unemployment rate (Oman)', value: '2.1%', change: '−0.3% from last year', tag: '2024', bg: 'rgba(243,200,78,0.05)' },
  { label: 'Population (Sultanate of Oman)', value: '4.7M', change: '+2.1% annual growth', tag: '2024', bg: 'rgba(92,78,117,0.05)' },
  { label: 'Employment rate', value: '64.2%', change: '+1.2% from last year', tag: '2024', bg: 'rgba(140,198,63,0.05)' },
  { label: 'Inflation (CPI, Oman)', value: '0.8%', change: 'Stable YoY', tag: 'Jan 2025', bg: 'rgba(118,181,199,0.05)' },
];

// Search results pool – filter by query (AI-driven search)
export const MOCK_SEARCH_POOL = [
  // Labour & employment
  { type: 'Dataset', title: 'Labour Force Survey – Oman 2024', snippet: 'Employment and unemployment statistics by governorate and sector. NCSI.', path: '/datasets', keywords: 'labour unemployment employment survey governorate jobs workforce' },
  { type: 'Dataset', title: 'Employment by Economic Sector – Oman', snippet: 'Employment breakdown by sector: oil, government, private, agriculture. Annual series.', path: '/datasets', keywords: 'employment sector jobs workforce labour' },
  { type: 'Publication', title: 'Labour Market Bulletin Q4 2024', snippet: 'Quarterly analysis of employment, unemployment and participation rates.', path: '/datasets', keywords: 'labour employment unemployment jobs bulletin' },
  // Population & demographics
  { type: 'Dataset', title: 'Population by Governorate', snippet: 'Annual population estimates and density indicators for Oman.', path: '/datasets', keywords: 'population governorate census demographics people' },
  { type: 'Dataset', title: 'Census 2020 Summary – Sultanate of Oman', snippet: 'National census by governorate, age and gender. Full summary tables.', path: '/datasets', keywords: 'census 2020 demographics population governorate' },
  { type: 'Dataset', title: 'Vital Statistics – Births and Deaths by Governorate', snippet: 'Birth and death registration data by governorate. NCSI.', path: '/datasets', keywords: 'vital statistics births deaths population demographics' },
  { type: 'Publication', title: 'Demographic Trends in Oman 2020–2024', snippet: 'Analysis of population growth, age structure and regional distribution.', path: '/datasets', keywords: 'demographics population trends census' },
  // Prices & inflation
  { type: 'Dataset', title: 'Consumer Price Index – Sultanate of Oman', snippet: 'Monthly CPI and inflation. Base year 2019. OMR.', path: '/datasets', keywords: 'CPI inflation consumer price prices cost' },
  { type: 'Publication', title: 'Monthly Economic Indicators – December 2024', snippet: 'Key economic indicators including CPI, inflation and price indices.', path: '/datasets', keywords: 'economic indicators monthly CPI inflation prices' },
  // Economy & GDP
  { type: 'Dataset', title: 'GDP by Governorate (Current Prices, OMR)', snippet: 'Gross domestic product at current prices by governorate.', path: '/datasets', keywords: 'GDP economic growth national accounts governorate' },
  { type: 'Dataset', title: 'National Accounts – Oman', snippet: 'GDP by expenditure and by industry. Annual and quarterly. OMR.', path: '/datasets', keywords: 'GDP national accounts economy growth' },
  { type: 'Publication', title: 'Statistical Yearbook – Sultanate of Oman 2024', snippet: 'Comprehensive statistical overview including GDP and national accounts.', path: '/datasets', keywords: 'yearbook statistics oman GDP economy' },
  // Trade
  { type: 'Dataset', title: 'International Trade Statistics – Oman', snippet: 'Imports, exports and trade balance by partner country. Customs data.', path: '/datasets', keywords: 'trade imports exports OMR international' },
  { type: 'Dataset', title: 'Balance of Payments – Oman (OMR million)', snippet: 'Current account, capital flows and external position. Central Bank of Oman.', path: '/datasets', keywords: 'trade balance of payments exports imports' },
  { type: 'Publication', title: 'External Sector Report 2024', snippet: 'Trade performance, FDI and balance of payments analysis.', path: '/datasets', keywords: 'trade external sector exports imports' },
  // Education
  { type: 'Dataset', title: 'Education Statistics by Governorate', snippet: 'Enrolment, graduates and education indicators by level and region.', path: '/datasets', keywords: 'education enrolment schools graduates governorate' },
  { type: 'Publication', title: 'Education Indicators – Oman 2023/24', snippet: 'Enrolment rates, literacy and education outcomes by governorate.', path: '/datasets', keywords: 'education enrolment schools indicators' },
  // Health
  { type: 'Dataset', title: 'Health Indicators – Oman', snippet: 'Mortality, morbidity and health facility statistics by governorate.', path: '/datasets', keywords: 'health mortality morbidity indicators governorate' },
  { type: 'Publication', title: 'Health Statistics Annual 2024', snippet: 'Key health indicators and facility coverage. Ministry of Health.', path: '/datasets', keywords: 'health statistics mortality morbidity' },
  // Environment
  { type: 'Dataset', title: 'Environmental Statistics – Sultanate of Oman', snippet: 'Emissions, waste and natural resource data. NCSI environmental accounts.', path: '/datasets', keywords: 'environment emissions waste natural resources' },
  // Regions / governorates
  { type: 'Dataset', title: 'Regional Economic Indicators – Oman', snippet: 'Key indicators by governorate: Muscat, Dhofar, Al Batinah, and others.', path: '/datasets', keywords: 'regional governorate Muscat Dhofar regions' },
  { type: 'Publication', title: 'Governorate Profiles 2024', snippet: 'Summary profiles for each governorate: economy, population, services.', path: '/datasets', keywords: 'governorate regional profiles regions' },
  // News & general
  { type: 'News', title: 'Oman Ranks First in West Asia in Open Data', snippet: 'Open Data Watch report on Oman\'s open data performance.', path: '/', keywords: 'oman open data west asia' },
  { type: 'News', title: 'NCSI Releases Latest Labour Force Survey Results', snippet: 'Unemployment at 2.1%; employment growth in services sector.', path: '/', keywords: 'NCSI labour employment unemployment survey' },
  { type: 'News', title: 'Census 2020 Data Now Available by Governorate', snippet: 'Detailed census tables published for all governorates.', path: '/', keywords: 'census population governorate demographics' },
];

// My Queries – Oman-focused
export const MOCK_QUERIES_DEFAULT = [
  { id: 'q1', name: 'Unemployment by governorate 2024', query: 'Unemployment rate by governorate Oman 2024', created: '15 Jan 2025', lastRun: '15 Jan 2025' },
  { id: 'q2', name: 'GDP growth Oman', query: 'GDP annual growth Sultanate of Oman 2019-2024', created: '10 Jan 2025', lastRun: '12 Jan 2025' },
  { id: 'q3', name: 'Population density by region', query: 'Population and area by governorate Oman', created: '5 Dec 2024', lastRun: '8 Dec 2024' },
];

// Chart data – Oman (for Report Builder)
export const CHART_GOVERNORATES_DATA = [
  { name: 'Muscat', value: 1.45 },
  { name: 'Dhofar', value: 0.42 },
  { name: 'Al Batinah South', value: 0.52 },
  { name: 'Al Sharqiyah North', value: 0.28 },
  { name: 'Al Dakhiliyah', value: 0.24 },
  { name: 'Others', value: 0.79 },
];

// Time series for line chart (e.g. GDP growth %, unemployment %)
export const CHART_GDP_GROWTH_DATA = [
  { year: '2020', value: -2.8 },
  { year: '2021', value: 3.0 },
  { year: '2022', value: 4.3 },
  { year: '2023', value: 1.2 },
  { year: '2024', value: 2.1 },
];

export const CHART_UNEMPLOYMENT_DATA = [
  { year: '2020', value: 2.8 },
  { year: '2021', value: 2.5 },
  { year: '2022', value: 2.3 },
  { year: '2023', value: 2.2 },
  { year: '2024', value: 2.1 },
];

/** Chart section content format: __CHART__|type|datasetKey (e.g. __CHART__|bar|governorates, __CHART__|line|gdpGrowth) */
export const CHART_DATASETS = {
  governorates: CHART_GOVERNORATES_DATA,
  gdpGrowth: CHART_GDP_GROWTH_DATA,
  unemployment: CHART_UNEMPLOYMENT_DATA,
};

export const CATEGORIES = ['All', 'Demographics', 'Economy', 'Education', 'Health', 'Environment', 'Labor Market', 'Vital Statistics'];
