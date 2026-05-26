'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PlotIcon, PLOT_ICONS } from './PlotIcon'
import { PLOT_COLORS } from './PlotColorDot'

export interface AddPlotInput {
  name: string
  color: string
  icon: string
}

interface AddPlotModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: AddPlotInput) => Promise<void>
}

export function AddPlotModal({ isOpen, onClose, onSubmit }: AddPlotModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('forest')
  const [icon, setIcon] = useState('leaf')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setColor('forest')
      setIcon('leaf')
      setError('')
    }
  }, [isOpen])

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New plot">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Plot name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Work, School, Hobbies"
          autoFocus
        />

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
                aria-label={slug}
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
            {isSubmitting ? 'Creating…' : 'Create plot'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
