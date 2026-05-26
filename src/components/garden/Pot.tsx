'use client'

import { useState, MouseEvent } from 'react'
import { TaskWithHealth } from '@/types'
import { PlantSVG } from './PlantSVG'
import { PlantStatusBadge } from './PlantStatusBadge'
import { formatDateGroup } from '@/lib/format'

interface PotProps {
  task: TaskWithHealth
  onAddSubtask: (parentId: string, potDueDate?: string) => void
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onCompleteSubtask: (subtaskId: string) => void
  onDeleteSubtask: (subtaskId: string) => void
}

/**
 * A Pot is a parent task that contains plants (subtasks). Visually distinct
 * from a Plant — rendered as a clay pot with mini-plants representing its
 * subtasks. Click to expand a popover showing the subtasks.
 *
 * Step 9 will replace this expander with a full-screen zoom view.
 */
export function Pot({
  task,
  onAddSubtask,
  onComplete,
  onDelete,
  onCompleteSubtask,
  onDeleteSubtask,
}: PotProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleAction(e: MouseEvent, fn: () => void) {
    e.stopPropagation()
    fn()
  }

  const visibleSubs = task.subtasks.slice(0, 3) // peek up to 3 mini-plants

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full flex-col items-center gap-1 rounded-xl p-1.5 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise/60"
      >
        <PotSVG className="plant-shadow h-20 w-20" miniPlants={visibleSubs} />
        <span className="line-clamp-1 w-full text-center font-playfair text-[11px] font-semibold text-mist drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
          {task.title}
        </span>
      </button>

      {/* left-0 so it never slides under the sidebar */}
      <div
        className={`absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-soil/15 bg-white p-4 shadow-2xl shadow-soil/40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-playfair truncate text-base font-bold text-forest">{task.title}</h4>
            <p className="text-[10px] text-soil/50">Pot &middot; {task.subtasks.length} {task.subtasks.length === 1 ? 'plant' : 'plants'}</p>
            {task.dueDate && (
              <p className="text-[10px] text-soil/60">Due {formatDateGroup(task.dueDate.slice(0, 10))}</p>
            )}
          </div>
          <PlantStatusBadge status={task.health.status} />
        </div>

        {/* Progress bar based on aggregate growth */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-soil/60">
            <span>Progress</span>
            <span className="font-semibold">{Math.round(task.health.growthPercent)}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-soil/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-forest-light to-sunrise transition-all"
              style={{ width: `${task.health.growthPercent}%` }}
            />
          </div>
        </div>

        {/* Subtask list */}
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-soil/50">Plants inside</p>
          {task.subtasks.length === 0 ? (
            <p className="mt-1 text-xs italic text-soil/40">No plants yet</p>
          ) : (
            <ul className="mt-1 max-h-40 space-y-1.5 overflow-y-auto pr-1">
              {task.subtasks.map((sub) => (
                <li key={sub.id} className="flex items-center gap-2 rounded-lg bg-soil/5 px-2 py-1.5">
                  <PlantSVG status={sub.health.status} className="h-6 w-6 shrink-0" />
                  <span className="line-clamp-1 flex-1 text-xs text-soil">{sub.title}</span>
                  <button
                    type="button"
                    onClick={(e) => handleAction(e, () => onCompleteSubtask(sub.id))}
                    className="rounded-full p-1 text-soil/50 hover:bg-sunrise/30 hover:text-soil"
                    aria-label="Harvest plant"
                  >
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAction(e, () => onDeleteSubtask(sub.id))}
                    className="rounded-full p-1 text-red-400/60 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete plant"
                  >
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                      <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={(e) => handleAction(e, () => onAddSubtask(task.id, task.dueDate ?? undefined))}
            className="flex-1 rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-mist transition-colors hover:bg-forest/80"
          >
            Add plant
          </button>
          <button
            type="button"
            onClick={(e) => handleAction(e, () => onComplete(task.id))}
            className="rounded-full bg-sunrise px-3 py-1.5 text-xs font-semibold text-soil transition-colors hover:bg-sunrise-light"
            aria-label="Harvest pot"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => handleAction(e, () => onDelete(task.id))}
            className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            aria-label="Delete pot"
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

/** Placeholder clay-pot SVG with mini-plant peeks. User will replace with art later. */
function PotSVG({ className, miniPlants }: { className: string; miniPlants: TaskWithHealth[] }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      {/* Mini plant peeks above the rim (up to 3) */}
      {miniPlants.map((p, i) => {
        const offsetX = 40 + (i - (miniPlants.length - 1) / 2) * 14
        return (
          <g key={p.id} transform={`translate(${offsetX - 8}, 18)`}>
            <PlantSVG status={p.health.status} className="h-4 w-4" />
          </g>
        )
      })}

      {/* Pot body — trapezoid + rim */}
      <path
        d="M20 38 L24 70 Q24 74 28 74 L52 74 Q56 74 56 70 L60 38 Z"
        fill="#A6603A"
        stroke="#6B4226"
        strokeWidth="1.5"
      />
      {/* Rim */}
      <rect x="18" y="34" width="44" height="8" rx="2" fill="#C0673E" stroke="#6B4226" strokeWidth="1.5" />
      {/* Soil at top */}
      <ellipse cx="40" cy="40" rx="20" ry="3" fill="#4A2D1A" />
      {/* Highlight */}
      <path d="M24 42 L26 68" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
