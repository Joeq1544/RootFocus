import { TaskStatus } from '@/types'
import { PixelSprite } from '@/components/pixel/sprites'

interface PlantSVGProps {
  status: TaskStatus
  className?: string
}

const STATUS_SPRITE: Record<TaskStatus, string> = {
  [TaskStatus.SEED]: 'plant-seed',
  [TaskStatus.SPROUT]: 'plant-sprout',
  [TaskStatus.GROWING]: 'plant-growing',
  [TaskStatus.BLOOMING]: 'plant-blooming',
  [TaskStatus.WILTING]: 'plant-wilting',
  [TaskStatus.DEAD]: 'plant-dead',
  [TaskStatus.COMPLETED]: 'plant-completed',
}

/**
 * Renders a plant as a pixel-art sprite for its growth stage. Keeps the same
 * `status` + `className` contract as before; only the visuals are pixel now.
 */
export function PlantSVG({ status, className = '' }: PlantSVGProps) {
  const animation =
    status === TaskStatus.GROWING || status === TaskStatus.BLOOMING
      ? 'animate-sway'
      : status === TaskStatus.COMPLETED
        ? 'animate-glow animate-sway'
        : ''

  return (
    <PixelSprite
      name={STATUS_SPRITE[status]}
      className={`${animation} ${className}`}
      title={`Plant in ${status.toLowerCase()} stage`}
    />
  )
}
