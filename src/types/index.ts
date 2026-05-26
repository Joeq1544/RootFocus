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

export interface TaskWithHealth extends Task {
  health: PlantHealth
  subtasks: TaskWithHealth[]
}

export interface WateringStreak {
  id: string
  userId: string
  currentStreak: number
  longestStreak: number
  lastWateredDate: string | null
}

export type TimerPhase = 'IDLE' | 'RUNNING' | 'PAUSED' | 'BREAK' | 'COMPLETED'

export interface SessionCreateInput {
  taskId: string
  durationMinutes: number
  notes?: string
}

export interface SessionCreateResult {
  session: FocusSession
  task: TaskWithHealth
  streak: WateringStreak
}

export interface SessionStats {
  totalMinutes: number
  totalSessions: number
  currentStreak: number
  longestStreak: number
  dailyData: { date: string; minutes: number; sessions: number }[]
  minutesByCategory: { category: string; minutes: number }[]
}

export interface FocusSessionWithTask extends FocusSession {
  task: { title: string; category: string | null; status: TaskStatus }
}
