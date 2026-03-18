/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* RealData Portal – exact Figma palette */
        portal: {
          navy: '#182f5b',
          'navy-dark': '#161616',
          blue: '#005287',
          'blue-primary': '#005287',
          'blue-dark': '#133c8b',
          'blue-deep': '#173e86',
          gray: '#939598',
          'gray-light': '#9da4ae',
          'gray-muted': '#a4adb8',
          'gray-placeholder': '#838383',
          white: '#ffffff',
          border: '#e7e7e8',
          'border-light': '#e5e7eb',
          'bg-section': '#f5f6f8',
          'bg-alt': '#f9fafc',
          'card-teal': '#ccefeb',
          'card-green': '#e8f4d9',
          'card-purple': '#e5d9ea',
          'ai-bg': '#eef2ff',
          success: '#ecfdf3',
          'success-border': '#abefc6',
          neutral: '#f9fafb',
          'neutral-border': '#d2d6db',
        },
        /* AI gradient: #a624d2 -> #3a70d8 */
        'ai-gradient': {
          from: '#a624d2',
          to: '#3a70d8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'portal-sm': '4px',
        'portal-md': '8px',
        'portal-lg': '10px',
        'portal-xl': '13px',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #1a3370 0%, #2a4b92 100%)',
        'ai-gradient': 'linear-gradient(90deg, #a624d2 0%, #3a70d8 100%)',
      },
      boxShadow: {
        'card': '0px 0px 4px rgba(0,0,0,0.08)',
        'dock': '0 -4px 24px -4px rgba(0,82,135,0.08), 0 4px 24px -4px rgba(0,0,0,0.06)',
        'dock-focus': '0 -4px 32px -4px rgba(0,82,135,0.12), 0 4px 24px -4px rgba(0,0,0,0.08)',
        'premium': '0 4px 6px -1px rgba(0,0,0,0.04), 0 10px 20px -5px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
        'premium-lg': '0 25px 50px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        'premium-inner': 'inset 0 1px 0 0 rgba(255,255,255,0.6)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'ai-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(166, 36, 210, 0.25)' },
          '50%': { opacity: '0.95', boxShadow: '0 0 20px 4px rgba(166, 36, 210, 0.15)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'search-dot': {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        'ai-pulse': 'ai-pulse 2.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'search-dot': 'search-dot 1.4s ease-in-out infinite',
      },
      backgroundSize: {
        'gradient-shift': '200% 200%',
      },
    },
  },
  plugins: [],
}
