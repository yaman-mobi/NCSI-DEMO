import { useState } from 'react';

/**
 * Interactive infographic embedded under "Sources" in the insight article.
 * Single-column, compact layout so it fits a narrow min-w-0 column without overlap.
 */
export default function OmanAITransitionInteractiveInfographic() {
  const timeline = [
    { year: 2022, title: 'Personal Data Protection Law', detail: 'Built trust and data governance foundations for AI adoption.' },
    { year: 2023, title: 'AI Governance Framework', detail: 'Established direction for responsible AI use across sectors.' },
    { year: 2024, title: 'Mueen Linguistic Model', detail: 'Strengthened Arabic-language and culturally-aware AI capabilities.' },
    { year: 2025, title: 'Safe & Ethical AI Policy', detail: 'Reinforced the national focus on ethical, transparent, and safe AI deployment.' },
  ];

  const opportunities = [
    { name: 'AI & ML', value: 35, description: 'Strongest opportunity area for students entering future-facing digital careers.' },
    { name: 'Digital Skills', value: 28, description: 'Core employability layer that supports broader digital transformation.' },
    { name: 'Data Science', value: 22, description: 'Growing need for analytical and statistical talent across sectors.' },
    { name: 'Tech Innovation', value: 15, description: 'Innovation ecosystem opportunities tied to startups, R&D, and product thinking.' },
  ];

  const pathForward = [
    'Accelerate AI education',
    'Enhance research funding',
    'Expand community engagement',
    'Foster ethical AI culture',
  ];

  const initiatives = [
    { title: 'Mueen', subtitle: 'Culturally-aware AI' },
    { title: 'Green AI', subtitle: 'Sustainable tech' },
  ];

  const assessments = [
    { label: 'Strong foundations', tone: 'teal' },
    { label: 'Digital trust', tone: 'teal' },
    { label: 'Infrastructure', tone: 'teal' },
    { label: 'High female STEM', tone: 'gold' },
  ];

  const [activeYear, setActiveYear] = useState(2024);
  const [activeOpportunity, setActiveOpportunity] = useState('AI & ML');

  const selectedTimeline = timeline.find((item) => item.year === activeYear);
  const selectedOpportunity = opportunities.find((item) => item.name === activeOpportunity);
  const totalOpportunity = opportunities.reduce((sum, item) => sum + item.value, 0);

  const card = 'rounded-xl border border-[#e0e8e6] bg-white p-4 shadow-sm';
  const h3 = 'font-display text-base font-semibold text-portal-navy';

  return (
    <div className="min-w-0 w-full text-[#12343b]">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f6f72]">
        Interactive story
      </p>

      <div className="flex flex-col gap-4">
        {/* Summary + KPIs */}
        <div className={card}>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d8e6e4] bg-[#f3fbfa] px-2.5 py-0.5 text-[11px] font-medium text-[#0f766e]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f766e]" />
            AI • Skills • Opportunity
          </div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-portal-navy">Oman&apos;s AI transition</h2>
          <p className="mt-1 text-sm text-[#5f6f72]">From government policy to student opportunity</p>
          <p className="mt-3 text-xs leading-relaxed text-[#3d4d50] sm:text-sm">
            National strategy is connecting to skills and jobs. Digital economy about{' '}
            <span className="font-semibold text-[#0f766e]">OMR 800M</span> with rising AI investment; focus on education and
            employability.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="col-span-2 rounded-lg bg-[linear-gradient(135deg,#0f766e_0%,#14827d_50%,#c9a056_100%)] p-px">
              <div className="rounded-[7px] bg-[#fbfbfa] px-3 py-2.5">
                <div className="text-[10px] text-[#5f6f72]">Digital economy</div>
                <div className="text-xl font-semibold text-[#12343b]">OMR 800M</div>
              </div>
            </div>
            <div className="rounded-lg bg-[#fcfcfb] px-3 py-2 ring-1 ring-[#e7eceb]">
              <div className="text-[10px] text-[#5f6f72]">Female STEM</div>
              <div className="text-lg font-semibold text-[#d2a066]">48%</div>
            </div>
            <div className="rounded-lg bg-[#fcfcfb] px-3 py-2 ring-1 ring-[#e7eceb]">
              <div className="text-[10px] text-[#5f6f72]">Arc</div>
              <div className="text-xs font-semibold leading-snug text-[#0f766e]">Policy → Skills → Jobs</div>
            </div>
          </div>
        </div>

        {/* Opportunity — stack: chart then list (fits narrow column) */}
        <div className={card}>
          <div className="flex flex-wrap items-baseline justify-between gap-1">
            <h3 className={h3}>Opportunity landscape</h3>
            <span className="text-[10px] text-[#5f6f72]">Tap a segment</span>
          </div>

          <div className="mt-4 flex flex-col items-center gap-5">
            <div className="relative h-[200px] w-[200px] shrink-0 sm:h-[220px] sm:w-[220px]">
              <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
                {(() => {
                  let cumulative = 0;
                  const radius = 72;
                  const circumference = 2 * Math.PI * radius;
                  const segmentColors = ['#0f766e', '#3fa39b', '#d2a066', '#93b8b0'];
                  return opportunities.map((item, index) => {
                    const fraction = item.value / totalOpportunity;
                    const dash = fraction * circumference;
                    const gap = circumference - dash;
                    const offset = -cumulative * circumference;
                    cumulative += fraction;
                    const isActive = activeOpportunity === item.name;
                    return (
                      <circle
                        key={item.name}
                        cx="110"
                        cy="110"
                        r={radius}
                        fill="transparent"
                        stroke={segmentColors[index]}
                        strokeWidth={isActive ? 26 : 20}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={offset}
                        strokeLinecap="butt"
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setActiveOpportunity(item.name)}
                        onClick={() => setActiveOpportunity(item.name)}
                      />
                    );
                  });
                })()}
                <circle cx="110" cy="110" r="44" fill="white" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
                <div className="text-[10px] text-[#5f6f72]">Top focus</div>
                <div className="max-w-[5.5rem] break-words text-sm font-semibold leading-tight sm:max-w-[7rem] sm:text-base">
                  {selectedOpportunity?.name}
                </div>
                <div className="text-xl font-semibold text-[#0f766e]">{selectedOpportunity?.value}%</div>
              </div>
            </div>

            <div className="w-full min-w-0 space-y-2">
              {opportunities.map((item, index) => {
                const active = item.name === activeOpportunity;
                const fills = ['bg-[#0f766e]', 'bg-[#3fa39b]', 'bg-[#d2a066]', 'bg-[#93b8b0]'];
                return (
                  <button
                    key={item.name}
                    type="button"
                    onMouseEnter={() => setActiveOpportunity(item.name)}
                    onClick={() => setActiveOpportunity(item.name)}
                    className={`w-full rounded-lg p-2.5 text-left transition-all ${active ? 'bg-[#f0faf9] ring-1 ring-[#cfe5e2]' : 'bg-[#fafafa] ring-1 ring-[#edf0ef] hover:bg-[#f5f5f4]'}`}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${fills[index]}`} />
                        <span className="truncate text-xs font-medium sm:text-sm">{item.name}</span>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-[#0f766e]">{item.value}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#eef3f2]">
                      <div className={`h-full rounded-full ${fills[index]}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </button>
                );
              })}
              <div className="rounded-lg border border-[#e8eceb] bg-[#fcfcfb] p-3 text-xs leading-relaxed text-[#4c5c5f]">
                {selectedOpportunity?.description}
              </div>
            </div>
          </div>
        </div>

        {/* Path + UNESCO: fixed 2×2 grids inside this column */}
        <div className={card}>
          <h3 className={h3}>Path forward</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {pathForward.map((item, i) => (
              <div
                key={item}
                className="flex min-h-0 items-start gap-2 rounded-lg bg-[#fcfcfb] p-2.5 ring-1 ring-[#edf0ef]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3fbfa] text-xs font-semibold text-[#0f766e]">
                  {i + 1}
                </div>
                <p className="min-w-0 flex-1 text-[11px] font-medium leading-snug text-[#12343b] sm:text-xs">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h3 className={h3}>UNESCO assessment</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {assessments.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg bg-[#fbfbfa] px-2 py-2 ring-1 ring-[#edf0ef]"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${item.tone === 'gold' ? 'bg-[#f6eadc] text-[#b8864a]' : 'bg-[#dff2ef] text-[#0f766e]'}`}
                >
                  ✓
                </div>
                <span className="min-w-0 text-[11px] font-medium leading-snug sm:text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Policy timeline */}
        <div className={card}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className={h3}>Policy timeline</h3>
            <span className="rounded-full bg-[#f3fbfa] px-2 py-0.5 text-[10px] font-medium text-[#0f766e]">Interactive</span>
          </div>
          <div className="relative ml-1.5 border-l border-[#dfe7e6] pl-3">
            {timeline.map((item) => {
              const active = item.year === activeYear;
              return (
                <button
                  key={item.year}
                  type="button"
                  onClick={() => setActiveYear(item.year)}
                  className={`relative mb-2 block w-full rounded-lg p-2.5 text-left transition-all last:mb-0 ${active ? 'bg-[#f0faf9] ring-1 ring-[#cfe5e2]' : 'hover:bg-[#fafaf9]'}`}
                >
                  <span
                    className={`absolute -left-[22px] top-4 h-2.5 w-2.5 rounded-full border-2 ${active ? 'border-[#0f766e] bg-[#0f766e]' : 'border-[#c8d4d2] bg-white'}`}
                  />
                  <div className="flex items-start gap-2">
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${active ? 'bg-[#0f766e] text-white' : 'bg-[#f0f4f3] text-[#0f766e]'}`}
                    >
                      {item.year}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#12343b]">{item.title}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 rounded-lg border border-[#e6eceb] bg-[#fcfcfb] p-3">
            <div className="text-[10px] text-[#5f6f72]">Selected milestone</div>
            <div className="mt-0.5 text-sm font-semibold">{selectedTimeline?.title}</div>
            <div className="mt-1.5 text-xs leading-relaxed text-[#4c5c5f]">{selectedTimeline?.detail}</div>
          </div>
        </div>

        {/* STEM */}
        <div className={card}>
          <div className="flex items-center justify-between">
            <h3 className={h3}>STEM growth</h3>
            <span className="text-[10px] text-[#5f6f72]">Gender split</span>
          </div>
          <div className="mt-3 space-y-3">
            {[
              { label: 'Female', value: 48, color: '#d2a066' },
              { label: 'Male', value: 52, color: '#0f766e' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#12343b]">{item.label}</span>
                  <span className="font-semibold" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#eef3f2]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transition arc — vertical stack (no cramped 3-col) */}
        <div className={card}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className={h3}>Transition arc</h3>
            <span className="text-[10px] text-[#5f6f72]">2022–25 → 2026+</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-lg border border-[#e8eceb] bg-[#fcfcfb] px-3 py-2.5">
              <span className="text-lg" aria-hidden>
                🏛️
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">2022–25 · Policy foundation</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-[#e8eceb] bg-[linear-gradient(135deg,#f4faf9_0%,#f7efe6_100%)] px-3 py-2.5">
              <span className="text-lg" aria-hidden>
                ↗
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">Growing investment</div>
                <div className="text-[11px] text-[#5f6f72]">From governance into capability-building</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-[#e8eceb] bg-[#fcfcfb] px-3 py-2.5">
              <span className="text-lg" aria-hidden>
                🎓
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">2026+ · Opportunity era</div>
              </div>
            </div>
          </div>
        </div>

        {/* Initiatives + key — stack on narrow */}
        <div className={card}>
          <h3 className={h3}>National initiatives</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {initiatives.map((item, index) => (
              <div key={item.title} className="flex items-center gap-2.5 rounded-lg border border-[#e8eceb] bg-[#fcfcfb] p-2.5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${index === 0 ? 'bg-[#e1f1ef]' : 'bg-[#f4ecdf]'}`}
                >
                  {index === 0 ? '💡' : '🌱'}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-[11px] text-[#5f6f72]">{item.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h3 className={h3}>Key message</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#4c5c5f] sm:text-sm">
            The story is about turning national AI momentum into student pathways, stronger digital skills, and long-term
            employability.
          </p>
        </div>
      </div>
    </div>
  );
}
