import type { Task as PrismaTask } from '@prisma/client'
import { Task, TaskStatus, TaskWithHealth } from '@/types'
import { calculatePlantHealth } from './plant-health'

/**
 * Converts a Prisma Task row (with Date objects) into the API-shape Task,
 * computes its PlantHealth, and attaches subtasks. Use this everywhere a
 * Task crosses the server → client boundary.
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
    priority: task.priority,
    status: task.status as TaskStatus,
    parentTaskId: task.parentTaskId,
    totalFocusMinutes: task.totalFocusMinutes,
    lastWateredAt: task.lastWateredAt ? task.lastWateredAt.toISOString() : null,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
  return { ...apiTask, subtasks, health: calculatePlantHealth(apiTask) }
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
