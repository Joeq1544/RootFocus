import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#2D5016', light: '#3D6B1F', dark: '#1E360F' },
        soil: { DEFAULT: '#6B4226', light: '#8B5E3C' },
        mist: { DEFAULT: '#F5F5F0', dark: '#E8E8E0' },
        sunrise: { DEFAULT: '#D4A843', light: '#E8C060' },
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
