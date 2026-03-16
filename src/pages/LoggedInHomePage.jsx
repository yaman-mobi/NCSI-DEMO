import { Link } from 'react-router-dom';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AlertsPanel from '../components/AlertsPanel';
import AIInsightsWidget from '../components/AIInsightsWidget';
import { useAuth } from '../context/AuthContext';
import { usePersona } from '../context/PersonaContext';
import { TRENDING_INSIGHTS } from '../data/trendingInsights';
import { MOCK_DATASETS } from '../data/omanMockData';
import UpperBar from '../components/UpperBar';

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
    title: 'Oil Export Volumes Q4 2024',
    subtitle: 'Crude oil and refined petroleum export data by destination',
    age: '2d ago',
    location: 'Muscat',
    tags: ['oil', 'exports'],
    badge: 'Dataset',
    tone: 'economy',
    image: 'https://picsum.photos/seed/oil-exports/180/100',
  },
  {
    id: 'feed-2',
    type: 'news',
    title: 'Red Sea Shipping Crisis: Oman Ports See Record Traffic as Alternative Route',
    subtitle:
      'Houthi attacks on commercial shipping in the Red Sea redirect global trade flows. Duqm and Salalah ports report a 28% increase in vessel calls.',
    age: '2d ago',
    location: 'Muscat',
    tags: ['shipping', 'red-sea'],
    badge: 'News',
    tone: 'trade',
    image: 'https://picsum.photos/seed/oman-port/180/100',
  },
  {
    id: 'feed-3',
    type: 'dataset',
    title: 'Oman GDP Growth 2024 (Flash Estimate)',
    subtitle: 'Real GDP growth and non-oil sector contribution for 2020–2024',
    age: '3d ago',
    location: 'Muscat',
    tags: ['gdp', 'economy'],
    badge: 'Dataset',
    tone: 'economy',
    image: 'https://picsum.photos/seed/gdp-growth/180/100',
  },
  {
    id: 'feed-4',
    type: 'news',
    title: 'Oman Mediates Between Iran and Western Powers Amid Regional Escalation',
    subtitle:
      'Oman leverages its neutral diplomatic stance to facilitate backchannel negotiations as tensions rise between Iran and the US-led coalition.',
    age: '3d ago',
    location: 'Muscat',
    tags: ['diplomacy', 'iran'],
    badge: 'News',
    tone: 'diplomacy',
    image: 'https://picsum.photos/seed/diplomacy/180/100',
  },
  {
    id: 'feed-5',
    type: 'dataset',
    title: 'Foreign Direct Investment Flows',
    subtitle: 'FDI inflows and outflows by sector and origin country, in OMR million.',
    age: '4d ago',
    location: 'Muscat',
    tags: ['fdi', 'investment'],
    badge: 'Dataset',
    tone: 'economy',
    image: 'https://picsum.photos/seed/fdi-investment/180/100',
  },
  {
    id: 'feed-6',
    type: 'dataset',
    title: 'Tourism Revenue Dashboard',
    subtitle: 'Monthly tourism revenue and visitor statistics by governorate.',
    age: '5d ago',
    location: 'Salalah',
    tags: ['tourism', 'revenue'],
    badge: 'Dataset',
    tone: 'tourism',
    image: 'https://picsum.photos/seed/oman-tourism/180/100',
  },
  {
    id: 'feed-7',
    type: 'news',
    title: 'Duqm SEZ Attracts $3.2B in New Investment as Companies Diversify from Conflict Zones',
    subtitle:
      'Special Economic Zone at Duqm sees a surge in foreign investment commitments as multinational companies seek stable alternatives to conflict-affected hubs.',
    age: '6d ago',
    location: 'Duqm',
    tags: ['investment', 'duqm'],
    badge: 'News',
    tone: 'economy',
    image: 'https://picsum.photos/seed/duqm-port/180/100',
  },
  {
    id: 'feed-8',
    type: 'dataset',
    title: 'Consumer Price Index – Salalah',
    subtitle: 'Monthly CPI data tracking inflation across consumer categories in Salalah.',
    age: '6d ago',
    location: 'Salalah',
    tags: ['inflation', 'consumer'],
    badge: 'Dataset',
    tone: 'prices',
    image: 'https://picsum.photos/seed/cpi-salalah/180/100',
  },
  {
    id: 'feed-9',
    type: 'news',
    title: 'Oil Prices Surge Past $85 as Gulf Tensions Threaten Strait of Hormuz',
    subtitle:
      'Brent crude spikes and fears of disruption to the Strait of Hormuz, through which 21% of global oil passes, push energy markets higher.',
    age: '6d ago',
    location: 'Muscat',
    tags: ['oil', 'energy'],
    badge: 'News',
    tone: 'energy',
    image: 'https://picsum.photos/seed/oil-prices/180/100',
  },
  {
    id: 'feed-10',
    type: 'news',
    title: 'Oman Strengthens Food Security Strategy Amid Regional Supply Chain Disruptions',
    subtitle:
      'Government accelerates food security initiatives as regional conflicts disrupt traditional supply routes. New agreements with India and East Africa diversify imports.',
    age: '6d ago',
    location: 'Muscat',
    tags: ['food-security', 'supply-chain'],
    badge: 'News',
    tone: 'food',
    image: 'https://picsum.photos/seed/food-security/180/100',
  },
];

export default function LoggedInHomePage() {
  const { user, profile } = useAuth();
  const { currentPersona } = usePersona();
  const greeting = getTimeGreeting();

  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const role = profile?.role_occupation || currentPersona?.role || 'NCSI Smart Portal user';
  const region = profile?.region || currentPersona?.region;
  const interests = profile?.interests?.length ? profile.interests : currentPersona?.interests || [];

  const primaryInterest = interests[0] || 'International Trade';

  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(MOCK_FEED_ITEMS.length / pageSize));
  const pagedItems = MOCK_FEED_ITEMS.slice((page - 1) * pageSize, page * pageSize);

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
            <button
              type="button"
              className="hidden rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 md:inline-flex"
            >
              Preferences
            </button>
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
                {TRENDING_INSIGHTS.map((item) => {
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
                  className="relative pb-1 font-medium text-portal-navy after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-portal-blue"
                >
                  For You
                </button>
                <button
                  type="button"
                  className="pb-1 text-portal-gray hover:text-portal-navy"
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
                <Link
                  to="/datasets"
                  className="inline-flex items-center rounded-full bg-portal-blue px-4 py-2 text-xs font-semibold text-white shadow hover:bg-portal-blue-dark"
                >
                  Browse Datasets
                </Link>
              </div>

              {/* Feed cards */}
              <div className="space-y-3">
                {pagedItems.map((item) => {
                  const isNews = item.type === 'news';
                  return (
                    <article
                      key={item.id}
                      className="flex rounded-2xl border border-portal-border bg-white shadow-sm hover:border-portal-blue/50"
                    >
                      {/* Left strip */}
                      <div
                        className={`flex w-32 shrink-0 flex-col justify-center rounded-l-2xl p-3 ${
                          isNews
                            ? 'bg-gradient-to-b from-portal-ai-bg via-portal-ai-bg to-portal-ai-bg'
                            : 'bg-gradient-to-b from-portal-bg-section via-portal-bg-section to-portal-bg-section'
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <span className="inline-flex items-center rounded-full bg-portal-navy px-2 py-0.5 text-[10px] font-semibold text-white">
                            {item.badge}
                          </span>
                          <div className="mt-2 overflow-hidden rounded-lg border border-white/40">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-[64px] w-full object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Main content */}
                      <div className="flex flex-1 flex-col justify-between p-3">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-portal-gray-muted">
                          <div className="flex items-center gap-2">
                            <span>{item.age}</span>
                            <span>•</span>
                            <span>{item.location}</span>
                          </div>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-portal-gray hover:text-portal-blue"
                          >
                            {isNews ? 'Read' : 'Explore'}
                            <span aria-hidden>↗</span>
                          </button>
                        </div>
                        <div className="mt-1">
                          <h3 className="font-display text-sm font-semibold leading-snug text-portal-navy">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs text-portal-gray line-clamp-2">
                            {item.subtitle}
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-portal-bg-section px-2 py-0.5 text-[10px] font-medium text-portal-gray"
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="inline-flex items-center rounded-full bg-[#6d42ff] px-2 py-0.5 text-[10px] font-semibold text-white">
                            Match
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-3 flex items-center justify-between px-1 text-xs text-portal-gray">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-full border border-portal-border bg-white px-3 py-1 font-medium hover:bg-portal-bg-section disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-full border border-portal-border bg-white px-3 py-1 font-medium hover:bg-portal-bg-section disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={`h-2.5 w-2.5 rounded-full ${
                            n === page ? 'bg-portal-blue' : 'bg-portal-bg-section hover:bg-portal-border'
                          }`}
                          aria-label={`Go to page ${n}`}
                        />
                      ))}
                    </div>
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
                  onClick={() => {}}
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

              {/* Trending topics list */}
              <section className="rounded-2xl border border-portal-border bg-white p-4 text-xs shadow-sm">
                <p className="font-display text-sm font-bold tracking-[-0.2px] text-portal-navy">Trending</p>
                <ol className="mt-3 space-y-1.5 text-xs">
                  {['oil', 'exports', 'energy', 'shipping', 'red-sea'].map((topic, idx) => (
                    <li key={topic} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="text-portal-gray-muted">#{idx + 1}</span>
                        <span className="font-medium text-portal-navy">{topic}</span>
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

