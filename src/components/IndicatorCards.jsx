import { usePersona } from '../context/PersonaContext';
import { MOCK_INDICATORS } from '../data/omanMockData';

// Reorder/emphasize indicators by persona (Economic Analyst: economy first; University Student: demographics/education first)
function getIndicatorsForPersona(persona) {
  const indicators = [...MOCK_INDICATORS];
  const role = persona?.role || '';
  if (role === 'Economic Analyst') {
    return indicators.sort((a, b) => {
      const order = { 'Unemployment rate (Oman)': 0, 'Inflation (CPI, Oman)': 1, 'Employment rate': 2, 'Population (Sultanate of Oman)': 3 };
      return (order[a.label] ?? 4) - (order[b.label] ?? 4);
    });
  }
  if (role === 'University Student') {
    return indicators.sort((a, b) => {
      const order = { 'Population (Sultanate of Oman)': 0, 'Unemployment rate (Oman)': 1, 'Employment rate': 2, 'Inflation (CPI, Oman)': 3 };
      return (order[a.label] ?? 4) - (order[b.label] ?? 4);
    });
  }
  return indicators;
}

export default function IndicatorCards() {
  const { currentPersona } = usePersona();
  const indicators = getIndicatorsForPersona(currentPersona);
  const role = currentPersona?.role;
  const sectionTitle = role === 'Economic Analyst' ? 'Key economic indicators' : role === 'University Student' ? 'Indicators for your research' : 'Indicator Cards';
  const sectionSubtitle = role === 'Economic Analyst'
    ? "Trade, inflation, and labour metrics relevant to economic analysis"
    : role === 'University Student'
    ? "Demographics and labour data for academic research"
    : "Real-time insights into Oman's economic performance and growth metrics";

  return (
    <section className="flex w-full shrink-0 flex-col items-center gap-[30px] bg-white px-[100px] py-[60px]">
      <div className="text-center">
        <h2 className="font-display text-[30px] font-extrabold leading-[50px] tracking-[-0.5px] text-[#161616]">
          {sectionTitle}
        </h2>
        <p className="mt-4 text-base font-medium leading-[35px] text-portal-gray">
          {sectionSubtitle}
        </p>
      </div>
      <div className="flex w-full max-w-[1240px] flex-wrap justify-center gap-6">
        {indicators.map((ind) => (
          <div
            key={ind.label}
            className="flex w-[292px] shrink-0 flex-col gap-1 rounded-[10px] p-[15px]"
            style={{ backgroundColor: ind.bg }}
          >
            <p className="text-base text-[#161616]">{ind.label}</p>
            <p className="font-display text-[36px] font-extrabold leading-[42px] text-portal-blue-dark">
              {ind.value}
            </p>
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
              <span className="text-xs text-portal-gray-light">{ind.change}</span>
              <span className="rounded border border-portal-neutral-border bg-portal-neutral px-2 py-0.5 text-sm text-[#1f2a37]">
                {ind.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
