'use client'

import { useState, MouseEvent } from 'react'
import { TaskWithHealth } from '@/types'
import { PlantSVG } from './PlantSVG'
import { PlantStatusBadge } from './PlantStatusBadge'
import { WaterDropIndicator } from './WaterDropIndicator'
import { useTimerContext } from '@/components/providers/TimerContext'
import { formatRelativeTime } from '@/lib/format'

interface PlantProps {
  task: TaskWithHealth
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
}

export function Plant({ task, onComplete, onDelete }: PlantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { openTimer } = useTimerContext()

  function handleAction(e: MouseEvent, fn: () => void) {
    e.stopPropagation()
    fn()
    setIsOpen(false)
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full flex-col items-center gap-1 rounded-xl p-1.5 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise/60"
      >
        <PlantSVG
          status={task.health.status}
          className="plant-shadow h-20 w-20"
        />
        <span className="line-clamp-1 w-full text-center font-playfair text-[11px] font-semibold text-mist drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
          {task.title}
        </span>
      </button>

      {/* Hover/click popover */}
      <div
        className={`absolute left-1/2 top-full z-40 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-soil/15 bg-white p-4 shadow-2xl shadow-soil/40 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-playfair text-base font-bold text-forest">{task.title}</h4>
          <PlantStatusBadge status={task.health.status} />
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-soil/70">{task.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-soil/70">
          <span className="font-medium">Priority {task.priority}</span>
          <WaterDropIndicator urgencyScore={task.health.urgencyScore} />
        </div>

        <p className="mt-1 text-xs text-soil/60">{formatRelativeTime(task.lastWateredAt)}</p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={(e) => handleAction(e, () => openTimer(task.id, task.title))}
            className="flex-1 rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-mist transition-colors hover:bg-forest/80"
          >
            Start Focus
          </button>
          <button
            type="button"
            onClick={(e) => handleAction(e, () => onComplete(task.id))}
            className="flex-1 rounded-full bg-sunrise px-3 py-1.5 text-xs font-semibold text-soil transition-colors hover:bg-sunrise-light"
          >
            Done
          </button>
          <button
            type="button"
            onClick={(e) => handleAction(e, () => onDelete(task.id))}
            className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            aria-label="Delete plant"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
