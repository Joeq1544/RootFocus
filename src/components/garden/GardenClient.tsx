'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Plot, PlotWithTasks, TaskWithHealth } from '@/types'
import { Pos } from '@/lib/garden-layout'
import { useTimerContext } from '@/components/providers/TimerContext'
import { useStreak } from '@/components/providers/StreakContext'
import { GardenPlot } from './GardenPlot'
import { ZoomView } from './ZoomView'
import { AddTaskModal, AddTaskInput } from './AddTaskModal'
import { AddPlotModal, AddPlotInput } from './AddPlotModal'
import { EditPlotModal, EditPlotInput } from './EditPlotModal'
import { PixelSprite } from '@/components/pixel/sprites'

type ZoomState = { kind: 'plot'; plotId: string } | { kind: 'pot'; potId: string } | null

interface GardenClientProps {
  initialPlots: PlotWithTasks[]
}

interface FloatingLabel {
  id: string
  label: string
  x: number
  y: number
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  try { return await res.json() } catch { return {} }
}

function errMsg(data: Record<string, unknown>, fallback: string): string {
  return typeof data.error === 'string' ? data.error : fallback
}

export function GardenClient({ initialPlots }: GardenClientProps) {
  const [plots, setPlots] = useState<PlotWithTasks[]>(initialPlots)
  const [actionError, setActionError] = useState<string | null>(null)
  const [floatingLabels, setFloatingLabels] = useState<FloatingLabel[]>([])

  // Modal state
  const [taskModal, setTaskModal] = useState<
    | { isOpen: true; mode: 'plant' | 'pot'; plotId?: string; parentTaskId?: string; potDueDate?: string }
    | { isOpen: false }
  >({ isOpen: false })
  const [plotModalOpen, setPlotModalOpen] = useState(false)
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null)
  const [zoom, setZoom] = useState<ZoomState>(null)

  const { registerSessionHandler } = useTimerContext()
  const { updateStreak } = useStreak()

  // ── Session handler ─────────────────────────────────────────────────────────
  const handleSessionComplete = useCallback(
    async ({
      taskId,
      durationMinutes,
      completedReps,
    }: {
      taskId: string
      durationMinutes: number
      completedReps?: number
    }) => {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, durationMinutes, completedReps }),
      })
      const data = await safeJson(res)
      if (!res.ok) {
        setActionError(errMsg(data, 'Failed to save session'))
        return
      }
      const result = data as { task?: TaskWithHealth; streak?: { currentStreak: number } }
      if (result.task) setPlots((prev) => replaceTaskInPlots(prev, result.task!))
      if (result.streak) updateStreak(result.streak.currentStreak)

      const labelText = completedReps && completedReps > 0
        ? `+${durationMinutes} min · +${completedReps} reps`
        : `+${durationMinutes} min`
      const label: FloatingLabel = {
        id: crypto.randomUUID(),
        label: labelText,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - 60,
      }
      setFloatingLabels((prev) => [...prev, label])
      setTimeout(() => setFloatingLabels((prev) => prev.filter((l) => l.id !== label.id)), 1600)
    },
    [updateStreak],
  )

  const handleSessionCompleteRef = useRef(handleSessionComplete)
  handleSessionCompleteRef.current = handleSessionComplete

  useEffect(() => {
    registerSessionHandler((data) => handleSessionCompleteRef.current(data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Plot CRUD ───────────────────────────────────────────────────────────────
  async function handleAddPlot(input: AddPlotInput) {
    const res = await fetch('/api/plots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(errMsg(data, 'Failed to create plot'))
    const created = data.plot as Plot | undefined
    if (!created) throw new Error('Malformed response')
    setPlots((prev) => [...prev, { ...created, tasks: [] }])
    setPlotModalOpen(false)
  }

  async function handleUpdatePlot(input: EditPlotInput) {
    if (!editingPlotId) return
    const res = await fetch(`/api/plots/${editingPlotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(errMsg(data, 'Failed to update plot'))
    const updated = data.plot as Plot | undefined
    if (!updated) throw new Error('Malformed response')
    setPlots((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated, tasks: p.tasks } : p)),
    )
    setEditingPlotId(null)
  }

  async function handleDeletePlot(strategy: 'move' | 'delete') {
    if (!editingPlotId) return
    const res = await fetch(`/api/plots/${editingPlotId}?strategy=${strategy}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) {
      const data = await safeJson(res)
      setActionError(errMsg(data, 'Failed to delete plot'))
      return
    }
    // Reload plots from server to reflect any "move" reassignments
    const fetchRes = await fetch('/api/plots')
    const fetchData = await safeJson(fetchRes)
    const refreshed = (fetchData.plots as Plot[] | undefined) ?? []
    setPlots((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]))
      return refreshed.map((p) => {
        const existing = byId.get(p.id)
        const tasks = existing?.tasks ?? []
        // If we deleted a plot with 'move' strategy, attached tasks may have moved to fallback
        return { ...p, tasks }
      })
    })
    // Re-fetch tasks to get accurate plot assignments
    const tRes = await fetch('/api/tasks')
    const tData = await safeJson(tRes)
    const tasks = (tData.tasks as TaskWithHealth[] | undefined) ?? []
    setPlots((prev) => prev.map((p) => ({
      ...p,
      tasks: tasks.filter((t) => t.plotId === p.id && t.parentTaskId === null && t.status !== 'COMPLETED'),
    })))
    setEditingPlotId(null)
  }

  // ── Task CRUD ───────────────────────────────────────────────────────────────
  async function handleAddTask(input: AddTaskInput) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(errMsg(data, 'Failed to plant task'))
    const created = data.task as TaskWithHealth | undefined
    if (!created) throw new Error('Malformed response')

    setPlots((prev) =>
      prev.map((p) => {
        if (input.parentTaskId) {
          // Subtask: append to its parent pot
          return {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === input.parentTaskId
                ? { ...t, subtasks: [...t.subtasks, { ...created, subtasks: [] }] }
                : t,
            ),
          }
        }
        if (p.id === input.plotId) {
          return { ...p, tasks: [...p.tasks, { ...created, subtasks: [] }] }
        }
        return p
      }),
    )

    setTaskModal({ isOpen: false })
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
      setActionError(errMsg(data, 'Failed to complete'))
      return
    }
    const updated = data.task as TaskWithHealth | undefined
    if (!updated) return
    // Completed tasks are hidden in garden — just remove from local state
    setPlots((prev) => removeTaskFromPlots(prev, updated.id))
  }

  async function handleDelete(taskId: string) {
    setActionError(null)
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) {
      const data = await safeJson(res)
      setActionError(errMsg(data, 'Failed to delete'))
      return
    }
    setPlots((prev) => removeTaskFromPlots(prev, taskId))
  }

  async function handleLogMinutes(taskId: string, delta: number) {
    setActionError(null)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, durationMinutes: delta, notes: 'Manual entry' }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(errMsg(data, 'Failed to log time'))

    const result = data as { task?: TaskWithHealth; streak?: { currentStreak: number } }
    if (result.task) setPlots((prev) => replaceTaskInPlots(prev, result.task!))
    if (result.streak) updateStreak(result.streak.currentStreak)

    const label: FloatingLabel = {
      id: crypto.randomUUID(),
      label: `+${delta} min`,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 60,
    }
    setFloatingLabels((prev) => [...prev, label])
    setTimeout(() => setFloatingLabels((prev) => prev.filter((l) => l.id !== label.id)), 1600)
  }

  async function handleLogReps(taskId: string, delta: number) {
    setActionError(null)
    const task = plots
      .flatMap((p) => p.tasks)
      .flatMap((t) => [t, ...t.subtasks])
      .find((t) => t.id === taskId)
    if (!task || task.targetReps === null) {
      throw new Error('Task is not rep-based')
    }
    const newTotal = task.completedReps + delta
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedReps: newTotal }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(errMsg(data, 'Failed to log reps'))
    const updated = data.task as TaskWithHealth | undefined
    if (updated) setPlots((prev) => replaceTaskInPlots(prev, updated))

    const label: FloatingLabel = {
      id: crypto.randomUUID(),
      label: `+${delta} reps`,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 60,
    }
    setFloatingLabels((prev) => [...prev, label])
    setTimeout(() => setFloatingLabels((prev) => prev.filter((l) => l.id !== label.id)), 1600)
  }

  async function handleConvertToPot(taskId: string) {
    setActionError(null)
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPot: true }),
    })
    const data = await safeJson(res)
    if (!res.ok) {
      setActionError(errMsg(data, 'Failed to convert'))
      return
    }
    const updated = data.task as TaskWithHealth | undefined
    if (!updated) return
    setPlots((prev) => replaceTaskInPlots(prev, updated))
  }

  async function handleMoveTask(taskId: string, pos: Pos) {
    setActionError(null)
    // Optimistic — snap the tile to its new spot immediately
    setPlots((prev) => setTaskPosition(prev, taskId, pos))
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posX: pos.x, posY: pos.y }),
    })
    if (!res.ok) {
      const data = await safeJson(res)
      setActionError(errMsg(data, 'Failed to move'))
      return
    }
    const data = await safeJson(res)
    const updated = data.task as TaskWithHealth | undefined
    if (updated) setPlots((prev) => replaceTaskInPlots(prev, updated))
  }

  async function handleToggleGridSnap(plotId: string, value: boolean) {
    setActionError(null)
    setPlots((prev) => prev.map((p) => (p.id === plotId ? { ...p, gridSnap: value } : p)))
    const res = await fetch(`/api/plots/${plotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gridSnap: value }),
    })
    if (!res.ok) {
      const data = await safeJson(res)
      setActionError(errMsg(data, 'Failed to update grid snap'))
      // revert
      setPlots((prev) => prev.map((p) => (p.id === plotId ? { ...p, gridSnap: !value } : p)))
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const editingPlot = plots.find((p) => p.id === editingPlotId) ?? null

  // Resolve the live zoom target from state so edits inside zoom stay in sync
  const zoomPlot = zoom?.kind === 'plot' ? plots.find((p) => p.id === zoom.plotId) ?? null : null
  const zoomPot =
    zoom?.kind === 'pot'
      ? plots.flatMap((p) => p.tasks).find((t) => t.id === zoom.potId) ?? null
      : null
  const zoomPotPlot =
    zoomPot != null ? plots.find((p) => p.tasks.some((t) => t.id === zoomPot.id)) ?? null : null

  if (plots.length === 0) {
    return (
      <>
        <EmptyState onCreatePlot={() => setPlotModalOpen(true)} />
        <AddPlotModal isOpen={plotModalOpen} onClose={() => setPlotModalOpen(false)} onSubmit={handleAddPlot} />
      </>
    )
  }

  return (
    <>
      {actionError && (
        <p className="mb-4 rounded-[4px] bg-red-100 px-4 py-2.5 font-pixel text-sm text-red-700 shadow-pixel-sm">{actionError}</p>
      )}

      <div className="mb-6 flex items-center justify-between">
        <p className="rounded-[4px] bg-bark/30 px-2.5 py-1 font-pixel text-sm text-mist shadow-pixel-sm">
          {plots.length} {plots.length === 1 ? 'plot' : 'plots'} growing
        </p>
        <button
          type="button"
          onClick={() => setPlotModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-[4px] bg-forest px-4 py-2 font-pixel text-sm font-bold text-mist shadow-pixel transition-transform active:translate-y-0.5"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14 M5 12h14" />
          </svg>
          New plot
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {plots.map((plot) => (
          <GardenPlot
            key={plot.id}
            plot={plot}
            onAddPlant={(plotId) => setTaskModal({ isOpen: true, mode: 'plant', plotId })}
            onAddPot={(plotId) => setTaskModal({ isOpen: true, mode: 'pot', plotId })}
            onEditPlot={(plotId) => setEditingPlotId(plotId)}
            onZoomPlot={(plotId) => setZoom({ kind: 'plot', plotId })}
            onZoomPot={(task) => setZoom({ kind: 'pot', potId: task.id })}
            onMoveTask={handleMoveTask}
            onToggleGridSnap={handleToggleGridSnap}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onConvertToPot={handleConvertToPot}
            onLogReps={handleLogReps}
            onLogMinutes={handleLogMinutes}
          />
        ))}
      </div>

      <AddTaskModal
        isOpen={taskModal.isOpen}
        onClose={() => setTaskModal({ isOpen: false })}
        onSubmit={handleAddTask}
        mode={taskModal.isOpen ? taskModal.mode : 'plant'}
        plotId={taskModal.isOpen ? taskModal.plotId : undefined}
        parentTaskId={taskModal.isOpen ? taskModal.parentTaskId : undefined}
        potDueDate={taskModal.isOpen ? taskModal.potDueDate : undefined}
      />

      <AddPlotModal
        isOpen={plotModalOpen}
        onClose={() => setPlotModalOpen(false)}
        onSubmit={handleAddPlot}
      />

      <EditPlotModal
        isOpen={editingPlotId !== null}
        plot={editingPlot}
        onClose={() => setEditingPlotId(null)}
        onSubmit={handleUpdatePlot}
        onDelete={handleDeletePlot}
      />

      {zoomPlot && (
        <ZoomView
          mode="plot"
          plot={zoomPlot}
          gridSnap={zoomPlot.gridSnap}
          onToggleGridSnap={(value) => handleToggleGridSnap(zoomPlot.id, value)}
          onClose={() => setZoom(null)}
          onMoveTask={handleMoveTask}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onConvertToPot={handleConvertToPot}
          onLogReps={handleLogReps}
          onLogMinutes={handleLogMinutes}
          onZoomPot={(task) => setZoom({ kind: 'pot', potId: task.id })}
          onAddPlant={() => setTaskModal({ isOpen: true, mode: 'plant', plotId: zoomPlot.id })}
          onAddPot={() => setTaskModal({ isOpen: true, mode: 'pot', plotId: zoomPlot.id })}
        />
      )}

      {zoomPot && (
        <ZoomView
          mode="pot"
          pot={zoomPot}
          gridSnap={zoomPotPlot?.gridSnap ?? false}
          onToggleGridSnap={(value) => zoomPotPlot && handleToggleGridSnap(zoomPotPlot.id, value)}
          onClose={() => setZoom(null)}
          onMoveTask={handleMoveTask}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onLogReps={handleLogReps}
          onLogMinutes={handleLogMinutes}
          onAddPlant={() =>
            setTaskModal({
              isOpen: true,
              mode: 'plant',
              parentTaskId: zoomPot.id,
              potDueDate: zoomPot.dueDate ?? undefined,
            })
          }
        />
      )}

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function replaceTaskInPlots(plots: PlotWithTasks[], updated: TaskWithHealth): PlotWithTasks[] {
  return plots.map((p) => ({
    ...p,
    tasks: p.tasks.map((t) => {
      if (t.id === updated.id) return { ...updated, subtasks: t.subtasks }
      if (t.subtasks.some((s) => s.id === updated.id)) {
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === updated.id ? { ...updated, subtasks: [] } : s,
          ),
        }
      }
      return t
    }),
  }))
}

function setTaskPosition(plots: PlotWithTasks[], id: string, pos: Pos): PlotWithTasks[] {
  return plots.map((p) => ({
    ...p,
    tasks: p.tasks.map((t) => {
      if (t.id === id) return { ...t, posX: pos.x, posY: pos.y }
      if (t.subtasks.some((s) => s.id === id)) {
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === id ? { ...s, posX: pos.x, posY: pos.y } : s,
          ),
        }
      }
      return t
    }),
  }))
}

function removeTaskFromPlots(plots: PlotWithTasks[], id: string): PlotWithTasks[] {
  return plots.map((p) => ({
    ...p,
    tasks: p.tasks
      .filter((t) => t.id !== id)
      .map((t) => ({ ...t, subtasks: t.subtasks.filter((s) => s.id !== id) })),
  }))
}

function EmptyState({ onCreatePlot }: { onCreatePlot: () => void }) {
  return (
    <div className="pixel-panel px-6 py-16 text-center">
      <PixelSprite name="logo" className="mx-auto h-24 w-24" />
      <h3 className="mt-4 font-pixel text-2xl font-bold text-forest">
        Your greenhouse is empty
      </h3>
      <p className="mt-2 font-pixel text-sm text-bark/70">
        Plots are the beds where your plants grow — think Work, School, Personal.
      </p>
      <button
        type="button"
        onClick={onCreatePlot}
        className="mt-6 inline-flex items-center gap-2 rounded-[4px] bg-sunrise px-6 py-3 font-pixel font-bold text-bark shadow-pixel transition-transform active:translate-y-0.5"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M12 5v14 M5 12h14" />
        </svg>
        Create your first plot
      </button>
    </div>
  )
}
