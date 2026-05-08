export enum TaskStatus {
  SEED = 'SEED',
  SPROUT = 'SPROUT',
  GROWING = 'GROWING',
  BLOOMING = 'BLOOMING',
  WILTING = 'WILTING',
  DEAD = 'DEAD',
  COMPLETED = 'COMPLETED',
}

export interface PlantHealth {
  status: TaskStatus
  growthPercent: number
  needsWater: boolean
  urgencyScore: number
}

export interface User {
  id: string
  email: string
  username: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  category: string | null
  priority: number
  status: TaskStatus
  parentTaskId: string | null
  totalFocusMinutes: number
  lastWateredAt: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface FocusSession {
  id: string
  userId: string
  taskId: string
  durationMinutes: number
  completedAt: string
  notes: string | null
}
