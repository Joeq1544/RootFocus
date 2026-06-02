'use client'

import { useRef, useState } from 'react'
import { TaskWithHealth } from '@/types'
import { Pos, defaultPositions, gridLineFractions, GRID_COLS, GRID_ROWS } from '@/lib/garden-layout'
import { DraggableTile } from './DraggableTile'
import { Plant } from './Plant'
import { Pot } from './Pot'

interface SoilCanvasProps {
  tasks: TaskWithHealth[]
  gridSnap: boolean
  onMoveTask: (taskId: string, pos: Pos) => void
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onConvertToPot?: (taskId: string) => void
  onLogReps?: (taskId: string, delta: number) => Promise<void>
  onLogMinutes?: (taskId: string, delta: number) => Promise<void>
  /** Plot mode only — clicking a pot zooms into it. */
  onZoomPot?: (task: TaskWithHealth) => void
  /** Extra classes for the bed (e.g. sizing in zoom view). */
  className?: string
  emptyHint?: string
}

/**
 * The positioned soil bed shared by the in-place plot view and the zoom view.
 * Tiles are placed by their fractional posX/posY (falling back to a flow grid
 * when unset) and dragged via DraggableTile. Tracks which plant popover is open.
 */
export function SoilCanvas({
  tasks,
  gridSnap,
  onMoveTask,
  onComplete,
  onDelete,
  onConvertToPot,
  onLogReps,
  onLogMinutes,
  onZoomPot,
  className = '',
  emptyHint = 'Plant something new…',
}: SoilCanvasProps) {
  const bedRef = useRef<HTMLDivElement | null>(null)
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)

  const getBedRect = () => bedRef.current?.getBoundingClientRect() ?? null

  const defaults = defaultPositions(tasks.length)
  const positions: Pos[] = tasks.map((t, i) =>
    t.posX != null && t.posY != null ? { x: t.posX, y: t.posY } : defaults[i],
  )

  return (
    <div
      ref={bedRef}
      onPointerDown={() => setOpenTaskId(null)}
      className={`soil-bed relative w-full overflow-visible ${className}`}
    >
      {gridSnap && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2px]">
          {gridLineFractions(GRID_COLS).map((f, i) => (
            <div
              key={`v${i}`}
              className="absolute bottom-0 top-0 w-px bg-mist/20"
              style={{ left: `${f * 100}%` }}
            />
          ))}
          {gridLineFractions(GRID_ROWS).map((f, i) => (
            <div
              key={`h${i}`}
              className="absolute left-0 right-0 h-px bg-mist/20"
              style={{ top: `${f * 100}%` }}
            />
          ))}
        </div>
      )}
      {tasks.length === 0 ? (
        <div className="absolute inset-4 flex items-center justify-center rounded-[3px] border-2 border-dashed border-mist/25 bg-black/15 text-center">
          <p className="font-pixel text-sm text-mist/70">{emptyHint}</p>
        </div>
      ) : (
        tasks.map((task, i) => {
          const others = positions.filter((_, j) => j !== i)
          return (
            <DraggableTile
              key={task.id}
              xFrac={positions[i].x}
              yFrac={positions[i].y}
              getBedRect={getBedRect}
              others={others}
              snap={gridSnap}
              onCommit={(pos) => onMoveTask(task.id, pos)}
              onActivate={() => {
                if (task.isPot) {
                  onZoomPot?.(task)
                } else {
                  setOpenTaskId((cur) => (cur === task.id ? null : task.id))
                }
              }}
            >
              {task.isPot ? (
                <Pot task={task} />
              ) : (
                <Plant
                  task={task}
                  open={openTaskId === task.id}
                  onClose={() => setOpenTaskId(null)}
                  onComplete={onComplete}
                  onDelete={onDelete}
                  onConvertToPot={onConvertToPot}
                  onLogReps={onLogReps}
                  onLogMinutes={onLogMinutes}
                />
              )}
            </DraggableTile>
          )
        })
      )}
    </div>
  )
}

