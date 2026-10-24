/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#155DFC',
          blueDark: '#0D47A1',
          blueLight: '#EBF2FF',
          emerald: '#059669',
          emeraldLight: '#DCFCE7',
          amber: '#D97706',
          amberLight: '#FEF3C7',
          rose: '#E11D48',
          roseLight: '#FFE4E6',
          purple: '#7C3AED',
          purpleLight: '#F3E8FF',
          darkBar: '#303030',
          canvas: '#F9FAFB',
          card: '#FFFFFF',
          textMain: '#101828',
          textMuted: '#475467',
          border: '#E4E7EC'
        }
      },
      fontFamily: {
        sans: ['"Google Sans Flex"', '"Google Sans"', '"Product Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Google Sans Flex"', '"Google Sans"', '"Product Sans"', 'Montserrat', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'figma-sm': '0 1px 3px 0 rgba(16, 24, 40, 0.1), 0 1px 2px 0 rgba(16, 24, 40, 0.06)',
        'figma-md': '0 4px 16px -2px rgba(16, 24, 40, 0.08), 0 2px 6px -2px rgba(16, 24, 40, 0.04)',
        'figma-lg': '0 12px 24px -4px rgba(16, 24, 40, 0.12), 0 4px 8px -2px rgba(16, 24, 40, 0.06)',
        'figma-glow-blue': '0 0 24px -4px rgba(21, 93, 252, 0.35)',
        'figma-glow-emerald': '0 0 24px -4px rgba(5, 150, 105, 0.35)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px'
      }
    },
  },
  plugins: [],
}
