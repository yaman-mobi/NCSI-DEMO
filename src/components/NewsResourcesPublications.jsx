import { Link } from 'react-router-dom';

const news = [
  { tag: 'Energy Transition', date: '16 July 2025', title: 'ما أهداف عُمان من إطلاق أول صندوق لتحوّل الطاقة؟', desc: 'تستعرض المقالة إطلاق سلطنة عُمان لأول صندوق استثماري مخصص لتحوّل الطاقة...', thumb: 'https://picsum.photos/60/60?random=1' },
  { tag: 'Open Data', date: '03 May 2025', title: 'Oman Ranks First in West Asia, Ninth Globally in Open Data', desc: 'According to a report by the Open Data Watch, Oman has achieved the top position in West Asia...', thumb: 'https://picsum.photos/60/60?random=2' },
  { tag: 'Development Goals', date: '18 November 2024', title: 'Gulf Statistical Centre says Oman has achieved many development goals', desc: 'The Gulf Statistical Centre reports that Oman has met numerous development targets...', thumb: 'https://picsum.photos/60/60?random=3' },
  { tag: 'Tourism', date: '28 Sep 2023', title: 'كيف وظّفت سلطنة عُمان إمكانياتها لدعم السياحة ورفع إيراداتها؟', desc: 'يعرض المقال كيف استفادت عُمان من مقوماتها الطبيعية والموقع الجغرافي...', thumb: 'https://picsum.photos/60/60?random=4' },
];

const resources = [
  { name: 'Ministry of Economy Portal', iconBg: 'bg-portal-card-teal', path: '/datasets' },
  { name: 'Central Bank of Oman', iconBg: 'bg-portal-card-green', path: '/datasets' },
  { name: 'Oman Investment Authority', iconBg: 'bg-portal-card-purple', path: '/datasets' },
];

const publications = [
  { title: 'Ministry of Economy Portal', desc: 'Comprehensive statistical overview of Oman', format: 'PDF • 15.2 MB', iconBg: 'bg-portal-card-teal' },
  { title: 'Ministry of Economy Portal', desc: 'Comprehensive statistical overview of Oman', format: 'PDF • 15.2 MB', iconBg: 'bg-portal-card-green' },
  { title: 'Monthly Economic Indicators', desc: 'December 2024 economic data', format: 'XLSX • 2.8 MB', iconBg: 'bg-portal-card-purple' },
];

export default function NewsResourcesPublications() {
  return (
    <section className="flex w-full shrink-0 flex-col gap-[30px] bg-white px-[100px] py-[60px]">
      <div className="grid w-full max-w-[1240px] grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent News & Updates */}
        <div className="flex flex-col gap-4 rounded-[10px] border border-portal-border bg-white px-6 py-[30px]">
          <h3 className="font-display text-[22px] font-bold leading-[50px] tracking-[-0.5px] text-[#161616]">
            Recent News & Updates
          </h3>
          <div className="flex flex-col gap-6">
            {news.map((item) => (
              <div key={item.title} className="flex gap-5">
                <img src={item.thumb} alt="" className="h-[60px] w-[60px] shrink-0 rounded-md object-cover" />
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-portal-success-border bg-portal-success px-2 py-0.5 text-sm text-[#085d3a]">{item.tag}</span>
                    <span className="text-xs text-portal-gray">{item.date}</span>
                  </div>
                  <h4 className="font-display text-lg font-bold leading-5 tracking-[-0.5px] text-[#161616]">
                    {item.title}
                  </h4>
                  <p className="text-base font-medium leading-[26px] text-portal-gray line-clamp-2">
                    {item.desc}
                  </p>
                  <Link to="/datasets" className="inline-flex w-fit items-center gap-1 text-base font-medium text-portal-navy hover:underline">
                    View Statistics
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Link to="/datasets" className="mt-2 text-portal-gray hover:text-portal-navy">+ View More</Link>
        </div>

        {/* Related Portals & Resources */}
        <div className="flex flex-col gap-4 rounded-[10px] border border-portal-border bg-white px-6 py-[30px]">
          <h3 className="font-display text-[22px] font-bold leading-[50px] tracking-[-0.5px] text-[#161616]">
            Related Portals & Resources
          </h3>
          <div className="flex flex-col gap-4">
            {resources.map((r) => (
              <Link
                key={r.name}
                to={r.path}
                className="flex items-center gap-5 rounded-lg border border-portal-border-light bg-white px-5 py-4 hover:border-portal-blue/30"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${r.iconBg}`}>
                  <svg className="h-6 w-6 text-portal-blue" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
                </div>
                <span className="flex-1 font-display text-lg font-medium tracking-[-0.5px] text-[#161616]">{r.name}</span>
                <svg className="h-6 w-6 text-portal-gray" fill="currentColor" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest Publications */}
        <div className="flex flex-col gap-4 rounded-[10px] border border-portal-border bg-white px-6 py-[30px]">
          <h3 className="font-display text-[22px] font-bold leading-[50px] tracking-[-0.5px] text-[#161616]">
            Latest Publications
          </h3>
          <div className="flex flex-col gap-4">
            {publications.map((p) => (
              <div
                key={p.title + p.desc}
                className="flex gap-5 rounded-lg border border-portal-border-light bg-white px-5 py-4"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${p.iconBg}`}>
                  <svg className="h-6 w-6 text-portal-blue" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <h4 className="font-display text-lg font-medium tracking-[-0.5px] text-[#161616]">{p.title}</h4>
                  <p className="text-base font-medium text-portal-gray">{p.desc}</p>
                  <span className="rounded border border-portal-neutral-border bg-portal-neutral px-2 py-0.5 text-sm text-[#1f2a37] w-fit">{p.format}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
