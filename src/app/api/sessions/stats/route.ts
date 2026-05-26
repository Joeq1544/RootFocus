import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { SessionStats } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [sessions, streak] = await Promise.all([
      prisma.focusSession.findMany({
        where: { userId: auth.userId },
        select: {
          durationMinutes: true,
          completedAt: true,
          task: { select: { category: true } },
        },
      }),
      prisma.wateringStreak.findFirst({ where: { userId: auth.userId } }),
    ])

    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    const totalSessions = sessions.length

    // Build daily data map
    const dailyMap = new Map<string, { minutes: number; sessions: number }>()
    for (const s of sessions) {
      const date = s.completedAt.toISOString().slice(0, 10)
      const entry = dailyMap.get(date) ?? { minutes: 0, sessions: 0 }
      entry.minutes += s.durationMinutes
      entry.sessions += 1
      dailyMap.set(date, entry)
    }

    // Fill last 84 days (12 weeks), newest first
    const dailyData: SessionStats['dailyData'] = []
    for (let i = 83; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000)
      const date = d.toISOString().slice(0, 10)
      const entry = dailyMap.get(date) ?? { minutes: 0, sessions: 0 }
      dailyData.push({ date, ...entry })
    }

    // Category breakdown
    const catMap = new Map<string, number>()
    for (const s of sessions) {
      const cat = s.task.category ?? 'Uncategorized'
      catMap.set(cat, (catMap.get(cat) ?? 0) + s.durationMinutes)
    }
    const minutesByCategory = Array.from(catMap.entries())
      .map(([category, minutes]) => ({ category, minutes }))
      .sort((a, b) => b.minutes - a.minutes)

    const stats: SessionStats = {
      totalMinutes,
      totalSessions,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      dailyData,
      minutesByCategory,
    }

    return NextResponse.json({ stats })
  } catch (err) {
    console.error('[GET /api/sessions/stats]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
