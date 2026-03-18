const features = [
  {
    iconBg: 'bg-portal-card-teal',
    icon: (
      <svg className="h-8 w-8 text-[#0d9488]" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z"/></svg>
    ),
    title: 'Unified Data Access',
    description: 'Access comprehensive statistical data from multiple government sources through a single, intuitive interface with real-time updates and historical trends.',
  },
  {
    iconBg: 'bg-portal-card-green',
    icon: (
      <svg className="h-8 w-8 text-[#16a34a]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/></svg>
    ),
    title: 'AI-Powered Insights',
    description: 'Leverage advanced AI algorithms to discover patterns, generate automated reports, and receive intelligent recommendations for data-driven decisions.',
  },
  {
    iconBg: 'bg-portal-card-purple',
    icon: (
      <svg className="h-8 w-8 text-[#7c3aed]" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
    ),
    title: 'Collaborative Platform',
    description: 'Enable seamless collaboration between government agencies, researchers, and stakeholders with shared workspaces and real-time communication tools.',
  },
];

export default function WhatIsSmartPortal() {
  return (
    <section className="flex w-full shrink-0 flex-col items-center gap-5 bg-white px-[100px] py-[60px]">
      <h2 className="font-display text-[30px] font-extrabold leading-[50px] tracking-[-0.5px] text-[#161616]">
        What is SMART Portal?
      </h2>
      <p className="max-w-[915px] text-center text-base font-medium leading-[35px] text-portal-gray">
        SMART Portal is Oman's comprehensive data intelligence platform, providing seamless access to statistical data, AI-powered analytics, and collaborative tools for evidence-based decision making.
      </p>
      <div className="flex w-full max-w-[1240px] gap-[58px]">
        {features.map((f) => (
          <div key={f.title} className="flex flex-1 flex-col items-center gap-[18px] p-[25px]">
            <div className={`flex h-[50px] w-[50px] items-center justify-center rounded ${f.iconBg} p-3`}>
              {f.icon}
            </div>
            <h3 className="text-center font-display text-lg font-bold leading-5 tracking-[-0.5px] text-[#161616]">
              {f.title}
            </h3>
            <p className="text-center text-base font-medium leading-[26px] text-portal-gray">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
