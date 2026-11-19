/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        perspective: {
          official: '#1e3a8a',      // PIB / Gov Navy
          officialBg: '#eff6ff',
          officialBorder: '#bfdbfe',
          left: '#2563eb',          // Progressive Blue
          leftBg: '#eef2ff',
          leftBorder: '#c7d2fe',
          center: '#64748b',        // Wire Slate
          centerBg: '#f8fafc',
          centerBorder: '#e2e8f0',
          right: '#dc2626',         // Conservative Crimson
          rightBg: '#fef2f2',
          rightBorder: '#fecaca',
        },
        surface: {
          base: '#ffffff',
          subtle: '#f8fafc',
          muted: '#f1f5f9',
          border: '#e2e8f0',
          borderSubtle: '#f1f5f9'
        }
      },
      fontFamily: {
        serif: ['"Newsreader"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 25px -4px rgba(0, 0, 0, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        'drawer': '-10px 0 30px -5px rgba(0, 0, 0, 0.1), -4px 0 10px -2px rgba(0, 0, 0, 0.05)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [],
};
