import { FocusSessionWithTask, TaskStatus } from '@/types'
import { PlantStatusBadge } from '@/components/garden/PlantStatusBadge'
import { formatTimeOfDay, formatMinutes } from '@/lib/format'

interface SessionCardProps {
  session: FocusSessionWithTask
}

const accentColors: Record<TaskStatus, string> = {
  [TaskStatus.SEED]: 'bg-soil/40',
  [TaskStatus.SPROUT]: 'bg-forest-light/50',
  [TaskStatus.GROWING]: 'bg-forest/60',
  [TaskStatus.BLOOMING]: 'bg-sunrise',
  [TaskStatus.WILTING]: 'bg-orange-400',
  [TaskStatus.DEAD]: 'bg-soil-light/50',
  [TaskStatus.COMPLETED]: 'bg-sunrise',
}

export function SessionCard({ session }: SessionCardProps) {
  const accent = accentColors[session.task.status]

  return (
    <div className="flex overflow-hidden rounded-2xl border border-soil/15 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Left accent bar */}
      <div className={`w-1 shrink-0 ${accent}`} />

      <div className="flex-1 px-5 py-4">
        {/* Row 1: title + status badge */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-playfair truncate text-sm font-bold text-forest">
            {session.task.title}
          </h3>
          <PlantStatusBadge status={session.task.status} className="shrink-0" />
        </div>

        {/* Row 2: metadata chips */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-soil/60">
          {session.task.category && (
            <span className="rounded-full bg-soil/10 px-2.5 py-0.5 font-medium text-soil">
              {session.task.category}
            </span>
          )}

          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
              <path d="M12 2C9 7 6 9.5 6 14a6 6 0 0 0 12 0c0-4.5-3-7-6-12z" />
            </svg>
            {formatMinutes(session.durationMinutes)}
          </span>

          <span>{formatTimeOfDay(session.completedAt)}</span>
        </div>

        {/* Notes */}
        {session.notes && (
          <p className="mt-2 line-clamp-2 text-xs italic text-soil/50">{session.notes}</p>
        )}
      </div>
    </div>
  )
}
