import { Plot, PlotWithTasks, TaskStatus, TaskWithHealth } from '@/types'

/**
 * Groups top-level (non-completed, parentless) tasks into their plots,
 * sorted by Plot.order ascending. Completed tasks are filtered out — they
 * live in the Trophy Room, not the garden.
 *
 * Pots and Plants both surface as top-level entries within a plot.
 * Subtasks are nested inside their parent pot (already serialized).
 */
export function organizePlots(plots: Plot[], tasks: TaskWithHealth[]): PlotWithTasks[] {
  const byPlot = new Map<string, TaskWithHealth[]>()

  for (const task of tasks) {
    if (task.status === TaskStatus.COMPLETED) continue
    if (task.parentTaskId !== null) continue
    if (!task.plotId) continue
    const list = byPlot.get(task.plotId) ?? []
    list.push(task)
    byPlot.set(task.plotId, list)
  }

  return plots
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((plot) => ({
      ...plot,
      tasks: (byPlot.get(plot.id) ?? []).sort(
        (a, b) => b.health.urgencyScore - a.health.urgencyScore,
      ),
    }))
}
