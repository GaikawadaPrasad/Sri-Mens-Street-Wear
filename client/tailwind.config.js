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
        darknavy: '#0B1220',
        goldAmber: '#F59E0B',
        goldAmberHover: '#D97706',
        goldLight: '#FEF3C7',
        // Support emeraldGreen alias or gold theme
        emeraldGreen: '#F59E0B',
        emeraldGreenHover: '#D97706',
        whiteBg: '#FFFFFF',
        lightgraySec: '#F8FAFC',
        cardBg: '#FFFFFF',
        borderCol: '#E2E8F0',
        primaryTxt: '#0F172A',
        secondaryTxt: '#64748B',
        mutedTxt: '#94A3B8',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
