'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatMinutes } from '@/lib/format'

interface LogMinutesModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (delta: number) => Promise<void>
  taskTitle: string
  totalFocusMinutes: number
  estimatedMinutes: number | null
}

export function LogMinutesModal({
  isOpen,
  onClose,
  onSubmit,
  taskTitle,
  totalFocusMinutes,
  estimatedMinutes,
}: LogMinutesModalProps) {
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setHours('')
      setMinutes('')
      setError('')
    }
  }, [isOpen])

  const target = estimatedMinutes ?? 120
  const remaining = Math.max(0, target - totalFocusMinutes)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const hoursStr = hours.trim()
    const minutesStr = minutes.trim()
    if (hoursStr.length === 0 && minutesStr.length === 0) {
      setError('Enter hours, minutes, or both')
      return
    }

    const h = hoursStr.length > 0 ? Number(hoursStr) : 0
    const m = minutesStr.length > 0 ? Number(minutesStr) : 0
    if (!Number.isInteger(h) || h < 0) {
      setError('Hours must be a non-negative whole number')
      return
    }
    if (!Number.isInteger(m) || m < 0 || m > 59) {
      setError('Minutes must be a whole number between 0 and 59')
      return
    }

    const total = h * 60 + m
    if (total < 1) {
      setError('Log at least 1 minute')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log time">
      <p className="text-sm text-soil/70">
        How long did you spend on <strong className="text-forest">{taskTitle}</strong>?
      </p>
      <p className="mt-1 text-xs text-soil/50">
        {formatMinutes(totalFocusMinutes)} / {formatMinutes(target)} done · {formatMinutes(remaining)} to go
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-soil">Time to add</label>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-1">
              <input
                type="number"
                min={0}
                step={1}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                autoFocus
                aria-label="Hours to add"
                className="w-full rounded-lg border border-soil/30 bg-white/80 px-3 py-2.5 text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
              <span className="text-sm text-soil/60">h</span>
            </div>
            <div className="flex flex-1 items-center gap-1">
              <input
                type="number"
                min={0}
                max={59}
                step={1}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="30"
                aria-label="Minutes to add"
                className="w-full rounded-lg border border-soil/30 bg-white/80 px-3 py-2.5 text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
              <span className="text-sm text-soil/60">m</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 text-sm font-semibold text-soil hover:bg-soil/10"
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging…' : 'Log time'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
