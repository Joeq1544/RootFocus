interface PlotColorDotProps {
  slug: string
  className?: string
}

export const PLOT_COLORS: Array<{ slug: string; hex: string; label: string }> = [
  { slug: 'forest',     hex: '#2D5016', label: 'Forest' },
  { slug: 'soil',       hex: '#6B4226', label: 'Soil' },
  { slug: 'sunrise',    hex: '#D4A843', label: 'Sunrise' },
  { slug: 'mist',       hex: '#A8A89A', label: 'Mist' },
  { slug: 'terracotta', hex: '#C0673E', label: 'Terracotta' },
  { slug: 'sky',        hex: '#5B89B5', label: 'Sky' },
  { slug: 'lavender',   hex: '#9C7BB5', label: 'Lavender' },
  { slug: 'sage',       hex: '#7AA17A', label: 'Sage' },
]

export function colorHex(slug: string): string {
  return PLOT_COLORS.find((c) => c.slug === slug)?.hex ?? '#2D5016'
}

export function PlotColorDot({ slug, className = 'h-3 w-3' }: PlotColorDotProps) {
  return (
    <span
      className={`inline-block rounded-full ring-1 ring-inset ring-black/10 ${className}`}
      style={{ backgroundColor: colorHex(slug) }}
      aria-hidden="true"
    />
  )
}
