import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';

const EVENTS = [
  { id: 'none', label: 'No event' },
  { id: 'tariff', label: 'US Tariff change (trade / BoP)', forRole: 'Economic Analyst', path: '/datasets?highlight=trade' },
  { id: 'census', label: 'National Census released', forRole: 'University Student', path: '/datasets?highlight=census' },
  { id: 'oil', label: 'Oil price shock (energy / revenue)', forRole: 'Economic Analyst', path: '/datasets?category=Economy' },
  { id: 'education', label: 'Education reform announced', forRole: 'University Student', path: '/datasets?category=Education' },
];

export default function EventSimulator({ variant = 'dark' }) {
  const navigate = useNavigate();
  const { currentPersona, activeEvent, setActiveEvent } = usePersona();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = variant === 'light';
  const current = EVENTS.find((e) => e.id === activeEvent);

  const handleSelectEvent = (ev) => {
    setActiveEvent(ev.id);
    setOpen(false);
    if (ev.path) navigate(ev.path);
  };

  const handleClearEvent = () => {
    setActiveEvent('none');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${isLight ? 'border-portal-border bg-portal-bg-section text-[#161616]' : 'border-white/30 bg-white/10 text-white'}`}
        title="Simulate external event for contextual UX"
      >
        <span className="opacity-80">Event:</span>
        <span>{current?.label ?? 'None'}</span>
        <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className={`absolute right-0 top-full z-50 mt-1 min-w-[240px] rounded-lg border shadow-lg ${isLight ? 'border-portal-border bg-white' : 'border-white/20 bg-[#1a3370]'}`}>
          <div className="border-b border-black/10 px-3 py-2">
            <p className={`text-xs font-medium ${isLight ? 'text-portal-gray' : 'text-white/80'}`}>
              Simulate event to see contextual content. Selecting an event opens the relevant datasets.
            </p>
          </div>
          <div className="py-1">
            {EVENTS.filter((e) => e.id !== 'none').map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => handleSelectEvent(ev)}
                className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-black/5 ${isLight ? 'text-[#161616]' : 'text-white'}`}
              >
                <span className="font-medium">{ev.label}</span>
                {ev.forRole && (
                  <span className={`text-xs ${isLight ? 'text-portal-gray' : 'text-white/70'}`}>
                    Best for: {ev.forRole}
                  </span>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearEvent}
              className={`flex w-full px-3 py-2 text-left text-sm ${isLight ? 'text-portal-gray hover:bg-portal-bg-section' : 'text-white/80 hover:bg-white/10'}`}
            >
              Clear event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
