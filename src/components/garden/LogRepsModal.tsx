'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface LogRepsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (delta: number) => Promise<void>
  taskTitle: string
  completedReps: number
  targetReps: number
}

export function LogRepsModal({
  isOpen,
  onClose,
  onSubmit,
  taskTitle,
  completedReps,
  targetReps,
}: LogRepsModalProps) {
  const [delta, setDelta] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setDelta('')
      setError('')
    }
  }, [isOpen])

  const remaining = Math.max(0, targetReps - completedReps)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = Number(delta)
    if (!Number.isInteger(parsed) || parsed < 1) {
      setError('Enter a positive whole number')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log reps">
      <p className="text-sm text-soil/70">
        How many reps did you just complete for <strong className="text-forest">{taskTitle}</strong>?
      </p>
      <p className="mt-1 text-xs text-soil/50">
        {completedReps} / {targetReps} done · {remaining} to go
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="reps-delta" className="text-sm font-medium text-soil">
            Reps to add
          </label>
          <input
            id="reps-delta"
            type="number"
            min={1}
            step={1}
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="e.g. 10"
            autoFocus
            className="w-full rounded-lg border border-soil/30 bg-white/80 px-4 py-2.5 text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
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
            {isSubmitting ? 'Logging…' : 'Log reps'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
