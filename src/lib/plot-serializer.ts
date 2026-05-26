import type { Plot as PrismaPlot } from '@prisma/client'
import { Plot } from '@/types'

/**
 * Converts a Prisma Plot row into the API-shape Plot with ISO string dates.
 */
export function serializePlot(plot: PrismaPlot): Plot {
  return {
    id: plot.id,
    userId: plot.userId,
    name: plot.name,
    color: plot.color,
    icon: plot.icon,
    order: plot.order,
    gridSnap: plot.gridSnap,
    createdAt: plot.createdAt.toISOString(),
    updatedAt: plot.updatedAt.toISOString(),
  }
}
