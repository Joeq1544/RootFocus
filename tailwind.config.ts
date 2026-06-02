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
        // Core garden tokens (kept for compatibility)
        forest: { DEFAULT: '#2D5016', light: '#3D6B1F', dark: '#1E360F' },
        soil: { DEFAULT: '#6B4226', light: '#8B5E3C', dark: '#4A2D1A' },
        mist: { DEFAULT: '#F5F5F0', dark: '#E8E8E0' },
        sunrise: { DEFAULT: '#D4A843', light: '#E8C060' },
        // Cozy pixel palette
        wood: { DEFAULT: '#7B4A2B', light: '#9C6B3F', dark: '#5A3620', plank: '#A6764A' },
        bark: '#3E2817',
        sky: { DEFAULT: '#A8D8E8', light: '#CDEBF2', dusk: '#F3C98B' },
        grass: { DEFAULT: '#5C9132', dark: '#3D6B1F', light: '#7DB14A' },
        clay: { DEFAULT: '#C0673E', dark: '#8A4628', light: '#D98A5E' },
        // UI panel tokens (parchment / wooden window)
        panel: { DEFAULT: '#F3E4C6', soft: '#EAD6AE', inset: '#E0C79A' },
        'panel-border': '#8A5A33',
        'panel-line': '#C9A86E',
      },
      fontFamily: {
        pixel: ['var(--font-pixel)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        // Hard, offset pixel shadows (no blur)
        pixel: '4px 4px 0 0 rgba(58,40,23,0.45)',
        'pixel-sm': '2px 2px 0 0 rgba(58,40,23,0.40)',
        'pixel-lg': '6px 6px 0 0 rgba(58,40,23,0.45)',
        'pixel-inset': 'inset 0 0 0 2px rgba(58,40,23,0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'pixel-sway': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '1' },
        },
        'sun-pulse': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-56px) scale(1.15)' },
        },
        'drift-x': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(40px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        bob: 'bob 2.4s steps(4, end) infinite',
        'pixel-sway': 'pixel-sway 3.2s steps(3, end) infinite',
        twinkle: 'twinkle 2.4s steps(2, end) infinite',
        'sun-pulse': 'sun-pulse 6s ease-in-out infinite',
        'float-up': 'float-up 1.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
