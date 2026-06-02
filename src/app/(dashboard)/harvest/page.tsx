import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { serializeTaskWithSubtasks } from '@/lib/task-serializer'
import { serializePlot } from '@/lib/plot-serializer'
import { HarvestClient } from '@/components/harvest/HarvestClient'
import { PixelSprite } from '@/components/pixel/sprites'

export default async function HarvestPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('rootfocus-token')?.value
  if (!token) redirect('/login')

  let userId: string
  try {
    const payload = await verifyToken(token)
    userId = payload.userId
  } catch {
    redirect('/login')
  }

  const rows = await prisma.task.findMany({
    where: { userId, parentTaskId: null, status: 'COMPLETED' },
    orderBy: [{ completedAt: 'desc' }, { updatedAt: 'desc' }],
    include: { subtasks: true, plot: true },
  })

  const initialHarvests = rows.map((row) => ({
    task: serializeTaskWithSubtasks(row),
    plot: row.plot ? serializePlot(row.plot) : null,
  }))

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <PixelSprite name="wheat" className="h-9 w-9" title="Harvest" />
          <h1 className="font-pixel text-3xl font-bold text-forest drop-shadow-[2px_2px_0_rgba(255,255,255,0.6)] sm:text-4xl">
            The Harvest
          </h1>
        </div>
        <p className="mt-1 font-pixel text-sm text-soil/80">
          Each plant you&apos;ve grown to maturity. Kept and celebrated.
        </p>
      </header>

      <HarvestClient initialHarvests={initialHarvests} />
    </div>
  )
}
