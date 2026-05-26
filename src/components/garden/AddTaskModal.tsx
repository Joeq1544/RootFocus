'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { TaskWithHealth } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface AddTaskInput {
  title: string
  description?: string
  category?: string
  priority: number
  dueDate?: string
  parentTaskId?: string
}

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: AddTaskInput) => Promise<void>
  parentTasks: TaskWithHealth[]
  defaultParentTaskId?: string
}

export function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
  parentTasks,
  defaultParentTaskId,
}: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState(5)
  const [dueDate, setDueDate] = useState('')
  const [parentTaskId, setParentTaskId] = useState<string>('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categorySuggestions = useMemo(() => {
    const set = new Set<string>()
    for (const t of parentTasks) {
      if (t.category) set.add(t.category)
    }
    return Array.from(set)
  }, [parentTasks])

  // Reset form when opened, applying default parent if provided
  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDescription('')
      setCategory('')
      setPriority(5)
      setDueDate('')
      setParentTaskId(defaultParentTaskId ?? '')
      setError('')
    }
  }, [isOpen, defaultParentTaskId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (title.trim().length === 0) {
      setError('Title is required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        parentTaskId: parentTaskId || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plant a new task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to grow?"
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

        <div className="flex flex-col gap-1">
          <label htmlFor="task-category" className="text-sm font-medium text-soil">
            Category
          </label>
          <input
            id="task-category"
            list="task-category-suggestions"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Work, Personal"
            className="w-full rounded-lg border border-soil/30 bg-white/80 px-4 py-2.5 text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
          <datalist id="task-category-suggestions">
            {categorySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="task-due" className="text-sm font-medium text-soil">
              Due date
            </label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-soil/30 bg-white/80 px-3 py-2.5 text-sm text-soil transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="task-parent" className="text-sm font-medium text-soil">
              Parent task
            </label>
            <select
              id="task-parent"
              value={parentTaskId}
              onChange={(e) => setParentTaskId(e.target.value)}
              className="w-full rounded-lg border border-soil/30 bg-white/80 px-3 py-2.5 text-sm text-soil transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
            >
              <option value="">None</option>
              {parentTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
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
            {isSubmitting ? 'Planting…' : 'Plant'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
