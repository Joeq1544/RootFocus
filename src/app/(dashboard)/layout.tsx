import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { DashboardChrome } from '@/components/layout/DashboardChrome'
import { StreakProvider } from '@/components/providers/StreakContext'
import { TimerContextProvider } from '@/components/providers/TimerContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    include: { streaks: true },
  })

  if (!user) redirect('/login')

  const streak = user.streaks[0] ?? { currentStreak: 0, longestStreak: 0 }

  // Today's focus minutes for sidebar footer
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayAgg = await prisma.focusSession.aggregate({
    where: { userId, completedAt: { gte: todayStart } },
    _sum: { durationMinutes: true },
  })
  const todayMinutes = todayAgg._sum.durationMinutes ?? 0

  return (
    <StreakProvider initialStreak={streak.currentStreak}>
      <TimerContextProvider>
        <DashboardChrome
          name={user.name}
          username={user.username}
          avatar={user.avatar}
          todayMinutes={todayMinutes}
        >
          {children}
        </DashboardChrome>
      </TimerContextProvider>
    </StreakProvider>
  )
}
