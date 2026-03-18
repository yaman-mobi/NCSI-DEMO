/**
 * RealData Portal – design tokens
 * Use these everywhere so all frames share the same colours.
 */
export const colors = {
  // Primary (brand, buttons, links, active states)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Backgrounds
  background: {
    page: '#f8fafc',
    card: '#ffffff',
    sidebar: '#ffffff',
    header: '#ffffff',
  },
  // Text
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    muted: '#94a3b8',
    inverse: '#ffffff',
  },
  // Borders and dividers
  border: {
    light: '#f1f5f9',
    default: '#e2e8f0',
    strong: '#cbd5e1',
  },
  // Semantic
  success: { 500: '#10b981', 600: '#059669' },
  warning: { 500: '#f59e0b', 600: '#d97706' },
  error: { 500: '#ef4444', 600: '#dc2626' },
}

export const spacing = {
  sidebarWidth: 260,
  headerHeight: 64,
  pagePadding: 24,
  cardPadding: 20,
  sectionGap: 24,
}

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
}
