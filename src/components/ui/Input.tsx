import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="font-pixel text-sm font-medium text-bark">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-[4px] border-2 bg-white px-3 py-2.5 text-soil placeholder-soil/40 outline-none transition-colors duration-150 focus:border-forest ${
          error ? 'border-red-400' : 'border-panel-border'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
