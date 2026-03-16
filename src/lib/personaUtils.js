/**
 * Maps auth user profile to the same shape as PersonaContext persona
 * so components can use one interface for both admin personas and logged-in user.
 */
export function profileToPersona(profile, userName = 'You') {
  if (!profile || typeof profile !== 'object') return null;
  return {
    id: 'user-profile',
    name: profile.role_occupation || userName,
    language: profile.language || 'English',
    role: profile.role_occupation || '',
    region: profile.region || '',
    interests: Array.isArray(profile.interests) ? profile.interests : [],
  };
}
