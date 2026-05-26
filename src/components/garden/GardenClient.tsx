'use client'

import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { TaskWithHealth } from '@/types'
import { organizeIntoPlots } from '@/lib/garden-organize'
import { useTimerContext } from '@/components/providers/TimerContext'
import { useStreak } from '@/components/providers/StreakContext'
import { GardenPlot } from './GardenPlot'
import { AddTaskModal, AddTaskInput } from './AddTaskModal'

interface GardenClientProps {
  initialTasks: TaskWithHealth[]
}

interface FloatingLabel {
  id: string
  taskId: string
  label: string
  x: number
  y: number
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

export function GardenClient({ initialTasks }: GardenClientProps) {
  const [tasks, setTasks] = useState<TaskWithHealth[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalParentId, setModalParentId] = useState<string | undefined>(undefined)
  const [actionError, setActionError] = useState<string | null>(null)
  const [floatingLabels, setFloatingLabels] = useState<FloatingLabel[]>([])

  const { registerSessionHandler } = useTimerContext()
  const { updateStreak } = useStreak()

  const plots = useMemo(() => organizeIntoPlots(tasks), [tasks])

  const handleSessionComplete = useCallback(
    async ({ taskId, durationMinutes }: { taskId: string; durationMinutes: number }) => {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, durationMinutes }),
      })
      const data = await safeJson(res)
      if (!res.ok) {
        setActionError(typeof data.error === 'string' ? data.error : 'Failed to save session')
        return
      }
      const result = data as { task?: TaskWithHealth; streak?: { currentStreak: number } }
      if (result.task) setTasks((prev) => replaceTask(prev, result.task!))
      if (result.streak) updateStreak(result.streak.currentStreak)

      // Floating label — center of viewport as a simple fallback
      const label: FloatingLabel = {
        id: crypto.randomUUID(),
        taskId,
        label: `+${durationMinutes} min`,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - 60,
      }
      setFloatingLabels((prev) => [...prev, label])
      setTimeout(() => {
        setFloatingLabels((prev) => prev.filter((l) => l.id !== label.id))
      }, 1600)
    },
    [updateStreak],
  )

  const handleSessionCompleteRef = useRef(handleSessionComplete)
  handleSessionCompleteRef.current = handleSessionComplete

  useEffect(() => {
    registerSessionHandler((data) => handleSessionCompleteRef.current(data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openAddModal(parentTaskId?: string) {
    setModalParentId(parentTaskId)
    setIsModalOpen(true)
    setActionError(null)
  }

  async function handleAdd(input: AddTaskInput) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const data = await safeJson(res)
    if (!res.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Failed to plant task')
    }
    const created = data.task as TaskWithHealth | undefined
    if (!created) throw new Error('Malformed response')

    setTasks((prev) => {
      if (created.parentTaskId) {
        return prev.map((t) =>
          t.id === created.parentTaskId
            ? { ...t, subtasks: [...t.subtasks, { ...created, subtasks: [] }] }
            : t,
        )
      }
      return [...prev, { ...created, subtasks: [] }]
    })

    setIsModalOpen(false)
    setModalParentId(undefined)
  }

  async function handleComplete(taskId: string) {
    setActionError(null)
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED', totalFocusMinutes: 120 }),
    })
    const data = await safeJson(res)
    if (!res.ok) {
      setActionError(typeof data.error === 'string' ? data.error : 'Failed to complete')
      return
    }
    const updated = data.task as TaskWithHealth | undefined
    if (!updated) return

    setTasks((prev) => replaceTask(prev, updated))
  }

  async function handleDelete(taskId: string) {
    setActionError(null)
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) {
      const data = await safeJson(res)
      setActionError(typeof data.error === 'string' ? data.error : 'Failed to delete')
      return
    }
    setTasks((prev) => removeTask(prev, taskId))
  }

  if (tasks.length === 0) {
    return (
      <>
        <EmptyState onPlant={() => openAddModal()} />
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAdd}
          parentTasks={tasks}
          defaultParentTaskId={modalParentId}
        />
      </>
    )
  }

  return (
    <>
      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{actionError}</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {plots.map((plot) => (
          <GardenPlot
            key={plot.id}
            title={plot.title}
            tasks={plot.tasks}
            parentTask={plot.parentTask}
            variant={plot.variant}
            onAddTask={openAddModal}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => openAddModal()}
          className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 font-semibold text-mist shadow-lg shadow-forest/30 transition-colors hover:bg-forest-dark"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14 M5 12h14" />
          </svg>
          Plant a new task
        </button>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        parentTasks={tasks}
        defaultParentTaskId={modalParentId}
      />

      {floatingLabels.map((lbl) => (
        <span
          key={lbl.id}
          className="animate-float-up pointer-events-none"
          style={{ left: lbl.x, top: lbl.y }}
        >
          {lbl.label}
        </span>
      ))}
    </>
  )
}

function replaceTask(tasks: TaskWithHealth[], updated: TaskWithHealth): TaskWithHealth[] {
  return tasks.map((t) => {
    if (t.id === updated.id) return { ...updated, subtasks: t.subtasks }
    if (t.subtasks.some((s) => s.id === updated.id)) {
      return {
        ...t,
        subtasks: t.subtasks.map((s) => (s.id === updated.id ? { ...updated, subtasks: [] } : s)),
      }
    }
    return t
  })
}

function removeTask(tasks: TaskWithHealth[], id: string): TaskWithHealth[] {
  return tasks
    .filter((t) => t.id !== id)
    .map((t) => ({
      ...t,
      subtasks: t.subtasks.filter((s) => s.id !== id),
    }))
}

function EmptyState({ onPlant }: { onPlant: () => void }) {
  return (
    <div className="rounded-3xl border-4 border-dashed border-soil/30 bg-mist/40 px-6 py-16 text-center">
      <svg
        viewBox="0 0 200 120"
        className="mx-auto h-32 w-48 text-soil/30"
        fill="currentColor"
        aria-hidden="true"
      >
        <ellipse cx="100" cy="100" rx="80" ry="14" />
        <ellipse cx="100" cy="98" rx="60" ry="8" fill="#8B5E3C" opacity="0.4" />
        <path d="M70 90 Q72 78 76 70" stroke="#3D6B1F" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M76 70 Q72 68 70 65 Q74 66 78 68 Z" fill="#3D6B1F" opacity="0.5" />
        <path d="M120 92 Q122 80 126 72" stroke="#3D6B1F" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M126 72 Q130 70 132 67 Q128 68 124 70 Z" fill="#3D6B1F" opacity="0.5" />
      </svg>
      <h3 className="mt-4 font-playfair text-2xl font-bold text-forest">
        Your garden is empty
      </h3>
      <p className="mt-2 text-sm text-soil/70">
        Every great garden starts with a single seed.
      </p>
      <button
        type="button"
        onClick={onPlant}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-sunrise px-6 py-3 font-semibold text-soil shadow-lg shadow-sunrise/40 transition-colors hover:bg-sunrise-light"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M12 5v14 M5 12h14" />
        </svg>
        Plant your first task
      </button>
    </div>
  )
}
