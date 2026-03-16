import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';
import { useAuth } from '../context/AuthContext';
import { profileToPersona } from '../lib/personaUtils';

const HERO_BG = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1440&q=80';

function getHeroContent(persona) {
  const role = persona?.role || '';
  const region = persona?.region || 'Oman';
  const interests = persona?.interests || [];
  if (role === 'Economic Analyst') {
    return {
      tagline: "Trade, BoP & Economic Data",
      subtitle: "Access trade statistics, Balance of Payments, and economic indicators to support analysis and policy. Data from NCSI and the Central Bank of Oman.",
      tags: ['Economy', 'International Trade', 'Finance'],
    };
  }
  if (role === 'University Student') {
    return {
      tagline: "Census, Demographics & Education",
      subtitle: `Explore census data, population statistics, and education indicators for ${region} and the Sultanate. Support your research with NCSI open data.`,
      tags: ['Demographics', 'Education', 'Social Trends'],
    };
  }
  return {
    tagline: "Discover Oman's Open Data",
    subtitle: "Access comprehensive statistical data, economic indicators, and government datasets to support research, policy-making, and innovation in the Sultanate of Oman.",
    tags: ['Demographics', 'Economy', 'Environment'],
  };
}

export default function Hero() {
  const navigate = useNavigate();
  const { currentPersona } = usePersona();
  const { user, profile, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const effectivePersona = isAuthenticated && profile ? profileToPersona(profile, user?.fullName) : currentPersona;
  const content = getHeroContent(effectivePersona);
  const tags = content.tags;

  const handleSearch = (e) => {
    e?.preventDefault?.();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/datasets');
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/datasets?category=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="relative flex h-[731px] w-full shrink-0 items-center justify-between px-[100px] py-[66px]">
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a3370] to-[#2a4b92] opacity-92" />
      </div>

      <div className="relative z-[1] flex w-[539px] flex-col gap-[30px]">
        <h1 className="font-display text-[60px] font-bold leading-[80px] tracking-[-1px] text-white">
          {isAuthenticated && user?.fullName ? (
            <>Welcome back,<br />{user.fullName}</>
          ) : (
            <>Discover Oman's<br />Open Data</>
          )}
        </h1>
        {(effectivePersona || isAuthenticated) && (
          <p className="font-sans text-sm font-medium uppercase tracking-wider text-white/90">
            {isAuthenticated ? 'Your personalized portal · ' : ''}{content.tagline}
          </p>
        )}
        <p className="font-sans text-lg leading-[42px] text-white text-justify">
          {content.subtitle}
        </p>
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => navigate('/datasets')}
            className="inline-flex h-10 items-center justify-center gap-1 rounded bg-white px-4 text-portal-blue-primary text-base font-medium hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Explore Datasets
          </button>
          <button
            type="button"
            onClick={() => navigate('/ai-assistant')}
            className="inline-flex h-10 items-center justify-center gap-1 rounded bg-gradient-to-r from-[#a624d2] to-[#3a70d8] px-4 text-white text-base font-medium hover:opacity-95"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Launch AI Data Assistant
          </button>
        </div>
      </div>

      <div className="relative z-[1] w-[592px] shrink-0 rounded-[13px] border border-white/20 bg-white/10 p-[25px]">
        <div className="mb-4 flex items-center gap-3">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-base font-medium text-white">Search Datasets</span>
        </div>
        <form onSubmit={handleSearch} className="mb-4 flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What is the unemployment rate in Muscat for 2024?"
            className="flex-1 rounded border-0 bg-white px-4 py-2.5 text-sm text-[#161616] placeholder:text-[#838383]"
          />
          <button type="submit" className="h-10 shrink-0 rounded bg-portal-navy px-4 text-base font-medium text-white hover:bg-portal-blue-dark">
            Search
          </button>
        </form>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="rounded-full bg-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/30"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
