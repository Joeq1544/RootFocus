interface PlotIconProps {
  slug: string
  className?: string
}

const PATHS: Record<string, React.ReactNode> = {
  leaf: <path d="M12 2C8 2 5 5 5 9c0 3.5 2.5 6.5 6 7.4V20H9v2h6v-2h-2v-3.6c3.5-.9 6-3.9 6-7.4 0-4-3-7-7-7z" />,
  briefcase: <path d="M3 8h18v11H3z M9 8V5h6v3 M3 13h18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  school: <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />,
  dumbbell: <path d="M6 6v12 M4 8v8 M2 10v4 M18 6v12 M20 8v8 M22 10v4 M6 12h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
  heart: <path d="M12 21s-7-4.5-9.5-9.4C1.2 8.7 3 5 6.5 5c2 0 3.5 1 5.5 3.5C13.5 6 15 5 17 5c3.5 0 5.3 3.7 4 6.6C19 16.5 12 21 12 21z" />,
  lightbulb: <path d="M9 21h6 M10 17h4 M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V17h5v-1.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  book: <path d="M4 4a2 2 0 0 1 2-2h12v18H6a2 2 0 0 0-2 2V4z M6 16h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  home: <path d="M3 12l9-9 9 9v9h-6v-6h-6v6H3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
}

export function PlotIcon({ slug, className = 'h-4 w-4' }: PlotIconProps) {
  const path = PATHS[slug] ?? PATHS.leaf
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {path}
    </svg>
  )
}

export const PLOT_ICONS = Object.keys(PATHS) as string[]
