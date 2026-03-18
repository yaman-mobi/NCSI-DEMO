import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Datasets', path: '/datasets' },
  { label: 'Reports', path: '/reports' },
  { label: 'My Queries', path: '/my-queries' },
  { label: 'AI Assistant', path: '/ai-assistant' },
  { label: 'Help', path: '/help' },
  { label: 'Search', path: '/search' },
];

export default function MainHeader({ variant = 'dark' }) {
  const isLight = variant === 'light';
  const location = useLocation();
  return (
    <header
      className={`flex h-20 items-center justify-between px-4 md:px-8 lg:px-[100px] py-2 ${
        isLight ? 'bg-white border-b border-portal-border' : 'absolute left-0 right-0 top-11 z-10'
      }`}
      role="banner"
    >
      <NavLink to="/" className="h-12 w-36 shrink-0">
        <img
          src="https://placehold.co/145x48/182f5b/ffffff?text=NCSI"
          alt="National Centre for Statistics & Information"
          className="h-full w-full object-contain"
        />
      </NavLink>
      <nav className="flex h-full items-center gap-0" aria-label="Main navigation">
        {navItems.map(({ label, path }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          const linkClass = isLight
            ? `flex flex-col items-center justify-center px-5 py-3 text-base font-bold hover:underline ${active ? 'text-portal-blue-primary' : 'text-portal-navy-dark'}`
            : `flex flex-col items-center justify-center px-5 py-3 text-base font-bold hover:underline ${active ? 'text-white underline' : 'text-white'}`;
          return (
            <NavLink key={path} to={path} className={linkClass}>
              {label}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
