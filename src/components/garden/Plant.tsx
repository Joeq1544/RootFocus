import { Task, PlantHealth } from '@/types'

interface PlantProps {
  task: Task
  health: PlantHealth
}

export function Plant({ task, health }: PlantProps) {
  return (
    <div data-testid="plant" data-status={health.status}>
      {task.title}
    </div>
  )
}
