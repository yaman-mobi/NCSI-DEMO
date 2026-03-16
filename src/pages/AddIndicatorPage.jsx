import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const categories = ['Demographics', 'Economy', 'Education', 'Health', 'Environment', 'Labor Market', 'Vital Statistics'];

export default function AddIndicatorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    source: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const key = 'ncsi_smart_portal_requested_indicators';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({ ...form, submittedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (_) {}
    navigate('/datasets', { state: { indicatorSubmitted: true } });
  };

  return (
    <div className="px-[100px] py-10">
      <div className="mx-auto max-w-[700px]">
        <div className="flex items-center gap-4">
          <Link to="/datasets" className="text-portal-gray hover:text-portal-navy">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </Link>
          <h1 className="font-display text-[30px] font-extrabold tracking-[-0.5px] text-[#161616]">
            Add Indicator
          </h1>
        </div>
        <p className="mt-2 text-base font-medium text-portal-gray">
          Submit a new statistical indicator to the portal.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#161616]">Indicator name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-portal-border-light bg-white px-4 py-3 text-[#161616] focus:border-portal-blue focus:outline-none"
              placeholder="e.g. Unemployment rate by governorate"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#161616]">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full rounded-lg border border-portal-border-light bg-white px-4 py-3 text-[#161616] focus:border-portal-blue focus:outline-none"
              placeholder="Brief description of the indicator and how it is calculated."
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[#161616]">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-portal-border-light bg-white px-4 py-3 text-[#161616] focus:border-portal-blue focus:outline-none"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-[#161616]">Unit</label>
            <input
              id="unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-portal-border-light bg-white px-4 py-3 text-[#161616] focus:border-portal-blue focus:outline-none"
              placeholder="e.g. Percentage, Count, OMR million"
            />
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-[#161616]">Data source</label>
            <input
              id="source"
              name="source"
              value={form.source}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-portal-border-light bg-white px-4 py-3 text-[#161616] focus:border-portal-blue focus:outline-none"
              placeholder="e.g. Labour Force Survey, NCSI"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="rounded bg-portal-blue px-6 py-3 text-base font-medium text-white hover:bg-[#004a75]"
            >
              Submit indicator
            </button>
            <Link
              to="/datasets"
              className="rounded border border-portal-border px-6 py-3 text-base font-medium text-portal-navy hover:bg-portal-bg-section"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
