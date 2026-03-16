const STORAGE_KEY = 'ncsi_smart_portal_queries';

export function loadQueries(defaultQueries) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return defaultQueries;
}

export function saveQueries(queries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
}
