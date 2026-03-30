import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', 'var(--font-instrument-sans)', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#F5F3EC',
          surface: '#E3DDCF',
          border: '#EAEAEA',
        },
        text: {
          primary: '#2A2A2A',
          secondary: '#4E4E4E',
          muted: '#8A8680',
        },
      },
    },
  },
  plugins: [],
}

export default config
