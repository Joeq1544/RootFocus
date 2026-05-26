'use client'

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-soil/40 px-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative z-50 w-full max-w-md rounded-3xl bg-mist p-8 shadow-2xl shadow-soil/30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-soil transition-colors hover:bg-soil/10"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M6 6 L18 18 M6 18 L18 6" />
          </svg>
        </button>
        {title && (
          <h2 className="font-playfair text-2xl font-bold text-forest pr-8">
            {title}
          </h2>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
