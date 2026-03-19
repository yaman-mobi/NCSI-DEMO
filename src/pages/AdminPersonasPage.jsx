import { useState } from 'react';
import { usePersona } from '../context/PersonaContext';
import { Link } from 'react-router-dom';

const LANGUAGES = ['English', 'Arabic'];
const ROLES = ['University Student', 'Economist', 'Data Analyst', 'Statistician', 'Economic Analyst', 'Data Scientist', 'Policy Researcher', 'Business Executive', 'Journalist', 'Government Official'];
const REGIONS = ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Ibri', 'Other'];
const INTERESTS = ['International Trade', 'Social Trends', 'Energy & Oil', 'Tourism', 'Education', 'Technology', 'Finance', 'Healthcare', 'Demographics', 'Infrastructure'];

export default function AdminPersonasPage() {
  const { personas, savePersona } = usePersona();

  return (
    <div className="px-[100px] py-10">
      <div className="mx-auto max-w-[800px]">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-portal-gray hover:text-portal-navy flex items-center gap-1 text-sm">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            Back
          </Link>
          <h1 className="font-display text-[30px] font-extrabold tracking-[-0.5px] text-[#161616]">
            Persona Configuration
          </h1>
        </div>
        <p className="mt-2 text-base font-medium text-portal-gray">
          Configure user personas to demonstrate personalized and contextualized experiences. Switch between personas from the header to see the portal adapt.
        </p>

        <div className="mt-10 space-y-10">
          {personas.map((p) => (
            <PersonaCard key={p.id} persona={p} onSave={(updates) => savePersona(p.id, updates)} />
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-portal-border bg-portal-bg-section p-6">
          <h3 className="font-display text-lg font-bold text-[#161616]">Technical demo checklist (aligned with RFP)</h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-portal-gray">
            <li><strong>Part 1 – Live Persona Configuration:</strong> Configure the four personas above (University Student, Economist, Data Analyst, Statistician). Use the <strong>View as</strong> dropdown in the header or <strong>Preferences</strong> on the home page to switch between them.</li>
            <li><strong>Dynamic UX:</strong> Go to Home — hero tagline, key indicators order, and &quot;Featured for you&quot; sections change per persona.</li>
            <li><strong>Contextual awareness – Event 1:</strong> Select <strong>Event: US Tariff change</strong>, then <strong>View as: Economic Analyst</strong>. Banner appears; click &quot;View trade &amp; BoP data&quot; to see trade datasets and Balance of Payments highlighted.</li>
            <li><strong>Contextual awareness – Event 2:</strong> Select <strong>Event: National Census released</strong>, then <strong>View as: University Student</strong>. Banner appears; click &quot;View census data&quot; to see census data and reports for their region and demographics.</li>
            <li><strong>Part 2 – Collaborative workspace:</strong> Reports → open or create a report. Switch <strong>Editing as</strong> between Data Analyst (Maker) and Senior Researcher (Checker). Both can use GenAI tools and co-edit; open in another tab to see sync.</li>
            <li><strong>AI-Assisted content:</strong> Click <strong>AI Generate</strong>, enter a prompt (e.g. &quot;Labour market trends in Oman 2020–2024&quot;). The prompt is shown above the report. Use rich editor: add text/charts/tables, <strong>Paraphrase</strong>, <strong>Grammar check</strong>, <strong>Spell check</strong> on text sections.</li>
            <li><strong>Review &amp; collaboration:</strong> Open <strong>Comments</strong> panel; add conversation threads on sections; resolve comments. Simulate Checker review with &quot;Editing as: Senior Researcher&quot;.</li>
            <li><strong>Publishing:</strong> Click <strong>Publish</strong> — the report moves to the &quot;Published&quot; section on the Reports page.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function PersonaCard({ persona, onSave }) {
  const [edit, setEdit] = useState({ ...persona });
  const [saved, setSaved] = useState(false);

  const toggleInterest = (interest) => {
    const next = edit.interests?.includes(interest)
      ? edit.interests.filter((i) => i !== interest)
      : [...(edit.interests || []), interest];
    setEdit((e) => ({ ...e, interests: next }));
  };

  const handleSave = () => {
    onSave(edit);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-portal-border bg-white p-6">
      <h2 className="font-display text-xl font-bold tracking-[-0.5px] text-[#161616]">{persona.name}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[#161616]">Language</label>
          <select
            value={edit.language || 'English'}
            onChange={(e) => setEdit((x) => ({ ...x, language: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-portal-border-light px-3 py-2 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#161616]">Role / Occupation</label>
          <select
            value={edit.role || ''}
            onChange={(e) => setEdit((x) => ({ ...x, role: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-portal-border-light px-3 py-2 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#161616]">Region / Geography</label>
          <select
            value={edit.region || ''}
            onChange={(e) => setEdit((x) => ({ ...x, region: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-portal-border-light px-3 py-2 text-sm"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-[#161616]">Stated Interests</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleInterest(i)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${(edit.interests || []).includes(i) ? 'bg-portal-blue text-white' : 'bg-portal-bg-section text-portal-gray'}`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          className="rounded bg-portal-blue px-4 py-2 text-sm font-medium text-white hover:bg-[#004a75]"
        >
          {saved ? 'Saved' : 'Save persona'}
        </button>
      </div>
    </div>
  );
}
