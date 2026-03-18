import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_QUERIES_DEFAULT } from '../data/omanMockData';
import { loadQueries, saveQueries } from '../lib/queriesStorage';

const MOCK_RUN_RESULT = [
  ['Governorate', 'Unemployment %', 'Employment'],
  ['Muscat', '2.1', 'High'],
  ['Dhofar', '2.4', 'Medium'],
  ['Al Batinah South', '2.0', 'High'],
];

export default function MyQueriesPage() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState(() => loadQueries(MOCK_QUERIES_DEFAULT));
  const [runResult, setRunResult] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editQuery, setEditQuery] = useState('');

  useEffect(() => {
    saveQueries(queries);
  }, [queries]);

  const handleNewQuery = () => {
    navigate('/ai-assistant');
  };

  const handleRun = (q) => {
    setRunResult({ title: q.name, rows: MOCK_RUN_RESULT });
  };

  const handleDelete = (id) => {
    setQueries((prev) => prev.filter((x) => x.id !== id));
    if (runResult) setRunResult(null);
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setEditName(q.name);
    setEditQuery(q.query);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setQueries((prev) =>
      prev.map((x) =>
        x.id === editingId ? { ...x, name: editName, query: editQuery, lastRun: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } : x
      )
    );
    setEditingId(null);
  };

  return (
    <div className="px-[100px] py-10">
      <div className="mx-auto max-w-[1240px]">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.5px] text-[#161616]">
          My Queries
        </h1>
        <p className="mt-2 text-base font-medium text-portal-gray">
          Manage your saved queries and view run history.
        </p>

        <div className="mt-8 flex justify-end">
          <button type="button" onClick={handleNewQuery} className="rounded bg-gradient-to-r from-[#a624d2] to-[#3a70d8] px-6 py-3 text-base font-medium text-white hover:opacity-95">
            + New Query
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {queries.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between gap-6 rounded-[10px] border border-portal-border bg-white p-6 hover:border-portal-blue/30"
            >
              {editingId === q.id ? (
                <div className="flex-1 min-w-0 space-y-2">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded border border-portal-border-light px-3 py-1.5 font-display text-[18px] font-bold" placeholder="Query name" />
                  <input value={editQuery} onChange={(e) => setEditQuery(e.target.value)} className="w-full rounded border border-portal-border-light px-3 py-1.5 font-mono text-sm" placeholder="Query" />
                  <div className="flex gap-2">
                    <button type="button" onClick={saveEdit} className="rounded bg-portal-blue px-4 py-2 text-sm text-white">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded border border-portal-border px-4 py-2 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-[18px] font-bold tracking-[-0.5px] text-[#161616]">{q.name}</h2>
                    <p className="mt-1 truncate font-mono text-sm text-portal-gray">{q.query}</p>
                    <p className="mt-2 text-xs text-portal-gray-muted">Created: {q.created} · Last run: {q.lastRun}</p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button type="button" onClick={() => handleRun(q)} className="rounded border border-portal-border px-4 py-2 text-sm font-medium text-portal-navy hover:bg-portal-bg-section">
                      Run
                    </button>
                    <button type="button" onClick={() => startEdit(q)} className="rounded border border-portal-border px-4 py-2 text-sm font-medium text-portal-navy hover:bg-portal-bg-section">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(q.id)} className="rounded border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {queries.length === 0 && (
          <div className="mt-12 rounded-[10px] border border-portal-border border-dashed bg-portal-bg-section p-12 text-center">
            <p className="text-portal-gray">You have no saved queries yet.</p>
            <button type="button" onClick={handleNewQuery} className="mt-4 rounded bg-portal-blue px-6 py-2 text-white hover:bg-[#004a75]">
              Create your first query
            </button>
          </div>
        )}

        {runResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRunResult(null)}>
            <div className="w-full max-w-lg rounded-xl border border-portal-border bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-[#161616]">Result: {runResult.title}</h3>
                <button type="button" onClick={() => setRunResult(null)} className="text-portal-gray hover:text-portal-navy">×</button>
              </div>
              <p className="mt-1 text-sm text-portal-gray">Sample result (Oman mock data)</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {runResult.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="border border-portal-border-light px-3 py-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={() => setRunResult(null)} className="mt-4 text-sm text-portal-blue">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
