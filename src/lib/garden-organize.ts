import { TaskStatus, TaskWithHealth } from '@/types'

export interface Plot {
  id: string
  title: string
  parentTask?: TaskWithHealth
  tasks: TaskWithHealth[]
  maxUrgency: number
  variant: 'active' | 'harvested'
}

const HARVESTED_ID = '__harvested__'
const UNCATEGORIZED = 'Uncategorized'

/**
 * Groups a flat list of top-level tasks (each with `subtasks`) into garden plots.
 *
 * - All COMPLETED tasks across the tree are gathered into a single trailing
 *   "Harvested" plot.
 * - Top-level active tasks that have any subtask become their own parent plot,
 *   containing their non-completed subtasks.
 * - Remaining childless top-level tasks group by category (or "Uncategorized").
 * - Active plots are sorted by max urgency descending; Harvested is always last.
 */
export function organizeIntoPlots(tasks: TaskWithHealth[]): Plot[] {
  const harvested: TaskWithHealth[] = []
  const activeTopLevel: TaskWithHealth[] = []

  for (const task of tasks) {
    if (task.health.status === TaskStatus.COMPLETED) {
      harvested.push(task)
    } else {
      activeTopLevel.push(task)
    }
    for (const sub of task.subtasks) {
      if (sub.health.status === TaskStatus.COMPLETED) harvested.push(sub)
    }
  }

  const parentPlots: Plot[] = []
  const categoryGroups = new Map<string, TaskWithHealth[]>()

  for (const task of activeTopLevel) {
    const hasAnySubtasks = task.subtasks.length > 0
    if (hasAnySubtasks) {
      const activeSubs = task.subtasks.filter(
        (s) => s.health.status !== TaskStatus.COMPLETED,
      )
      parentPlots.push({
        id: task.id,
        title: task.title,
        parentTask: task,
        tasks: activeSubs,
        maxUrgency: maxUrgency([task, ...activeSubs]),
        variant: 'active',
      })
    } else {
      const category = task.category?.trim() || UNCATEGORIZED
      const list = categoryGroups.get(category) ?? []
      list.push(task)
      categoryGroups.set(category, list)
    }
  }

  const categoryPlots: Plot[] = Array.from(categoryGroups.entries()).map(
    ([category, list]) => ({
      id: `category:${category}`,
      title: category,
      tasks: list,
      maxUrgency: maxUrgency(list),
      variant: 'active',
    }),
  )

  const activePlots = [...parentPlots, ...categoryPlots].sort(
    (a, b) => b.maxUrgency - a.maxUrgency,
  )

  if (harvested.length > 0) {
    activePlots.push({
      id: HARVESTED_ID,
      title: 'Harvested',
      tasks: harvested,
      maxUrgency: 0,
      variant: 'harvested',
    })
  }

  return activePlots
}

function maxUrgency(tasks: TaskWithHealth[]): number {
  return tasks.reduce((m, t) => Math.max(m, t.health.urgencyScore), 0)
}
