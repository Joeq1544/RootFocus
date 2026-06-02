import { TaskStatus } from '@/types'

interface PlantStatusBadgeProps {
  status: TaskStatus
  className?: string
}

const statusClasses: Record<TaskStatus, string> = {
  [TaskStatus.SEED]: 'bg-soil/20 text-soil',
  [TaskStatus.SPROUT]: 'bg-grass/25 text-forest',
  [TaskStatus.GROWING]: 'bg-grass/30 text-forest',
  [TaskStatus.BLOOMING]: 'bg-sunrise/40 text-bark',
  [TaskStatus.WILTING]: 'bg-orange-200 text-orange-800',
  [TaskStatus.DEAD]: 'bg-soil-light/30 text-soil-light',
  [TaskStatus.COMPLETED]: 'bg-sunrise text-bark',
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
      className={`inline-flex items-center rounded-[3px] px-2 py-0.5 font-pixel text-[10px] font-bold uppercase tracking-wide shadow-[inset_0_0_0_1px_rgba(58,40,23,0.2)] ${statusClasses[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  )
}
