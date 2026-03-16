import { Link } from 'react-router-dom';

const faqs = [
  { q: 'How do I download a dataset?', a: 'Go to Datasets, use filters or search, then click Preview or Download on the dataset card. You can choose CSV, XLSX or PDF where available.' },
  { q: 'What is the AI Data Assistant?', a: 'The AI Assistant lets you ask questions in natural language and get instant insights, charts and summaries from Oman\'s statistical database. Try it from the Home page or the AI Assistant section.' },
  { q: 'How do I save a query?', a: 'After running a query in the Datasets or AI Assistant section, use "Save query" to add it to My Queries. You can run, edit or delete saved queries from the My Queries page.' },
  { q: 'Where does the data come from?', a: 'Data is provided by the National Centre for Statistics & Information (NCSI) and other official sources in the Sultanate of Oman. It is updated according to each source\'s release schedule.' },
  { q: 'Is the data free to use?', a: 'Yes. Oman\'s open data is made available under the Open Government License. You can use, share and adapt it with appropriate attribution. See Policies & Legal in the footer for full terms.' },
];

export default function HelpPage() {
  return (
    <div className="px-[100px] py-10">
      <div className="mx-auto max-w-[800px]">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.5px] text-[#161616]">
          Help & Support
        </h1>
        <p className="mt-2 text-base font-medium text-portal-gray">
          Find answers to common questions and learn how to use the portal.
        </p>

        <div className="mt-10 space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-[10px] border border-portal-border bg-white p-6"
            >
              <h2 className="font-display text-[18px] font-bold tracking-[-0.5px] text-[#161616]">
                {item.q}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-portal-gray">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[10px] border border-portal-border bg-portal-bg-section p-8">
          <h2 className="font-display text-[22px] font-bold tracking-[-0.5px] text-[#161616]">
            Still need help?
          </h2>
          <p className="mt-2 text-portal-gray">
            Contact us or use the AI Assistant for instant answers.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href="mailto:info@ncsi.gov.om"
              className="rounded bg-portal-navy px-6 py-3 text-white font-medium hover:bg-[#1a3370]"
            >
              Contact Us
            </a>
            <Link
              to="/ai-assistant"
              className="rounded border border-portal-border px-6 py-3 font-medium text-portal-navy hover:bg-white"
            >
              Chat with AI Assistant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
