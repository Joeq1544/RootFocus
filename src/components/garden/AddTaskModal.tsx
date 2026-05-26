'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface AddTaskInput {
  title: string
  description?: string
  priority: number
  dueDate?: string
  plotId?: string
  parentTaskId?: string
  isPot?: boolean
}

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: AddTaskInput) => Promise<void>
  mode: 'plant' | 'pot'
  plotId?: string         // when creating directly into a plot (top-level)
  parentTaskId?: string   // when creating a subtask inside a pot
  potDueDate?: string     // ISO date string of the parent pot (for subtask due-date ceiling)
}

export function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  plotId,
  parentTaskId,
  potDueDate,
}: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(5)
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDescription('')
      setPriority(5)
      setDueDate('')
      setError('')
    }
  }, [isOpen])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (title.trim().length === 0) {
      setError('Title is required')
      return
    }

    if (dueDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(dueDate + 'T00:00:00')
      if (due <= today) {
        setError('Due date must be after today')
        return
      }
      if (potDueDate) {
        const potDue = new Date(potDueDate.slice(0, 10) + 'T00:00:00')
        if (due > potDue) {
          setError(`Due date must be on or before the pot's due date (${potDueDate.slice(0, 10)})`)
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        plotId,
        parentTaskId,
        isPot: mode === 'pot',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const titleText = mode === 'pot' ? 'New pot' : 'New plant'
  const submitLabel = isSubmitting ? 'Planting…' : mode === 'pot' ? 'Place pot' : 'Plant'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titleText}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={mode === 'pot' ? 'What\'s the big project?' : 'What do you want to grow?'}
          autoFocus
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="task-description" className="text-sm font-medium text-soil">
            Description
          </label>
          <textarea
            id="task-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a few notes..."
            className="w-full resize-none rounded-lg border border-soil/30 bg-white/80 px-4 py-2.5 text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        </div>

        {/* Plants get priority + due date; Pots get due date only */}
        {mode === 'plant' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="task-priority" className="text-sm font-medium text-soil">
                Priority
              </label>
              <span className="text-sm font-semibold text-forest">{priority} / 10</span>
            </div>
            <input
              id="task-priority"
              type="range"
              min={1}
              max={10}
              step={1}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full accent-forest"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="task-due" className="text-sm font-medium text-soil">
            Due date <span className="text-soil/50 font-normal">(optional)</span>
          </label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-soil/30 bg-white/80 px-3 py-2.5 text-sm text-soil transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
          {potDueDate && (
            <p className="text-[11px] text-soil/50">Must be on or before {potDueDate.slice(0, 10)}</p>
          )}
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
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
