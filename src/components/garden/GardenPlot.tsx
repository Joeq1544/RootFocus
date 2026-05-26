'use client'

import { TaskWithHealth } from '@/types'
import { Plant } from './Plant'

interface GardenPlotProps {
  title: string
  tasks: TaskWithHealth[]
  parentTask?: TaskWithHealth
  variant?: 'active' | 'harvested'
  onAddTask?: (parentTaskId?: string) => void
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
}

export function GardenPlot({
  title,
  tasks,
  parentTask,
  variant = 'active',
  onAddTask,
  onComplete,
  onDelete,
}: GardenPlotProps) {
  const isHarvested = variant === 'harvested'

  return (
    <section className={`raised-bed ${isHarvested ? 'harvested' : ''} p-6 pt-5`}>
      {/* Header sits on the wooden top rim */}
      <header className="relative z-10 mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isHarvested && (
            <svg className="h-5 w-5 text-sunrise" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" />
            </svg>
          )}
          <div>
            <h3 className="font-playfair text-base font-bold text-mist drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              {title}
            </h3>
            <p className="text-[11px] text-mist/70">
              {tasks.length} {tasks.length === 1 ? 'plant' : 'plants'}
              {isHarvested ? ' harvested' : ''}
            </p>
          </div>
        </div>
        {!isHarvested && onAddTask && (
          <button
            type="button"
            onClick={() => onAddTask(parentTask?.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-mist/40 bg-soil/30 text-mist shadow-md backdrop-blur-sm transition-colors hover:border-sunrise hover:bg-sunrise hover:text-soil"
            aria-label={`Add plant to ${title}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M12 5v14 M5 12h14" />
            </svg>
          </button>
        )}
      </header>

      {parentTask && (
        <div className="relative z-10 mb-3">
          <div className="flex items-center justify-between text-[11px] text-mist/80">
            <span>Progress</span>
            <span className="font-semibold">{Math.round(parentTask.health.growthPercent)}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/30 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-forest-light to-sunrise transition-all"
              style={{ width: `${parentTask.health.growthPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Soil interior where plants live */}
      <div className={`soil-bed ${isHarvested ? 'harvested' : ''} relative min-h-[160px] p-4`}>
        {tasks.length === 0 ? (
          <div className="flex h-full min-h-[140px] items-center justify-center rounded-lg border-2 border-dashed border-mist/20 bg-black/10 px-4 py-6 text-center">
            <p className="text-sm italic text-mist/60">Plant something new...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {tasks.map((task) => (
              <Plant
                key={task.id}
                task={task}
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
