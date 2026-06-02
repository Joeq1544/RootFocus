'use client'

import { formatDateGroup, formatMinutes } from '@/lib/format'

interface DayData {
  date: string
  minutes: number
  sessions: number
}

interface StreakCalendarProps {
  dailyData: DayData[]
}

function cellColor(minutes: number): string {
  if (minutes === 0) return 'bg-soil/25'
  if (minutes <= 25) return 'bg-grass-light/60'
  if (minutes <= 60) return 'bg-grass/80'
  if (minutes <= 120) return 'bg-grass-dark'
  return 'bg-forest'
}

export function StreakCalendar({ dailyData }: StreakCalendarProps) {
  // dailyData is sorted oldest → newest (84 entries)
  // We display 12 columns (weeks) × 7 rows (days Sun–Sat)
  // Pad the start so the first cell aligns to the correct weekday
  const dataMap = new Map(dailyData.map((d) => [d.date, d]))

  // Build a grid: 12 weeks, starting from the Sunday on or before (today - 83 days)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const oldestDay = new Date(today.getTime() - 83 * 86_400_000)
  // Roll back to the nearest Sunday
  const startDay = new Date(oldestDay)
  startDay.setDate(startDay.getDate() - startDay.getDay())

  // Total cells = 7 * 12 = 84, but startDay may be before our data window
  const weeks: Array<Array<{ date: string; inWindow: boolean }>> = []
  for (let w = 0; w < 12; w++) {
    const week: Array<{ date: string; inWindow: boolean }> = []
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDay.getTime() + (w * 7 + d) * 86_400_000)
      const dateStr = cellDate.toISOString().slice(0, 10)
      const oldestStr = oldestDay.toISOString().slice(0, 10)
      const todayStr = today.toISOString().slice(0, 10)
      week.push({ date: dateStr, inWindow: dateStr >= oldestStr && dateStr <= todayStr })
    }
    weeks.push(week)
  }

  // Month labels: detect where month changes across weeks
  const monthLabels: Array<{ weekIndex: number; label: string }> = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const firstInWindow = week.find((c) => c.inWindow)
    if (firstInWindow) {
      const m = new Date(firstInWindow.date + 'T12:00:00').getMonth()
      if (m !== lastMonth) {
        monthLabels.push({
          weekIndex: wi,
          label: new Date(firstInWindow.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }),
        })
        lastMonth = m
      }
    }
  })

  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-2">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1 pt-5">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="flex h-3 w-3 items-center justify-center text-[9px] text-soil/40">
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex flex-col gap-0.5">
          {/* Month labels */}
          <div className="relative h-4 mb-1">
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={label + weekIndex}
                className="absolute text-[9px] font-medium text-soil/50"
                style={{ left: weekIndex * 16 }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Weeks as columns */}
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map(({ date, inWindow }) => {
                  const data = dataMap.get(date)
                  const minutes = inWindow ? (data?.minutes ?? 0) : 0
                  const sessions = inWindow ? (data?.sessions ?? 0) : 0

                  return (
                    <div
                      key={date}
                      className={`group relative h-3 w-3 rounded-[2px] transition-transform hover:scale-125 ${
                        inWindow ? `${cellColor(minutes)} shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]` : 'bg-transparent'
                      }`}
                    >
                      {inWindow && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="whitespace-nowrap rounded-[4px] bg-wood px-2 py-1.5 font-pixel text-[10px] leading-tight text-mist shadow-pixel-sm">
                            <p className="font-bold">{formatDateGroup(date)}</p>
                            {minutes > 0 ? (
                              <>
                                <p>{formatMinutes(minutes)} focused</p>
                                <p>{sessions} {sessions === 1 ? 'session' : 'sessions'}</p>
                              </>
                            ) : (
                              <p className="text-mist/60">No sessions</p>
                            )}
                          </div>
                          <div className="mx-auto h-1.5 w-1.5 -translate-y-0.5 rotate-45 bg-wood" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 font-pixel text-[10px] text-bark/60">
        <span>Less</span>
        {[0, 20, 45, 90, 150].map((min) => (
          <div key={min} className={`h-3 w-3 rounded-[2px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] ${cellColor(min)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
