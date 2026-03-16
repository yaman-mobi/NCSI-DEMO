import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconBell } from './Icons'

export default function Header() {
  const [search, setSearch] = useState('')

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <label htmlFor="global-search" className="sr-only">Search datasets</label>
        <input
          id="global-search"
          type="search"
          placeholder="Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-oman-sky focus:border-transparent"
        />
      </div>
      <div className="flex items-center gap-4 ml-6">
        <Link
          to="/app/notifications"
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <IconBell className="h-5 w-5" aria-hidden />
        </Link>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Hi,</span>
          <Link to="/app/profile" className="font-medium text-oman-navy hover:underline">Omar</Link>
          <span>▼</span>
        </div>
        <Link
          to="/login"
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="px-3 py-1.5 rounded-lg bg-oman-navy text-white text-sm font-medium hover:bg-oman-navy-light"
        >
          Login
        </Link>
      </div>
    </header>
  )
}
