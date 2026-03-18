import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MOCK_SEARCH_POOL } from '../data/omanMockData';
import { usePersona } from '../context/PersonaContext';

// AI semantic expansion: natural language → extra keywords for matching
const SEMANTIC_MAP = {
  jobs: ['employment', 'labour', 'unemployment', 'workforce', 'survey'],
  employment: ['labour', 'unemployment', 'jobs', 'workforce'],
  unemployment: ['labour', 'employment', 'jobs', 'survey'],
  prices: ['CPI', 'inflation', 'consumer price', 'cost'],
  inflation: ['CPI', 'consumer price', 'prices'],
  gdp: ['GDP', 'economic', 'growth', 'national accounts'],
  economy: ['GDP', 'economic', 'trade', 'CPI', 'indicators'],
  people: ['population', 'census', 'demographics', 'governorate'],
  population: ['census', 'demographics', 'governorate', 'vital'],
  education: ['enrolment', 'schools', 'graduates', 'education statistics'],
  health: ['mortality', 'morbidity', 'health indicators'],
  trade: ['imports', 'exports', 'international trade', 'balance of payments'],
  regions: ['governorate', 'regional', 'by region', 'Muscat', 'Dhofar'],
  governorate: ['regional', 'by governorate', 'governorates'],
};

const RECENT_SEARCHES_KEY = 'ncsi_search_recent';

// Popular topics for smart discovery (when search box empty)
const POPULAR_TOPICS = [
  { label: 'Unemployment by governorate', query: 'unemployment by governorate', icon: 'chart' },
  { label: 'GDP growth trends', query: 'GDP growth trends Oman', icon: 'trend' },
  { label: 'Population by region', query: 'population by governorate', icon: 'map' },
  { label: 'Labour force survey', query: 'labour force survey Oman 2024', icon: 'data' },
  { label: 'CPI and inflation', query: 'CPI inflation consumer price', icon: 'chart' },
  { label: 'Trade and balance of payments', query: 'trade balance of payments Oman', icon: 'data' },
  { label: 'Education by governorate', query: 'education statistics by governorate', icon: 'data' },
  { label: 'Census 2020', query: 'census 2020 Oman', icon: 'data' },
];

function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
    }
  } catch (_) {}
  return [];
}

function saveRecentSearch(q) {
  const trimmed = q.trim();
  if (!trimmed) return;
  const recent = loadRecentSearches();
  const filtered = recent.filter((r) => r.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...filtered].slice(0, 8);
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (_) {}
}

function expandQuery(q) {
  const lower = q.trim().toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const expanded = new Set([lower, ...words]);
  words.forEach((word) => {
    const added = SEMANTIC_MAP[word];
    if (added) added.forEach((a) => expanded.add(a.toLowerCase()));
  });
  return Array.from(expanded);
}

function getInterpretedTerms(q) {
  const lower = q.trim().toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const related = new Set();
  words.forEach((word) => {
    const added = SEMANTIC_MAP[word];
    if (added) added.slice(0, 3).forEach((a) => related.add(a));
  });
  return Array.from(related).slice(0, 5);
}

// Richer AI summary and insights
function generateAISummary(query, results, persona) {
  const role = persona?.role || 'User';
  const byType = results.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  const types = Object.entries(byType).map(([t, c]) => `${c} ${t}${c > 1 ? 's' : ''}`).join(', ');
  const themes = [];
  if (results.some((r) => /labour|employment|unemployment|jobs|workforce/i.test(r.title + r.snippet + r.keywords))) themes.push('labour and employment');
  if (results.some((r) => /population|census|demographic|vital|births|deaths/i.test(r.title + r.snippet + r.keywords))) themes.push('population and demographics');
  if (results.some((r) => /CPI|inflation|price/i.test(r.title + r.snippet + r.keywords))) themes.push('prices and inflation');
  if (results.some((r) => /trade|export|import|balance of payments/i.test(r.title + r.snippet + r.keywords))) themes.push('trade and external sector');
  if (results.some((r) => /GDP|economic|national accounts/i.test(r.title + r.snippet + r.keywords))) themes.push('GDP and national accounts');
  if (results.some((r) => /education|enrolment|schools/i.test(r.title + r.snippet + r.keywords))) themes.push('education');
  if (results.some((r) => /health|mortality|morbidity/i.test(r.title + r.snippet + r.keywords))) themes.push('health');
  if (results.some((r) => /governorate|regional|region/i.test(r.title + r.snippet + r.keywords))) themes.push('regional breakdown');
  if (themes.length === 0) themes.push('Oman statistics');
  const themeStr = themes.slice(0, 4).join(', ');
  const topTitle = results.length > 0 ? results[0].title : '';
  const suggestedSearches = [];
  if (/jobs|employment|unemployment|labour/i.test(query)) suggestedSearches.push('labour force survey', 'employment by sector', 'governorate breakdown');
  else if (/population|people|census|demographic/i.test(query)) suggestedSearches.push('census 2020', 'vital statistics', 'population by governorate');
  else if (/price|inflation|CPI/i.test(query)) suggestedSearches.push('CPI monthly', 'inflation rate', 'consumer price index');
  else if (/gdp|economy|growth/i.test(query)) suggestedSearches.push('GDP by governorate', 'national accounts', 'economic indicators');
  else if (/trade|export|import/i.test(query)) suggestedSearches.push('international trade', 'balance of payments', 'external sector');
  else suggestedSearches.push('employment', 'population', 'CPI', 'GDP', 'education');
  const sentences = [];
  sentences.push(`Your search for "${query}" returned ${results.length} result${results.length !== 1 ? 's' : ''} across ${types}.`);
  if (results.length > 0) {
    sentences.push(`Key themes: ${themeStr}. Results are ranked by relevance using semantic matching.`);
    sentences.push(`Top result: "${topTitle}" is likely the most relevant. ${themes.includes('regional breakdown') ? 'Many datasets include governorate-level breakdowns for regional analysis.' : ''}`);
    sentences.push(`Insight: NCSI and partner sources cover official statistics; use the Datasets page to filter by category or download data.`);
  } else {
    sentences.push(`Try broader or related terms—for example: ${suggestedSearches.slice(0, 3).join(', ')}.`);
    sentences.push(`You can also browse by theme (Labour, Demographics, Economy, Education) on the Datasets page.`);
  }
  if (persona) sentences.push(`Summary tailored for ${role}.`);
  return { sentences, suggestedSearches: suggestedSearches.slice(0, 4) };
}

// Search engine loader — distinct from AI Assistant (no reasoning steps, just search feedback)
function SearchLoader() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-portal-border bg-white px-8 py-12 shadow-sm">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-portal-border" />
        <div className="absolute inset-0 rounded-full border-2 border-portal-blue border-t-transparent animate-spin" />
        <svg className="h-6 w-6 text-portal-blue relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="mt-4 text-sm font-medium text-portal-gray">Searching datasets, publications and news</p>
      <div className="mt-2 flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-portal-blue animate-search-dot" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-portal-blue animate-search-dot" style={{ animationDelay: '200ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-portal-blue animate-search-dot" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}

// Streaming text effect for AI summary + insights
function AISummaryBlock({ query, results, persona, onSuggestedSearch }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const summary = useMemo(() => generateAISummary(query, results, persona), [query, results, persona]);
  const fullText = summary.sentences.join(' ');

  useEffect(() => {
    if (!query || !fullText) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      if (i >= fullText.length) {
        clearInterval(id);
        setDisplayed(fullText);
        setDone(true);
        return;
      }
      i += 2;
      setDisplayed(fullText.slice(0, i));
    }, 18);
    return () => clearInterval(id);
  }, [query, fullText]);

  if (!query) return null;

  return (
    <div className="rounded-2xl border border-portal-border bg-gradient-to-br from-portal-ai-bg/90 to-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#a624d2]/15 to-[#3a70d8]/15">
            <svg className="h-5 w-5 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold tracking-tight text-[#161616]">AI Summary &amp; Insights</h3>
            <p className="text-xs font-medium text-portal-gray">Understanding your search and what to try next</p>
          </div>
        </div>
        <Link
          to="/ai-assistant"
          state={{ initialQuery: query }}
          className="shrink-0 rounded-full bg-gradient-to-r from-[#a624d2] to-[#3a70d8] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          Ask AI
        </Link>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[#374151]">
        {displayed}
        {!done && <span className="inline-block h-4 w-[2px] animate-pulse bg-portal-blue align-middle" />}
      </p>
      {done && summary.suggestedSearches?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-portal-border/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-portal-gray mb-2">Suggested searches</p>
          <div className="flex flex-wrap gap-2">
            {summary.suggestedSearches.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestedSearch?.(s)}
                className="rounded-full bg-white border border-portal-border-light px-3 py-1.5 text-xs font-medium text-portal-blue shadow-sm hover:bg-portal-ai-bg hover:border-portal-blue/40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Build suggestion pool from titles + semantic terms
const SUGGESTION_POOL = [
  ...new Set([
    ...MOCK_SEARCH_POOL.map((r) => r.title),
    ...Object.keys(SEMANTIC_MAP),
    ...Object.values(SEMANTIC_MAP).flat(),
    'population by governorate',
    'GDP growth Oman',
    'unemployment rate',
    'labour force survey',
    'CPI inflation',
    'trade statistics',
    'census 2020',
    'education by governorate',
    'health indicators',
    'balance of payments',
  ]),
];

function getLiveSuggestions(input, limit = 6) {
  const trimmed = (input || '').trim().toLowerCase();
  if (trimmed.length < 2) return [];
  const words = trimmed.split(/\s+/).filter(Boolean);
  return SUGGESTION_POOL
    .filter((s) => {
      const lower = s.toLowerCase();
      return lower.includes(trimmed) || words.some((w) => lower.includes(w));
    })
    .slice(0, limit);
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const { currentPersona } = usePersona();
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const searchFormRef = useRef(null);

  const liveSuggestions = useMemo(() => getLiveSuggestions(query), [query]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchFormRef.current && !searchFormRef.current.contains(e.target)) setSuggestionsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((e, searchText) => {
    if (e) e.preventDefault();
    const trimmed = (searchText ?? query).trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
      setSubmittedQuery(trimmed);
      setIsSearching(true);
      saveRecentSearch(trimmed);
      setRecentSearches(loadRecentSearches());
    }
  }, [query, setSearchParams]);

  const onSuggestedSearch = useCallback((s) => {
    setQuery(s);
    setSearchParams({ q: s });
    setSubmittedQuery(s);
    setIsSearching(true);
    saveRecentSearch(s);
    setRecentSearches(loadRecentSearches());
  }, [setSearchParams]);

  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || isSearching) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join(' ').trim();
      if (transcript) setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [isSearching]);

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const q = submittedQuery.trim();
  const qLower = q.toLowerCase();
  const expandedTerms = useMemo(() => expandQuery(q), [q]);
  const interpretedTerms = useMemo(() => getInterpretedTerms(q), [q]);
  const hasSearched = submittedQuery.length > 0;

  const allResults = useMemo(() => {
    if (!hasSearched || !q) return [];
    const pool = MOCK_SEARCH_POOL.map((r) => {
      const title = r.title.toLowerCase();
      const snippet = (r.snippet || '').toLowerCase();
      const keywords = (r.keywords || '').toLowerCase();
      const text = `${title} ${snippet} ${keywords}`;
      let score = 0;
      if (title.includes(qLower)) score += 10;
      if (title === qLower || title.startsWith(qLower)) score += 5;
      expandedTerms.forEach((term) => {
        if (title.includes(term)) score += 3;
        if (keywords.includes(term)) score += 2;
        if (snippet.includes(term)) score += 1;
      });
      return { ...r, score };
    });
    return pool.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  }, [hasSearched, q, qLower, expandedTerms]);

  const results = useMemo(() => {
    if (typeFilter === 'All') return allResults;
    return allResults.filter((r) => r.type === typeFilter);
  }, [allResults, typeFilter]);

  // Simulate search completion
  useEffect(() => {
    if (!isSearching || !hasSearched) return;
    const t = setTimeout(() => setIsSearching(false), 1200);
    return () => clearTimeout(t);
  }, [isSearching, hasSearched]);

  const resultTypes = useMemo(() => {
    const types = [...new Set(allResults.map((r) => r.type))];
    return ['All', ...types];
  }, [allResults]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-portal-bg-section/60">
      <div className="px-6 py-8 lg:px-[100px] lg:py-10">
        <div className="mx-auto max-w-[900px]">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-[28px] font-extrabold tracking-[-0.5px] text-[#161616] lg:text-[30px]">
                AI Search
              </h1>
              <p className="mt-2 text-base font-medium text-portal-gray">
                Semantic search across datasets, publications and news. Ask in natural language.
              </p>
            </div>
            <Link
              to="/ai-assistant"
              className="rounded-xl border border-portal-border/80 bg-white px-4 py-2.5 text-sm font-medium text-portal-blue shadow-sm hover:bg-portal-ai-bg hover:border-portal-blue/40 transition flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              AI Assistant
            </Link>
          </div>

          {/* Search form — AI-style floating pill with live suggestions */}
          <form ref={searchFormRef} onSubmit={(e) => handleSearch(e)} className="mt-8 relative">
            <div className="relative rounded-2xl border border-portal-border-light bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 focus-within:border-portal-blue/50 focus-within:ring-2 focus-within:ring-portal-blue/15 focus-within:shadow-[0_8px_32px_rgba(0,82,135,0.12)]">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 shrink-0 text-portal-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSuggestionsOpen(true); }}
                  onFocus={() => { if (query.trim().length >= 2 || liveSuggestions.length > 0) setSuggestionsOpen(true); }}
                  placeholder="e.g. unemployment by governorate, GDP growth, population census..."
                  className="min-w-0 flex-1 border-0 bg-transparent text-[#161616] placeholder:text-portal-gray focus:outline-none text-base"
                  autoComplete="off"
                />
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    disabled={isSearching}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${isListening ? 'bg-red-500/15 text-red-500 animate-pulse' : 'bg-portal-blue/10 text-portal-blue hover:bg-portal-blue/20'}`}
                    title={isListening ? 'Stop listening' : 'Voice search'}
                    aria-label={isListening ? 'Stop listening' : 'Start voice search'}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-[#a624d2] to-[#3a70d8] px-6 py-3 text-base font-medium text-white shadow-lg shadow-purple-500/20 hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Live AI suggestions dropdown */}
            {suggestionsOpen && liveSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-portal-border bg-white py-2 shadow-premium-lg">
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-portal-gray">AI suggestions</p>
                {liveSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setQuery(s); onSuggestedSearch(s); setSuggestionsOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#161616] hover:bg-portal-ai-bg/60 transition flex items-center gap-2"
                  >
                    <svg className="h-4 w-4 shrink-0 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Recent searches */}
          {recentSearches.length > 0 && !hasSearched && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-portal-gray">Recent</span>
              {recentSearches.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSuggestedSearch(s)}
                  className="rounded-full border border-portal-border-light bg-white px-3 py-1.5 text-xs font-medium text-portal-gray hover:bg-portal-ai-bg hover:border-portal-blue/40 hover:text-portal-blue transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Smart Discovery — popular topics when no search yet */}
          {!hasSearched && (
            <div className="mt-8 rounded-2xl border border-portal-border bg-gradient-to-br from-portal-ai-bg/50 to-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#a624d2]/15 to-[#3a70d8]/15">
                  <svg className="h-5 w-5 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#161616]">Smart Discovery</h3>
                  <p className="text-xs text-portal-gray">Popular topics — click to search instantly</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {POPULAR_TOPICS.map((t) => (
                  <button
                    key={t.query}
                    type="button"
                    onClick={() => onSuggestedSearch(t.query)}
                    className="rounded-xl border border-portal-border-light bg-white px-4 py-3 text-left text-sm font-medium text-[#161616] shadow-sm transition hover:border-portal-blue/40 hover:bg-portal-ai-bg/50 hover:shadow-md flex items-center gap-2"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-portal-blue/10 text-portal-blue">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results section */}
          {hasSearched && (
            <>
              {/* Search loader */}
              {isSearching && <SearchLoader />}

              {!isSearching && (
                <>
                  {/* AI interpreted strip */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-portal-border bg-portal-ai-bg/60 px-4 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-portal-blue-dark/80">AI search</span>
                    <span className="text-portal-gray">·</span>
                    <span className="text-sm text-[#161616]">Searching for &quot;{q}&quot;</span>
                    {interpretedTerms.length > 0 && (
                      <>
                        <span className="text-portal-gray">·</span>
                        <span className="text-sm text-portal-gray-muted">also including:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {interpretedTerms.map((term) => (
                            <span
                              key={term}
                              className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-portal-blue shadow-sm"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Filters */}
                  {allResults.length > 0 && resultTypes.length > 1 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-portal-gray">Filter</span>
                      {resultTypes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTypeFilter(t)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            typeFilter === t
                              ? 'bg-portal-blue text-white shadow-sm'
                              : 'border border-portal-border-light bg-white text-portal-gray hover:bg-portal-ai-bg hover:text-portal-blue'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 text-sm text-portal-gray">
                    {results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''} found` : 'No results found'}
                  </p>

                  {/* AI Summary & insights */}
                  <AISummaryBlock query={q} results={results} persona={currentPersona} onSuggestedSearch={onSuggestedSearch} />

                  {/* Results list */}
                  <div className="mt-6 space-y-4">
                    {results.length > 0 ? (
                      results.map((r, i) => (
                        <Link
                          key={i}
                          to={r.path}
                          className="block rounded-xl border border-portal-border bg-white p-6 shadow-sm transition hover:border-portal-blue/40 hover:shadow-md animate-fade-in-up"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="rounded-lg bg-portal-bg-section px-2.5 py-1 text-xs font-medium text-portal-gray">
                                {r.type}
                              </span>
                              <h2 className="mt-2 font-display text-[18px] font-bold tracking-[-0.5px] text-[#161616]">
                                {r.title}
                              </h2>
                              <p className="mt-1 text-sm text-portal-gray">{r.snippet}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {r.score >= 10 && (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  High match
                                </span>
                              )}
                              <Link
                                to="/ai-assistant"
                                state={{ initialQuery: `Tell me more about ${r.title}` }}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-full border border-portal-border/80 bg-white px-2.5 py-1 text-[10px] font-medium text-portal-blue hover:bg-portal-ai-bg"
                              >
                                Ask AI
                              </Link>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-portal-border bg-portal-ai-bg/30 p-8 text-center">
                        <p className="text-portal-gray mb-4">No results found for this filter. Try different or broader keywords, or use the suggested searches above.</p>
                        <button
                          type="button"
                          onClick={() => setTypeFilter('All')}
                          className="rounded-full bg-portal-blue px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                        >
                          Clear filter
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
