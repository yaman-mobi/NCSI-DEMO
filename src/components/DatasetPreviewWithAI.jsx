import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  processDatasetCommand,
  getContextualSuggestions,
} from '../lib/datasetAICommands';

function escapeCsvCell(cell) {
  const s = String(cell ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function tableToSheet(headers, rows) {
  const all = [headers, ...rows];
  return all.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
}

function normalizeNum(s) {
  if (s == null || s === '') return NaN;
  const cleaned = String(s).replace(/,/g, '').replace(/%/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? NaN : n;
}

function isNumericColumn(rows, colIndex) {
  if (!rows?.length) return false;
  const sample = rows.slice(0, 5).map((r) => r[colIndex]);
  return sample.every((v) => !isNaN(normalizeNum(v)) || v === '—' || v === '');
}

/** Get color for conditional formatting (green = high, red = low) */
function getCellColor(value, colValues, isNumeric) {
  if (!isNumeric || value === '—' || value === '') return null;
  const n = normalizeNum(value);
  if (isNaN(n)) return null;
  const nums = colValues.map((v) => normalizeNum(v)).filter((x) => !isNaN(x));
  if (nums.length < 2) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (max === min) return null;
  const pct = (n - min) / (max - min);
  const r = Math.round(34 + (1 - pct) * 200);
  const g = Math.round(139 + pct * 100);
  const b = Math.round(34 + pct * 150);
  return `rgba(${r},${g},${b},0.35)`;
}

export default function DatasetPreviewWithAI({ dataset, initialHeaders, initialRows, onClose, onDownload }) {
  const [headers, setHeaders] = useState(initialHeaders);
  const [rows, setRows] = useState(initialRows);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageSuccess, setMessageSuccess] = useState(true);
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'chart'
  const [fullscreen, setFullscreen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const [chartColumn, setChartColumn] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line' | 'pie'

  // Keep chartColumn in sync when headers change (e.g. after AI transforms)
  useEffect(() => {
    if (!chartColumn) return;
    const validCols = headers.slice(1);
    if (!validCols.includes(chartColumn)) {
      setChartColumn(null);
    }
  }, [headers, chartColumn]);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const runCommand = useCallback(
    (cmd) => {
      const trimmed = (typeof cmd === 'string' ? cmd : input).trim();
      if (!trimmed) return;

      setLoading(true);
      setMessage(null);

      setTimeout(() => {
        const result = processDatasetCommand(trimmed, { headers, rows });

        if (result.reset) {
          setHeaders(initialHeaders);
          setRows(initialRows);
          setHistory((h) => [...h, { type: 'reset', text: trimmed }]);
        } else if (result.headers != null && result.rows != null) {
          setHeaders(result.headers);
          setRows(result.rows);
          setHistory((h) => [...h, { type: 'command', text: trimmed }]);
        }

        setMessage(result.message);
        setMessageSuccess(result.success);
        setLoading(false);
        if (typeof cmd === 'string') setInput('');
      }, 400);
    },
    [headers, rows, initialHeaders, initialRows, input]
  );

  const handleReset = () => {
    setHeaders(initialHeaders);
    setRows(initialRows);
    setMessage('Table reset to original data.');
    setMessageSuccess(true);
    setHistory((h) => [...h, { type: 'reset', text: 'Reset' }]);
    setSortConfig({ column: null, direction: 'asc' });
  };

  const handleDownload = () => {
    const csv = tableToSheet(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(dataset?.title || 'dataset').replace(/[^a-z0-9]/gi, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (onDownload) onDownload();
  };

  const handleSort = (colIndex) => {
    setSortConfig((prev) => {
      const nextDir = prev.column === colIndex && prev.direction === 'asc' ? 'desc' : 'asc';
      return { column: colIndex, direction: nextDir };
    });
  };

  const sortedRows = useMemo(() => {
    if (sortConfig.column == null) return rows;
    const idx = sortConfig.column;
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = a[idx];
      const vb = b[idx];
      const na = normalizeNum(va);
      const nb = normalizeNum(vb);
      if (!isNaN(na) && !isNaN(nb)) return dir * (na - nb);
      return dir * String(va || '').localeCompare(String(vb || ''));
    });
  }, [rows, sortConfig]);

  const chartData = useMemo(() => {
    const labelCol = headers[0];
    const valueCol = chartColumn ?? (headers.length > 1 ? headers[headers.length - 1] : headers[0]);
    const valueIdx = headers.indexOf(valueCol);
    if (valueIdx < 0) return [];
    return sortedRows.map((row) => ({
      name: String(row[0]).slice(0, 18),
      value: normalizeNum(row[valueIdx]) || 0,
      fullName: row[0],
    }));
  }, [headers, sortedRows, chartColumn]);

  const numericCols = useMemo(() => {
    return headers.map((_, i) => isNumericColumn(rows, i));
  }, [headers, rows]);

  const suggestedCommands = useMemo(() => getContextualSuggestions(headers, rows, dataset), [headers, rows, dataset]);

  const aiInsights = useMemo(() => {
    const insights = [];
    if (headers.length >= 2 && rows.length > 0) {
      const lastColIdx = headers.length - 1;
      const vals = rows.map((r) => normalizeNum(r[lastColIdx])).filter((n) => !isNaN(n));
      if (vals.length > 0) {
        const total = vals.reduce((a, b) => a + b, 0);
        const maxVal = Math.max(...vals);
        const maxRow = rows.find((r) => normalizeNum(r[lastColIdx]) === maxVal);
        if (maxRow && total > 0) {
          const pct = ((maxVal / total) * 100).toFixed(1);
          insights.push(`${maxRow[0]} has the highest value (${pct}% of total)`);
        }
      }
    }
    if (headers.some((h) => /year|202[0-4]|month/i.test(h)) && rows.length >= 2) {
      insights.push('Try "Add a column for Growth %" to see trends');
    }
    if (headers.some((h) => /governorate|region/i.test(h))) {
      insights.push('Filter by governorate: "Filter to Muscat only"');
    }
    return insights.slice(0, 4);
  }, [headers, rows]);

  const containerClass = fullscreen
    ? 'fixed inset-0 z-[60] flex flex-col bg-slate-50'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6';

  return (
    <div className={`${containerClass} transition-opacity duration-200`} onClick={!fullscreen ? onClose : undefined} role="dialog" aria-modal="true" aria-labelledby="dataset-preview-title">
      <div
        className={
          fullscreen
            ? 'flex flex-1 flex-col overflow-hidden bg-white'
            : 'flex max-h-[92vh] w-full max-w-[1360px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-premium-lg'
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar – premium */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/90 bg-slate-50/95 px-5 py-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                viewMode === 'grid' ? 'bg-white text-portal-blue shadow-premium ring-1 ring-slate-200/80' : 'text-slate-600 hover:bg-white/90 hover:text-slate-800'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                viewMode === 'chart' ? 'bg-white text-portal-blue shadow-premium ring-1 ring-slate-200/80' : 'text-slate-600 hover:bg-white/90 hover:text-slate-800'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-2-2V5a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-2 4z" />
              </svg>
              Chart
            </button>
            {viewMode === 'chart' && (
              <div className="flex gap-0.5 rounded-lg bg-slate-200/60 p-1">
                {['bar', 'line', 'pie'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setChartType(t)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all duration-200 ${chartType === t ? 'bg-white text-portal-blue shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            <div className="mx-2 h-5 w-px bg-slate-200/80" />
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white hover:text-portal-blue"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((f) => !f)}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white hover:text-portal-blue"
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {fullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
              {fullscreen ? 'Exit' : 'Fullscreen'}
            </button>
            <button
              type="button"
              onClick={() => setAiPanelOpen((o) => !o)}
              className={`ml-2 flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                aiPanelOpen ? 'bg-gradient-to-r from-[#a624d2]/12 to-[#3a70d8]/12 text-portal-blue ring-1 ring-[#a624d2]/20' : 'text-slate-600 hover:bg-white/90'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Assistant
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200/90 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white hover:border-slate-300"
            >
              Reset
            </button>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700">
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Data/Chart area */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Title bar */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <h2 id="dataset-preview-title" className="font-display text-lg font-semibold tracking-tight text-slate-900">{dataset?.title}</h2>
                <p className="mt-1 text-[13px] text-slate-500">
                  {headers.length} columns × {rows.length} rows · Source: {dataset?.source || 'NCSI'}
                </p>
              </div>
              {viewMode === 'chart' && headers.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-slate-500">Value column</span>
                  <select
                    value={chartColumn ?? headers[headers.length - 1]}
                    onChange={(e) => setChartColumn(e.target.value || null)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 transition-colors focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none"
                  >
                    {headers.slice(1).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Grid or Chart */}
            <div className="flex-1 overflow-auto p-5">
              {viewMode === 'grid' ? (
                <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-premium">
                  <div className="overflow-x-auto">
                    <table className="premium-table w-full min-w-[500px] border-collapse text-[13px]">
                      <thead>
                        <tr className="bg-slate-50/90">
                          {headers.map((h, j) => (
                            <th
                              key={j}
                              onClick={() => handleSort(j)}
                              className={`cursor-pointer select-none border-b border-slate-200/90 px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-600 transition-colors duration-150 hover:bg-slate-100/80 ${
                                numericCols[j] ? 'text-right' : ''
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {h}
                                {sortConfig.column === j && (
                                  <span className="text-portal-blue">
                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                          {sortedRows.map((row, i) => (
                          <tr
                            key={i}
                            className={`border-b border-slate-100/80 transition-colors duration-150 hover:bg-slate-50/60 ${
                              i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                            }`}
                          >
                            {row.map((cell, j) => {
                              const bg = getCellColor(cell, rows.map((r) => r[j]), numericCols[j]);
                              return (
                                <td
                                  key={j}
                                  className={`px-5 py-3 text-[13px] text-slate-700 ${numericCols[j] ? 'text-right tabular-nums' : ''}`}
                                  style={bg ? { backgroundColor: bg } : undefined}
                                >
                                  {cell}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-[420px] w-full rounded-xl border border-slate-200/90 bg-white p-6 shadow-premium">
                  {chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      <p className="text-[13px]">No chartable data. Use a dataset with at least one numeric column.</p>
                    </div>
                  ) : chartType === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius="78%"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((_, i) => {
                            const hues = [205, 262, 142, 32, 320];
                            return <Cell key={i} fill={`hsl(${hues[i % hues.length]}, 52%, 48%)`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />;
                          })}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(226,232,240,0.9)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }} formatter={(v) => v?.toLocaleString()} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : chartType === 'line' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={70} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(226,232,240,0.9)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }} formatter={(v) => v?.toLocaleString()} labelFormatter={(l) => chartData.find((d) => d.name === l)?.fullName ?? l} />
                        <Line type="monotone" dataKey="value" stroke="#005287" strokeWidth={2.5} dot={{ fill: '#005287', strokeWidth: 2, r: 4 }} name={(chartColumn ?? headers[headers.length - 1]) || 'Value'} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={70} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: '1px solid rgba(226,232,240,0.9)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}
                          formatter={(value) => [value?.toLocaleString(), (chartColumn ?? headers[headers.length - 1]) || 'Value']}
                          labelFormatter={(label) => chartData.find((d) => d.name === label)?.fullName ?? label}
                        />
                        <Bar dataKey="value" fill="#005287" radius={[4, 4, 0, 0]} name={(chartColumn ?? headers[headers.length - 1]) || 'Value'}>
                          {chartData.map((_, i) => {
                            const lightness = chartData.length > 1 ? Math.max(28, 42 - (i / (chartData.length - 1)) * 14) : 38;
                            return <Cell key={i} fill={`hsl(205, 72%, ${lightness}%)`} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Panel – premium sidebar */}
          {aiPanelOpen && (
            <div className="flex w-[340px] shrink-0 flex-col border-l border-slate-200/80 bg-white">
              <div className="border-b border-slate-200/80 bg-gradient-to-br from-slate-50 to-white px-5 py-3.5">
                <h3 className="font-semibold text-slate-800">AI Data Assistant</h3>
                <p className="mt-0.5 text-[12px] text-slate-500">Transform data with natural language</p>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden p-4">
                {aiInsights.length > 0 && (
                  <div className="mb-4 rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 to-white px-4 py-3 shadow-sm">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Insights</p>
                    <ul className="space-y-1.5 text-[13px] text-slate-600">
                      {aiInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-portal-blue" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && runCommand(input)}
                      placeholder="e.g. Add column Growth %, Sort by 2024..."
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:border-portal-blue focus:ring-2 focus:ring-portal-blue/20 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => runCommand(input)}
                    disabled={loading || !input.trim()}
                    className="shrink-0 rounded-xl bg-gradient-to-r from-[#a624d2] to-[#3a70d8] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:opacity-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      </span>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {message != null && (
                  <p className={`mt-2 flex items-center gap-1.5 text-[13px] ${messageSuccess ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {messageSuccess && <span className="text-emerald-500">✓</span>}
                    {message}
                  </p>
                )}
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Quick actions</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedCommands.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => runCommand(s)}
                        className="rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-portal-blue/40 hover:bg-slate-50 hover:text-portal-blue"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {history.length > 0 && (
                  <div className="mt-5 flex-1 overflow-auto">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">History</p>
                    <ul className="space-y-1.5">
                      {[...history].reverse().slice(0, 8).map((h, i) => (
                        <li
                          key={`${h.type}-${h.text}-${i}`}
                          className="flex items-center gap-2 rounded-lg bg-slate-50/80 px-3 py-2 text-[12px] text-slate-600"
                        >
                          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${h.type === 'reset' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {h.type === 'reset' ? 'Reset' : 'Applied'}
                          </span>
                          <span className="truncate">{h.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
