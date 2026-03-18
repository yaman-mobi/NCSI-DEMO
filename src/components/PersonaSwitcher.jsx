import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';

const ROLES = ['Economic Analyst', 'University Student', 'Data Scientist', 'Policy Researcher', 'Business Executive', 'Journalist', 'Government Official'];
const REGIONS = ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Ibri', 'Other'];
const INTERESTS = ['International Trade', 'Social Trends', 'Energy & Oil', 'Tourism', 'Education', 'Technology', 'Finance', 'Healthcare', 'Demographics', 'Infrastructure'];

export default function PersonaSwitcher({ variant = 'dark' }) {
  const { personas, currentPersonaId, setCurrentPersonaId, currentPersona, savePersona } = usePersona();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', region: '', interests: [] });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = variant === 'light';
  const textClass = isLight ? 'text-[#161616]' : 'text-white';

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      role: p.role || '',
      region: p.region || '',
      interests: p.interests || [],
    });
    setEditOpen(true);
    setOpen(false);
  };

  const toggleInterest = (interest) => {
    setEditForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const saveEdit = () => {
    if (editingId) {
      savePersona(editingId, {
        name: editForm.name || editForm.role,
        role: editForm.role,
        region: editForm.region,
        interests: editForm.interests,
      });
      setEditOpen(false);
      setEditingId(null);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${isLight ? 'border-portal-border bg-portal-bg-section text-[#161616]' : 'border-white/30 bg-white/10 text-white'}`}
        >
          <span className="w-2 h-2 rounded-full bg-green-400" aria-hidden />
          {currentPersona ? currentPersona.name : 'View as'}
          <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {open && (
          <div className={`absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border shadow-lg ${isLight ? 'border-portal-border bg-white' : 'border-white/20 bg-[#1a3370]'}`}>
            <div className="py-1">
              {personas.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-black/5">
                  <button
                    type="button"
                    className={`flex-1 text-left text-sm font-medium ${isLight ? 'text-[#161616]' : 'text-white'}`}
                    onClick={() => {
                      setCurrentPersonaId(p.id);
                      setOpen(false);
                    }}
                  >
                    {p.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="text-xs opacity-70 hover:opacity-100"
                    title="Edit persona"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-black/10 px-2 py-1">
              <Link
                to="/admin/personas"
                className={`block rounded px-2 py-1.5 text-xs font-medium ${isLight ? 'text-portal-blue hover:bg-portal-bg-section' : 'text-white/80 hover:bg-white/10'}`}
              >
                Configure personas →
              </Link>
            </div>
          </div>
        )}
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-portal-border bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#161616]">Edit Persona</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#161616]">Display name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded border border-portal-border-light px-3 py-2 text-sm"
                  placeholder="e.g. Economic Analyst"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#161616]">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  className="mt-1 w-full rounded border border-portal-border-light px-3 py-2 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#161616]">Region</label>
                <select
                  value={editForm.region}
                  onChange={(e) => setEditForm((f) => ({ ...f, region: e.target.value }))}
                  className="mt-1 w-full rounded border border-portal-border-light px-3 py-2 text-sm"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#161616]">Interests</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${editForm.interests.includes(i) ? 'bg-portal-blue text-white' : 'bg-portal-bg-section text-portal-gray'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={saveEdit}
                className="rounded bg-portal-blue px-4 py-2 text-sm font-medium text-white hover:bg-[#004a75]"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { setEditOpen(false); setEditingId(null); }}
                className="rounded border border-portal-border px-4 py-2 text-sm font-medium text-[#161616]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
