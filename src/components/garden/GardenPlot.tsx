'use client'

import { PlotWithTasks } from '@/types'
import { Plant } from './Plant'
import { Pot } from './Pot'
import { PlotIcon } from './PlotIcon'
import { PlotColorDot } from './PlotColorDot'

interface GardenPlotProps {
  plot: PlotWithTasks
  onAddPlant: (plotId: string) => void
  onAddPot: (plotId: string) => void
  onAddSubtask: (potId: string, potDueDate?: string) => void
  onEditPlot: (plotId: string) => void
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onConvertToPot: (taskId: string) => void
}

export function GardenPlot({
  plot,
  onAddPlant,
  onAddPot,
  onAddSubtask,
  onEditPlot,
  onComplete,
  onDelete,
  onConvertToPot,
}: GardenPlotProps) {
  return (
    <section className="raised-bed p-6 pt-5">
      {/* Header */}
      <header className="relative z-10 mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <PlotColorDot slug={plot.color} className="h-3 w-3 shrink-0" />
          <PlotIcon slug={plot.icon} className="h-4 w-4 shrink-0 text-mist" />
          <div className="min-w-0">
            <h3 className="font-playfair truncate text-base font-bold text-mist drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              {plot.name}
            </h3>
            <p className="text-[11px] text-mist/70">
              {plot.tasks.length} {plot.tasks.length === 1 ? 'plant' : 'plants'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAddPlant(plot.id)}
            className="flex h-8 items-center gap-1 rounded-full border border-mist/40 bg-sunrise/80 px-2.5 text-[11px] font-semibold text-soil shadow-md backdrop-blur-sm transition hover:bg-sunrise"
            aria-label={`Add plant to ${plot.name}`}
            title="Add Plant"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M12 5v14 M5 12h14" />
            </svg>
            Plant
          </button>
          <button
            type="button"
            onClick={() => onAddPot(plot.id)}
            className="flex h-8 items-center gap-1 rounded-full border border-mist/40 bg-soil/30 px-2.5 text-[11px] font-semibold text-mist shadow-md backdrop-blur-sm transition hover:bg-soil"
            aria-label={`Add pot to ${plot.name}`}
            title="Add Pot"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
              <path d="M5 9h14l-2 11H7L5 9z M3 7h18v2H3z" />
            </svg>
            Pot
          </button>
          <button
            type="button"
            onClick={() => onEditPlot(plot.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-mist/40 bg-soil/30 text-mist shadow-md backdrop-blur-sm transition hover:bg-soil"
            aria-label={`Edit ${plot.name}`}
            title="Plot settings"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </header>

      {/* Soil interior */}
      <div className="soil-bed relative min-h-[160px] p-4">
        {plot.tasks.length === 0 ? (
          <div className="flex h-full min-h-[140px] items-center justify-center rounded-lg border-2 border-dashed border-mist/20 bg-black/10 px-4 py-6 text-center">
            <p className="text-sm italic text-mist/60">Plant something new...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {plot.tasks.map((task) =>
              task.isPot ? (
                <Pot
                  key={task.id}
                  task={task}
                  onAddSubtask={onAddSubtask}
                  onComplete={onComplete}
                  onDelete={onDelete}
                  onCompleteSubtask={onComplete}
                  onDeleteSubtask={onDelete}
                />
              ) : (
                <Plant
                  key={task.id}
                  task={task}
                  onComplete={onComplete}
                  onDelete={onDelete}
                  onConvertToPot={onConvertToPot}
                />
              ),
            )}
          </div>
        )}
      </div>
    </section>
  )
}
