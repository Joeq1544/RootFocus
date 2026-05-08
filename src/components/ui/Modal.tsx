interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true">
      <div>
        {title && <h2>{title}</h2>}
        <button onClick={onClose} aria-label="Close modal">
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
