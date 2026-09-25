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
          primary: '#0B1F3A',       // Deep Navy Blue
          secondary: '#1769C2',     // Royal Blue
          accent: '#10B981',        // Emerald Green
          accentHover: '#059669',   // Dark Green
          bg: '#F4F8FC',            // Light Blue-White
          card: '#FFFFFF',          // White
          text: '#102A43',          // Dark Navy
          textMuted: '#64748B',     // Slate Gray
          border: '#E2E8F0',        // Subtle border
        },
        navy: {
          900: '#071527',
          800: '#0B1F3A',
          700: '#102A43',
          600: '#1e3a5f',
          500: '#2d5482'
        },
        royalblue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#1769C2',
          600: '#1359a6',
          700: '#0f4887',
          800: '#0d3869'
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
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
