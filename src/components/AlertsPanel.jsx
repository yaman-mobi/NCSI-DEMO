import { useState, useRef, useEffect } from 'react';
import {
  loadAlerts,
  addAlert,
  removeAlert,
  loadTriggered,
  markTriggeredAsRead,
  markAllTriggeredAsRead,
  seedDemoTriggeredIfEmpty,
} from '../lib/alertsStorage';

export default function AlertsPanel({ variant = 'dark' }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('triggered'); // 'triggered' | 'manage'
  const [alerts, setAlerts] = useState(loadAlerts);
  const [triggered, setTriggered] = useState(loadTriggered);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlertLabel, setNewAlertLabel] = useState('');
  const [newAlertType, setNewAlertType] = useState('new_data');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      seedDemoTriggeredIfEmpty();
      setAlerts(loadAlerts());
      setTriggered(loadTriggered());
    }
  }, [open]);

  const refresh = () => {
    seedDemoTriggeredIfEmpty();
    setAlerts(loadAlerts());
    setTriggered(loadTriggered());
  };

  const handleCreateAlert = () => {
    if (!newAlertLabel.trim()) return;
    addAlert({ label: newAlertLabel.trim(), type: newAlertType });
    setNewAlertLabel('');
    setShowCreate(false);
    refresh();
  };

  const unreadCount = triggered.filter((t) => !t.read).length;
  const isLight = variant === 'light';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(!open); refresh(); }}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border text-xs font-medium ${isLight ? 'border-portal-border bg-portal-bg-section text-[#161616]' : 'border-white/30 bg-white/10 text-white'}`}
        aria-label="Alerts"
        aria-expanded={open}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-full z-50 mt-1 w-[320px] rounded-lg border shadow-xl ${isLight ? 'border-portal-border bg-white' : 'border-white/20 bg-[#1a3370]'}`}>
          <div className={`flex border-b ${isLight ? 'border-portal-border' : 'border-white/20'}`}>
            <button
              type="button"
              onClick={() => setTab('triggered')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${tab === 'triggered' ? (isLight ? 'text-portal-blue border-b-2 border-portal-blue' : 'text-white border-b-2 border-white') : (isLight ? 'text-portal-gray' : 'text-white/70')}`}
            >
              Notifications
              {unreadCount > 0 && <span className="ml-1 text-xs">({unreadCount})</span>}
            </button>
            <button
              type="button"
              onClick={() => setTab('manage')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${tab === 'manage' ? (isLight ? 'text-portal-blue border-b-2 border-portal-blue' : 'text-white border-b-2 border-white') : (isLight ? 'text-portal-gray' : 'text-white/70')}`}
            >
              Manage
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto p-3">
            {tab === 'triggered' && (
              <>
                {triggered.length === 0 ? (
                  <p className={`py-4 text-center text-sm ${isLight ? 'text-portal-gray' : 'text-white/70'}`}>
                    No notifications yet. Create an alert in the Manage tab to get notified when conditions are met.
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { markAllTriggeredAsRead(); refresh(); }}
                      className="mb-2 text-xs font-medium text-portal-blue hover:underline"
                    >
                      Mark all read
                    </button>
                    <ul className="space-y-2">
                      {triggered.slice(0, 10).map((t, i) => (
                        <li
                          key={i}
                          className={`rounded-lg border p-2 text-sm ${t.read ? (isLight ? 'border-portal-border-light bg-portal-bg-section/50' : 'border-white/10 bg-white/5') : (isLight ? 'border-amber-200 bg-amber-50' : 'border-amber-400/30 bg-amber-500/10')}`}
                        >
                          <p className={isLight ? 'text-[#161616]' : 'text-white'}>{t.message}</p>
                          <p className="mt-1 text-xs text-portal-gray-muted">{new Date(t.at).toLocaleString()}</p>
                          {!t.read && (
                            <button
                              type="button"
                              onClick={() => { markTriggeredAsRead(t.alertId); refresh(); }}
                              className="mt-2 text-xs font-medium text-portal-blue"
                            >
                              Mark read
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {tab === 'manage' && (
              <>
                <div className="space-y-2">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className={`flex items-center justify-between rounded-lg border p-2 text-sm ${isLight ? 'border-portal-border bg-portal-bg-section' : 'border-white/10 bg-white/5'}`}
                    >
                      <span className={isLight ? 'text-[#161616]' : 'text-white'}>{a.label}</span>
                      <button
                        type="button"
                        onClick={() => { removeAlert(a.id); refresh(); }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {!showCreate ? (
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="mt-3 w-full rounded border border-dashed border-portal-blue py-2 text-sm font-medium text-portal-blue hover:bg-portal-ai-bg"
                  >
                    + Create alert
                  </button>
                ) : (
                  <div className="mt-3 space-y-2 rounded-lg border border-portal-border bg-portal-bg-section p-3">
                    <input
                      type="text"
                      value={newAlertLabel}
                      onChange={(e) => setNewAlertLabel(e.target.value)}
                      placeholder="e.g. When unemployment in Muscat > 3%"
                      className="w-full rounded border border-portal-border-light px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-portal-blue"
                    />
                    <select
                      value={newAlertType}
                      onChange={(e) => setNewAlertType(e.target.value)}
                      className="w-full rounded border border-portal-border-light px-2 py-1.5 text-sm focus:outline-none"
                    >
                      <option value="threshold">Threshold (e.g. indicator &gt; X%)</option>
                      <option value="new_data">New data in category</option>
                      <option value="new_report">New report published</option>
                    </select>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleCreateAlert} className="rounded bg-portal-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-[#004a75]">
                        Save
                      </button>
                      <button type="button" onClick={() => { setShowCreate(false); setNewAlertLabel(''); }} className="rounded border border-portal-border px-3 py-1.5 text-sm font-medium text-[#161616]">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
