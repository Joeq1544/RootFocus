import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { serializeTaskWithSubtasks } from '@/lib/task-serializer'
import { serializePlot } from '@/lib/plot-serializer'
import { organizePlots } from '@/lib/garden-organize'
import { getGreeting } from '@/lib/format'
import { GardenClient } from '@/components/garden/GardenClient'
import { PixelSprite } from '@/components/pixel/sprites'

export default async function GardenPage() {
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      streaks: true,
      plots: { orderBy: { order: 'asc' } },
      tasks: {
        where: { parentTaskId: null, status: { not: 'COMPLETED' } },
        include: { subtasks: true },
      },
    },
  })

  if (!user) redirect('/login')

  const allTasks = user.tasks.map(serializeTaskWithSubtasks)
  const plots = user.plots.map(serializePlot)
  const initialPlots = organizePlots(plots, allTasks)

  const streak = user.streaks[0] ?? { currentStreak: 0, longestStreak: 0 }

  return (
    <div className="relative animate-fade-in">
      <header className="relative z-10 mb-8">
        <h1 className="font-pixel text-3xl font-bold text-forest drop-shadow-[2px_2px_0_rgba(255,255,255,0.6)] sm:text-4xl">
          {getGreeting(user.name ?? user.username)}
        </h1>
        <p className="mt-1 font-pixel text-sm text-soil/80">Your garden today</p>

        <div className="pixel-panel mt-5 inline-flex items-center gap-3 px-4 py-2.5">
          <PixelSprite name="sun" className="sun-rays h-9 w-9" title="Streak" />
          <div>
            <p className="font-pixel text-[10px] font-bold uppercase tracking-wider text-bark/60">
              Watering streak
            </p>
            <p className="font-pixel text-xl font-bold text-forest">
              {streak.currentStreak} day{streak.currentStreak === 1 ? '' : 's'}
              <span className="ml-2 font-pixel text-xs font-normal text-bark/60">
                · best {streak.longestStreak}
              </span>
            </p>
          </div>
        </div>
      </header>

      <GardenClient initialPlots={initialPlots} />
    </div>
  )
}

