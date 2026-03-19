import { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePersona } from '../context/PersonaContext';
import { profileToPersona } from '../lib/personaUtils';
import { MOCK_DATASETS, CATEGORIES, FOR_YOU_ID_TO_MOCK_ID } from '../data/omanMockData';
import { getForYouDatasetsForPersona } from '../data/profileDataPerPersona';
import { DATASET_PREVIEW_DATA } from '../data/datasetPreviewData';
import RecommendedForYou from '../components/RecommendedForYou';
import InsightCards from '../components/InsightCards';
import DatasetPreviewWithAI from '../components/DatasetPreviewWithAI';
import { addRecentViewed } from '../lib/recommendations';

/** Get preview rows for a dataset. Uses DATASET_PREVIEW_DATA when available. */
function getMockPreviewRows(dataset, forAI = false) {
  const fullData = DATASET_PREVIEW_DATA[dataset?.id];
  if (fullData && fullData.length > 0) {
    const [header, ...rows] = fullData;
    const rowCount = forAI ? rows.length : Math.min(5, rows.length);
    return [header, ...rows.slice(0, rowCount)];
  }
  return [
    ['Year', 'Value'],
    ['2020', '—'],
    ['2021', '—'],
    ['2022', '—'],
    ['2023', '—'],
    ['2024', '—'],
  ];
}

/** Convert raw rows (first row = header) to { headers, rows } for AI control */
function toTableShape(rawRows) {
  if (!rawRows || rawRows.length === 0) return { headers: [], rows: [] };
  const [headers, ...rows] = rawRows;
  return { headers: headers || [], rows: rows || [] };
}

export default function DatasetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { currentPersona } = usePersona();
  const effectivePersona = isAuthenticated && profile ? profileToPersona(profile) : currentPersona;
  const forYouDatasets = effectivePersona ? getForYouDatasetsForPersona(effectivePersona.role) : [];
  const highlight = searchParams.get('highlight');
  const categoryParam = searchParams.get('category');
  const indicatorSubmitted = location.state?.indicatorSubmitted;
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || (highlight === 'trade' ? 'Economy' : highlight === 'census' ? 'Demographics' : 'All')
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [previewDataset, setPreviewDataset] = useState(null);

  useEffect(() => {
    if (categoryParam && CATEGORIES.includes(categoryParam)) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    if (highlight === 'trade') setSelectedCategory('Economy');
    else if (highlight === 'census') setSelectedCategory('Demographics');
  }, [highlight]);

  const handleDownload = (d) => {
    const rows = getMockPreviewRows(d, true);
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${d.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = MOCK_DATASETS.filter((d) => {
    const matchCat = selectedCategory === 'All' || d.category === selectedCategory;
    const matchSearch = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const userInterests = profile?.interests || [];
  const hasPersonalization = isAuthenticated && userInterests.length > 0;

  // Demo: when coming from contextual event, sort so relevant (trade/census) datasets appear first; when logged in with interests, sort by interest match
  const sorted =
    highlight === 'trade'
      ? [...filtered].sort((a, b) => {
          const aRelevant = (a.tags || []).includes('trade');
          const bRelevant = (b.tags || []).includes('trade');
          if (aRelevant && !bRelevant) return -1;
          if (!aRelevant && bRelevant) return 1;
          return 0;
        })
      : highlight === 'census'
        ? [...filtered].sort((a, b) => {
            const aRelevant = (a.tags || []).includes('census') || (a.title || '').toLowerCase().includes('census');
            const bRelevant = (b.tags || []).includes('census') || (b.title || '').toLowerCase().includes('census');
            if (aRelevant && !bRelevant) return -1;
            if (!aRelevant && bRelevant) return 1;
            return 0;
          })
        : hasPersonalization
          ? [...filtered].sort((a, b) => {
              const tagsA = (a.tags || []).map((t) => t.toLowerCase());
              const tagsB = (b.tags || []).map((t) => t.toLowerCase());
              const catA = (a.category || '').toLowerCase();
              const catB = (b.category || '').toLowerCase();
              const scoreA = userInterests.filter((i) => tagsA.some((t) => t.includes(i.toLowerCase()) || i.toLowerCase().includes(t)) || catA.includes(i.toLowerCase())).length;
              const scoreB = userInterests.filter((i) => tagsB.some((t) => t.includes(i.toLowerCase()) || i.toLowerCase().includes(t)) || catB.includes(i.toLowerCase())).length;
              if (scoreB !== scoreA) return scoreB - scoreA;
              return 0;
            })
          : filtered;

  return (
    <div className="px-[100px] py-10">
      <div className="mx-auto max-w-[1240px]">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.5px] text-[#161616]">
          Datasets
        </h1>
        <p className="mt-2 text-base font-medium text-portal-gray">
          Browse and download Oman&apos;s open statistical datasets. Data sourced from NCSI public assets: ncsi.gov.om, data.gov.om, data.ncsi.gov.om, portal.ecensus.gov.om.
        </p>

        {indicatorSubmitted && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-display font-bold text-[#161616]">Indicator request submitted</p>
            <p className="text-sm text-portal-gray">Your indicator has been received. It will be reviewed by NCSI.</p>
          </div>
        )}
        {highlight === 'trade' && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-display font-bold text-[#161616]">Relevant to current context: US Tariff change</p>
            <p className="text-sm text-portal-gray">Trade datasets and Balance of Payments reports are highlighted below.</p>
          </div>
        )}
        {highlight === 'census' && (
          <div className="mt-6 rounded-xl border border-portal-card-teal/50 bg-portal-card-teal/20 p-4">
            <p className="font-display font-bold text-[#161616]">Relevant to current context: National Census released</p>
            <p className="text-sm text-portal-gray">Census and demographics data for your region and interests.</p>
          </div>
        )}
        {hasPersonalization && !highlight && (
          <div className="mt-6 rounded-xl border border-portal-ai-bg bg-portal-ai-bg/50 p-4">
            <p className="font-display font-bold text-[#161616]">Personalized for you</p>
            <p className="text-sm text-portal-gray">Datasets are ordered by relevance to your interests: {userInterests.slice(0, 4).join(', ')}{userInterests.length > 4 ? '…' : ''}</p>
          </div>
        )}

        {forYouDatasets.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-[20px] font-bold tracking-[-0.5px] text-[#161616]">
              For you as {effectivePersona?.name || effectivePersona?.role || 'your role'}
            </h2>
            <p className="mt-1 text-sm text-portal-gray">Datasets tailored to your persona from the NCSI portal.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {forYouDatasets.map((d) => {
                const mockId = FOR_YOU_ID_TO_MOCK_ID[d.id];
                const mock = mockId ? MOCK_DATASETS.find((x) => x.id === mockId) : null;
                const dataset = mock || { id: d.id, title: d.title, category: (d.tags && d.tags[0]) || 'General', description: d.whyRelevant };
                return (
                  <Link
                    key={d.id}
                    to={`/datasets?q=${encodeURIComponent(dataset.title)}`}
                    className="flex flex-col rounded-[10px] border border-portal-border bg-white p-4 transition hover:border-portal-blue/50 hover:shadow-sm"
                  >
                    <span className="rounded bg-portal-card-teal px-2 py-0.5 text-xs font-medium text-[#085d3a] w-fit">{dataset.category}</span>
                    <h3 className="mt-2 font-display text-base font-bold text-[#161616]">{dataset.title}</h3>
                    <p className="mt-1 text-sm text-portal-gray">{d.whyRelevant}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6">
          <RecommendedForYou context="datasets" compact />
        </div>

        {sorted.length > 0 && (
          <div className="mt-6">
            <InsightCards type="dataset" dataset={sorted[0]} />
          </div>
        )}

        <div className="mt-8 flex gap-6">
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-portal-border-light bg-white px-4 py-3">
            <svg className="h-6 w-6 text-portal-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchParams((p) => { p.set('q', e.target.value.trim()); return p; })}
              placeholder="Search datasets..."
              className="flex-1 border-0 bg-transparent text-[#161616] placeholder:text-portal-gray focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setSearchParams((p) => { if (searchQuery.trim()) p.set('q', searchQuery.trim()); else p.delete('q'); return p; })}
            className="rounded bg-portal-navy px-6 py-3 text-base font-medium text-white hover:bg-[#1a3370]"
          >
            Search
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchParams((p) => {
                    const next = new URLSearchParams(p);
                    if (cat === 'All') next.delete('category'); else next.set('category', cat);
                    return next;
                  });
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === cat ? 'bg-portal-blue text-white' : 'bg-portal-bg-section text-[#161616] hover:bg-portal-border'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Link
            to="/datasets/add-indicator"
            className="rounded border border-portal-blue px-4 py-2 text-sm font-medium text-portal-blue hover:bg-portal-bg-section"
          >
            + Add Indicator
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          {sorted.map((d) => {
            const isRelevantTrade = highlight === 'trade' && (d.tags || []).includes('trade');
            const isRelevantCensus = highlight === 'census' && ((d.tags || []).includes('census') || (d.title || '').toLowerCase().includes('census'));
            const isRelevantToEvent = isRelevantTrade || isRelevantCensus;
            return (
            <div
              key={d.id}
              className={`flex items-start justify-between gap-6 rounded-[10px] border bg-white p-6 hover:border-portal-blue/30 ${isRelevantToEvent ? 'border-portal-blue/50 ring-1 ring-portal-blue/20' : 'border-portal-border'}`}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-portal-card-teal px-2 py-0.5 text-xs font-medium text-[#085d3a]">{d.category}</span>
                  {isRelevantToEvent && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Relevant to current event
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-display text-[20px] font-bold tracking-[-0.5px] text-[#161616]">{d.title}</h2>
                <p className="mt-1 text-base text-portal-gray">{d.description}</p>
                <p className="mt-2 text-sm text-portal-gray-muted">Last updated: {d.lastUpdated} · {d.format}</p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/ai-assistant"
                  state={{ initialQuery: `Tell me about ${d.title} - ${d.description}` }}
                  className="rounded border border-portal-border px-4 py-2 text-sm font-medium text-portal-navy hover:bg-portal-ai-bg/50 hover:border-portal-blue/50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Ask AI
                </Link>
                <button type="button" onClick={() => { addRecentViewed({ type: 'dataset', id: d.id }); setPreviewDataset(d); }} className="rounded border border-portal-border px-4 py-2 text-sm font-medium text-portal-navy hover:bg-portal-bg-section">
                  Preview
                </button>
                <button type="button" onClick={() => handleDownload(d)} className="rounded bg-portal-blue px-4 py-2 text-sm font-medium text-white hover:bg-[#004a75]">
                  Download
                </button>
              </div>
            </div>
          );
          })}
        </div>

        {sorted.length === 0 && (
          <p className="py-12 text-center text-portal-gray">No datasets match your filters.</p>
        )}
      </div>

      {previewDataset && (() => {
        const rawRows = getMockPreviewRows(previewDataset, true);
        const { headers: initialHeaders, rows: initialRows } = toTableShape(rawRows);
        return (
          <DatasetPreviewWithAI
            dataset={previewDataset}
            initialHeaders={initialHeaders}
            initialRows={initialRows}
            onClose={() => setPreviewDataset(null)}
            onDownload={() => handleDownload(previewDataset)}
          />
        );
      })()}
    </div>
  );
}
