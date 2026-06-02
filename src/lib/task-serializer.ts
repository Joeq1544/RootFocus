import type { Task as PrismaTask } from '@prisma/client'
import { Task, TaskStatus, TaskWithHealth, ProgressType } from '@/types'
import { calculatePlantHealth, calculatePotHealth } from './plant-health'

/**
 * Converts a Prisma Task row (with Date objects) into the API-shape Task,
 * computes its PlantHealth, and attaches subtasks. Use this everywhere a
 * Task crosses the server → client boundary.
 *
 * Pots (isPot=true) compute their health from subtask health, not their own
 * focus-minute counter.
 */
export function serializeTask(
  task: PrismaTask,
  subtasks: TaskWithHealth[] = [],
): TaskWithHealth {
  const apiTask: Task = {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    category: task.category,
    plotId: task.plotId,
    isPot: task.isPot,
    priority: task.priority,
    status: task.status as TaskStatus,
    parentTaskId: task.parentTaskId,
    totalFocusMinutes: task.totalFocusMinutes,
    progressType: task.progressType as ProgressType,
    estimatedMinutes: task.estimatedMinutes,
    targetReps: task.targetReps,
    completedReps: task.completedReps,
    lastWateredAt: task.lastWateredAt ? task.lastWateredAt.toISOString() : null,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    posX: task.posX,
    posY: task.posY,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }

  const health = task.isPot
    ? calculatePotHealth(subtasks.map((s) => s.health))
    : calculatePlantHealth(apiTask)

  return { ...apiTask, subtasks, health }
}

/**
 * Serializes a top-level Prisma task plus its already-loaded subtasks array.
 * Each subtask is serialized with empty grandchildren (only one level deep).
 */
export function serializeTaskWithSubtasks(
  task: PrismaTask & { subtasks: PrismaTask[] },
): TaskWithHealth {
  const subtasks = task.subtasks.map((s) => serializeTask(s, []))
  return serializeTask(task, subtasks)
}
