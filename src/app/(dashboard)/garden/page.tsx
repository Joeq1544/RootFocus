import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { serializeTaskWithSubtasks } from '@/lib/task-serializer'
import { getGreeting } from '@/lib/format'
import { GardenClient } from '@/components/garden/GardenClient'

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
      tasks: {
        where: { parentTaskId: null },
        include: { subtasks: true },
      },
    },
  })

  if (!user) redirect('/login')

  const initialTasks = user.tasks
    .map(serializeTaskWithSubtasks)
    .sort((a, b) => b.health.urgencyScore - a.health.urgencyScore)

  const streak = user.streaks[0] ?? { currentStreak: 0, longestStreak: 0 }

  return (
    <div className="relative animate-fade-in">
      {/* Ambient garden details */}
      <GardenAmbience />

      <header className="relative z-10 mb-8">
        <h1 className="font-playfair text-3xl font-bold text-forest sm:text-4xl">
          {getGreeting(user.username)}
        </h1>
        <p className="mt-1 text-sm text-soil/70">Your garden today</p>

        <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sunrise/30 to-sunrise/10 px-5 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sunrise/40">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-soil" fill="currentColor" aria-hidden="true">
              <path d="M13.5 2 C 13.5 6, 8 7, 8 12 C 8 16, 11 19, 14 19 C 17 19, 19 16.5, 19 13 C 19 9.5, 16 8, 16.5 5 C 14 6, 13 4, 13.5 2 Z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-soil/60">
              Watering streak
            </p>
            <p className="font-playfair text-xl font-bold text-forest">
              {streak.currentStreak} day{streak.currentStreak === 1 ? '' : 's'}
              <span className="ml-2 text-xs font-normal text-soil/60">
                · best {streak.longestStreak}
              </span>
            </p>
          </div>
        </div>
      </header>

      <GardenClient initialTasks={initialTasks} />
    </div>
  )
}

function GardenAmbience() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Warm sun in top-right */}
      <div
        className="sun-rays absolute -right-20 -top-24 h-72 w-72 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,168,67,0.45) 0%, rgba(212,168,67,0.18) 50%, transparent 80%)',
        }}
      />
      <svg
        className="sun-rays absolute right-6 top-6 h-16 w-16 text-sunrise/70"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <circle cx="32" cy="32" r="10" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="31"
            y="2"
            width="2"
            height="8"
            rx="1"
            transform={`rotate(${i * 30} 32 32)`}
            opacity="0.7"
          />
        ))}
      </svg>

      {/* Drifting butterfly */}
      <svg
        className="animate-drift absolute left-[12%] top-24 h-8 w-8 text-sunrise/80"
        viewBox="0 0 32 32"
        fill="currentColor"
      >
        <path d="M16 16 Q8 6 4 12 Q4 18 12 18 Z" />
        <path d="M16 16 Q24 6 28 12 Q28 18 20 18 Z" />
        <path d="M16 16 Q10 22 8 26 Q14 24 16 20 Z" opacity="0.7" />
        <path d="M16 16 Q22 22 24 26 Q18 24 16 20 Z" opacity="0.7" />
        <path d="M16 12 L16 22" stroke="#6B4226" strokeWidth="1" />
      </svg>

      {/* Grass tufts along the bottom */}
      <svg
        className="absolute bottom-0 left-0 h-12 w-full text-forest-light/50"
        viewBox="0 0 1200 50"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        {Array.from({ length: 60 }).map((_, i) => {
          const x = i * 20 + (i % 3) * 4
          const h = 20 + (i % 5) * 6
          return (
            <path
              key={i}
              d={`M${x} 50 Q${x + 3} ${50 - h} ${x + 6} 50 Z`}
              opacity={0.5 + (i % 3) * 0.15}
            />
          )
        })}
      </svg>

      {/* Subtle dappled light spots */}
      <div className="absolute left-[20%] top-1/3 h-40 w-40 rounded-full bg-sunrise/15 blur-3xl" />
      <div className="absolute right-[15%] top-2/3 h-56 w-56 rounded-full bg-forest-light/15 blur-3xl" />
    </div>
  )
}
