import { NavLink, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../images/ncis-logo.svg';

const EXTERNAL_BASE = 'https://realsoftapps.com/RealDataPortal_Demo';
const isProd = import.meta.env.PROD;
const navItems = [
  { label: 'Home', path: `${EXTERNAL_BASE}/home/landing` },
  { label: 'My Queries', path: '/my-queries' },
  { label: 'Datasets', path: `${EXTERNAL_BASE}/home/indicator` },
  { label: 'Help', path: '/help' },
  { label: 'AI Assistant', path: '/ai-assistant' },
];


export default function TopBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    function handleClickOutside(e) {
      if (moreRef.current && !moreRef.current.contains(e.target))
        setMoreOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = isAuthenticated
  ? [
    { label: 'My Profile', path: isProd ? `${EXTERNAL_BASE}/app/profile` : '/' },
    ...navItems,
    { label: 'Data Copilot', path: `${EXTERNAL_BASE}/copilot` }
  ]
  : navItems;

  return (
    <header
      className="inner-header relative flex h-14 shrink-0 items-center justify-between gap-3 px-4 md:px-6 lg:px-[100px] py-2 bg-[#182f5b] w-full"
      role="banner"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
        <NavLink to="/" className="w-145 min-w-0 shrink-0">
          <img
            src={logo}
            alt="National Centre for Statistics & Information"
            className="h-full w-full max-h-9 object-contain object-left"
          />
        </NavLink>
      </div>
      <div className="flex shrink-0 items-center gap-2" ref={moreRef}>
        <div className="relative sm:hidden">
          <button
            type="button"
            className="flex rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-expanded={moreOpen}
            aria-controls="topbar-mobile-nav"
            aria-label={moreOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMoreOpen((o) => !o)}
          >
            {moreOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          {moreOpen && (
            <nav
              id="topbar-mobile-nav"
              className="absolute right-0 top-full z-[100] mt-1 max-h-[min(70vh,24rem)] w-[min(calc(100vw-2rem),16rem)] overflow-y-auto rounded-lg border border-white/20 bg-[#182f5b] py-2 shadow-xl"
              aria-label="Main navigation"
            >
              {menuItems.map(({ label, path }) => {
                const isExternal = path.startsWith('http');
                const exactMatch = !isExternal && location.pathname === path;
                const startsWithMatch = !isExternal && path !== '/' && location.pathname.startsWith(path);
                const active =
                  (exactMatch && (
                    (path !== '/' && path !== '/ai-assistant') ||
                    (path === '/' && label === 'Home') ||
                    (path === '/ai-assistant' && label === 'AI Assistant')
                  )) ||
                  (startsWithMatch && (
                    path !== '/ai-assistant' ||
                    (path === '/ai-assistant' && label === 'AI Assistant')
                  ));
                const itemClass = `block px-4 py-2.5 text-sm font-medium ${
                  active ? 'bg-white/10 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`;
                return isExternal ? (
                  <a
                    key={label}
                    href={path}
                    className={itemClass}
                    rel="noopener noreferrer"
                    onClick={() => setMoreOpen(false)}
                  >
                    {label}
                  </a>
                ) : (
                  <NavLink key={label} to={path} className={itemClass} onClick={() => setMoreOpen(false)}>
                    {label}
                  </NavLink>
                );
              })}
            </nav>
          )}
        </div>
        <nav
          className="hidden items-center gap-0 sm:flex"
          aria-label="Main navigation"
        >
          {menuItems.map(({ label, path }) => {
            const isExternal = path.startsWith('http');
            const exactMatch = !isExternal && location.pathname === path;
            const startsWithMatch = !isExternal && path !== '/' && location.pathname.startsWith(path);
            const active =
              (exactMatch && (
                (path !== '/' && path !== '/ai-assistant') ||
                (path === '/' && label === 'Home') ||
                (path === '/ai-assistant' && label === 'AI Assistant')
              )) ||
              (startsWithMatch && (
                path !== '/ai-assistant' ||
                (path === '/ai-assistant' && label === 'AI Assistant')
              ));
            const linkClass = `flex items-center px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap f-16 ${
              active ? 'text-white underline decoration-2 underline-offset-2' : 'text-white/90 hover:text-white'
            }`;
            return isExternal ? (
              <a key={label} href={path} className={linkClass} rel="noopener noreferrer">
                {label}
              </a>
            ) : (
              <NavLink key={label} to={path} className={linkClass}>
                {label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
