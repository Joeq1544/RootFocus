import { TaskStatus } from '@/types'

interface PlantStatusBadgeProps {
  status: TaskStatus
  className?: string
}

const statusClasses: Record<TaskStatus, string> = {
  [TaskStatus.SEED]: 'bg-soil/20 text-soil',
  [TaskStatus.SPROUT]: 'bg-forest-light/20 text-forest',
  [TaskStatus.GROWING]: 'bg-forest/20 text-forest',
  [TaskStatus.BLOOMING]: 'bg-sunrise/30 text-soil',
  [TaskStatus.WILTING]: 'bg-orange-200 text-orange-800',
  [TaskStatus.DEAD]: 'bg-soil-light/30 text-soil-light',
  [TaskStatus.COMPLETED]: 'bg-gradient-to-r from-sunrise to-sunrise-light text-soil',
}

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.SEED]: 'Seed',
  [TaskStatus.SPROUT]: 'Sprout',
  [TaskStatus.GROWING]: 'Growing',
  [TaskStatus.BLOOMING]: 'Blooming',
  [TaskStatus.WILTING]: 'Wilting',
  [TaskStatus.DEAD]: 'Dead',
  [TaskStatus.COMPLETED]: 'Harvested',
}

export function PlantStatusBadge({ status, className = '' }: PlantStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusClasses[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  )
}
