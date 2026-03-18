/**
 * Proactive alerts: "Notify when..." – stored in localStorage for demo.
 */

const STORAGE_KEY = 'ncsi_smart_portal_alerts';
const TRIGGERED_KEY = 'ncsi_smart_portal_alerts_triggered';

export function loadAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (_) {}
  return [];
}

export function saveAlerts(alerts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (_) {}
}

export function addAlert(alert) {
  const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newAlert = {
    id,
    label: alert.label || 'New alert',
    type: alert.type || 'threshold', // 'threshold' | 'new_data' | 'new_report'
    condition: alert.condition || {},
    createdAt: new Date().toISOString(),
    active: true,
  };
  const alerts = loadAlerts();
  alerts.push(newAlert);
  saveAlerts(alerts);
  return newAlert;
}

export function removeAlert(id) {
  const alerts = loadAlerts().filter((a) => a.id !== id);
  saveAlerts(alerts);
}

export function loadTriggered() {
  try {
    const raw = localStorage.getItem(TRIGGERED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (_) {}
  return [];
}

export function saveTriggered(triggered) {
  try {
    localStorage.setItem(TRIGGERED_KEY, JSON.stringify(triggered));
  } catch (_) {}
}

export function markAlertTriggered(alertId, message) {
  const triggered = loadTriggered();
  triggered.unshift({
    alertId,
    message: message || 'Your alert condition was met.',
    at: new Date().toISOString(),
    read: false,
  });
  saveTriggered(triggered.slice(0, 50));
}

export function markTriggeredAsRead(id) {
  const triggered = loadTriggered().map((t) => (t.alertId === id || t.read ? { ...t, read: true } : t));
  saveTriggered(triggered);
}

export function markAllTriggeredAsRead() {
  saveTriggered(loadTriggered().map((t) => ({ ...t, read: true })));
}

/** Seed one demo notification for first-time visitors (run once when panel opens). */
const DEMO_TRIGGERED_KEY = 'ncsi_smart_portal_alerts_demo_seeded';
export function seedDemoTriggeredIfEmpty() {
  try {
    if (localStorage.getItem(DEMO_TRIGGERED_KEY)) return;
    const t = loadTriggered();
    if (t.length > 0) return;
    saveTriggered([{
      alertId: 'demo',
      message: 'New Census data for Salalah is now available on the portal.',
      at: new Date().toISOString(),
      read: false,
    }]);
    localStorage.setItem(DEMO_TRIGGERED_KEY, '1');
  } catch (_) {}
}
