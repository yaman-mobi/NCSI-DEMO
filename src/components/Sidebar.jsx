import { NavLink, Link } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/datasets', label: 'Datasets' },
  { to: '/my-queries', label: 'My Queries' },
  { to: '/ai-assistant', label: 'AI Assistant' },
  { to: '/reports', label: 'Reports' },
  { to: '/search', label: 'Search' },
  { to: '/help', label: 'Help' },
  { to: '/admin/personas', label: 'Admin – Personas' },
]

export default function Sidebar() {
  return (
    <aside className="w-[260px] shrink-0 bg-portal-navy flex flex-col" aria-label="Sidebar navigation">
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm font-bold">R</div>
          <div>
            <h1 className="text-white font-semibold tracking-tight">RealData Portal</h1>
            <p className="text-white/70 text-xs mt-0.5">Discover Oman&apos;s Open Data</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Link to="/" className="block px-3 py-2 text-xs text-white/60 hover:text-white/90">← Back to landing</Link>
        <p className="text-xs text-white/50 px-3 mt-1">RealData Portal v1.0</p>
      </div>
    </aside>
  )
}
