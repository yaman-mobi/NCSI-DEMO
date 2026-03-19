import { Link } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';
import { useAuth } from '../context/AuthContext';
import { profileToPersona } from '../lib/personaUtils';

const INTEREST_IMAGES = {
  'International Trade': 'https://picsum.photos/seed/trade/80/80',
  Finance: 'https://picsum.photos/seed/finance/80/80',
  'Energy & Oil': 'https://picsum.photos/seed/energy/80/80',
  Demographics: 'https://picsum.photos/seed/demographics/80/80',
  Education: 'https://picsum.photos/seed/education/80/80',
  'Social Trends': 'https://picsum.photos/seed/social/80/80',
  Healthcare: 'https://picsum.photos/seed/health/80/80',
  Technology: 'https://picsum.photos/seed/tech/80/80',
  Tourism: 'https://picsum.photos/seed/tourism/80/80',
  Infrastructure: 'https://picsum.photos/seed/infrastructure/80/80',
};

const INTEREST_TO_DATASETS = {
  'International Trade': {
    to: '/datasets?category=Economy&highlight=trade',
    label: 'International trade & BoP',
    desc: 'Imports, exports, and balance of payments for Oman.',
  },
  Finance: {
    to: '/datasets?category=Economy',
    label: 'GDP & national accounts',
    desc: 'Growth, sectors, and macro aggregates.',
  },
  'Energy & Oil': {
    to: '/datasets?category=Economy',
    label: 'Energy & oil indicators',
    desc: 'Production, exports, and prices.',
  },
  Demographics: {
    to: '/datasets?highlight=census',
    label: 'Census & demographics',
    desc: 'Population by governorate, age, and gender.',
  },
  Education: {
    to: '/datasets?category=Education',
    label: 'Education statistics',
    desc: 'Enrolment, graduates, and outcomes.',
  },
  'Social Trends': {
    to: '/datasets?category=Demographics',
    label: 'Social trends',
    desc: 'Households, youth, and society.',
  },
  Healthcare: {
    to: '/datasets?category=Demographics',
    label: 'Health indicators',
    desc: 'Facilities, coverage, and vital statistics.',
  },
  Technology: {
    to: '/datasets?category=Economy',
    label: 'ICT & innovation',
    desc: 'Digital economy indicators.',
  },
  Tourism: {
    to: '/datasets?category=Economy',
    label: 'Tourism statistics',
    desc: 'Arrivals, nights, and revenues.',
  },
  Infrastructure: {
    to: '/datasets?category=Economy',
    label: 'Infrastructure data',
    desc: 'Construction and transport indicators.',
  },
};

function getFeaturedForPersona(persona) {
  const role = persona?.role || '';
  const interests = persona?.interests || [];

  if (role === 'Economic Analyst' || role === 'Economist') {
    return {
      title: 'Featured signals for analysts',
      subtitle: 'Quick entry points into trade, BoP, and growth data. From PDF profile.',
      items: [
        {
          label: 'Trade & balance of payments',
          to: '/datasets?category=Economy&highlight=trade',
          desc: 'Imports, exports, and external position.',
          tag: 'Trade',
        },
        {
          label: 'GDP & national accounts',
          to: '/datasets?category=Economy',
          desc: 'Headline growth and sector breakdowns.',
          tag: 'GDP',
        },
        {
          label: 'Labour market indicators',
          to: '/datasets?category=Labor%20Market',
          desc: 'Employment and unemployment by governorate.',
          tag: 'Labour',
        },
      ],
    };
  }

  if (role === 'University Student') {
    return {
      title: 'Featured for students',
      subtitle: 'Datasets that work well for projects and assignments. From PDF profile data.',
      items: [
        { label: 'Higher Education Enrollment Trends', to: '/datasets?category=Education', desc: 'Understand popular majors and competition levels.', tag: 'Education' },
        { label: 'Census 2020 summary', to: '/datasets?highlight=census', desc: 'Population, age groups, and regions.', tag: 'Census' },
        { label: 'Graduate Employment Outcomes', to: '/datasets?category=Labor%20Market', desc: 'See which degrees lead to jobs.', tag: 'Labour' },
        { label: 'Tourism Sector Activity', to: '/datasets?category=Economy', desc: 'Explore growing career sectors.', tag: 'Tourism' },
      ],
    };
  }

  if (role === 'Data Analyst') {
    return {
      title: 'Featured for data analysts',
      subtitle: 'CPI, labour segmentation, tourism KPIs. Build dashboards and pipelines.',
      items: [
        { label: 'Consumer Price Index (Detailed)', to: '/datasets?category=Economy', desc: 'Build inflation dashboards.', tag: 'CPI' },
        { label: 'Labour Market Segmentation', to: '/datasets?category=Labor%20Market', desc: 'Deep slicing by age, gender, education.', tag: 'Labour' },
        { label: 'Tourism KPIs', to: '/datasets?category=Economy', desc: 'Track performance metrics.', tag: 'Tourism' },
        { label: 'Population by Governorate', to: '/datasets?category=Demographics', desc: 'Geo-based dashboards.', tag: 'Population' },
      ],
    };
  }

  if (role === 'Statistician') {
    return {
      title: 'Featured for statisticians',
      subtitle: 'Population, CPI basket, labour force. Cross-domain analysis.',
      items: [
        { label: 'Population Demographics', to: '/datasets?category=Demographics', desc: 'Base for all statistical analysis.', tag: 'Population' },
        { label: 'Labour Force Survey', to: '/datasets?category=Labor%20Market', desc: 'Official employment statistics.', tag: 'Labour' },
        { label: 'CPI Basket Structure', to: '/datasets?category=Economy', desc: 'Understand inflation methodology.', tag: 'CPI' },
        { label: 'National Accounts', to: '/datasets?category=Economy', desc: 'Macroeconomic framework.', tag: 'GDP' },
      ],
    };
  }

  if (interests.length > 0) {
    const items = interests.slice(0, 4).map((i) => {
      const preset = INTEREST_TO_DATASETS[i];
      const base = preset || { to: '/datasets', label: i, desc: 'Relevant official datasets.' };
      const image = INTEREST_IMAGES[i] || 'https://picsum.photos/seed/ncsi/80/80';
      return { ...base, tag: i, image };
    });
    if (items.length > 0) {
      return {
        title: 'Featured for you',
        subtitle: 'AI has selected a few starting points based on your profile.',
        items,
      };
    }
  }

  return null;
}

export default function FeaturedForYou() {
  const { currentPersona } = usePersona();
  const { profile, isAuthenticated } = useAuth();
  const effectivePersona = isAuthenticated && profile ? profileToPersona(profile) : currentPersona;
  const featuredRaw = effectivePersona ? getFeaturedForPersona(effectivePersona) : null;
  const featured = featuredRaw
    ? {
        ...featuredRaw,
        items: featuredRaw.items.slice(0, 4),
      }
    : null;
  if (!featured) return null;

  return (
    <section
      className="w-full border-t border-portal-border-light bg-gradient-to-r from-portal-bg-section via-portal-ai-bg/30 to-portal-bg-section px-[100px] py-5"
      aria-label="Featured for you"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 rounded-2xl border border-portal-border-light bg-white/70 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-ai-gradient-from/25 to-ai-gradient-to/25">
            <svg className="h-4 w-4 text-portal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold tracking-[-0.2px] text-portal-navy">
              {featured.title}
            </h2>
            {featured.subtitle && (
              <p className="mt-0.5 text-xs text-portal-gray line-clamp-1">{featured.subtitle}</p>
            )}
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {featured.items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="group flex items-center gap-3 rounded-2xl border border-portal-border-light bg-portal-bg-section/80 px-3 py-2 text-xs shadow-sm transition-all hover:border-portal-blue/60 hover:bg-white hover:shadow-md"
            >
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-portal-bg-section">
                <img
                  src={item.image || INTEREST_IMAGES[item.tag] || 'https://picsum.photos/seed/ncsi/80/80'}
                  alt={item.tag}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 rounded-full ring-1 ring-white/60" />
              </div>
              <div className="min-w-0 text-left">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-portal-gray-muted">
                  <span className="inline-flex rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold text-portal-blue">
                    {item.tag}
                  </span>
                </p>
                <p className="truncate font-medium text-portal-navy">{item.label}</p>
                <p className="truncate text-[10px] text-portal-gray-muted">{item.desc}</p>
              </div>
              <svg
                className="h-3.5 w-3.5 flex-shrink-0 text-portal-gray group-hover:text-portal-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

