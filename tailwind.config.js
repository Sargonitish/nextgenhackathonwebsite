/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F3A',
        offwhite: '#F2EFE6',
        yellow: '#FFD23F',
        line: 'rgba(242, 239, 230, 0.2)',
        // Backwards compatibility with admin / dynamic overrides
        background: '#0B1F3A',
        primary: {
          DEFAULT: '#FFD23F',
        },
        accent: {
          DEFAULT: '#F2EFE6',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '1px',
        DEFAULT: '0px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
        '3xl': '2px',
      },
      boxShadow: {
        hard: '6px 6px 0 #FFD23F',
        'hard-sm': '4px 4px 0 rgba(242, 239, 230, 0.3)',
        'hard-dark': '4px 4px 0 #0B1F3A',
        'hard-hover': '2px 2px 0 #FFD23F',
      },
    },
  },
  plugins: [],
};
