import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';
import { useAuth } from '../context/AuthContext';
import { profileToPersona } from '../lib/personaUtils';
import OmanMap from '../components/OmanMap';

// Only prompts that have real mock answers + interactive elements (map, chart, table, cards, publication)
const RECOMMENDED_PROMPTS = [
  // Map (interactive)
  { label: 'Map: population by governorate', query: "Show me a map of Oman by governorate to see where the population is most concentrated." },
  { label: 'Population density map', query: "Show population density map." },
  { label: 'Map: compare population density', query: "Show a map of Oman by governorate to compare population density" },
  // Chart (interactive)
  { label: 'Compare population across governorates', query: "Compare population across governorates" },
  { label: 'GDP growth trends', query: "Show me GDP growth trends over the last 5 years" },
  { label: 'GDP by sector', query: "Show GDP by sector for Oman" },
  // Cards (interactive)
  { label: 'Key economic indicators', query: "Key economic indicators for Oman" },
  { label: 'Regional economic indicators Muscat', query: "Show regional economic indicators for Muscat." },
  // Table (interactive)
  { label: 'Population by governorate', query: "Show population by governorate from the latest census" },
  { label: 'Labour force by governorate', query: "Show labour force statistics by governorate" },
  { label: 'Trade & balance of payments', query: "Show trade and balance of payments for Oman" },
  // Publication (interactive link)
  { label: 'Latest NCSI report', query: "Latest NCSI report or publication" },
];

// Simulated response generator: returns reasoning steps + content (text, chart, or table)
function generateMockResponse(query, persona) {
  const q = (query || '').toLowerCase();
  const role = persona?.role || 'User';
  const region = persona?.region || 'Oman';
  const interests = persona?.interests || [];

  const reasoningSteps = [
    "Parsing your question and identifying data domains...",
    "Searching NCSI statistical database for relevant indicators...",
    "Applying filters for time range and geography...",
    `Contextualizing results for your profile (${role}, ${region})...`,
    "Formatting the response for clarity.",
  ];

  if (q.includes('gdp') || (q.includes('growth') && q.includes('trend'))) {
    const data = [
      { year: '2020', value: -2.8, label: '2020' },
      { year: '2021', value: 3.0, label: '2021' },
      { year: '2022', value: 4.3, label: '2022' },
      { year: '2023', value: 2.1, label: '2023' },
      { year: '2024', value: 2.7, label: '2024' },
    ];
    const maxVal = Math.max(...data.map((d) => Math.abs(d.value)));
    return {
      reasoningSteps,
      content: {
        type: 'chart',
        chartKind: 'line',
        title: `GDP growth trends in Oman (2020–2024) — tailored for ${role}`,
        data,
        maxVal,
        unit: '%',
        summary: `Oman's GDP growth recovered from -2.8% in 2020 to an estimated 2.7% in 2024. As someone interested in ${interests[0] || 'economic indicators'}, you may want to explore the quarterly breakdown in our Datasets section.`,
      },
    };
  }

  if (q.includes('map') || (q.includes('governorate') && q.includes('map')) || (q.includes('by region') && !q.includes('table')) || (q.includes('population') && (q.includes('concentrated') || q.includes('map') || q.includes('density')))) {
    const regions = [
      { name: 'Muscat', value: 1.45, fill: '#005287', lat: 23.588, lng: 58.383 },
      { name: 'Dhofar', value: 0.42, fill: '#1a5f8a', lat: 17.015, lng: 54.092 },
      { name: 'Al Batinah North', value: 0.73, fill: '#2a6b8e', lat: 24.347, lng: 56.708 },
      { name: 'Al Batinah South', value: 0.52, fill: '#3a7892', lat: 23.9, lng: 57.4 },
      { name: 'Al Sharqiyah North', value: 0.28, fill: '#4a8596', lat: 22.5, lng: 58.5 },
      { name: 'Al Dakhiliyah', value: 0.42, fill: '#5a929a', lat: 22.933, lng: 57.533 },
      { name: 'Al Dhahirah', value: 0.21, fill: '#5a929a', lat: 23.2, lng: 56.5 },
      { name: 'Musandam', value: 0.05, fill: '#6a9fa0', lat: 26.2, lng: 56.24 },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'map',
        title: `National Population Distribution — Oman by governorate`,
        regions,
        summary: `Data summary: Muscat: 1.45M · Al Batinah North: 0.73M · Dhofar & Al Dakhiliyah: 0.42M each. Interactive map: click markers for population. Data: Oman Data Portal, NCSI Census and annual estimates.`,
      },
    };
  }

  if ((q.includes('compare') && q.includes('population')) || (q.includes('population') && q.includes('governorate')) || q.includes('population across')) {
    const data = [
      { name: 'Muscat', value: 1.45, label: '1.45M' },
      { name: 'Al Batinah N.', value: 0.73, label: '0.73M' },
      { name: 'Dhofar', value: 0.42, label: '0.42M' },
      { name: 'Al Batinah S.', value: 0.52, label: '0.52M' },
      { name: 'Al Sharqiyah N.', value: 0.28, label: '0.28M' },
      { name: 'Al Dakhiliyah', value: 0.42, label: '0.42M' },
    ];
    const maxVal = Math.max(...data.map((d) => d.value));
    return {
      reasoningSteps,
      content: {
        type: 'chart',
        chartKind: 'bar',
        title: `Population by governorate (million) — ${region}`,
        data,
        maxVal,
        unit: 'M',
        summary: `Muscat and Al Batinah have the highest population. Data: NCSI. Would you like a time series or demographics breakdown?`,
      },
    };
  }

  if (q.includes('key indicator') || q.includes('economic indicator') || q.includes('main indicator')) {
    const cards = [
      { label: 'Unemployment rate', value: '2.1%', sub: '2024, NCSI LFS', trend: 'down' },
      { label: 'GDP growth (real)', value: '2.1%', sub: '2024', trend: 'up' },
      { label: 'CPI inflation', value: '0.8%', sub: 'Jan 2025 YoY', trend: 'neutral' },
      { label: 'Population', value: '4.7M', sub: 'Sultanate of Oman', trend: 'up' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'cards',
        title: `Key economic indicators for ${region}`,
        cards,
        summary: `Latest NCSI and CBO indicators. Personalized for ${role}. Download full series from the Datasets page.`,
      },
    };
  }

  // Scenario 1: Economy performance & investment — cards for key metrics
  if ((q.includes('economy') && (q.includes('perform') || q.includes('invest'))) || (q.includes('invest') && q.includes('good time'))) {
    const cards = [
      { label: 'GDP (Q1 2024)', value: '10,441.98 Mn R.O.', sub: 'Current prices' },
      { label: 'Real GDP growth', value: '2.5%', sub: 'Q1 2025' },
      { label: 'Total FDI', value: '30.04 B OMR', sub: 'End 2024, +18% YoY' },
      { label: 'Largest investor', value: 'UK · 15.3 B OMR', sub: 'US 7.6B, Kuwait 1.25B' },
      { label: 'Non-oil sector growth', value: '4.4%', sub: 'Early 2025 · construction, tourism, logistics' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'cards',
        title: 'Oman\'s economy performance and investment landscape',
        cards,
        summary: 'Based on the latest data from the Oman Data Portal. Growth has continued into 2025. Key indicators suggest a favourable environment for investors.',
      },
    };
  }

  // Follow-up: Free Zones exceptions — cards
  if ((q.includes('free zones') || q.includes('free zone')) && (q.includes('exception') || q.includes('prohibited'))) {
    const cards = [
      { label: 'Designated Free Zones', value: 'Salalah · Sohar · Duqm', sub: 'Export-oriented projects' },
      { label: 'Criteria', value: 'Export orientation, tech transfer, job creation', sub: 'Case-by-case' },
      { label: 'Conditions', value: 'Min investment threshold', sub: 'Omani national employment share' },
      { label: 'Authority', value: 'Ministry of Commerce', sub: 'Investment Services Center' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'cards',
        title: 'Exceptions for prohibited activities in Free Zones',
        cards,
        summary: 'Under FCIL and Free Zone regulations. Certain reserved activities may be permitted when project meets criteria. Consult Free Zone authority for eligibility.',
      },
    };
  }

  // Scenario 1 follow-up: Full list of 123 prohibited activities (must come before generic prohibited)
  if ((q.includes('full list') || q.includes('123')) && q.includes('prohibited')) {
    const rows = [
      { category: 'National Heritage', examples: 'Omani Halwa, Khanjars, Kummah, Frankincense' },
      { category: 'Traditional Crafts', examples: 'Wood, leather, silver, copper, palm handicrafts' },
      { category: 'Retail & Personal', examples: 'Grocery stores, mobile cafes, tailoring, barbershops' },
      { category: 'Services & Logistics', examples: 'Real estate brokerage, customs clearance, towing' },
      { category: 'Administrative', examples: 'Sanad centers, typing services, mailbox rentals' },
      { category: 'Environment & Agriculture', examples: 'Marine fishing, beekeeping, aquaculture, nurseries' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'table',
        title: 'Summary of 123 activities reserved for Omani nationals (FCIL)',
        columns: ['Category', 'Examples'],
        rows,
        summary: `The complete list of 123 reserved activities is published in the Official Gazette and available through the Ministry of Commerce, Industry and Investment Promotion. The categories above represent the main groupings. For the full itemised list, visit the Investment Services Center or data.gov.om.`,
      },
    };
  }

  // Scenario 1 follow-up: Prohibited sectors — table + summary
  if (q.includes('prohibited') || (q.includes('foreign investment') && (q.includes('sector') || q.includes('restrict')))) {
    const rows = [
      { category: 'National Heritage', examples: 'Omani Halwa, Khanjars, Kummah, Frankincense' },
      { category: 'Traditional Crafts', examples: 'Wood, leather, silver, copper, palm handicrafts' },
      { category: 'Retail & Personal Services', examples: 'Grocery stores, mobile cafes, tailoring, barbershops' },
      { category: 'Services & Logistics', examples: 'Real estate brokerage, customs clearance, towing' },
      { category: 'Administrative Support', examples: 'Sanad centers, typing services, mailbox rentals' },
      { category: 'Environment & Agriculture', examples: 'Marine fishing, beekeeping, aquaculture, nurseries' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'table',
        title: 'Sectors prohibited for foreign investment (FCIL)',
        columns: ['Category', 'Examples'],
        rows,
        summary: 'Under the FCIL, foreign investors can own 100% in most sectors. 123 activities are reserved for Omani nationals (Sept 2024) to support local SMEs and protect national heritage.',
      },
    };
  }

  // Scenario 2: Tourism trends — cards
  if (q.includes('tourism') || (q.includes('tour agency') && q.includes('visitors')) || (q.includes('visitors') && q.includes('coming from'))) {
    const cards = [
      { label: 'Total arrivals (2024)', value: '3.89 M', sub: 'Visitors' },
      { label: 'GCC share (peak months)', value: '56%', sub: 'e.g. July' },
      { label: 'UAE', value: '1.18 M', sub: 'Top nationality' },
      { label: 'India', value: '623,623', sub: 'Second' },
      { label: 'Yemen', value: '203,055', sub: 'Third' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'cards',
        title: 'Tourism trends in Oman',
        cards,
        summary: 'Based on the Oman Data Portal. Visitor engagement at cultural sites (Masjids, Eid Prayer Places) tracked across Muscat, Dhofar, Nizwa.',
      },
    };
  }

  // Scenario 3: Regional infrastructure — cards
  if (q.includes('logistics hub') || (q.includes('population concentration') && q.includes('transportation')) || (q.includes('transportation') && q.includes('population'))) {
    const cards = [
      { label: 'Muscat', value: '1.45 M', sub: 'Most populated governorate' },
      { label: 'Al Batinah North', value: '0.73 M', sub: 'Second' },
      { label: 'Al Dakhiliyah', value: '0.42 M', sub: 'Third' },
      { label: 'Vehicle activity', value: 'Tracked', sub: 'Total Registered Vehicles, heavy traffic' },
      { label: 'Aviation hubs', value: 'Muscat · Salalah', sub: 'Primary gateways' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'cards',
        title: 'Regional infrastructure and population density',
        cards,
        summary: 'Census and transportation datasets. Mobility monitored via New/Renewed Driving Licenses. Data available to regional level for workforce readiness.',
      },
    };
  }

  // Scenario 4: Industrial energy — cards
  if (q.includes('industrial energy') || (q.includes('natural gas') && q.includes('manufacturing')) || (q.includes('energy consumption') && q.includes('oman'))) {
    const cards = [
      { label: 'Industrial areas demand', value: '9,190.38 MNSCF', sub: '2023' },
      { label: 'Power & water generation', value: '310,444.89 MNSCF', sub: 'Dedicated to power grid' },
      { label: 'Total national consumption', value: '1,908,026.68 MNSCF', sub: 'All sectors, oil fields, refineries' },
      { label: 'Refinery hubs', value: 'Sohar · MAF', sub: 'Processing volumes, energy efficiency' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'cards',
        title: 'Industrial energy consumption in Oman',
        cards,
        summary: 'Environment and Energy datasets (2023). Natural gas utilization and power requirements for the manufacturing sector.',
      },
    };
  }

  // Follow-up: Omani investment abroad — cards
  if (q.includes('omani investment') && q.includes('abroad')) {
    const cards = [
      { label: 'Total outward investment', value: '2.84 B OMR', sub: 'End 2024' },
      { label: 'UAE', value: '1.12 B OMR', sub: 'Primary destination' },
      { label: 'Saudi Arabia', value: '0.68 B OMR', sub: 'Second' },
      { label: 'Kuwait', value: '0.42 B OMR', sub: 'Third' },
      { label: 'Sector focus', value: 'Real estate, finance, logistics', sub: 'Diversification beyond domestic' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'cards',
        title: 'Omani investment abroad',
        cards,
        summary: 'Oman Data Portal and Central Bank of Oman. Investments in GCC and MENA markets continue to grow.',
      },
    };
  }

  // Follow-up: Hotel occupancy rates
  if (q.includes('hotel occupancy') || (q.includes('occupancy') && q.includes('hotel'))) {
    const rows = [
      { category: '5-Star', rate: '72%', period: '2024 avg' },
      { category: '4-Star', rate: '68%', period: '2024 avg' },
      { category: '3-Star', rate: '61%', period: '2024 avg' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'table',
        title: 'Hotel occupancy rates by category (Oman)',
        columns: ['Category', 'Occupancy', 'Period'],
        rows,
        summary: `Occupancy peaks during Khareef (July–September) in Dhofar and the winter season (November–February) in Muscat. Data: Oman Data Portal, Ministry of Heritage and Tourism.`,
      },
    };
  }

  // Follow-up: Cultural sites Dhofar Khareef — cards
  if ((q.includes('cultural sites') || q.includes('cultural site')) && (q.includes('dhofar') || q.includes('khareef'))) {
    const cards = [
      { label: 'Khareef season visitors', value: '412,000', sub: 'July–Sept 2024' },
      { label: 'Peak month', value: 'August', sub: 'Khareef & Salalah Tourism Festival' },
      { label: 'Key sites', value: 'Frankincense Museum, Al Baleed', sub: 'Masjids across Dhofar' },
      { label: 'Visitor profile', value: 'Domestic · GCC · India · Europe', sub: 'Monsoon-like Khareef climate' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'cards',
        title: 'Visitors to cultural sites in Dhofar during Khareef season',
        cards,
        summary: 'Oman Data Portal and Ministry of Heritage and Tourism. Museum of the Land of Frankincense, Al Baleed Archaeological Park.',
      },
    };
  }

  // Follow-up: Commercial vehicles Al Batinah — cards
  if (q.includes('commercial vehicles') && (q.includes('batinah') || q.includes('al batinah'))) {
    const cards = [
      { label: 'Total commercial vehicles', value: '28,450', sub: 'End 2024 · trucks, vans, buses' },
      { label: 'YoY growth', value: '+4.2%', sub: 'New registrations' },
      { label: 'National rank', value: '2nd', sub: 'After Muscat' },
      { label: 'Linked to', value: 'Sohar Port', sub: 'Industrial zone activity' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'cards',
        title: 'Commercial vehicles registered in Al Batinah North',
        cards,
        summary: 'Royal Oman Police and Oman Data Portal. Reflects logistics and industrial activity.',
      },
    };
  }

  // Follow-up: Natural gas growth rate in industrial areas
  if (q.includes('natural gas') && (q.includes('growth') || q.includes('annual')) && q.includes('industrial')) {
    const data = [
      { year: '2020', value: -1.2, label: '2020' },
      { year: '2021', value: 2.8, label: '2021' },
      { year: '2022', value: 4.1, label: '2022' },
      { year: '2023', value: 3.6, label: '2023' },
    ];
    const maxVal = Math.max(...data.map((d) => Math.abs(d.value)));
    return {
      reasoningSteps,
      content: {
        type: 'chart',
        chartKind: 'line',
        title: 'Annual growth rate of natural gas consumption in industrial areas (%)',
        data,
        maxVal,
        unit: '%',
        summary: `Industrial natural gas demand has grown steadily since 2021, driven by expansion in Sohar and Duqm industrial zones. Data: Environment and Energy datasets, Oman Data Portal.`,
      },
    };
  }

  // Follow-up: Electricity consumption Muscat vs Sohar
  if (q.includes('electricity consumption') && (q.includes('muscat') || q.includes('sohar'))) {
    const rows = [
      { zone: 'Muscat', consumption: '4,820 GWh', share: '38%' },
      { zone: 'Sohar Industrial', consumption: '2,140 GWh', share: '17%' },
      { zone: 'Other governorates', consumption: '5,740 GWh', share: '45%' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'table',
        title: 'Electricity consumption: Muscat vs Sohar industrial zones (2023)',
        columns: ['Zone', 'Consumption', 'National share'],
        rows,
        summary: `Muscat leads in total consumption due to residential and commercial demand. Sohar's industrial zone shows the highest industrial-intensity consumption per square kilometre. Data: Oman Data Portal, Environment and Energy datasets.`,
      },
    };
  }

  if (q.includes('report') || q.includes('publication') || q.includes('ncsi report') || q.includes('latest publication')) {
    return {
      reasoningSteps,
      content: {
        type: 'publication',
        title: 'Statistical Yearbook – Sultanate of Oman 2024',
        description: 'Comprehensive statistical overview including national accounts, labour market, demographics, and sectoral indicators. Published by NCSI.',
        format: 'PDF · 15.2 MB',
        date: 'December 2024',
        link: '/datasets',
      },
    };
  }

  if (q.includes('population') || q.includes('governorate') || q.includes('region')) {
    const rows = [
      { governorate: 'Muscat', population: '1.45M', growth: '2.1%' },
      { governorate: 'Dhofar', population: '0.41M', growth: '1.8%' },
      { governorate: 'North Al Batinah', population: '0.73M', growth: '2.0%' },
      { governorate: 'South Al Batinah', population: '0.31M', growth: '1.6%' },
      { governorate: 'Ad Dakhiliyah', population: '0.42M', growth: '1.9%' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'table',
        title: `Population by governorate (latest) — focus on ${region}`,
        columns: ['Governorate', 'Population', 'Annual growth'],
        rows,
        summary: `Population growth varies by governorate; ${region} is highlighted in our analysis. Would you like a time series or age breakdown?`,
      },
    };
  }

  if (q.includes('education') || q.includes('statistics')) {
    return {
      reasoningSteps,
      content: {
        type: 'text',
        title: `Education statistics by region`,
        body: `Based on NCSI's latest education indicators: gross enrollment in general education reached about 98% in 2023/24. Enrollment is highest in Muscat and Dhofar. As a ${role}, you might find the "Education" and "Demographics" datasets useful for deeper analysis. I've prioritized data relevant to ${region}.`,
      },
    };
  }

  if (q.includes('trade') || q.includes('balance of payments') || q.includes('bop') || q.includes('import') || q.includes('export')) {
    const rows = [
      { item: 'Current account balance', value: '1,240 OMR million', period: '2024' },
      { item: 'Goods balance', value: '2,180', period: '2024' },
      { item: 'Services balance', value: '-620', period: '2024' },
    ];
    return {
      reasoningSteps,
      content: {
        type: 'table',
        title: `Trade and Balance of Payments — ${region}`,
        columns: ['Indicator', 'Value', 'Period'],
        rows,
        summary: `As an Economic Analyst, you may find the International Trade Statistics and Balance of Payments (CBO) datasets most relevant. Data is from NCSI and Central Bank of Oman. Would you like a breakdown by partner country or time series?`,
      },
    };
  }

  // Default: unemployment or generic
  return {
    reasoningSteps,
    content: {
      type: 'text',
      title: `Unemployment and labour market — ${region}`,
      body: `According to the latest Labour Force Survey (NCSI), the unemployment rate in ${region} for 2024 was approximately 2.1%. Oman's overall rate remains among the lowest in the region. Results are personalized to your role (${role}). Would you like a breakdown by gender, age group, or governorate?`,
    },
  };
}

// Follow-ups based on last answer — each scenario has relevant follow-ups; follow-ups lead to more follow-ups for smooth flow
function getFollowUps(lastContent, persona) {
  const base = [
    "How is Oman's economy performing lately? I want to know if it's a good time to invest.",
    "Show me a map of Oman by governorate to see where the population is most concentrated.",
    "Key economic indicators for Oman",
  ];

  const title = (lastContent?.title || '').toLowerCase();

  // Unemployment / Labour
  if (title.includes('unemployment') || title.includes('labour')) {
    return [
      "Break down unemployment by gender",
      "Show unemployment by age group",
      "Compare population across governorates",
    ];
  }

  // GDP chart
  if (title.includes('gdp') || (title.includes('growth') && title.includes('trend'))) {
    return [
      "Show quarterly GDP growth",
      "How is Oman's economy performing lately? I want to know if it's a good time to invest.",
      "Key economic indicators for Oman",
    ];
  }

  // Economic indicators (cards)
  if (title.includes('economic indicator') || title.includes('key indicator')) {
    return [
      "How is Oman's economy performing lately? I want to know if it's a good time to invest.",
      "Show me GDP growth trends over the last 5 years",
      "Which sectors are currently prohibited for foreign investment?",
    ];
  }

  // Map & Population
  if (title.includes('population') || title.includes('national population distribution')) {
    return [
      "Show population density map",
      "Show regional economic indicators for Muscat",
      "Which regions have the highest population concentration and the most active transportation networks?",
    ];
  }

  // Scenario 1: Economy performance
  if (title.includes('economy') && (title.includes('investment') || title.includes('performance'))) {
    return [
      "Which sectors are currently prohibited for foreign investment?",
      "Can you show me the volume of Omani investment abroad?",
      "Key economic indicators for Oman",
    ];
  }

  // Scenario 1 follow-up: Prohibited sectors
  if (title.includes('prohibited') || title.includes('foreign investment')) {
    return [
      "Are there exceptions for these prohibited activities in the Free Zones?",
      "Can you provide a full list of the 123 prohibited activities?",
      "How is Oman's economy performing lately? I want to know if it's a good time to invest.",
    ];
  }

  // Scenario 1 follow-up: Full list 123
  if (title.includes('123') && title.includes('activities')) {
    return [
      "Are there exceptions for these prohibited activities in the Free Zones?",
      "Which sectors are currently prohibited for foreign investment?",
      "Can you show me the volume of Omani investment abroad?",
    ];
  }

  // Scenario 1 follow-up: Omani investment abroad
  if (title.includes('omani investment') || title.includes('investment abroad')) {
    return [
      "Which sectors are currently prohibited for foreign investment?",
      "How is Oman's economy performing lately? I want to know if it's a good time to invest.",
      "Key economic indicators for Oman",
    ];
  }

  // Scenario 1 follow-up: Free Zones exceptions
  if ((title.includes('free zone') || title.includes('exceptions')) && title.includes('prohibited')) {
    return [
      "Can you provide a full list of the 123 prohibited activities?",
      "Which sectors are currently prohibited for foreign investment?",
      "How is Oman's economy performing lately? I want to know if it's a good time to invest.",
    ];
  }

  // Scenario 2: Tourism
  if (title.includes('tourism')) {
    return [
      "What are the hotel occupancy rates for 3-star to 5-star hotels?",
      "Can you show the number of visitors to cultural sites in the Dhofar region during Khareef season?",
      "Which regions have the highest population concentration and the most active transportation networks?",
    ];
  }

  // Scenario 2 follow-up: Hotel occupancy
  if (title.includes('hotel occupancy')) {
    return [
      "What are the current tourism trends in Oman, and where are most visitors coming from?",
      "Can you show the number of visitors to cultural sites in the Dhofar region during Khareef season?",
      "Show me a map of Oman by governorate to see where the population is most concentrated.",
    ];
  }

  // Scenario 2 follow-up: Cultural sites Dhofar
  if (title.includes('cultural sites') || (title.includes('dhofar') && title.includes('khareef'))) {
    return [
      "What are the hotel occupancy rates for 3-star to 5-star hotels?",
      "What are the current tourism trends in Oman, and where are most visitors coming from?",
      "Which regions have the highest population concentration and the most active transportation networks?",
    ];
  }

  // Scenario 3: Infrastructure
  if (title.includes('infrastructure') || title.includes('logistics')) {
    return [
      "Show a map of Oman by governorate to compare population density",
      "What is the total number of commercial vehicles registered in Al Batinah North?",
      "Show population density map",
    ];
  }

  // Scenario 3 follow-up: Commercial vehicles
  if (title.includes('commercial vehicles')) {
    return [
      "Which regions have the highest population concentration and the most active transportation networks?",
      "Show a map of Oman by governorate to compare population density",
      "Show population by governorate from the latest census",
    ];
  }

  // Scenario 4 follow-up: Electricity Muscat vs Sohar (check before generic energy)
  if (title.includes('electricity consumption') && (title.includes('muscat') || title.includes('sohar'))) {
    return [
      "Show the annual growth rate of natural gas consumption in industrial areas",
      "What does the data say about industrial energy consumption in Oman? I want to understand the demand for natural gas in the manufacturing sector.",
      "Which regions have the highest population concentration and the most active transportation networks?",
    ];
  }

  // Scenario 4 follow-up: Natural gas growth chart
  if (title.includes('natural gas') && title.includes('growth')) {
    return [
      "How does electricity consumption compare between the Muscat and Sohar industrial zones?",
      "What does the data say about industrial energy consumption in Oman? I want to understand the demand for natural gas in the manufacturing sector.",
      "Key economic indicators for Oman",
    ];
  }

  // Scenario 4: Industrial energy (main)
  if (title.includes('industrial energy') || (title.includes('energy consumption') && title.includes('oman'))) {
    return [
      "Show the annual growth rate of natural gas consumption in industrial areas",
      "How does electricity consumption compare between the Muscat and Sohar industrial zones?",
      "Key economic indicators for Oman",
    ];
  }

  // Trade & BoP
  if (title.includes('trade') || title.includes('balance of payments')) {
    return [
      "How is Oman's economy performing lately? I want to know if it's a good time to invest.",
      "Key economic indicators for Oman",
      "Which sectors are currently prohibited for foreign investment?",
    ];
  }

  // Education
  if (title.includes('education')) {
    return [
      "Show population by governorate from the latest census",
      "Compare population across governorates",
      "Key economic indicators for Oman",
    ];
  }

  // Type-based fallbacks (when title doesn't match)
  if (lastContent?.type === 'chart') {
    return ["Show me GDP growth trends over the last 5 years", "Compare population across governorates", "Key economic indicators for Oman"];
  }
  if (lastContent?.type === 'table') {
    return ["Show population by governorate from the latest census", "Show trade and balance of payments for Oman", "Key economic indicators for Oman"];
  }
  if (lastContent?.type === 'map') {
    return ["Show population density map", "Show regional economic indicators for Muscat", "Which regions have the highest population concentration and the most active transportation networks?"];
  }
  if (lastContent?.type === 'cards') {
    return ["How is Oman's economy performing lately? I want to know if it's a good time to invest.", "Show me GDP growth trends over the last 5 years", "Which sectors are currently prohibited for foreign investment?"];
  }
  if (lastContent?.type === 'publication') {
    return ["Latest NCSI report or publication", "Key economic indicators for Oman", "Show population by governorate from the latest census"];
  }
  return base;
}

function ReasoningBlock({ steps, onDone }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const CHAR_MS = 32;
  const MIN_STEP_MS = 700;

  useEffect(() => {
    if (!steps?.length || stepIndex >= steps.length) {
      onDone?.();
      return;
    }
    const step = steps[stepIndex];
    let i = 0;
    const start = Date.now();
    const id = setInterval(() => {
      if (i <= step.length) {
        setDisplayed(step.slice(0, i));
        i++;
      } else {
        clearInterval(id);
        const elapsed = Date.now() - start;
        const minRemaining = Math.max(0, MIN_STEP_MS - elapsed);
        setTimeout(() => {
          setStepIndex((s) => s + 1);
          setDisplayed('');
        }, minRemaining);
      }
    }, CHAR_MS);
    return () => clearInterval(id);
  }, [steps, stepIndex]);

  useEffect(() => {
    if (stepIndex >= steps?.length && steps?.length) onDone?.();
  }, [stepIndex, steps?.length, onDone]);

  if (!steps?.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-portal-border bg-gradient-to-br from-slate-50/95 to-portal-ai-bg/95 px-4 py-3.5 shadow-sm backdrop-blur-sm">
      <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(0,82,135,0.04)_50%,transparent_60%)] bg-[length:200%_100%] animate-shimmer pointer-events-none" />
      <div className="relative flex gap-3">
        <div className="flex shrink-0 flex-col items-center pt-0.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-portal-blue/20 to-[#3a70d8]/20">
            <svg className="h-4 w-4 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i < stepIndex
                    ? 'bg-emerald-500'
                    : i === stepIndex
                      ? 'scale-125 bg-portal-blue ring-2 ring-portal-blue/30'
                      : 'bg-portal-border'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-portal-blue-dark/80">Reasoning</p>
          <div className="mt-2 space-y-2">
            {steps.slice(0, stepIndex).map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-portal-gray-muted">
                <span className="mt-0.5 shrink-0 text-emerald-500">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </span>
                <span className="line-through opacity-80">{s}</span>
              </div>
            ))}
            {stepIndex < steps.length && (
              <div className="flex items-start gap-2 text-xs text-portal-navy-dark">
                <span className="mt-0.5 shrink-0 text-portal-blue">
                  <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-portal-blue border-t-transparent animate-spin" />
                </span>
                <span className="whitespace-pre-wrap break-words">
                  {displayed}
                  <span className="inline-block h-3.5 w-[2px] animate-pulse bg-portal-blue align-middle" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Renders text with **bold** markdown and paragraph breaks
function FormattedTextBody({ text }) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => {
        const parts = [];
        let remaining = para;
        let key = 0;
        while (remaining.length > 0) {
          const boldStart = remaining.indexOf('**');
          if (boldStart === -1) {
            parts.push(<span key={key++}>{remaining}</span>);
            break;
          }
          const boldEnd = remaining.indexOf('**', boldStart + 2);
          if (boldEnd === -1) {
            parts.push(<span key={key++}>{remaining}</span>);
            break;
          }
          if (boldStart > 0) parts.push(<span key={key++}>{remaining.slice(0, boldStart)}</span>);
          parts.push(<strong key={key++} className="font-semibold text-[#161616]">{remaining.slice(boldStart + 2, boldEnd)}</strong>);
          remaining = remaining.slice(boldEnd + 2);
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-[#374151]">
            {parts}
          </p>
        );
      })}
    </div>
  );
}

function AnswerContent({ content }) {
  if (!content) return null;

  if (content.type === 'text') {
    return (
      <div className="space-y-3">
        {content.title && <p className="font-display text-base font-semibold text-[#161616]">{content.title}</p>}
        <FormattedTextBody text={content.body} />
      </div>
    );
  }

  if (content.type === 'chart') {
    const { data, maxVal, unit, title, summary, chartKind } = content;
    const isBar = chartKind === 'bar';
    return (
      <div className="space-y-3">
        {title && <p className="font-display font-semibold text-[#161616]">{title}</p>}
        <div className={`rounded-xl border border-portal-border/80 bg-white p-4 shadow-sm ${isBar ? 'min-w-[320px]' : ''}`}>
          {isBar ? (
            <div className="space-y-2.5">
              {data.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-[#161616]">{d.name}</span>
                  <div className="h-6 flex-1 min-w-0 rounded-md bg-portal-bg-section overflow-hidden">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-portal-blue to-[#1a5f8a] transition-all duration-500"
                      style={{ width: `${(d.value / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-xs font-semibold text-portal-blue">{d.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-1.5">
              {data.map((d, i) => (
                <div key={d.year ?? i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-portal-gray">{d.value}{unit}</span>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-portal-blue to-portal-blue-dark"
                    style={{ height: `${Math.max(8, (Math.abs(d.value) / maxVal) * 120)}px` }}
                  />
                  <span className="text-xs text-portal-gray">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {summary && <p className="text-sm text-portal-gray-muted">{summary}</p>}
      </div>
    );
  }

  if (content.type === 'map') {
    const { title, regions, summary } = content;
    const mapRegions = (regions || []).map((r) => ({
      name: r.name,
      lat: r.lat,
      lng: r.lng,
      pop: r.value,
    })).filter((r) => r.lat != null && r.lng != null);
    return (
      <OmanMap
        title={title}
        summary={summary}
        regions={mapRegions.length > 0 ? mapRegions : undefined}
        interactive={true}
      />
    );
  }

  if (content.type === 'cards') {
    const { title, cards, summary } = content;
    return (
      <div className="space-y-4">
        {title && <p className="font-display text-base font-semibold text-[#161616]">{title}</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((c, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-portal-border/70 bg-gradient-to-br from-white to-portal-bg-section/50 p-4 shadow-sm transition-all hover:border-portal-blue/30 hover:shadow-md"
            >
              <div className="absolute top-0 right-0 h-16 w-16 -translate-y-1/2 translate-x-1/2 rounded-full bg-portal-blue/5" />
              <p className="relative text-[11px] font-semibold uppercase tracking-wider text-portal-gray">{c.label}</p>
              <p className="relative mt-1.5 font-display text-lg font-bold text-[#161616]">{c.value}</p>
              <p className="relative mt-1 text-xs leading-snug text-portal-gray-muted">{c.sub}</p>
            </div>
          ))}
        </div>
        {summary && <p className="text-sm leading-relaxed text-portal-gray-muted">{summary}</p>}
      </div>
    );
  }

  if (content.type === 'publication') {
    const { title, description, format, date, link } = content;
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-portal-border/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <p className="font-display font-semibold text-[#161616]">{title}</p>
          <p className="mt-1 text-sm text-portal-gray">{description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-portal-gray-muted">
            <span>{format}</span>
            <span>·</span>
            <span>{date}</span>
          </div>
          <a href={link} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-portal-blue hover:underline">
            Open in Datasets
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>
    );
  }

  if (content.type === 'table') {
    const { columns, rows, title, summary } = content;
    const rowKeys = rows[0] ? Object.keys(rows[0]) : [];
    return (
      <div className="space-y-3">
        {title && <p className="font-display text-base font-semibold text-[#161616]">{title}</p>}
        <div className="overflow-x-auto rounded-xl border border-portal-border/70 shadow-sm">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-portal-border bg-gradient-to-r from-portal-bg-section to-portal-bg-section/80">
                {columns.map((c) => (
                  <th key={c} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-portal-gray">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-portal-border/60 last:border-0 transition-colors hover:bg-portal-bg-section/80">
                  {rowKeys.map((k, j) => (
                    <td key={k} className="px-4 py-2.5 text-[#374151]">{r[k]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {summary && <p className="text-sm leading-relaxed text-portal-gray-muted">{summary}</p>}
      </div>
    );
  }

  return null;
}

const AI_CHAT_LIST_KEY = 'ncsi_smart_portal_ai_chat_list';

function generateChatId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getChatTitleFromMessages(messages) {
  const first = messages?.find((m) => m.role === 'user');
  const text = first?.text?.trim() || '';
  return text.length > 40 ? text.slice(0, 38) + '…' : text || 'New chat';
}

const AI_CHAT_LEGACY_KEY = 'ncsi_smart_portal_ai_chat';

function loadChatList() {
  try {
    const raw = localStorage.getItem(AI_CHAT_LIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const legacy = localStorage.getItem(AI_CHAT_LEGACY_KEY);
    if (legacy) {
      const messages = JSON.parse(legacy);
      if (Array.isArray(messages) && messages.length > 0) {
        const migrated = [{
          id: generateChatId(),
          title: getChatTitleFromMessages(messages),
          messages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }];
        saveChatList(migrated);
        localStorage.removeItem(AI_CHAT_LEGACY_KEY);
        return migrated;
      }
    }
  } catch (_) {}
  return [];
}

function saveChatList(list) {
  try {
    localStorage.setItem(AI_CHAT_LIST_KEY, JSON.stringify(list));
  } catch (_) {}
}

function getChatTitle(messages) {
  return getChatTitleFromMessages(messages);
}

export default function AIAssistantPage() {
  const location = useLocation();
  const { currentPersona } = usePersona();
  const { user, profile, isAuthenticated } = useAuth();
  const effectivePersona = isAuthenticated && profile ? profileToPersona(profile, user?.fullName) : currentPersona;
  const [chatList, setChatList] = useState(loadChatList);
  const [currentChatId, setCurrentChatId] = useState(() => {
    const list = loadChatList();
    return list.length > 0 ? list[0].id : null;
  });
  const [messages, setMessages] = useState(() => {
    const list = loadChatList();
    const first = list[0];
    return first?.messages ?? [];
  });
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingReasoningDone, setStreamingReasoningDone] = useState(false);
  const [pendingContent, setPendingContent] = useState(null);
  const [pendingFollowUps, setPendingFollowUps] = useState([]);
  const [pendingReasoningSteps, setPendingReasoningSteps] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isStreaming, pendingContent]);

  const currentChat = currentChatId ? chatList.find((c) => c.id === currentChatId) : null;

  const updateCurrentChatMessages = useCallback((nextMessages) => {
    if (!currentChatId) return;
    setChatList((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              messages: nextMessages,
              title: getChatTitle(nextMessages),
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
  }, [currentChatId]);

  useEffect(() => {
    saveChatList(chatList);
  }, [chatList]);

  const handleNewChat = useCallback(() => {
    const id = generateChatId();
    const newChat = {
      id,
      title: 'New chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChatList((prev) => [newChat, ...prev]);
    setCurrentChatId(id);
    setMessages([]);
    setSidebarOpen(false);
  }, []);

  const handleSelectChat = useCallback((id) => {
    const chat = chatList.find((c) => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setMessages(chat.messages || []);
    }
    setSidebarOpen(false);
  }, [chatList]);

  useEffect(() => {
    if (!currentChatId && chatList.length === 0) {
      handleNewChat();
    }
  }, []);


  useEffect(() => {
    if (!isStreaming && messages.length > 0 && currentChatId) {
      updateCurrentChatMessages(messages);
    }
  }, [messages, isStreaming, currentChatId, updateCurrentChatMessages]);

  const initialQueryApplied = useRef(false);
  useEffect(() => {
    const q = location.state?.initialQuery;
    if (q && typeof q === 'string' && !initialQueryApplied.current) {
      initialQueryApplied.current = true;
      setInput(q);
      handleSendMessage(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when initialQuery is set
  }, [location.state?.initialQuery]);

  const handleSendMessage = useCallback((text) => {
    const trimmed = (typeof text === 'string' ? text : input).trim();
    if (!trimmed) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    if (currentChatId) {
      setChatList((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? { ...c, messages: [...(c.messages || []), userMsg], title: getChatTitle([...(c.messages || []), userMsg]), updatedAt: new Date().toISOString() }
            : c
        )
      );
    }
    setInput('');
    setIsStreaming(true);
    setStreamingReasoningDone(false);
    setPendingContent(null);
    setPendingFollowUps([]);

    const { reasoningSteps, content } = generateMockResponse(trimmed, effectivePersona);
    setPendingReasoningSteps(reasoningSteps);
    setPendingContent(content);
    setPendingFollowUps(getFollowUps(content, effectivePersona));

    // Match ReasoningBlock timing: ~32ms per char + 700ms min per step (onDone sets streamingReasoningDone)
    const contentDelay = reasoningSteps.reduce((acc, s) => acc + s.length * 32 + 700, 0) + 300;

    const t = setTimeout(() => {
      setMessages((m) =>
        m.concat({
          role: 'assistant',
          reasoningSteps: null,
          content,
          followUps: getFollowUps(content, effectivePersona),
        })
      );
      setPendingContent(null);
      setPendingFollowUps([]);
      setIsStreaming(false);
      setStreamingReasoningDone(false);
    }, contentDelay);

    return () => clearTimeout(t);
  }, [input, effectivePersona, currentChatId]);

  const handleSend = () => handleSendMessage(input);
  const handleFollowUp = (followUpText) => handleSendMessage(followUpText);

  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || isStreaming) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join(' ').trim();
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [isStreaming]);

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const personaName = effectivePersona?.name || (isAuthenticated ? user?.fullName || 'You' : 'Guest');

  const DOCK_HEIGHT_ESTIMATE = 128;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-portal-bg-section/60">
      {/* Chat history sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setSidebarOpen(false)} aria-hidden />
          <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-portal-border/80 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-portal-border/80 p-3">
              <span className="font-display text-sm font-bold text-[#161616]">Chat history</span>
              <button type="button" onClick={() => setSidebarOpen(false)} className="rounded p-1.5 text-portal-gray hover:bg-portal-bg-section hover:text-[#161616]">×</button>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-portal-blue/50 bg-portal-ai-bg/50 px-3 py-2 text-sm font-medium text-portal-blue hover:bg-portal-ai-bg"
            >
              <span>+</span> New chat
            </button>
            <div className="flex-1 overflow-y-auto p-2">
              {chatList.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => handleSelectChat(chat.id)}
                  className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    chat.id === currentChatId
                      ? 'bg-portal-ai-bg text-portal-blue font-medium'
                      : 'text-portal-gray hover:bg-portal-bg-section hover:text-[#161616]'
                  }`}
                >
                  <span className="block truncate">{chat.title || 'New chat'}</span>
                  <span className="mt-0.5 block text-[10px] text-portal-gray-muted">
                    {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </>
      )}

      {/* Premium header */}
      <div className="shrink-0 border-b border-portal-border/60 bg-white/90 px-4 py-3 backdrop-blur-md lg:px-[100px]">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-portal-border/60 bg-white px-2.5 py-1.5 text-sm font-medium text-portal-gray hover:bg-portal-bg-section hover:text-[#161616]"
              title="Chat history"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              <span className="hidden sm:inline">History</span>
            </button>
            <h1 className="font-display text-xl font-extrabold tracking-tight text-[#161616] lg:text-[22px]">
              AI Data Assistant
            </h1>
            <span className="rounded-full bg-gradient-to-r from-portal-ai-bg to-portal-blue/10 px-3 py-1 text-xs font-medium text-portal-blue-dark">
              For {personaName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleNewChat}
            className="rounded-lg border border-portal-border/60 bg-white px-3 py-1.5 text-sm font-medium text-portal-blue hover:bg-portal-ai-bg"
          >
            + New chat
          </button>
        </div>
      </div>

      {/* Chat area — only this scrolls; no page scroll */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 lg:px-12">
        <div className="mx-auto flex h-full w-full max-w-[1000px] flex-col overflow-hidden rounded-2xl border border-portal-border/80 bg-white/95 shadow-lg shadow-portal-navy/5">
          <div
            ref={scrollContainerRef}
            className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden p-6 lg:p-8"
            style={{ paddingBottom: DOCK_HEIGHT_ESTIMATE }}
          >
            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-1 flex-col items-center gap-4 py-8 text-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-portal-ai-bg/80 via-white to-portal-blue/10 shadow-inner ring-1 ring-portal-border/40">
                  <svg className="h-8 w-8 text-portal-blue/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-[#161616]">Ask about Oman&apos;s data</p>
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-portal-gray">Charts, maps, key indicators, reports. Click any prompt below to start.</p>
                </div>
                <div className="w-full max-w-3xl flex-1 overflow-y-auto rounded-xl border border-portal-border/60 bg-portal-bg-section/30 px-4 py-3">
                  <div className="flex flex-wrap justify-center gap-2">
                    {RECOMMENDED_PROMPTS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(p.query)}
                        className="rounded-full border border-portal-border/70 bg-white px-3 py-1.5 text-[11px] font-medium text-portal-blue shadow-sm transition hover:bg-portal-ai-bg hover:border-portal-blue hover:shadow"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 lg:max-w-[75%] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#a624d2] to-[#3a70d8] text-white shadow-lg shadow-purple-500/20 ring-1 ring-black/5'
                      : 'border border-portal-border/70 bg-white text-[#161616] shadow-md shadow-portal-navy/5'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-sm font-medium leading-snug">{msg.text}</p>
                  ) : (
                    <div className="space-y-3">
                      <AnswerContent content={msg.content} />
                      {msg.followUps?.length > 0 && (
                        <div className="flex flex-wrap gap-2 border-t border-portal-border/80 pt-3">
                          <span className="w-full text-xs font-semibold uppercase tracking-wider text-portal-gray">Follow-up</span>
                          {msg.followUps.map((f, j) => (
                            <button
                              key={j}
                              type="button"
                              onClick={() => handleFollowUp(f)}
                              className="rounded-full border border-portal-border-light bg-white px-3 py-1.5 text-xs font-medium text-portal-blue shadow-sm transition hover:bg-portal-bg-section hover:shadow"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-2xl border border-portal-border bg-transparent px-0 py-0 lg:max-w-[75%]">
                  {!streamingReasoningDone ? (
                    <ReasoningBlock
                      steps={pendingReasoningSteps}
                      onDone={() => setStreamingReasoningDone(true)}
                    />
                  ) : pendingContent ? (
                    <div className="rounded-2xl border border-portal-border/70 bg-white px-4 py-3 shadow-md shadow-portal-navy/5">
                      <AnswerContent content={pendingContent} />
                      {pendingFollowUps.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-portal-border pt-3">
                          <span className="w-full text-xs font-semibold uppercase tracking-wider text-portal-gray">Follow-up</span>
                          {pendingFollowUps.map((f, j) => (
                            <button key={j} type="button" disabled className="rounded-full border border-portal-border-light bg-white px-3 py-1.5 text-xs font-medium text-portal-gray">
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating dock — Siri-style AI input */}
      <div className="fixed bottom-6 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-xl relative z-[9999]">
          <div className="rounded-full border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 focus-within:bg-white/95 focus-within:shadow-[0_8px_32px_rgba(0,82,135,0.12)] focus-within:border-portal-blue/30">
            <div className="flex items-center gap-3 px-5 py-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about Oman's data or tap to speak"
                disabled={isStreaming}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-[15px] text-[#161616] placeholder:text-portal-gray/90 focus:outline-none disabled:opacity-60"
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  disabled={isStreaming}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${isListening ? 'bg-red-500/15 text-red-500 animate-pulse' : 'bg-portal-blue/10 text-portal-blue hover:bg-portal-blue/20'}`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#a624d2] to-[#3a70d8] text-white shadow-lg shadow-purple-500/25 transition hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
              >
                {isStreaming ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
