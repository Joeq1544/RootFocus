import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-forest text-mist hover:bg-forest-light disabled:opacity-50',
  secondary: 'bg-sunrise text-bark hover:bg-sunrise-light disabled:opacity-50',
  ghost: 'bg-panel text-bark hover:bg-panel-soft disabled:opacity-50',
}

/** Chunky pixel button: hard border + offset shadow, presses down on click. */
export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`pixel-btn inline-flex items-center justify-center px-5 py-2 font-pixel text-sm font-semibold tracking-wide transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise/70 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
