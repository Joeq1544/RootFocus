import { TaskStatus } from '@/types'

interface PlantStatusBadgeProps {
  status: TaskStatus
}

export function PlantStatusBadge({ status }: PlantStatusBadgeProps) {
  return <span data-testid="plant-status-badge">{status}</span>
}
