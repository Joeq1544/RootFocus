'use client'

import { TaskWithHealth } from '@/types'
import { PlantSVG } from './PlantSVG'
import { PixelSprite } from '@/components/pixel/sprites'

interface PotProps {
  task: TaskWithHealth
}

/**
 * A Pot is a parent task that contains plants (subtasks). Visually distinct
 * from a Plant — a pixel clay pot with mini-plants peeking out for its
 * subtasks. Purely presentational: dragging is handled by the wrapping
 * DraggableTile, and a clean click zooms into the pot's interior (ZoomView).
 */
export function Pot({ task }: PotProps) {
  const visibleSubs = task.subtasks.slice(0, 3) // peek up to 3 mini-plants

  return (
    <div className="relative flex w-20 flex-col items-center gap-1 p-1.5">
      <div className="relative h-20 w-20">
        {/* Mini-plant peeks above the rim */}
        <div className="absolute inset-x-0 top-1 flex justify-center gap-0.5">
          {visibleSubs.map((p) => (
            <PlantSVG key={p.id} status={p.health.status} className="h-7 w-7" />
          ))}
        </div>
        <PixelSprite name="pot" className="plant-shadow absolute inset-0 h-20 w-20" title="Pot" />
      </div>
      {task.subtasks.length > 0 && (
        <span
          className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-sm bg-forest px-1 font-pixel text-[10px] font-bold text-mist shadow-pixel-sm"
          aria-hidden="true"
        >
          {task.subtasks.length}
        </span>
      )}
      <span className="line-clamp-1 w-full text-center font-pixel text-[11px] font-semibold text-mist drop-shadow-[1px_1px_0_rgba(0,0,0,0.7)]">
        {task.title}
      </span>
    </div>
  )
}
