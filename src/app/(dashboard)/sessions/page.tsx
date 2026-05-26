import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { FocusSessionWithTask, SessionStats, TaskStatus } from '@/types'
import { formatMinutes, formatDateGroup } from '@/lib/format'
import { StreakCalendar } from '@/components/sessions/StreakCalendar'
import { SessionCard } from '@/components/sessions/SessionCard'

export default async function SessionsPage() {
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

  const [sessionsRaw, streak] = await Promise.all([
    prisma.focusSession.findMany({
      where: { userId },
      include: { task: { select: { title: true, category: true, status: true } } },
      orderBy: { completedAt: 'desc' },
      take: 200,
    }),
    prisma.wateringStreak.findFirst({ where: { userId } }),
  ])

  // Serialize sessions
  const sessions: FocusSessionWithTask[] = sessionsRaw.map((s) => ({
    id: s.id,
    userId: s.userId,
    taskId: s.taskId,
    durationMinutes: s.durationMinutes,
    completedAt: s.completedAt.toISOString(),
    notes: s.notes,
    task: {
      title: s.task.title,
      category: s.task.category,
      status: s.task.status as TaskStatus,
    },
  }))

  // Aggregate stats
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  const dailyMap = new Map<string, { minutes: number; sessions: number }>()
  for (const s of sessions) {
    const date = s.completedAt.slice(0, 10)
    const entry = dailyMap.get(date) ?? { minutes: 0, sessions: 0 }
    entry.minutes += s.durationMinutes
    entry.sessions += 1
    dailyMap.set(date, entry)
  }

  const dailyData: SessionStats['dailyData'] = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    const date = d.toISOString().slice(0, 10)
    const entry = dailyMap.get(date) ?? { minutes: 0, sessions: 0 }
    dailyData.push({ date, ...entry })
  }

  // Group sessions by date
  const grouped = new Map<string, FocusSessionWithTask[]>()
  for (const s of sessions) {
    const date = s.completedAt.slice(0, 10)
    const group = grouped.get(date) ?? []
    group.push(s)
    grouped.set(date, group)
  }

  const stats = {
    totalMinutes,
    totalSessions: sessions.length,
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <header>
        <h1 className="font-playfair text-3xl font-bold text-forest sm:text-4xl">
          Session History
        </h1>
        <p className="mt-1 text-sm text-soil/70">Your focus journey so far</p>

        {/* Stats summary bar */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatChip label="Total focus" value={formatMinutes(stats.totalMinutes)} />
          <StatChip label="Sessions" value={String(stats.totalSessions)} />
          <StatChip label="Current streak" value={`${stats.currentStreak}d`} />
          <StatChip label="Best streak" value={`${stats.longestStreak}d`} />
        </div>
      </header>

      {/* Streak heatmap */}
      <section>
        <h2 className="mb-4 font-playfair text-xl font-bold text-forest">Watering Streak</h2>
        <div className="rounded-3xl border border-soil/15 bg-white p-6 shadow-sm">
          <StreakCalendar dailyData={dailyData} />
        </div>
      </section>

      {/* Sessions list */}
      <section>
        <h2 className="mb-4 font-playfair text-xl font-bold text-forest">All Sessions</h2>

        {sessions.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-soil/20 bg-mist/40 px-6 py-16 text-center">
            <p className="font-playfair text-lg font-bold text-forest">No sessions yet</p>
            <p className="mt-2 text-sm text-soil/60">
              Start a focus session from the garden to see your history here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([date, dateSessions]) => (
              <div key={date}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-soil/50">
                  {formatDateGroup(date)}
                </p>
                <div className="space-y-2">
                  {dateSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-soil/15 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wider text-soil/50">{label}</p>
      <p className="font-playfair mt-0.5 text-xl font-bold text-forest">{value}</p>
    </div>
  )
}
