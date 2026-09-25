/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: '#1769C2',       // Primary Blue
          primaryHover: '#1257A0',  // Darker Blue
          darkNavy: '#0B1F3A',      // Dark Navy (text/icons only)
          accent: '#10B981',        // Green
          accentHover: '#059669',   // Dark Green
          lightGreen: '#D1FAE5',    // Light Green badge bg
          lightBlue: '#E8F2FF',     // Light Blue badge bg
          bg: '#F8FAFC',            // Clean light main bg
          card: '#FFFFFF',          // White card
          text: '#0F172A',          // Dark Slate Text
          textMuted: '#64748B',     // Secondary Slate Text
          border: '#D9E2EC',        // Subtle border
        },
        brand: {
          blue: '#1769C2',
          blueHover: '#1257A0',
          blueLight: '#E8F2FF',
          blueBorder: '#BFDBFE',
          green: '#10B981',
          greenHover: '#059669',
          greenLight: '#D1FAE5',
          navy: '#0B1F3A',
          text: '#0F172A',
          muted: '#64748B',
          border: '#D9E2EC',
          bg: '#F8FAFC'
        },
        navy: {
          900: '#071527',
          800: '#0B1F3A',
          700: '#102A43',
          600: '#1e3a5f',
          500: '#2d5482'
        },
        royalblue: {
          50: '#E8F2FF',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#1769C2',
          600: '#1257A0',
          700: '#0f4887',
          800: '#0d3869'
        },
        emerald: {
          50: '#ecfdf5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1769C2, #10B981)',
        'brand-gradient-hover': 'linear-gradient(135deg, #1359a6, #059669)',
        'hero-gradient': 'linear-gradient(135deg, #0B1F3A 0%, #1769C2 50%, #10B981 100%)',
      }
    },
  },
  plugins: [],
}
