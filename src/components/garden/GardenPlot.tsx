'use client'

import { PlotWithTasks, TaskWithHealth } from '@/types'
import { Pos } from '@/lib/garden-layout'
import { Sprout, Plus, Grid3x3, Maximize2, Pencil } from 'lucide-react'
import { SoilCanvas } from './SoilCanvas'
import { PlotIcon } from './PlotIcon'
import { PlotColorDot } from './PlotColorDot'

interface GardenPlotProps {
  plot: PlotWithTasks
  onAddPlant: (plotId: string) => void
  onAddPot: (plotId: string) => void
  onEditPlot: (plotId: string) => void
  onZoomPlot: (plotId: string) => void
  onZoomPot: (task: TaskWithHealth) => void
  onMoveTask: (taskId: string, pos: Pos) => void
  onToggleGridSnap: (plotId: string, value: boolean) => void
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onConvertToPot: (taskId: string) => void
  onLogReps: (taskId: string, delta: number) => Promise<void>
  onLogMinutes: (taskId: string, delta: number) => Promise<void>
}

const ICON_BTN =
  'flex h-8 w-8 items-center justify-center rounded-[4px] text-mist shadow-pixel-sm transition-transform active:translate-y-0.5'

export function GardenPlot({
  plot,
  onAddPlant,
  onAddPot,
  onEditPlot,
  onZoomPlot,
  onZoomPot,
  onMoveTask,
  onToggleGridSnap,
  onComplete,
  onDelete,
  onConvertToPot,
  onLogReps,
  onLogMinutes,
}: GardenPlotProps) {
  return (
    <section className="raised-bed p-5 pt-4">
      {/* Header — wooden sign plate */}
      <header className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-[4px] bg-bark/25 px-2.5 py-1 shadow-[inset_0_0_0_2px_rgba(0,0,0,0.18)]">
          <PlotColorDot slug={plot.color} className="h-3 w-3 shrink-0" />
          <PlotIcon slug={plot.icon} className="h-4 w-4 shrink-0 text-mist" />
          <div className="min-w-0">
            <h3 className="truncate font-pixel text-base font-bold text-mist drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
              {plot.name}
            </h3>
            <p className="font-pixel text-[10px] text-mist/70">
              {plot.tasks.length} {plot.tasks.length === 1 ? 'plant' : 'plants'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAddPlant(plot.id)}
            className="flex h-8 items-center gap-1 rounded-[4px] bg-sunrise px-2.5 font-pixel text-[11px] font-bold text-bark shadow-pixel-sm transition-transform active:translate-y-0.5"
            title="Add Plant"
          >
            <Sprout className="h-3.5 w-3.5" strokeWidth={2.5} />
            Plant
          </button>
          <button
            type="button"
            onClick={() => onAddPot(plot.id)}
            className="flex h-8 items-center gap-1 rounded-[4px] bg-clay px-2.5 font-pixel text-[11px] font-bold text-mist shadow-pixel-sm transition-transform active:translate-y-0.5"
            title="Add Pot"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            Pot
          </button>

          <button
            type="button"
            onClick={() => onToggleGridSnap(plot.id, !plot.gridSnap)}
            className={`${ICON_BTN} ${plot.gridSnap ? 'bg-sunrise text-bark' : 'bg-wood-light'}`}
            aria-pressed={plot.gridSnap}
            title={plot.gridSnap ? 'Grid snap on' : 'Grid snap off'}
          >
            <Grid3x3 className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => onZoomPlot(plot.id)}
            className={`${ICON_BTN} bg-wood-light`}
            title="Expand plot"
          >
            <Maximize2 className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => onEditPlot(plot.id)}
            className={`${ICON_BTN} bg-wood-light`}
            title="Plot settings"
          >
            <Pencil className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Soil interior — spatial canvas */}
      <SoilCanvas
        tasks={plot.tasks}
        gridSnap={plot.gridSnap}
        onMoveTask={onMoveTask}
        onComplete={onComplete}
        onDelete={onDelete}
        onConvertToPot={onConvertToPot}
        onLogReps={onLogReps}
        onLogMinutes={onLogMinutes}
        onZoomPot={onZoomPot}
        className="aspect-[4/3]"
      />
    </section>
  )
}
