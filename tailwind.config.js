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
          primary: {
            DEFAULT: '#10b981',
            hover: '#059669',
          },
          secondary: '#64748b',
          dark: {
            bg: '#0a0a0a',
            card: '#141414',
            border: '#262626',
            text: '#fafafa',
          }
        },
      spacing: {
        'section': '2rem',
      },
      borderRadius: {
        'container': '0.75rem',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
