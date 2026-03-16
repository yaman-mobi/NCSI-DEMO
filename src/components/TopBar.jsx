import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import PersonaSwitcher from './PersonaSwitcher';
import EventSimulator from './EventSimulator';
import AlertsPanel from './AlertsPanel';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Datasets', path: '/datasets' },
  { label: 'Reports', path: '/reports' },
  { label: 'My Queries', path: '/my-queries' },
  { label: 'AI Assistant', path: '/ai-assistant' },
  { label: 'Admin', path: '/admin/personas' },
  { label: 'Help', path: '/help' },
  { label: 'Search', path: '/search' },
];

export default function TopBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    function handleClickOutside(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut();
    navigate('/', { replace: true });
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 md:px-6 lg:px-[100px] py-2 bg-[#182f5b] w-full" role="banner">
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <NavLink to="/" className="h-9 w-28 shrink-0">
          <img
            src="https://placehold.co/145x48/182f5b/ffffff?text=NCSI"
            alt="National Centre for Statistics & Information"
            className="h-full w-full object-contain object-left"
          />
        </NavLink>
        <nav className="hidden items-center gap-0 sm:flex" aria-label="Main navigation">
          {navItems.map(({ label, path }) => {
            const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  active ? 'text-white underline decoration-2 underline-offset-2' : 'text-white/90 hover:text-white'
                }`}
              >
                {label}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {/* Alerts icon only */}
        <AlertsPanel variant="dark" />
        <button type="button" className="hidden text-sm font-medium text-white/90 hover:text-white sm:block" aria-label="Arabic (coming soon)">
          عربي
        </button>
        {isAuthenticated ? (
          <>
            <span className="hidden text-sm text-white/90 sm:block">Hi, <span className="font-medium text-white">{displayName}</span></span>
            {profile?.role_occupation && (
              <span className="hidden text-xs text-white/70 lg:block" title="Your role">{profile.role_occupation}</span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/register" className="hidden text-sm font-medium text-white/90 hover:text-white sm:block">
              Register
            </Link>
            <Link to="/login" className="rounded border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20">
              Login
            </Link>
          </>
        )}
        {/* \"More\" menu (all screens) – shows persona + event */}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20"
            aria-label="More options"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-white/20 bg-[#1a3370] p-3 shadow-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">View & event</p>
              <div className="flex flex-col gap-2">
                <PersonaSwitcher variant="light" />
                <EventSimulator variant="light" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
