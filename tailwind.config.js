/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F6F7F9',
        surface: '#FFFFFF',
        sidebar: '#12161D',
        sidebarInk: '#C7CDD6',
        ink: '#171B21',
        inkSoft: '#5B6472',
        accent: '#E8A23D',
        accentInk: '#14161B',
        line: '#E2E5EA',
        danger: '#D64545',
        success: '#2F9E64',
      },
      fontFamily: {
        head: ['Archivo', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
