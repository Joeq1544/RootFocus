import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-forest text-white hover:bg-forest-dark disabled:opacity-50',
  secondary:
    'bg-sunrise text-soil hover:bg-sunrise-light disabled:opacity-50',
  ghost:
    'border-2 border-forest text-forest hover:bg-forest hover:text-white disabled:opacity-50',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-6 py-2.5 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:ring-offset-2 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
