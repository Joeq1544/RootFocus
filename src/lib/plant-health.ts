import { Task, TaskStatus, PlantHealth } from '@/types'

/**
 * Computes a Pot's aggregate health from its subtasks' health.
 *
 * Growth = mean of subtask growth percentages.
 * Urgency = max of subtask urgency scores.
 * Status is derived from aggregate growth, with one exception:
 *   if every subtask is COMPLETED, the pot is COMPLETED.
 * A pot with no subtasks is a SEED.
 */
export function calculatePotHealth(subtaskHealth: PlantHealth[]): PlantHealth {
  if (subtaskHealth.length === 0) {
    return { status: TaskStatus.SEED, growthPercent: 0, needsWater: false, urgencyScore: 0 }
  }

  const allCompleted = subtaskHealth.every((h) => h.status === TaskStatus.COMPLETED)
  const growthPercent = subtaskHealth.reduce((sum, h) => sum + h.growthPercent, 0) / subtaskHealth.length
  const urgencyScore = subtaskHealth.reduce((max, h) => Math.max(max, h.urgencyScore), 0)
  const needsWater = subtaskHealth.some((h) => h.needsWater)

  let status: TaskStatus
  if (allCompleted) status = TaskStatus.COMPLETED
  else if (needsWater && growthPercent > 25) status = TaskStatus.WILTING
  else if (growthPercent === 0) status = TaskStatus.SEED
  else if (growthPercent <= 25) status = TaskStatus.SPROUT
  else if (growthPercent <= 60) status = TaskStatus.GROWING
  else status = TaskStatus.BLOOMING

  return { status, growthPercent, needsWater, urgencyScore }
}

/**
 * Derives the visual/health state of a plant from its associated task data.
 *
 * Growth scale: 0 min = 0%, 120 min = 100% (capped).
 * Urgency scale: priority × (hours since last watered / 24), capped at 10.
 */
export function calculatePlantHealth(task: Task): PlantHealth {
  const growthPercent = Math.min(100, (task.totalFocusMinutes / 120) * 100)

  const now = Date.now()
  const lastWatered = task.lastWateredAt ? new Date(task.lastWateredAt).getTime() : null
  const hoursSinceWatered = lastWatered != null ? (now - lastWatered) / 3_600_000 : Infinity

  const needsWater = lastWatered == null || hoursSinceWatered > 24

  const urgencyScore = Math.min(
    10,
    task.priority * (Math.min(hoursSinceWatered, 240) / 24),
  )

  let status: TaskStatus

  if (growthPercent === 100) {
    status = TaskStatus.COMPLETED
  } else if (needsWater && growthPercent > 25) {
    status = TaskStatus.WILTING
  } else if (growthPercent === 0) {
    status = TaskStatus.SEED
  } else if (growthPercent <= 25) {
    status = TaskStatus.SPROUT
  } else if (growthPercent <= 60) {
    status = TaskStatus.GROWING
  } else {
    status = TaskStatus.BLOOMING
  }

  return { status, growthPercent, needsWater, urgencyScore }
}
