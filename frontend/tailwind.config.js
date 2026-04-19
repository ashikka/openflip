/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amber: '#FF8200',
        ember: '#663300',
        highlight: '#FFA940',
        cyan: '#00E5FF',
        ink: '#0A0A0A',
        inkSoft: '#111111',
      },
      fontFamily: {
        display: ['VT323', 'monospace'],
        body: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        pixel: '4px 4px 0 0 #663300',
        glow: '0 0 0 1px rgba(0, 229, 255, 0.4), 0 0 20px rgba(0, 229, 255, 0.15)',
      },
      maxWidth: {
        shell: '72rem',
      },
    },
  },
  plugins: [],
}
