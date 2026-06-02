'use client'

import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Sprout, Plus, Check, Trash2, X, Grid3x3 } from 'lucide-react'
import { PlotWithTasks, TaskWithHealth } from '@/types'
import { Pos } from '@/lib/garden-layout'
import { SoilCanvas } from './SoilCanvas'
import { GrowthBar } from './GrowthBar'
import { PlotColorDot } from './PlotColorDot'
import { PlotIcon } from './PlotIcon'

interface ZoomViewProps {
  mode: 'plot' | 'pot'
  plot?: PlotWithTasks
  pot?: TaskWithHealth
  /** Resolved grid-snap for the canvas (plot's own, or pot's parent plot's). */
  gridSnap: boolean
  onToggleGridSnap: (value: boolean) => void
  onClose: () => void
  onMoveTask: (taskId: string, pos: Pos) => void
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onConvertToPot?: (taskId: string) => void
  onLogReps?: (taskId: string, delta: number) => Promise<void>
  onLogMinutes?: (taskId: string, delta: number) => Promise<void>
  onZoomPot?: (task: TaskWithHealth) => void
  onAddPlant: () => void
  onAddPot?: () => void
}

/** Full-screen canvas for arranging one plot or one pot's interior. */
export function ZoomView(props: ZoomViewProps) {
  const { mode, plot, pot, gridSnap, onToggleGridSnap, onClose } = props
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!mounted) return null

  const tasks = mode === 'plot' ? plot?.tasks ?? [] : pot?.subtasks ?? []
  const title = mode === 'plot' ? plot?.name ?? '' : pot?.title ?? ''

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-40 flex flex-col bg-bark/55 p-4 sm:p-8" onClick={onClose}>
      <div
        className="pixel-panel relative z-50 mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-wood px-4 py-2.5 shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]">
          <div className="flex min-w-0 items-center gap-2">
            {mode === 'plot' && plot && (
              <>
                <PlotColorDot slug={plot.color} className="h-3.5 w-3.5 shrink-0" />
                <PlotIcon slug={plot.icon} className="h-5 w-5 shrink-0 text-mist" />
              </>
            )}
            <h2 className="truncate font-pixel text-xl font-bold text-mist drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
              {title}
            </h2>
            {mode === 'pot' && (
              <span className="shrink-0 rounded-[3px] bg-bark/30 px-2 py-0.5 font-pixel text-[10px] font-medium text-mist/80">
                {tasks.length} {tasks.length === 1 ? 'plant' : 'plants'}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleGridSnap(!gridSnap)}
              className={`flex h-8 items-center gap-1.5 rounded-[4px] px-2.5 font-pixel text-xs font-bold shadow-pixel-sm transition-transform active:translate-y-0.5 ${
                gridSnap ? 'bg-sunrise text-bark' : 'bg-wood-light text-mist'
              }`}
              title={gridSnap ? 'Grid snap on' : 'Grid snap off'}
            >
              <Grid3x3 className="h-4 w-4" strokeWidth={2.5} />
              Snap
            </button>

            <button
              type="button"
              onClick={props.onAddPlant}
              className="flex h-8 items-center gap-1 rounded-[4px] bg-sunrise px-2.5 font-pixel text-xs font-bold text-bark shadow-pixel-sm transition-transform active:translate-y-0.5"
            >
              <Sprout className="h-4 w-4" strokeWidth={2.5} />
              Plant
            </button>

            {mode === 'plot' && props.onAddPot && (
              <button
                type="button"
                onClick={props.onAddPot}
                className="flex h-8 items-center gap-1 rounded-[4px] bg-clay px-2.5 font-pixel text-xs font-bold text-mist shadow-pixel-sm transition-transform active:translate-y-0.5"
              >
                <Plus className="h-4 w-4" strokeWidth={3} />
                Pot
              </button>
            )}

            {mode === 'pot' && pot && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    props.onComplete(pot.id)
                    onClose()
                  }}
                  className="flex h-8 items-center gap-1 rounded-[4px] bg-forest px-2.5 font-pixel text-xs font-bold text-mist shadow-pixel-sm transition-transform active:translate-y-0.5"
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                  Harvest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onDelete(pot.id)
                    onClose()
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-red-500/90 text-mist shadow-pixel-sm transition-transform active:translate-y-0.5"
                  aria-label="Delete pot"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-wood-light text-mist shadow-pixel-sm transition-transform active:translate-y-0.5"
            >
              <X className="h-4 w-4" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-auto p-5 sm:p-7">
          {/* Pot progress */}
          {mode === 'pot' && pot && (
            <div className="mb-4">
              <GrowthBar percent={pot.health.growthPercent} />
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1">
          <SoilCanvas
            tasks={tasks}
            gridSnap={gridSnap}
            onMoveTask={props.onMoveTask}
            onComplete={props.onComplete}
            onDelete={props.onDelete}
            onConvertToPot={mode === 'plot' ? props.onConvertToPot : undefined}
            onLogReps={props.onLogReps}
            onLogMinutes={props.onLogMinutes}
            onZoomPot={mode === 'plot' ? props.onZoomPot : undefined}
            className="h-full min-h-[60vh]"
            emptyHint={mode === 'pot' ? 'Add the first plant to this pot…' : 'Plant something new…'}
          />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
