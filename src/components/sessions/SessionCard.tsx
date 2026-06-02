import { Droplet } from 'lucide-react'
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
    <div className="pixel-panel pixel-panel-soft flex overflow-hidden">
      {/* Left accent bar */}
      <div className={`w-1.5 shrink-0 ${accent}`} />

      <div className="flex-1 px-5 py-4">
        {/* Row 1: title + status badge */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-pixel text-sm font-bold text-forest">
            {session.task.title}
          </h3>
          <PlantStatusBadge status={session.task.status} className="shrink-0" />
        </div>

        {/* Row 2: metadata chips */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-bark/60">
          {session.task.category && (
            <span className="rounded-[3px] bg-bark/10 px-2 py-0.5 font-pixel font-medium text-bark">
              {session.task.category}
            </span>
          )}

          <span className="flex items-center gap-1 font-pixel">
            <Droplet className="h-3 w-3" />
            {formatMinutes(session.durationMinutes)}
          </span>

          <span className="font-pixel">{formatTimeOfDay(session.completedAt)}</span>
        </div>

        {/* Notes */}
        {session.notes && (
          <p className="mt-2 line-clamp-2 text-xs italic text-bark/50">{session.notes}</p>
        )}
      </div>
    </div>
  )
}
