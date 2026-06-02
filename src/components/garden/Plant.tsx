'use client'

import { useState, MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2, Clock } from 'lucide-react'
import { TaskWithHealth, ProgressType } from '@/types'
import { PlantSVG } from './PlantSVG'
import { PlantStatusBadge } from './PlantStatusBadge'
import { WaterDropIndicator } from './WaterDropIndicator'
import { GrowthBar } from './GrowthBar'
import { LogRepsModal } from './LogRepsModal'
import { LogMinutesModal } from './LogMinutesModal'
import { useTimerContext } from '@/components/providers/TimerContext'
import { formatRelativeTime, formatDateGroup, formatMinutes } from '@/lib/format'

interface PlantProps {
  task: TaskWithHealth
  /** Whether this plant's popover is open (lifted to the canvas). */
  open: boolean
  /** Close the popover (after an action, or to dismiss). */
  onClose: () => void
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onConvertToPot?: (taskId: string) => void
  onLogReps?: (taskId: string, delta: number) => Promise<void>
  onLogMinutes?: (taskId: string, delta: number) => Promise<void>
}

export function Plant({
  task,
  open,
  onClose,
  onComplete,
  onDelete,
  onConvertToPot,
  onLogReps,
  onLogMinutes,
}: PlantProps) {
  const [logRepsOpen, setLogRepsOpen] = useState(false)
  const [logMinutesOpen, setLogMinutesOpen] = useState(false)
  const { openTimer } = useTimerContext()

  const isRepTask = task.progressType === ProgressType.REPS
  const isTimeTask = task.progressType === ProgressType.TIME

  function handleAction(e: MouseEvent, fn: () => void) {
    e.stopPropagation()
    fn()
    onClose()
  }

  function handleStartFocus() {
    openTimer(
      task.id,
      task.title,
      isRepTask && task.targetReps
        ? { targetReps: task.targetReps, completedReps: task.completedReps }
        : undefined,
    )
  }

  async function handleLogRepsSubmit(delta: number) {
    if (!onLogReps) return
    await onLogReps(task.id, delta)
    setLogRepsOpen(false)
  }

  async function handleLogMinutesSubmit(delta: number) {
    if (!onLogMinutes) return
    await onLogMinutes(task.id, delta)
    setLogMinutesOpen(false)
  }

  return (
    <div className="relative">
      {/* Presentational tile — pointer interaction handled by DraggableTile wrapper */}
      <div className="relative flex w-20 flex-col items-center gap-1 rounded-xl p-1.5">
        <PlantSVG status={task.health.status} className="plant-shadow h-20 w-20" />
        {isRepTask && (
          <span
            className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-forest text-[8px] font-bold text-mist shadow-sm"
            title="Rep-based"
            aria-hidden="true"
          >
            🔁
          </span>
        )}
        <span className="line-clamp-1 w-full text-center font-pixel text-[11px] font-semibold text-mist drop-shadow-[1px_1px_0_rgba(0,0,0,0.7)]">
          {task.title}
        </span>
      </div>

      {/* Click popover — left-0 so it never slides under the sidebar.
          Stops pointer events so the drag wrapper never sees clicks here. */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="pixel-panel absolute left-0 top-full z-50 mt-2 w-64 p-4"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 460, damping: 26 }}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-pixel text-base font-bold text-forest">{task.title}</h4>
              <PlantStatusBadge status={task.health.status} />
            </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-soil/70">{task.description}</p>
          )}

          <div className="mt-3">
            <GrowthBar percent={task.health.growthPercent} />
          </div>

          {isRepTask && task.targetReps !== null && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-soil/5 px-3 py-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-soil/50">Reps</p>
                <p className="text-sm font-bold text-forest">
                  {task.completedReps} / {task.targetReps}
                </p>
              </div>
              {onLogReps && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLogRepsOpen(true)
                    onClose()
                  }}
                  className="flex items-center gap-1 rounded-full bg-forest px-3 py-1.5 text-[11px] font-semibold text-mist transition-colors hover:bg-forest/80"
                  aria-label="Log reps"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M12 5v14 M5 12h14" />
                  </svg>
                  Log reps
                </button>
              )}
            </div>
          )}

          {isTimeTask && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-soil/5 px-3 py-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-soil/50">Time</p>
                <p className="text-sm font-bold text-forest">
                  {formatMinutes(task.totalFocusMinutes)} / {formatMinutes(task.estimatedMinutes ?? 120)}
                </p>
              </div>
              {onLogMinutes && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLogMinutesOpen(true)
                    onClose()
                  }}
                  className="flex items-center gap-1 rounded-full bg-forest px-3 py-1.5 text-[11px] font-semibold text-mist transition-colors hover:bg-forest/80"
                  aria-label="Log time"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M12 5v14 M5 12h14" />
                  </svg>
                  Log time
                </button>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-soil/70">
            <span className="font-medium">Priority {task.priority}</span>
            <WaterDropIndicator urgencyScore={task.health.urgencyScore} />
          </div>

          <p className="mt-1 text-xs text-soil/60">{formatRelativeTime(task.lastWateredAt)}</p>

          {task.dueDate && (
            <p className="mt-1 text-xs text-soil/60">
              Due {formatDateGroup(task.dueDate.slice(0, 10))}
            </p>
          )}

          {onConvertToPot && task.subtasks.length === 0 && (
            <button
              type="button"
              onClick={(e) => handleAction(e, () => onConvertToPot(task.id))}
              className="mt-3 w-full rounded-lg border border-soil/20 px-3 py-1.5 text-[11px] font-medium text-soil/70 transition-colors hover:border-soil/40 hover:text-soil"
            >
              Convert to Pot &middot; break into smaller plants
            </button>
          )}

          <div className="mt-4 flex gap-2">
            <button
                type="button"
                onClick={(e) => handleAction(e, () => onComplete(task.id))}
                className="flex-1 rounded-[4px] bg-sunrise px-3 py-1.5 font-pixel text-xs font-bold text-bark shadow-pixel-sm transition-transform active:translate-y-0.5"
              >
                Harvest
              </button>
              <button
                type="button"
                onClick={(e) => handleAction(e, () => onDelete(task.id))}
                className="rounded-[4px] bg-red-500/90 px-3 py-1.5 text-mist shadow-pixel-sm transition-transform active:translate-y-0.5"
                aria-label="Delete plant"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => handleAction(e, handleStartFocus)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[4px] px-2 py-1 font-pixel text-[11px] font-medium text-bark/60 transition-colors hover:bg-bark/5 hover:text-bark"
            >
              <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
              Start focus timer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isRepTask && task.targetReps !== null && onLogReps && (
        <LogRepsModal
          isOpen={logRepsOpen}
          onClose={() => setLogRepsOpen(false)}
          onSubmit={handleLogRepsSubmit}
          taskTitle={task.title}
          completedReps={task.completedReps}
          targetReps={task.targetReps}
        />
      )}

      {isTimeTask && onLogMinutes && (
        <LogMinutesModal
          isOpen={logMinutesOpen}
          onClose={() => setLogMinutesOpen(false)}
          onSubmit={handleLogMinutesSubmit}
          taskTitle={task.title}
          totalFocusMinutes={task.totalFocusMinutes}
          estimatedMinutes={task.estimatedMinutes}
        />
      )}
    </div>
  )
}
