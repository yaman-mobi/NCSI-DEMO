import { useNavigate, Link } from 'react-router-dom';

const exampleQueries = [
  'What\'s the unemployment rate in Muscat for 2024?',
  'Show me GDP growth trends in Oman over the last 5 years',
  'Compare population growth across governorates',
  'Display education statistics by region in Oman',
  'Show trade and Balance of Payments data for Oman',
  'Census 2020 data by governorate and demographics',
];

export default function AIAssistant() {
  const navigate = useNavigate();

  const handleExampleClick = (query) => {
    navigate('/ai-assistant', { state: { initialQuery: query } });
  };

  return (
    <section id="ai-assistant" className="flex w-full shrink-0 flex-col items-center gap-5 bg-portal-bg-section px-[100px] py-[60px]">
      <h2 className="font-display text-[30px] font-extrabold leading-[50px] tracking-[-0.5px] text-[#161616]">
        Meet Your AI Data Assistant
      </h2>
      <p className="max-w-[800px] text-center text-base font-medium leading-[35px] text-portal-gray">
        Experience the future of data discovery with our advanced AI assistant. Ask questions in natural language and get instant insights, visualizations, and analysis from Oman's comprehensive statistical database.
      </p>
      <div className="w-full max-w-[1200px] rounded-[10px] border border-portal-border bg-white px-[25px] py-[30px]">
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center">
            <svg className="h-12 w-12 text-portal-blue" fill="currentColor" viewBox="0 0 24 24"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h3c0 1.66 1.34 3 3 3s3-1.34 3-3h3c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17c0 .83-.67 1.5-1.5 1.5S13 17.83 13 17s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM15 9H9V5c0-.83.67-1.5 1.5-1.5S12 4.17 12 5v4z"/></svg>
          </div>
          <div className="text-center">
            <h3 className="font-display text-xl font-extrabold tracking-[-0.5px] text-portal-blue-dark">
              AI Data Assistant
            </h3>
            <p className="text-base text-[#4b5563]">
              Powered by advanced natural language processing
            </p>
          </div>
          <div className="w-full rounded-xl bg-portal-ai-bg p-6">
            <p className="mb-4 text-center text-base font-medium text-[#1f2937]">
              Ask questions in natural language and get instant insights from Oman's comprehensive statistical database.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {exampleQueries.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleExampleClick(q)}
                  className="rounded-md border border-portal-border-light bg-white px-4 py-3 text-left text-sm font-medium text-[#374151] hover:bg-gray-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <Link
            to="/ai-assistant"
            className="inline-flex h-10 items-center justify-center gap-1 rounded bg-gradient-to-r from-[#a624d2] to-[#3a70d8] px-4 text-white text-base font-medium hover:opacity-95"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Launch AI Data Assistant
          </Link>
        </div>
      </div>
    </section>
  );
}
