import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'ncsi_smart_portal_personas';
const STATE_KEY = 'ncsi_smart_portal_persona_state'; // currentPersonaId + activeEvent
/** All 4 personas from PDF "My profile data per persona" */
const DEFAULT_PERSONAS = [
  {
    id: 'university-student',
    name: 'University Student',
    language: 'English',
    role: 'University Student',
    region: 'Salalah',
    interests: ['Education', 'Demographics', 'Social Trends'],
  },
  {
    id: 'economist',
    name: 'Economist',
    language: 'English',
    role: 'Economist',
    region: 'Muscat',
    interests: ['International Trade', 'Finance', 'Energy & Oil'],
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    language: 'English',
    role: 'Data Analyst',
    region: 'Muscat',
    interests: ['CPI', 'Labour', 'Tourism', 'Open data'],
  },
  {
    id: 'statistician',
    name: 'Statistician',
    language: 'English',
    role: 'Statistician',
    region: 'Muscat',
    interests: ['Population', 'Labour', 'Education', 'CPI'],
  },
];

function loadPersonas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 4) {
        // Migrate old economic-analyst to economist
        return parsed.map((p) =>
          p.id === 'economic-analyst' ? { ...DEFAULT_PERSONAS.find((d) => d.id === 'economist'), id: 'economist' } : p
        );
      }
    }
  } catch (_) {}
  return DEFAULT_PERSONAS;
}

function savePersonas(personas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
}

function loadPersonaState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const allowedEvents = new Set(['tariff', 'census', 'oil', 'education', 'none']);
        const eventValue = allowedEvents.has(parsed.activeEvent) ? parsed.activeEvent : 'none';
        let personaId = parsed.currentPersonaId ?? null;
        if (personaId === 'economic-analyst') personaId = 'economist'; // migrate
        return { currentPersonaId: personaId, activeEvent: eventValue };
      }
    }
  } catch (_) {}
  return { currentPersonaId: null, activeEvent: 'none' };
}

function savePersonaState(currentPersonaId, activeEvent) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({ currentPersonaId, activeEvent }));
  } catch (_) {}
}

const PersonaContext = createContext(null);

export function PersonaProvider({ children }) {
  const [personas, setPersonas] = useState(loadPersonas);
  const initialState = loadPersonaState();
  const [currentPersonaId, setCurrentPersonaId] = useState(initialState.currentPersonaId);
  const [activeEvent, setActiveEvent] = useState(initialState.activeEvent);

  useEffect(() => {
    savePersonas(personas);
  }, [personas]);

  useEffect(() => {
    savePersonaState(currentPersonaId, activeEvent);
  }, [currentPersonaId, activeEvent]);

  // Demo-ready: default to first persona when none was ever selected (first visit)
  const hasDefaultedRef = useRef(false);
  useEffect(() => {
    if (hasDefaultedRef.current) return;
    if (currentPersonaId == null && personas.length > 0) {
      hasDefaultedRef.current = true;
      setCurrentPersonaId(personas[0].id);
    }
  }, [currentPersonaId, personas]);

  const currentPersona = currentPersonaId ? personas.find((p) => p.id === currentPersonaId) : null;

  const savePersona = useCallback((id, updates) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const getPersona = useCallback(
    (id) => personas.find((p) => p.id === id),
    [personas]
  );

  const value = {
    personas,
    setPersonas,
    currentPersonaId,
    setCurrentPersonaId,
    currentPersona,
    activeEvent,
    setActiveEvent,
    savePersona,
    getPersona,
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within PersonaProvider');
  return ctx;
}
