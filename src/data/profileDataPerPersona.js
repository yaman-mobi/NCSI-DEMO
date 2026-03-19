/**
 * Profile data per persona – extracted from "My profile data per persona" PDF.
 * Oman News Agency, Knoema, IMF, Times of Oman, MTCIT, NCSI data portal references.
 */

/**
 * External links – EXACT URLs extracted from PDF embedded hyperlinks.
 * Extracted via PyPDF2 from "My profile data per persona.pdf".
 * Note: Knoema is cited in PDF text but has no embedded link; data.gov.om is the portal.
 */
export const EXTERNAL_LINKS = {
  // Oman News Agency – exact article URLs from PDF
  omanNews: 'https://omannews.gov.om',
  omanNewsEn: 'https://omannews.gov.om/topics/en/80',
  omanNewsAiFoundations: 'https://omannews.gov.om/topics/en/79/show/127278',
  omanNewsCareerLabour: 'https://omannews.gov.om/topics/en/79/show/107875',
  omanNewsTourism: 'https://omannews.gov.om/topics/en/80/show/127401',
  omanNewsTourism2: 'https://omannews.gov.om/topics/en/80/show/126882',
  // data.gov.om – Oman Data Portal, exact dataset URLs from PDF
  dataGovOm: 'https://data.gov.om',
  dataGovOmHigherEducation: 'https://data.gov.om/fukxnkd/higher-education',
  dataGovOmLabourMarket: 'https://data.gov.om/byvmwhe/labour-market',
  dataGovOmTourism: 'https://data.gov.om/dedblxg/tourism',
  dataGovOmPriceIndex: 'https://data.gov.om/OMPRCINX2017/price-index',
  dataGovOmPopulation: 'https://data.gov.om/search?query=Population',
  // IMF – exact URLs from PDF
  imf: 'https://www.imf.org',
  imfOman: 'https://www.imf.org/en/countries/omn',
  imfELibrary: 'https://www.elibrary.imf.org',
  imfELibraryArticle: 'https://www.elibrary.imf.org/view/journals/002/2026/004/article-A001-en.xml',
  // Times of Oman – exact article from PDF (digital economy OMR 800M)
  timesOfOman: 'https://timesofoman.com',
  timesOfOmanDigitalEconomy: 'https://timesofoman.com/article/169319-omans-digital-economy-surges-to-omr800mn-driving-vision-2040-diversification-goals',
  // MTCIT – exact AI programme page from PDF
  mtcit: 'https://mtcit.gov.om',
  mtcitAiProgramme: 'https://mtcit.gov.om/media-4/news-announcements-11/news-85/oman-ai-digital-future-program-20242026-171',
  // Other (cited in text; Knoema has no embedded link in PDF)
  knoema: 'https://knoema.com',
  ncsiGovOm: 'https://www.ncsi.gov.om',
  portalEcensus: 'https://portal.ecensus.gov.om',
};

/** Source labels for display */
export const SOURCE_LABELS = {
  [EXTERNAL_LINKS.omanNews]: 'Oman News Agency',
  [EXTERNAL_LINKS.omanNewsEn]: 'Oman News Agency (EN)',
  [EXTERNAL_LINKS.omanNewsAiFoundations]: 'Oman News – AI foundations',
  [EXTERNAL_LINKS.omanNewsCareerLabour]: 'Oman News – Career & Labour',
  [EXTERNAL_LINKS.omanNewsTourism]: 'Oman News – Tourism',
  [EXTERNAL_LINKS.omanNewsTourism2]: 'Oman News – Tourism',
  [EXTERNAL_LINKS.dataGovOm]: 'data.gov.om',
  [EXTERNAL_LINKS.dataGovOmHigherEducation]: 'data.gov.om – Higher education',
  [EXTERNAL_LINKS.dataGovOmLabourMarket]: 'data.gov.om – Labour market',
  [EXTERNAL_LINKS.dataGovOmTourism]: 'data.gov.om – Tourism',
  [EXTERNAL_LINKS.dataGovOmPriceIndex]: 'data.gov.om – Price index',
  [EXTERNAL_LINKS.dataGovOmPopulation]: 'data.gov.om – Population',
  [EXTERNAL_LINKS.imf]: 'IMF',
  [EXTERNAL_LINKS.imfOman]: 'IMF – Oman',
  [EXTERNAL_LINKS.imfELibrary]: 'IMF eLibrary',
  [EXTERNAL_LINKS.imfELibraryArticle]: 'IMF eLibrary – Article',
  [EXTERNAL_LINKS.timesOfOman]: 'Times of Oman',
  [EXTERNAL_LINKS.timesOfOmanDigitalEconomy]: 'Times of Oman – Digital economy',
  [EXTERNAL_LINKS.mtcit]: 'MTCIT',
  [EXTERNAL_LINKS.mtcitAiProgramme]: 'MTCIT – AI programme',
  [EXTERNAL_LINKS.knoema]: 'Knoema',
  [EXTERNAL_LINKS.ncsiGovOm]: 'NCSI',
  [EXTERNAL_LINKS.portalEcensus]: 'eCensus Portal',
};

/** Trending AI Insights by persona – full content from PDF */
export const TRENDING_INSIGHTS_BY_PERSONA = {
  'University Student': [
    {
      id: 'student-ai-digital-skills',
      title: 'AI and digital skills are moving from policy to student opportunity',
      category: 'AI · Digital economy · Skills · Higher education',
      tag: 'Insight',
      age: '16 days ago',
      region: 'Education & skills',
      image: 'https://picsum.photos/seed/oman-ai-campus/800/480',
      whatThisIsAbout:
        "Oman's AI push is no longer just a government strategy story. It is becoming a skills and employability story for students, especially in fields tied to digital transformation, innovation, and future jobs. Oman News Agency reported strong national foundations for AI, while Oman's digital economy was recently reported at about OMR 800 million with growing AI investment.",
      aiPerspective:
        "This insight emerged by combining the recent AI-policy momentum with higher-education enrollment data. The signal is that student demand for AI, data, and digital courses is likely to strengthen because national investment is now visible both in policy language and in sector-scale spending. Higher-education enrollment on the data portal reached 141,277 in 2023, up 12.1% year over year.",
      linkedPhoto: 'Oman News Agency AI foundations coverage or modern Oman campus visual',
      relatedDatasetNames: ['Higher education', 'Labour market', 'Population', 'Data Portal homepage'],
      sourceLinks: [EXTERNAL_LINKS.omanNewsAiFoundations, EXTERNAL_LINKS.dataGovOmHigherEducation],
    },
    {
      id: 'student-career-fairs',
      title: 'Career fairs and vacancy announcements point to a tighter education-to-work link',
      category: 'Employability · Graduates · Labour market · Career readiness',
      tag: 'Live',
      age: '7 days ago',
      region: 'Labour market',
      image: 'https://picsum.photos/seed/squ-career-fair/800/480',
      whatThisIsAbout:
        "Recent announcements around Sultan Qaboos University's career fair and Ministry of Labour vacancies suggest a visible effort to connect students and graduates to hiring pipelines. The SQU fair was positioned around job vacancies, training, and career development, and the Labour Ministry separately announced 325 vacancies, including 136 for bachelor's holders.",
      aiPerspective:
        "The insight comes from pairing job-market announcements with labour-market data that show unemployment is not evenly distributed across age and qualification groups. For example, the portal reports 5.88% unemployment for Omani ages 25–29 in 2023, and 17.0% for Omani females with university education in 2023, which makes transition support especially important.",
      linkedPhoto: 'SQU campus or career-event image',
      relatedDatasetNames: ['Labour market unemployment', 'Higher education enrollment by gender/field', 'Population by age'],
      sourceLinks: [EXTERNAL_LINKS.omanNewsCareerLabour, EXTERNAL_LINKS.dataGovOmLabourMarket],
    },
    {
      id: 'student-tourism-hospitality',
      title: 'Tourism growth is creating a stronger case for hospitality and heritage-related study paths',
      category: 'Tourism · Heritage · Hospitality · Regional development',
      tag: 'Insight',
      age: '6–8 days ago',
      region: 'Tourism',
      image: 'https://picsum.photos/seed/sumharam-jabal-shams/800/480',
      whatThisIsAbout:
        'Oman has recently signed tourism-related development and operating agreements, including Sumharam Archaeological Park, berths for tourism and commercial purposes, and projects at Jabal Shams. Together, these point to continued tourism-sector development with implications for hospitality, events, heritage management, and destination services.',
      aiPerspective:
        "This insight came from matching current tourism investment news with the portal's tourism dataset, which tracks visitors, hotel guests, hotel revenues, and service indicators. The pattern suggests tourism is not just a sector story; it is also a skills-demand story for students choosing programs linked to tourism operations and experience design.",
      linkedPhoto: 'Sumharam or Jabal Shams tourism development coverage',
      relatedDatasetNames: ['Tourism', 'Higher education', 'Labour market'],
      sourceLinks: [EXTERNAL_LINKS.omanNewsTourism, EXTERNAL_LINKS.dataGovOmTourism],
    },
    {
      id: 'student-female-participation',
      title: 'Female participation in higher education remains a major story for the next talent wave',
      category: 'Women · Education · Inclusion · Talent pipeline',
      tag: 'Insight',
      age: 'dataset-led insight',
      region: 'Education',
      image: 'https://picsum.photos/seed/oman-campus-life/800/480',
      whatThisIsAbout:
        "Oman's higher-education data shows female enrollment at 80,764 in 2023, out of 141,277 total enrolled students, indicating women make up a substantial share of the higher-education pipeline.",
      aiPerspective:
        "This insight comes from reading enrollment and unemployment together. Female participation in higher education is strong, but labour-market data still shows elevated unemployment for Omani women with university education, so the next policy question is less about access and more about transition into work.",
      linkedPhoto: 'University-campus image representing student life in Oman',
      relatedDatasetNames: ['Higher education by gender', 'Labour market unemployment by education and gender'],
      sourceLinks: [EXTERNAL_LINKS.dataGovOmHigherEducation, EXTERNAL_LINKS.dataGovOmLabourMarket],
    },
  ],
  Economist: [
    {
      id: 'economist-2026-non-oil',
      title: "Oman's 2026 story remains one of non-oil growth plus fiscal discipline",
      category: 'GDP · Fiscal policy · Non-oil economy · Budget',
      tag: 'Insight',
      age: 'about 2 months ago',
      region: 'Macroeconomics',
      image: 'https://picsum.photos/seed/muscat-economic/800/480',
      whatThisIsAbout:
        "The IMF projects Oman's 2026 real GDP growth at 4.0% and consumer-price growth at 1.5%, while its Article IV materials describe robust nonhydrocarbon growth and continued fiscal adjustment. The 2026 budget also continues the fiscal-sustainability narrative.",
      aiPerspective:
        "This insight was derived by combining IMF macro signals with Oman's own budget framing. The key message is that Oman's macro narrative is shifting from pure hydrocarbon dependence toward a more balanced mix of non-oil activity, tax revenue, and controlled deficits.",
      linkedPhoto: 'Muscat economic skyline or port/logistics image',
      relatedDatasetNames: ['National accounts', 'Foreign trade', 'Price index', 'Electricity'],
      sourceLinks: [EXTERNAL_LINKS.imfOman, EXTERNAL_LINKS.imfELibraryArticle, EXTERNAL_LINKS.dataGovOm],
    },
    {
      id: 'economist-tax-revenue',
      title: 'Tax revenue is becoming a more visible pillar of fiscal resilience',
      category: 'Public finance · Tax · Revenue diversification · Budget',
      tag: 'Live',
      age: '41 days ago',
      region: 'Fiscal policy',
      image: 'https://picsum.photos/seed/oman-tax/800/480',
      whatThisIsAbout:
        'Oman News Agency reported that tax revenues exceeded RO 1.3 billion, underscoring the growing role of non-oil revenue streams in public finance.',
      aiPerspective:
        "The insight came from reading tax-revenue news beside the budget and IMF outlook. A stronger tax base helps Oman maintain fiscal room even when energy markets are volatile, which is exactly the kind of resilience economists watch in diversification stories.",
      linkedPhoto: 'Official economy or ministry image from the tax-revenue announcement',
      relatedDatasetNames: ['National accounts', 'Price index', 'Foreign trade'],
      sourceLinks: [EXTERNAL_LINKS.omanNews, EXTERNAL_LINKS.dataGovOm],
    },
    {
      id: 'economist-tourism-diversification',
      title: 'Tourism investment is acting like a regional diversification engine',
      category: 'Tourism · Diversification · Regional investment · Services economy',
      tag: 'Insight',
      age: '6–8 days ago',
      region: 'Tourism',
      image: 'https://picsum.photos/seed/heritage-mountain/800/480',
      whatThisIsAbout:
        'New tourism-related projects and operating licenses, including developments at Sumharam and Jabal Shams, signal that tourism remains one of the most visible channels through which Oman is diversifying growth beyond hydrocarbons.',
      aiPerspective:
        "This came from linking project announcements to the tourism dataset, which contains visitor and hotel-service indicators. The economic reading is that tourism investment is not just about arrivals; it supports jobs, local services, transport demand, and regional spending spillovers.",
      linkedPhoto: 'Heritage-site or mountain-tourism image from official coverage',
      relatedDatasetNames: ['Tourism', 'Labour market', 'Foreign trade', 'Population by governorate'],
      sourceLinks: [EXTERNAL_LINKS.omanNewsTourism, EXTERNAL_LINKS.dataGovOmTourism],
    },
    {
      id: 'economist-digital-economy',
      title: 'Digital economy scaling is now large enough to track as a macro diversification signal',
      category: 'Digital economy · AI investment · Productivity · Vision 2040',
      tag: 'Insight',
      age: 'recent media reporting',
      region: 'Digital economy',
      image: 'https://picsum.photos/seed/oman-ai-digital/800/480',
      whatThisIsAbout:
        "Reporting that Oman's digital economy has reached roughly OMR 800 million, alongside national AI initiatives, suggests digital activity is moving into a scale that economists can watch as part of structural transformation.",
      aiPerspective:
        "This insight came from connecting the digital-economy story to Oman Vision 2040 themes and the open-data ecosystem. Even if the data portal does not yet expose a single 'digital economy' time series, related datasets in labour, education, trade, and business activity can be used as proxy indicators of digital adoption and diversification.",
      linkedPhoto: 'AI / digital transformation visual from official AI programme coverage',
      relatedDatasetNames: ['Labour market', 'Higher education', 'Foreign trade', 'Population'],
      sourceLinks: [EXTERNAL_LINKS.timesOfOmanDigitalEconomy, EXTERNAL_LINKS.mtcitAiProgramme, EXTERNAL_LINKS.dataGovOm],
    },
  ],
  'Data Analyst': [
    {
      id: 'analyst-inflation-cpi',
      title: 'Inflation is low overall, but category-level movement still matters',
      category: 'CPI · Inflation · Consumer prices · Price monitoring',
      tag: 'Insight',
      age: 'macro context current; portal values latest visible point 2023',
      region: 'Prices & inflation',
      image: 'https://picsum.photos/seed/oman-market/800/480',
      whatThisIsAbout:
        "Oman's inflation outlook remains relatively contained, with the IMF projecting 1.5% consumer-price growth in 2026, while Oman's CPI dataset shows the all-items index at 111.10 in December 2023 and the food index at 114.50 in December 2023.",
      aiPerspective:
        "The insight came from comparing the macro inflation outlook with the portal's more granular CPI series. For analysts, the opportunity is to move beyond headline inflation and watch which baskets are stickier or more volatile than the national average.",
      linkedPhoto: 'Market or consumer-prices image from official economy coverage',
      relatedDatasetNames: ['Price Index overall CPI', 'Price Index food CPI'],
      sourceLinks: [EXTERNAL_LINKS.imfOman, EXTERNAL_LINKS.dataGovOmPriceIndex],
    },
    {
      id: 'analyst-graduate-employment',
      title: 'Graduate employment analysis should be segmented, not averaged',
      category: 'Unemployment · Youth · Graduates · Segmentation',
      tag: 'Live',
      age: '7 days ago plus latest portal data',
      region: 'Labour market',
      image: 'https://picsum.photos/seed/graduate-career/800/480',
      whatThisIsAbout:
        "Recent job and career announcements are useful, but the labour dataset shows why analysts should not rely on a single unemployment headline. Omani male unemployment ages 18–24 was 11.38% in 2023, Omani ages 25–29 stood at 5.88%, and Omani females with university education were at 17.0%.",
      aiPerspective:
        "This insight arose from comparing policy announcements with disaggregated labour data. The dataset clearly suggests that age, gender, and qualification segmentation explains more than the top-line rate alone.",
      linkedPhoto: 'University-career fair image or graduate event image',
      relatedDatasetNames: ['Labour market unemployment by age/gender/education', 'Higher education enrollment by gender'],
      sourceLinks: [EXTERNAL_LINKS.omanNewsCareerLabour, EXTERNAL_LINKS.dataGovOmLabourMarket],
    },
    {
      id: 'analyst-tourism-dashboard',
      title: 'Tourism projects need a dashboard that joins project news to visitor and hotel metrics',
      category: 'Tourism analytics · Regional dashboards · Visitors · Hotels',
      tag: 'Insight',
      age: '6–8 days ago',
      region: 'Tourism',
      image: 'https://picsum.photos/seed/tourism-development/800/480',
      whatThisIsAbout:
        'Oman has multiple new tourism projects and operating agreements underway, but the real analytics value comes from tying them to measurable outcomes such as visitor counts, guest mix, hotel revenues, and service usage. The tourism dataset explicitly includes visitors by location/category and hotel-service indicators.',
      aiPerspective:
        "This insight came from spotting a natural join between policy/news events and portal data structure. A data analyst can turn isolated news items into a monitoring product by watching whether project locations later show movement in visitation, room demand, or guest nationality mix.",
      linkedPhoto: 'Official image from the tourism development article',
      relatedDatasetNames: ['Tourism', 'Population', 'Labour market'],
      sourceLinks: [EXTERNAL_LINKS.omanNewsTourism, EXTERNAL_LINKS.dataGovOmTourism],
    },
    {
      id: 'analyst-open-data-ai',
      title: 'Open data plus AI makes Oman a strong candidate for portal-driven analytics products',
      category: 'Open data · AI · Data products · Analytics enablement',
      tag: 'Insight',
      age: 'current platform context; AI foundations article 16 days ago',
      region: 'Open data',
      image: 'https://picsum.photos/seed/oman-data-ai/800/480',
      whatThisIsAbout:
        "Oman's data portal is positioned as a free public platform for citizens, investors, researchers, and developers, and recent official coverage says the country has strong foundations for AI. That combination is important because it supports self-service analytics, portal storytelling, and applied AI summaries on top of public data.",
      aiPerspective:
        "This insight came from the coexistence of two signals: a broad, multi-topic open-data portal and active national AI policy momentum. For analysts, that means the next step is not just publishing datasets, but packaging them into persona-based narratives, anomaly flags, and trend explainers.",
      linkedPhoto: 'Data/AI themed visual from AI foundations or national AI programme coverage',
      relatedDatasetNames: ['Data Portal topic catalog', 'Price Index', 'Labour market', 'Higher education', 'Foreign trade', 'Tourism'],
      sourceLinks: [EXTERNAL_LINKS.dataGovOm, EXTERNAL_LINKS.omanNewsAiFoundations],
    },
  ],
  Statistician: [
    {
      id: 'stat-cross-domain',
      title: 'The strongest public-data story is no longer volume alone, but how well domains can be connected',
      category: 'Open data · Statistical system · Metadata · Integration',
      tag: 'Insight',
      age: 'current platform context',
      region: 'Statistical system',
      image: 'https://picsum.photos/seed/oman-portal/800/480',
      whatThisIsAbout:
        "Oman's portal spans multiple domains including population, national accounts, housing, security, electricity, labour, tourism, prices, and education. That breadth makes cross-domain analysis increasingly possible.",
      aiPerspective:
        "This insight came from looking at the portal as a statistical system, not just a website. The opportunity is to connect datasets by shared dimensions such as time, region, gender, age, sector, or nationality, which is where higher-value statistical storytelling begins.",
      linkedPhoto: 'General Oman data-portal or national institutions image',
      relatedDatasetNames: ['Population', 'Labour market', 'Higher education', 'Tourism', 'Price Index', 'Foreign trade', 'Electricity'],
      sourceLinks: [EXTERNAL_LINKS.dataGovOm],
    },
    {
      id: 'stat-gender-education',
      title: 'Gender and education remain essential disaggregation variables, not optional cuts',
      category: 'Gender statistics · Education statistics · Labour statistics',
      tag: 'Insight',
      age: 'dataset-led insight',
      region: 'Labour & education',
      image: 'https://picsum.photos/seed/oman-campus/800/480',
      whatThisIsAbout:
        'Female higher-education enrollment was 80,764 in 2023, and labour data also exposes a distinct unemployment profile for Omani women with university education. That makes gender-by-education cross-tabulation central to interpretation.',
      aiPerspective:
        "This insight emerged from comparing two statistical domains that are often published separately. A statistician would read this as a classic case for harmonized classification and disaggregated reporting rather than relying on national averages.",
      linkedPhoto: 'Campus or student-life image representing higher education in Oman',
      relatedDatasetNames: ['Higher education by gender', 'Labour market by education and gender'],
      sourceLinks: [EXTERNAL_LINKS.dataGovOmHigherEducation, EXTERNAL_LINKS.dataGovOmLabourMarket],
    },
    {
      id: 'stat-cpi-basket',
      title: 'Price statistics should be interpreted at basket level, not only through the all-items headline',
      category: 'CPI methodology · Basket analysis · Inflation measurement',
      tag: 'Insight',
      age: 'dataset-led insight with current macro relevance',
      region: 'Prices',
      image: 'https://picsum.photos/seed/oman-retail/800/480',
      whatThisIsAbout:
        "Oman's all-items CPI and food CPI do not move identically, which reinforces the value of category-level measurement. The portal reports the all-items CPI at 111.10 and food CPI at 114.50 for December 2023.",
      aiPerspective:
        "This insight comes from a basic but important statistical principle: the aggregate index can hide variation inside the basket. In portal terms, this supports drill-down views, contribution charts, and category-level change analysis rather than only one national trend line.",
      linkedPhoto: 'Economy or retail-market image aligned to price statistics',
      relatedDatasetNames: ['Price Index all-items CPI', 'Price Index food CPI'],
      sourceLinks: [EXTERNAL_LINKS.dataGovOmPriceIndex, EXTERNAL_LINKS.omanNews],
    },
    {
      id: 'stat-regional-tourism',
      title: 'Regional tourism and infrastructure announcements create a natural test case for before/after statistical monitoring',
      category: 'Regional statistics · Tourism statistics · Impact measurement',
      tag: 'Insight',
      age: '6–8 days ago',
      region: 'Regional statistics',
      image: 'https://picsum.photos/seed/tourism-project/800/480',
      whatThisIsAbout:
        'New tourism projects in locations such as Sumharam and Jabal Shams are ideal cases for place-based monitoring. They create a clean statistical question: do visitor counts, hotel usage, employment, or nearby service indicators shift after the intervention?',
      aiPerspective:
        "This insight came from combining news events with the portal's tourism structure. For statisticians, these are opportunities to design pre/post comparisons, location benchmarks, and regional panels rather than treating project announcements as stand-alone facts.",
      linkedPhoto: 'Official tourism-development article image',
      relatedDatasetNames: ['Tourism', 'Population', 'Labour market', 'Electricity'],
      sourceLinks: [EXTERNAL_LINKS.omanNewsTourism, EXTERNAL_LINKS.dataGovOmTourism],
    },
  ],
};

/** "For You" datasets by persona – from PDF. Some include optional image for card display. */
export const FOR_YOU_DATASETS_BY_PERSONA = {
  'University Student': [
    { id: 'higher-education-enrollment', title: 'Higher Education Enrollment Trends', tags: ['education', 'students', 'gender'], whyRelevant: 'Understand popular majors and competition levels', image: 'https://picsum.photos/seed/oman-campus/180/100' },
    { id: 'graduates-by-field', title: 'Graduates by Field of Study', tags: ['education', 'skills'], whyRelevant: 'Identify high-demand vs saturated fields' },
    { id: 'student-to-employment-transition', title: 'Graduate Employment Outcomes', tags: ['employment', 'graduates'], whyRelevant: 'See which degrees lead to jobs' },
    { id: 'labour-market-youth', title: 'Youth Unemployment Rates', tags: ['youth', 'labour'], whyRelevant: 'Understand job market difficulty for young people' },
    { id: 'tourism-sector-opportunities', title: 'Tourism Sector Activity', tags: ['tourism', 'jobs'], whyRelevant: 'Explore growing career sectors', image: 'https://picsum.photos/seed/oman-tourism/180/100' },
    { id: 'digital-economy-indicators', title: 'Digital Economy & ICT Indicators', tags: ['technology', 'ai'], whyRelevant: 'Align with future tech careers', image: 'https://picsum.photos/seed/digital-ai/180/100' },
    { id: 'population-youth', title: 'Youth Population Distribution', tags: ['population', 'youth'], whyRelevant: 'Understand competition and demographics' },
    { id: 'female-education-participation', title: 'Female Participation in Higher Education', tags: ['gender', 'education'], whyRelevant: 'Track gender trends in education' },
    { id: 'scholarships-programs', title: 'Scholarships & Education Programs', tags: ['education', 'funding'], whyRelevant: 'Discover funding opportunities' },
    { id: 'internships-training', title: 'Internship & Training Opportunities', tags: ['training', 'skills'], whyRelevant: 'Bridge gap between study and employment' },
  ],
  Economist: [
    { id: 'gdp-sector-breakdown', title: 'GDP by Economic Sector', tags: ['gdp', 'economy'], whyRelevant: 'Track diversification beyond oil', image: 'https://picsum.photos/seed/gdp-economy/180/100' },
    { id: 'oil-production-prices', title: 'Oil Production & Prices', tags: ['oil', 'energy'], whyRelevant: "Core driver of Oman's economy", image: 'https://picsum.photos/seed/oil-energy/180/100' },
    { id: 'government-revenue', title: 'Government Revenue & Taxes', tags: ['fiscal', 'budget'], whyRelevant: 'Assess fiscal sustainability' },
    { id: 'public-expenditure', title: 'Government Expenditure', tags: ['spending', 'budget'], whyRelevant: 'Understand public spending priorities' },
    { id: 'foreign-direct-investment', title: 'Foreign Direct Investment (FDI)', tags: ['investment', 'fdi'], whyRelevant: 'Measure investment attractiveness' },
    { id: 'balance-of-payments', title: 'Balance of Payments', tags: ['trade', 'external'], whyRelevant: 'Track trade and capital flows' },
    { id: 'inflation-cpi', title: 'Consumer Price Index (CPI)', tags: ['inflation'], whyRelevant: 'Monitor cost of living' },
    { id: 'labour-market-overview', title: 'Labour Market Overview', tags: ['employment'], whyRelevant: 'Understand workforce dynamics' },
    { id: 'tourism-economic-impact', title: 'Tourism Economic Contribution', tags: ['tourism', 'services'], whyRelevant: 'Key diversification sector', image: 'https://picsum.photos/seed/tourism-oman/180/100' },
    { id: 'trade-by-country', title: 'Foreign Trade by Country', tags: ['exports', 'imports'], whyRelevant: 'Analyze global trade relations' },
    { id: 'industrial-production', title: 'Industrial Production Index', tags: ['industry'], whyRelevant: 'Track economic activity trends' },
  ],
  'Data Analyst': [
    { id: 'cpi-detailed', title: 'Consumer Price Index (Detailed)', tags: ['cpi', 'inflation'], whyRelevant: 'Build inflation dashboards', image: 'https://picsum.photos/seed/market-cpi/180/100' },
    { id: 'labour-segmentation', title: 'Labour Market Segmentation', tags: ['labour', 'segmentation'], whyRelevant: 'Enable deep slicing analysis' },
    { id: 'tourism-kpis', title: 'Tourism KPIs', tags: ['tourism', 'kpi'], whyRelevant: 'Track performance metrics', image: 'https://picsum.photos/seed/tourism-kpi/180/100' },
    { id: 'trade-flows', title: 'Trade Flows by Commodity', tags: ['trade', 'exports'], whyRelevant: 'Analyze trade patterns' },
    { id: 'population-by-region', title: 'Population by Governorate', tags: ['population', 'regional'], whyRelevant: 'Geo-based dashboards', image: 'https://picsum.photos/seed/oman-map/180/100' },
    { id: 'education-by-gender', title: 'Education by Gender', tags: ['education', 'gender'], whyRelevant: 'Segmentation analysis' },
    { id: 'employment-by-sector', title: 'Employment by Sector', tags: ['employment', 'sector'], whyRelevant: 'Workforce distribution insights' },
    { id: 'energy-consumption', title: 'Energy Consumption', tags: ['energy'], whyRelevant: 'Track infrastructure demand' },
    { id: 'housing-statistics', title: 'Housing & Real Estate Indicators', tags: ['housing'], whyRelevant: 'Urban and planning analysis' },
    { id: 'transportation-data', title: 'Transport & Mobility Data', tags: ['transport'], whyRelevant: 'Mobility and accessibility insights' },
    { id: 'api-dataset-catalog', title: 'Open Data API Catalog', tags: ['api', 'metadata'], whyRelevant: 'Build automated pipelines' },
  ],
  Statistician: [
    { id: 'population-demographics', title: 'Population Demographics', tags: ['population'], whyRelevant: 'Base for all statistical analysis', image: 'https://picsum.photos/seed/population-stats/180/100' },
    { id: 'household-surveys', title: 'Household Surveys', tags: ['household'], whyRelevant: 'Socioeconomic indicators' },
    { id: 'labour-force-survey', title: 'Labour Force Survey', tags: ['labour'], whyRelevant: 'Official employment statistics' },
    { id: 'education-statistics', title: 'Education Statistics', tags: ['education'], whyRelevant: 'Human capital analysis' },
    { id: 'price-index-basket', title: 'CPI Basket Structure', tags: ['cpi'], whyRelevant: 'Understand inflation methodology' },
    { id: 'national-accounts', title: 'National Accounts', tags: ['gdp'], whyRelevant: 'Macroeconomic framework', image: 'https://picsum.photos/seed/national-accounts/180/100' },
    { id: 'regional-indicators', title: 'Regional Indicators', tags: ['regional'], whyRelevant: 'Spatial analysis' },
    { id: 'health-statistics', title: 'Health Statistics', tags: ['health'], whyRelevant: 'Population well-being analysis', image: 'https://picsum.photos/seed/health-stats/180/100' },
    { id: 'crime-security', title: 'Crime & Security Statistics', tags: ['security'], whyRelevant: 'Social indicators' },
    { id: 'environmental-data', title: 'Environmental Indicators', tags: ['environment'], whyRelevant: 'Sustainability analysis' },
    { id: 'time-series-archive', title: 'Time Series Data Archive', tags: ['time-series'], whyRelevant: 'Long-term trend analysis' },
  ],
};

/** Trending datasets for all personas – from PDF */
export const TRENDING_DATASETS_FOR_ALL = [
  { id: 'oil-prices', title: 'Oil Prices & Energy Indicators', tags: ['oil', 'energy'], clickTrend: 'Very High' },
  { id: 'cpi-oman', title: 'Consumer Price Index – Oman', tags: ['inflation'], clickTrend: 'Very High' },
  { id: 'duqm-investment', title: 'Duqm SEZ Investment Data', tags: ['investment'], clickTrend: 'High' },
  { id: 'tourism-revenue', title: 'Tourism Revenue Dashboard', tags: ['tourism'], clickTrend: 'High' },
  { id: 'labour-market', title: 'Labour Market Overview', tags: ['employment'], clickTrend: 'High' },
  { id: 'foreign-trade', title: 'Foreign Trade Statistics', tags: ['trade'], clickTrend: 'High' },
];

const ROLE_ALIAS = { 'Economic Analyst': 'Economist' }; // both map to Economist data

/** Get insights for a persona; fallback to Economist if persona not in map */
export function getInsightsForPersona(role) {
  const key = ROLE_ALIAS[role] || role || 'Economist';
  return TRENDING_INSIGHTS_BY_PERSONA[key] || TRENDING_INSIGHTS_BY_PERSONA['Economist'] || [];
}

/** Get "For You" datasets for a persona */
export function getForYouDatasetsForPersona(role) {
  const key = ROLE_ALIAS[role] || role || 'Economist';
  return FOR_YOU_DATASETS_BY_PERSONA[key] || FOR_YOU_DATASETS_BY_PERSONA['Economist'] || [];
}
