import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AlertsPanel from '../components/AlertsPanel';
import AIInsightsWidget from '../components/AIInsightsWidget';
import { useAuth } from '../context/AuthContext';
import { usePersona } from '../context/PersonaContext';
import { getTrendingInsightsForPersona } from '../data/trendingInsights';
import { getForYouDatasetsForPersona } from '../data/profileDataPerPersona';
import { profileToPersona } from '../lib/personaUtils';
import { MOCK_DATASETS, TRENDING_DATASETS_FOR_ALL } from '../data/omanMockData';
import UpperBar from '../components/UpperBar';
import PreferencesDialog from '../components/PreferencesDialog';

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const MOCK_REPORT_OVERVIEW = {
  datasets: 6,
  news: 6,
  totalItems: 12,
};

const MOCK_FEED_ITEMS = [
  {
    id: 'feed-1',
    type: 'dataset',
    title: 'Oil Prices & Energy Indicators',
    subtitle: 'Oil production, prices, energy sector. Core driver of Oman economy. Knoema.',
    age: '2d ago',
    location: 'Muscat',
    tags: ['oil', 'energy'],
    badge: 'Dataset',
    tone: 'economy',
    image: 'https://picsum.photos/seed/oil-exports/180/100',
  },
  {
    id: 'feed-2',
    type: 'news',
    title: 'Oman AI foundations: Strong national push – Oman News Agency',
    subtitle:
      'Oman News Agency reported strong national foundations for AI. Digital economy at OMR 800M with growing AI investment.',
    age: '16d ago',
    location: 'Muscat',
    tags: ['AI', 'digital-economy'],
    badge: 'News',
    tone: 'trade',
    image: 'https://picsum.photos/seed/oman-port/180/100',
  },
  {
    id: 'feed-3',
    type: 'dataset',
    title: 'IMF Oman 2026: GDP 4.0%, CPI 1.5% – Non-oil growth',
    subtitle: 'IMF projects real GDP growth at 4.0%, consumer-price growth at 1.5%. Fiscal adjustment. IMF eLibrary.',
    age: '2mo ago',
    location: 'Muscat',
    tags: ['IMF', 'gdp', 'fiscal'],
    badge: 'Dataset',
    tone: 'economy',
    image: 'https://picsum.photos/seed/gdp-growth/180/100',
  },
  {
    id: 'feed-4',
    type: 'news',
    title: 'Oman tax revenues exceed RO 1.3 billion – Oman News Agency',
    subtitle:
      'Tax revenues underscore growing role of non-oil revenue streams in public finance. Fiscal resilience.',
    age: '41d ago',
    location: 'Muscat',
    tags: ['tax', 'fiscal'],
    badge: 'News',
    tone: 'economy',
    image: 'https://picsum.photos/seed/diplomacy/180/100',
  },
  {
    id: 'feed-5',
    type: 'dataset',
    title: 'Higher Education Enrollment – 141,277 in 2023, +12.1% YoY',
    subtitle: 'Female enrollment 80,764. Knoema. Student demand for AI, data, digital courses.',
    age: '7d ago',
    location: 'Muscat',
    tags: ['education', 'Knoema'],
    badge: 'Dataset',
    tone: 'education',
    image: 'https://picsum.photos/seed/fdi-investment/180/100',
  },
  {
    id: 'feed-6',
    type: 'news',
    title: 'Sumharam & Jabal Shams tourism projects – Oman News',
    subtitle: 'Tourism development and operating agreements. Heritage, hospitality, destination services.',
    age: '6–8d ago',
    location: 'Salalah',
    tags: ['tourism', 'heritage'],
    badge: 'News',
    tone: 'tourism',
    image: 'https://picsum.photos/seed/oman-tourism/180/100',
  },
  {
    id: 'feed-7',
    type: 'news',
    title: 'SQU Career Fair & Ministry of Labour – 325 vacancies',
    subtitle:
      '136 for bachelor’s holders. Career development, training. Education-to-work link. Oman News.',
    age: '7d ago',
    location: 'Muscat',
    tags: ['career', 'labour', 'graduates'],
    badge: 'News',
    tone: 'economy',
    image: 'https://picsum.photos/seed/duqm-port/180/100',
  },
  {
    id: 'feed-8',
    type: 'dataset',
    title: 'Consumer Price Index – Oman (all-items 111.10, food 114.50 Dec 2023)',
    subtitle: 'CPI by basket. IMF projects 1.5% in 2026. Category-level movement matters. Knoema.',
    age: '6d ago',
    location: 'Muscat',
    tags: ['CPI', 'inflation'],
    badge: 'Dataset',
    tone: 'prices',
    image: 'https://picsum.photos/seed/cpi-salalah/180/100',
  },
  {
    id: 'feed-9',
    type: 'news',
    title: 'Oman digital economy at OMR 800M – Times of Oman',
    subtitle:
      'National AI initiatives. Digital activity scaling for structural transformation. MTCIT.',
    age: '6d ago',
    location: 'Muscat',
    tags: ['digital-economy', 'AI'],
    badge: 'News',
    tone: 'energy',
    image: 'https://picsum.photos/seed/oil-prices/180/100',
  },
  {
    id: 'feed-10',
    type: 'dataset',
    title: 'Labour market: Unemployment 5.88% (25–29), 17% females with university',
    subtitle:
      'Segmented data. Age, gender, qualification. Knoema. Graduate employment analysis.',
    age: '6d ago',
    location: 'Muscat',
    tags: ['labour', 'unemployment'],
    badge: 'Dataset',
    tone: 'labour',
    image: 'https://picsum.photos/seed/food-security/180/100',
  },
];

export default function LoggedInHomePage() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { currentPersona } = usePersona();
  const greeting = getTimeGreeting();

  const effectivePersona = isAuthenticated && profile ? profileToPersona(profile) : currentPersona;
  const forYouDatasets = effectivePersona ? getForYouDatasetsForPersona(effectivePersona.role) : [];

  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const role = profile?.role_occupation || currentPersona?.role || 'NCSI Smart Portal user';
  const region = profile?.region || currentPersona?.region;
  const interests = profile?.interests?.length ? profile.interests : currentPersona?.interests || [];

  const primaryInterest = interests[0] || 'International Trade';

  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState('forYou'); // 'forYou' | 'trending'
  const [forYouPage, setForYouPage] = useState(1);

  const forYouPageSize = 5;
  const forYouTotalPages = Math.max(1, Math.ceil(forYouDatasets.length / forYouPageSize));
  const pagedForYouDatasets = forYouDatasets.slice((forYouPage - 1) * forYouPageSize, forYouPage * forYouPageSize);

  useEffect(() => {
    setForYouPage(1);
  }, [effectivePersona?.role]);

  const getRelatedDatasetsForInsight = (insight) => {
    if (!insight.relatedDatasetIds) return [];
    return insight.relatedDatasetIds
      .map((id) => MOCK_DATASETS.find((d) => d.id === id))
      .filter(Boolean)
      .slice(0, 3);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-stretch bg-white">
      <UpperBar />
      <TopBar />
      <main id="main-content" className="flex-1 bg-portal-bg-section/40" role="main">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 md:px-6 lg:px-0 lg:py-8">
          {/* Hero header: greeting */}
          <section className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-portal-navy to-portal-blue px-6 py-4 text-white shadow-md">
            <div>
              <p className="text-xs font-medium text-white/80">
                {role} · {region || 'Oman'}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-[-0.5px]">
                {greeting}, {firstName}
              </h1>
              <p className="mt-1 text-sm text-white/90">
                Your AI feed is tailored to your role, region, and interests.
              </p>
            </div>
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setPreferencesOpen(true)}
                className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                Preferences
              </button>
              <PreferencesDialog open={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
            </div>
          </section>

          {/* Trending AI insights */}
          <section className="space-y-3 rounded-2xl bg-transparent">
            <div className="rounded-3xl border border-portal-border bg-white/95 p-4 shadow-md shadow-portal-navy/10">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-portal-ai-bg">
                      <svg className="h-4 w-4 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </span>
                    <h2 className="font-display text-base font-bold tracking-[-0.2px] text-portal-navy">
                      Trending AI Insights
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-portal-gray">
                    Automatically surfaced topics based on your profile and recent events.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-portal-gray-muted">4 topics tracked</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                    Live
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
                {getTrendingInsightsForPersona(currentPersona || (profile ? { role: profile.role_occupation } : null)).map((item) => {
                  const related = getRelatedDatasetsForInsight(item);
                  return (
                    <Link
                      key={item.id}
                      to={`/insights/${item.id}`}
                      className="group flex min-h-[150px] w-[280px] flex-col overflow-hidden rounded-2xl border border-portal-border-light bg-white text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:border-portal-blue/60 hover:shadow-lg"
                    >
                      <div className="flex flex-1 items-stretch p-3.5 gap-3">
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1 text-[10px] text-portal-gray-muted">
                              <span className="h-1.5 w-1.5 rounded-full bg-portal-blue" />
                              <span className="truncate">
                                {item.category}
                              </span>
                            </div>
                            <h3 className="mt-2 font-display text-sm font-semibold leading-snug text-portal-navy">
                              {item.title}
                            </h3>
                          </div>
                          <span className="mt-2 text-[11px] text-portal-gray-muted">{item.age}</span>
                        </div>
                        <div className="relative h-[72px] w-[96px] flex-shrink-0 overflow-hidden rounded-lg bg-portal-bg-section">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Your interests */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs text-portal-gray">Your interests:</span>
              <span className="inline-flex items-center rounded-full bg-portal-bg-section px-3 py-1 text-xs font-medium text-portal-blue">
                {primaryInterest}
              </span>
            </div>
          </section>

          {/* Tabs + main layout */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            {/* Left column: feed */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex items-center gap-4 border-b border-portal-border-light px-1 pb-2 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveFeedTab('forYou')}
                  className={`relative pb-1 ${activeFeedTab === 'forYou' ? 'font-medium text-portal-navy after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-portal-blue' : 'text-portal-gray hover:text-portal-navy'}`}
                >
                  For You
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFeedTab('trending')}
                  className={`relative pb-1 ${activeFeedTab === 'trending' ? 'font-medium text-portal-navy after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-portal-blue' : 'text-portal-gray hover:text-portal-navy'}`}
                >
                  Trending
                </button>
              </div>

              {/* Explore datasets banner */}
              <div className="flex items-center justify-between rounded-2xl border border-portal-border bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-portal-bg-section">
                    <svg className="h-4 w-4 text-portal-blue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 5h18v4H3V5zm0 5h18v9H3v-9zm2 2v5h14v-5H5z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-portal-gray-muted">
                      Explore all datasets
                    </p>
                    <p className="mt-1 text-sm text-portal-gray">
                      Jump into curated datasets and reports aligned with your role.
                    </p>
                  </div>
                </div>
                <a
                  href="https://realsoftapps.com/RealDataPortal_Demo/home/indicator"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-portal-blue px-4 py-2 text-xs font-semibold text-white shadow hover:bg-portal-blue-dark"
                >
                  Browse Datasets
                </a>
              </div>

              {/* Feed cards – For You (persona-specific) or Trending (PDF TRENDING DATASETS FOR ALL) */}
              <div className="space-y-3">
                {activeFeedTab === 'forYou' ? (
                  forYouDatasets.length > 0 ? (
                    pagedForYouDatasets.map((d) => (
                      <Link
                        key={d.id}
                        to={`/datasets?q=${encodeURIComponent(d.title)}`}
                        className="flex rounded-2xl border border-portal-border bg-white shadow-sm transition-all hover:border-portal-blue/50 hover:shadow-md"
                      >
                        <div className="flex w-32 shrink-0 flex-col justify-center rounded-l-2xl bg-gradient-to-b from-portal-bg-section via-portal-bg-section to-portal-bg-section p-3">
                          <span className="inline-flex items-center rounded-full bg-portal-navy px-2 py-0.5 text-[10px] font-semibold text-white">
                            For you
                          </span>
                          <div className="mt-2 flex h-[64px] items-center justify-center overflow-hidden rounded-lg border border-portal-border-light bg-white">
                            {d.image ? (
                              <img src={d.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <svg className="h-8 w-8 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-3">
                          <div className="flex items-center justify-between gap-2 text-[11px] text-portal-gray-muted">
                            <span>Curated for {effectivePersona?.name || effectivePersona?.role || 'your role'}</span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-portal-blue">
                              Explore <span aria-hidden>↗</span>
                            </span>
                          </div>
                          <div className="mt-1">
                            <h3 className="font-display text-sm font-semibold leading-snug text-portal-navy">{d.title}</h3>
                            <p className="mt-1 text-xs text-portal-gray line-clamp-2">{d.whyRelevant}</p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(d.tags || []).map((tag) => (
                              <span key={tag} className="rounded-full bg-portal-bg-section px-2 py-0.5 text-[10px] font-medium text-portal-gray">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-portal-border bg-white p-8 text-center">
                      <p className="text-portal-gray">Select a role in Preferences to see your personalized datasets.</p>
                      <button
                        type="button"
                        onClick={() => setPreferencesOpen(true)}
                        className="mt-3 rounded-full bg-portal-blue px-4 py-2 text-sm font-medium text-white hover:bg-portal-blue-dark"
                      >
                        Open Preferences
                      </button>
                    </div>
                  )
                ) : (
                  TRENDING_DATASETS_FOR_ALL.map((d) => (
                    <Link
                      key={d.id}
                      to="/datasets"
                      className="flex rounded-2xl border border-portal-border bg-white shadow-sm transition-all hover:border-portal-blue/50 hover:shadow-md"
                    >
                      <div className="flex w-32 shrink-0 flex-col justify-center rounded-l-2xl bg-gradient-to-b from-portal-bg-section via-portal-bg-section to-portal-bg-section p-3">
                        <span className="inline-flex items-center rounded-full bg-portal-navy px-2 py-0.5 text-[10px] font-semibold text-white">
                          Dataset
                        </span>
                        <div className="mt-2 flex h-[64px] items-center justify-center rounded-lg border border-portal-border-light bg-white">
                          <svg className="h-8 w-8 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-3">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-portal-gray-muted">
                          <span>Trending across all users</span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {d.clickTrend}
                          </span>
                        </div>
                        <div className="mt-1">
                          <h3 className="font-display text-sm font-semibold leading-snug text-portal-navy">{d.title}</h3>
                          <p className="mt-1 text-xs text-portal-gray line-clamp-2">
                            Most popular datasets by click volume. From PDF profile data.
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {d.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-portal-bg-section px-2 py-0.5 text-[10px] font-medium text-portal-gray">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
                {activeFeedTab === 'forYou' && forYouDatasets.length > 0 && forYouTotalPages > 1 && (
                  <div className="mt-3 flex items-center justify-between px-1 text-xs text-portal-gray">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForYouPage((p) => Math.max(1, p - 1))}
                        disabled={forYouPage === 1}
                        className="rounded-full border border-portal-border bg-white px-3 py-1 font-medium hover:bg-portal-bg-section disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setForYouPage((p) => Math.min(forYouTotalPages, p + 1))}
                        disabled={forYouPage === forYouTotalPages}
                        className="rounded-full border border-portal-border bg-white px-3 py-1 font-medium hover:bg-portal-bg-section disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                    <span>
                      Page {forYouPage} of {forYouTotalPages}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: My Reports + Overview */}
            <div className="space-y-4">
              <section className="rounded-2xl border border-portal-border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-portal-bg-section">
                      <svg className="h-4 w-4 text-portal-blue" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                    </span>
                    <div>
                      <h2 className="font-display text-sm font-bold tracking-[-0.2px] text-portal-navy">
                        My Reports
                      </h2>
                      <p className="mt-1 text-xs text-portal-gray">
                        Continue or create a new report.
                      </p>
                    </div>
                  </div>
                  <AlertsPanel variant="light" />
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/report/new')}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-portal-blue to-portal-blue-dark px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95"
                >
                  + Create Report
                </button>
                <div className="mt-3 rounded-lg border border-portal-border-light bg-portal-bg-section/60 px-3 py-2 text-xs text-portal-gray">
                  <p className="font-medium text-portal-navy">Untitled Report</p>
                  <p className="mt-0.5 text-[11px] text-portal-gray-muted">Created 10m ago</p>
                </div>
              </section>

              <section className="rounded-2xl border border-portal-border bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-portal-bg-section">
                    <svg className="h-4 w-4 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3v18h18M7 15l4-6 3 4 4-8"
                      />
                    </svg>
                  </span>
                  <h2 className="font-display text-sm font-bold tracking-[-0.2px] text-portal-navy">
                    Overview
                  </h2>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="rounded-xl bg-portal-bg-section/70 px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-portal-gray-muted">
                      Datasets
                    </p>
                    <p className="mt-1 text-lg font-display font-bold text-portal-navy">
                      {MOCK_REPORT_OVERVIEW.datasets}
                    </p>
                  </div>
                  <div className="rounded-xl bg-portal-bg-section/70 px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-portal-gray-muted">
                      News
                    </p>
                    <p className="mt-1 text-lg font-display font-bold text-portal-navy">
                      {MOCK_REPORT_OVERVIEW.news}
                    </p>
                  </div>
                  <div className="rounded-xl bg-portal-bg-section/70 px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-portal-gray-muted">
                      Matches
                    </p>
                    <p className="mt-1 text-lg font-display font-bold text-portal-navy">
                      {MOCK_REPORT_OVERVIEW.totalItems}
                    </p>
                  </div>
                  <div className="rounded-xl bg-portal-bg-section/70 px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-portal-gray-muted">
                      Total
                    </p>
                    <p className="mt-1 text-lg font-display font-bold text-portal-navy">
                      {MOCK_REPORT_OVERVIEW.totalItems}
                    </p>
                  </div>
                </div>
              </section>

              {/* AI Insights widget */}
              <AIInsightsWidget />

              {/* Trending datasets – from PDF */}
              <section className="rounded-2xl border border-portal-border bg-white p-4 text-xs shadow-sm">
                <p className="font-display text-sm font-bold tracking-[-0.2px] text-portal-navy">Trending datasets</p>
                <ol className="mt-3 space-y-1.5 text-xs">
                  {TRENDING_DATASETS_FOR_ALL.map((d, idx) => (
                    <li key={d.id} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="text-portal-gray-muted">#{idx + 1}</span>
                        <span className="font-medium text-portal-navy">{d.title}</span>
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        {d.clickTrend}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </section>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

