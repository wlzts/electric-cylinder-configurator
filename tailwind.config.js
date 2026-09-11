/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F5F3',
        surface: '#FFFFFF',
        ink: '#111111',
        muted: '#686868',
        line: '#E4E4E1',
        accent: {
          DEFAULT: '#C8552B',
          soft: '#E8744A',
          deep: '#A8431E',
        },
        ok: '#2F7D4F',
        warn: '#B8860B',
        bad: '#B23A3A',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,17,17,0.04), 0 4px 16px rgba(17,17,17,0.04)',
        'card-hover': '0 2px 4px rgba(17,17,17,0.06), 0 10px 28px rgba(17,17,17,0.08)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
