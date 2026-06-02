'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

/** Pixel "window": parchment panel with a wooden title bar and a hard frame. */
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[55] flex items-center justify-center bg-bark/50 px-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="pixel-panel relative z-[60] w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            {/* Title bar */}
            <div className="flex items-center justify-between gap-2 bg-wood px-4 py-2.5 shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]">
              <h2 className="font-pixel text-lg font-bold text-mist drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-clay text-mist shadow-pixel-sm transition-transform active:translate-y-0.5"
              >
                <X className="h-4 w-4" strokeWidth={3} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
