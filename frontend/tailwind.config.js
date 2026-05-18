/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 35px rgba(45, 212, 191, 0.24)',
      },
      colors: {
        void: '#05070D',
        panel: 'rgba(11, 18, 32, 0.72)',
        ember: '#F59E0B',
        mint: '#34D399',
        pulse: '#F472B6',
      },
    },
  },
  plugins: [],
};

