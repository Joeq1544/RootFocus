import { Task, TaskStatus, PlantHealth } from '@/types'

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
