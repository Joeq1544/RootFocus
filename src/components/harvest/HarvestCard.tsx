'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { TaskStatus, TaskWithHealth, Plot, ProgressType } from '@/types'
import { PlantSVG } from '@/components/garden/PlantSVG'
import { PlotIcon } from '@/components/garden/PlotIcon'
import { PlotColorDot } from '@/components/garden/PlotColorDot'
import { formatMinutes, formatDateGroup } from '@/lib/format'

interface HarvestCardProps {
  task: TaskWithHealth
  plot: Plot | null
  onDelete: (id: string) => Promise<void>
}

function daysBetween(start: string, end: string): number {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  return Math.max(0, Math.round((endMs - startMs) / 86_400_000))
}

export function HarvestCard({ task, plot, onDelete }: HarvestCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const harvestedAt = task.completedAt ?? task.updatedAt
  const days = daysBetween(task.createdAt, harvestedAt)
  const harvestedDate = formatDateGroup(harvestedAt.slice(0, 10))

  const isRepTask = task.progressType === ProgressType.REPS
  const completedSubtasks = task.subtasks.filter((s) => s.status === TaskStatus.COMPLETED).length

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await onDelete(task.id)
    } finally {
      setIsDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="pixel-panel pixel-panel-soft relative flex gap-4 px-4 py-3">
      <div className="shrink-0">
        <PlantSVG status={TaskStatus.COMPLETED} className="h-14 w-14" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-pixel text-base font-bold text-forest">{task.title}</h3>

          {confirming ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-[4px] bg-red-600 px-2.5 py-1 font-pixel text-[10px] font-bold text-white shadow-pixel-sm transition-transform active:translate-y-0.5 disabled:opacity-50"
              >
                {isDeleting ? 'Discarding…' : 'Discard'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={isDeleting}
                className="rounded-[4px] bg-panel-inset px-2.5 py-1 font-pixel text-[10px] font-bold text-bark shadow-pixel-sm transition-transform active:translate-y-0.5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="shrink-0 rounded-[4px] p-1.5 text-bark/40 transition-colors hover:bg-red-100 hover:text-red-600"
              aria-label="Discard harvest"
              title="Discard harvest"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {plot && (
          <div className="mt-0.5 flex items-center gap-1.5 font-pixel text-[11px] text-bark/70">
            <PlotColorDot slug={plot.color} className="h-2.5 w-2.5" />
            <PlotIcon slug={plot.icon} className="h-3 w-3" />
            <span className="truncate">{plot.name}</span>
          </div>
        )}

        <p className="mt-1 text-xs text-bark/60">
          Harvested {harvestedDate} · {days === 0 ? 'same day' : `${days} day${days === 1 ? '' : 's'}`} from planting
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-pixel text-xs text-bark/70">
          {task.totalFocusMinutes > 0 && <span>{formatMinutes(task.totalFocusMinutes)} logged</span>}
          {isRepTask && task.targetReps !== null && (
            <span>
              {task.completedReps} / {task.targetReps} reps
            </span>
          )}
          {task.isPot && task.subtasks.length > 0 && (
            <span>
              {completedSubtasks} / {task.subtasks.length} plants
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
