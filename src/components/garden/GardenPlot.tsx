import { Task } from '@/types'

interface GardenPlotProps {
  tasks: Task[]
}

export function GardenPlot({ tasks }: GardenPlotProps) {
  return <div data-testid="garden-plot">{tasks.length} plants</div>
}
