'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Plot } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PlotIcon, PLOT_ICONS } from './PlotIcon'
import { PLOT_COLORS } from './PlotColorDot'

export interface EditPlotInput {
  name: string
  color: string
  icon: string
}

interface EditPlotModalProps {
  isOpen: boolean
  plot: Plot | null
  onClose: () => void
  onSubmit: (input: EditPlotInput) => Promise<void>
  onDelete: (strategy: 'move' | 'delete') => Promise<void>
}

export function EditPlotModal({ isOpen, plot, onClose, onSubmit, onDelete }: EditPlotModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('forest')
  const [icon, setIcon] = useState('leaf')
  const [strategy, setStrategy] = useState<'move' | 'delete'>('move')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && plot) {
      setName(plot.name)
      setColor(plot.color)
      setIcon(plot.icon)
      setStrategy('move')
      setConfirmingDelete(false)
      setError('')
    }
  }, [isOpen, plot])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (name.trim().length === 0) {
      setError('Name is required')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), color, icon })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    setIsSubmitting(true)
    try {
      await onDelete(strategy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit plot">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Plot name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-soil">Color</label>
          <div className="grid grid-cols-8 gap-2">
            {PLOT_COLORS.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setColor(c.slug)}
                aria-label={c.label}
                className={`relative h-9 w-9 rounded-full ring-2 ring-inset transition ${
                  color === c.slug ? 'ring-soil scale-110' : 'ring-soil/15 hover:ring-soil/40'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-soil">Icon</label>
          <div className="grid grid-cols-8 gap-2">
            {PLOT_ICONS.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => setIcon(slug)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  icon === slug ? 'border-forest bg-forest/10 text-forest' : 'border-soil/20 text-soil/60 hover:border-soil/40'
                }`}
              >
                <PlotIcon slug={slug} className="h-4 w-4" />
              </button>
            ))}
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
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-4">
        <p className="text-sm font-semibold text-red-800">Delete this plot</p>
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mt-2 rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-700 hover:border-red-500 hover:bg-red-100"
          >
            Delete plot…
          </button>
        ) : (
          <div className="mt-3 space-y-3">
            <label className="flex items-start gap-2 text-xs text-red-800">
              <input
                type="radio"
                name="delete-strategy"
                checked={strategy === 'move'}
                onChange={() => setStrategy('move')}
                className="mt-0.5 accent-red-600"
              />
              <span>
                <strong className="font-semibold">Move tasks</strong> to an &ldquo;Uncategorized&rdquo; plot
                (auto-created if needed)
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs text-red-800">
              <input
                type="radio"
                name="delete-strategy"
                checked={strategy === 'delete'}
                onChange={() => setStrategy('delete')}
                className="mt-0.5 accent-red-600"
              />
              <span>
                <strong className="font-semibold">Delete all tasks</strong> in this plot (irreversible)
              </span>
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting…' : 'Confirm delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
