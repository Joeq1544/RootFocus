'use client'

import { useMemo, useState } from 'react'
import { Plot, ProgressType, TaskWithHealth } from '@/types'
import { formatMinutes, formatDateGroup } from '@/lib/format'
import { HarvestCard } from './HarvestCard'
import { PixelSprite } from '@/components/pixel/sprites'

export interface Harvest {
  task: TaskWithHealth
  plot: Plot | null
}

interface HarvestClientProps {
  initialHarvests: Harvest[]
}

function dayKey(h: Harvest): string {
  const ts = h.task.completedAt ?? h.task.updatedAt
  return ts.slice(0, 10)
}

function daysBetween(start: string, end: string): number {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  return Math.max(0, Math.round((endMs - startMs) / 86_400_000))
}

export function HarvestClient({ initialHarvests }: HarvestClientProps) {
  const [harvests, setHarvests] = useState<Harvest[]>(initialHarvests)
  const [actionError, setActionError] = useState<string | null>(null)

  const stats = useMemo(() => {
    let totalMinutes = 0
    let totalReps = 0
    let longestDays = 0
    for (const { task } of harvests) {
      totalMinutes += task.totalFocusMinutes
      if (task.progressType === ProgressType.REPS) totalReps += task.completedReps
      const harvestedAt = task.completedAt ?? task.updatedAt
      const days = daysBetween(task.createdAt, harvestedAt)
      if (days > longestDays) longestDays = days
    }
    return {
      count: harvests.length,
      totalMinutes,
      totalReps,
      longestDays,
    }
  }, [harvests])

  const grouped = useMemo(() => {
    const map = new Map<string, Harvest[]>()
    for (const h of harvests) {
      const key = dayKey(h)
      const group = map.get(key) ?? []
      group.push(h)
      map.set(key, group)
    }
    // Preserve insertion order (already sorted desc by completedAt on the server)
    return Array.from(map.entries())
  }, [harvests])

  async function handleDelete(taskId: string) {
    setActionError(null)
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) {
      let message = 'Failed to discard harvest'
      try {
        const data = (await res.json()) as { error?: string }
        if (typeof data.error === 'string') message = data.error
      } catch {
        // ignore JSON parse errors
      }
      setActionError(message)
      throw new Error(message)
    }
    setHarvests((prev) => prev.filter((h) => h.task.id !== taskId))
  }

  if (harvests.length === 0) {
    return (
      <div className="pixel-panel px-6 py-16 text-center">
        <PixelSprite name="wheat" className="mx-auto h-16 w-16" />
        <h3 className="mt-4 font-pixel text-2xl font-bold text-forest">Nothing harvested yet</h3>
        <p className="mt-2 font-pixel text-sm text-bark/70">
          Plants you finish growing will be kept here.
        </p>
      </div>
    )
  }

  return (
    <>
      {actionError && (
        <p className="mb-4 rounded-[4px] bg-red-100 px-4 py-2.5 font-pixel text-sm text-red-700 shadow-pixel-sm">{actionError}</p>
      )}

      {/* Top stats bar */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip label="Harvests" value={String(stats.count)} />
        <StatChip label="Total time" value={stats.totalMinutes > 0 ? formatMinutes(stats.totalMinutes) : '—'} />
        <StatChip label="Total reps" value={stats.totalReps > 0 ? String(stats.totalReps) : '—'} />
        <StatChip
          label="Longest grow"
          value={stats.longestDays > 0 ? `${stats.longestDays} day${stats.longestDays === 1 ? '' : 's'}` : 'same day'}
        />
      </div>

      {/* Grouped list */}
      <div className="space-y-8">
        {grouped.map(([date, dateHarvests]) => (
          <div key={date}>
            <p className="mb-3 inline-block rounded-[4px] bg-bark/30 px-2.5 py-1 font-pixel text-xs font-bold uppercase tracking-wider text-mist shadow-pixel-sm">
              {formatDateGroup(date)}
            </p>
            <div className="space-y-3">
              {dateHarvests.map((h) => (
                <HarvestCard key={h.task.id} task={h.task} plot={h.plot} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="pixel-panel pixel-panel-soft px-4 py-3">
      <p className="font-pixel text-[10px] font-bold uppercase tracking-wider text-bark/60">{label}</p>
      <p className="mt-0.5 font-pixel text-xl font-bold text-forest">{value}</p>
    </div>
  )
}
