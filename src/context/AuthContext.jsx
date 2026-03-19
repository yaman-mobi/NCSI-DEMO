import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_STORAGE_KEY = 'ncsi_smart_portal_auth';
const PROFILE_STORAGE_KEY = 'ncsi_smart_portal_user_profile';

function loadStoredAuth() {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.userId && parsed.email) {
        return {
          userId: parsed.userId,
          email: parsed.email,
          fullName: parsed.fullName || parsed.email.split('@')[0],
        };
      }
    }
  } catch (_) {}
  return null;
}

function loadStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          language: parsed.language || 'English',
          role_occupation: parsed.role_occupation || '',
          region: parsed.region || '',
          interests: Array.isArray(parsed.interests) ? parsed.interests : [],
        };
      }
    }
  } catch (_) {}
  return null;
}

function saveAuth(user) {
  if (user && user.userId && user.email) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
    }));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function saveProfile(profile) {
  if (profile && typeof profile === 'object') {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredAuth);
  const [profile, setProfileState] = useState(loadStoredProfile);

  useEffect(() => {
    if (user) {
      const existing = loadStoredProfile();
      if (existing && (existing.role_occupation || (existing.interests && existing.interests.length > 0))) {
        setProfileState(existing);
      }
    } else {
      setProfileState(null);
    }
  }, [user?.userId]);

  const updateProfile = useCallback((updates) => {
    setProfileState((prev) => {
      const next = { ...(prev || {}), ...updates };
      if (next.interests && !Array.isArray(next.interests)) next.interests = [];
      saveProfile(next);
      return next;
    });
  }, []);

  const signUp = useCallback((email, password, fullName) => {
    const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const u = {
      userId,
      email: email.trim(),
      fullName: (fullName || email.split('@')[0] || 'User').trim(),
    };
    setUser(u);
    saveAuth(u);
    const existingProfile = loadStoredProfile();
    const defaultProfile = {
      language: 'English',
      role_occupation: '',
      region: '',
      interests: [],
    };
    setProfileState(existingProfile || defaultProfile);
    if (!existingProfile) saveProfile(defaultProfile);
    return { error: null };
  }, []);

  const signIn = useCallback((email, password) => {
    const stored = loadStoredAuth();
    if (stored && stored.email.toLowerCase() === email.trim().toLowerCase()) {
      setUser(stored);
      setProfileState(loadStoredProfile());
      return { error: null };
    }
    return { error: { message: 'Invalid email or password. For demo, register first or use the same email you registered with.' } };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setProfileState(null);
    saveAuth(null);
    localStorage.clear();
  }, []);

  const value = {
    user,
    profile,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasCompletedOnboarding: !!(
      profile &&
      profile.role_occupation &&
      Array.isArray(profile.interests) &&
      profile.interests.length > 0
    ),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
