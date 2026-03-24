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
      className="inner-header flex h-14 shrink-0 items-center justify-between gap-4 px-4 md:px-6 lg:px-[100px] py-2 bg-[#182f5b] w-full"
      role="banner"
    >
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <NavLink to="/" className="w-145 shrink-0">
          <img
            src={logo}
            alt="National Centre for Statistics & Information"
            className="h-full w-full object-contain object-left"
          />
        </NavLink>
      </div>
      <div className="flex shrink-0 items-center gap-2">
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
