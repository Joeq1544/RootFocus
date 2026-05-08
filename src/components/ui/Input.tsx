import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-soil">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-soil/30 bg-white/80 px-4 py-2.5 text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
