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
  progressType?: 'TIME' | 'REPS'
  estimatedMinutes?: number
  targetReps?: number
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
  const [progressType, setProgressType] = useState<'TIME' | 'REPS'>('TIME')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [targetReps, setTargetReps] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDescription('')
      setPriority(5)
      setDueDate('')
      setProgressType('TIME')
      setEstimatedHours('')
      setEstimatedMinutes('')
      setTargetReps('')
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

    let estimatedMinutesValue: number | undefined
    let targetRepsValue: number | undefined

    if (mode === 'plant') {
      if (progressType === 'TIME') {
        const hoursStr = estimatedHours.trim()
        const minutesStr = estimatedMinutes.trim()
        if (hoursStr.length > 0 || minutesStr.length > 0) {
          const hours = hoursStr.length > 0 ? Number(hoursStr) : 0
          const minutes = minutesStr.length > 0 ? Number(minutesStr) : 0
          if (!Number.isInteger(hours) || hours < 0) {
            setError('Hours must be a non-negative whole number')
            return
          }
          if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
            setError('Minutes must be a whole number between 0 and 59')
            return
          }
          const total = hours * 60 + minutes
          if (total < 1) {
            setError('Estimated time must be at least 1 minute')
            return
          }
          estimatedMinutesValue = total
        }
      }

      if (progressType === 'REPS') {
        const parsedTarget = Number(targetReps)
        if (!Number.isInteger(parsedTarget) || parsedTarget < 1) {
          setError('Target reps must be a positive whole number')
          return
        }
        targetRepsValue = parsedTarget
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
        progressType: mode === 'plant' ? progressType : undefined,
        estimatedMinutes: estimatedMinutesValue,
        targetReps: targetRepsValue,
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

        {/* Progress type selector — plants only */}
        {mode === 'plant' && (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-soil">Progress type</span>
            <div className="flex gap-2 rounded-full bg-soil/10 p-1">
              <button
                type="button"
                onClick={() => setProgressType('TIME')}
                className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  progressType === 'TIME' ? 'bg-forest text-mist shadow' : 'text-soil/70 hover:text-soil'
                }`}
              >
                ⏱ Time-based
              </button>
              <button
                type="button"
                onClick={() => setProgressType('REPS')}
                className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  progressType === 'REPS' ? 'bg-forest text-mist shadow' : 'text-soil/70 hover:text-soil'
                }`}
              >
                🔁 Rep-based
              </button>
            </div>
            <p className="mt-1 text-[11px] text-soil/50">
              {progressType === 'TIME'
                ? 'Growth comes from minutes logged — manual entries and focus sessions both count.'
                : 'Growth comes from reps you log.'}
            </p>
          </div>
        )}

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

        {/* TIME mode: optional estimated time (hours + minutes) */}
        {mode === 'plant' && progressType === 'TIME' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-soil">
              Estimated time <span className="text-soil/50 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-1">
                <input
                  id="task-est-hours"
                  type="number"
                  min={0}
                  step={1}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="2"
                  aria-label="Estimated hours"
                  className="w-full rounded-lg border border-soil/30 bg-white/80 px-3 py-2.5 text-sm text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
                <span className="text-sm text-soil/60">h</span>
              </div>
              <div className="flex flex-1 items-center gap-1">
                <input
                  id="task-est-minutes"
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  placeholder="0"
                  aria-label="Estimated minutes"
                  className="w-full rounded-lg border border-soil/30 bg-white/80 px-3 py-2.5 text-sm text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
                <span className="text-sm text-soil/60">m</span>
              </div>
            </div>
            <p className="text-[11px] text-soil/50">Total time (manual or focus) to reach full growth. Default 2h.</p>
          </div>
        )}

        {/* REPS mode: target only */}
        {mode === 'plant' && progressType === 'REPS' && (
          <div className="flex flex-col gap-1">
            <label htmlFor="task-target-reps" className="text-sm font-medium text-soil">
              How many reps total?
            </label>
            <input
              id="task-target-reps"
              type="number"
              min={1}
              step={1}
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              placeholder="e.g. 50"
              className="w-full rounded-lg border border-soil/30 bg-white/80 px-3 py-2.5 text-sm text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
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
