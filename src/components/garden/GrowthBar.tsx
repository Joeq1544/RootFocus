interface GrowthBarProps {
  percent: number
  label?: string
}

const SEGMENTS = 10

/** Segmented pixel progress bar (filled "blocks" out of 10). */
export function GrowthBar({ percent, label = 'Progress' }: GrowthBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  const filled = Math.round((clamped / 100) * SEGMENTS)
  return (
    <div>
      <div className="flex justify-between font-pixel text-[10px] text-bark/70">
        <span>{label}</span>
        <span className="font-bold">{Math.round(clamped)}%</span>
      </div>
      <div className="mt-1 flex gap-0.5 rounded-[3px] bg-bark/15 p-0.5 shadow-[inset_0_0_0_2px_rgba(58,40,23,0.25)]">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-[1px] transition-colors ${
              i < filled
                ? i < SEGMENTS * 0.6
                  ? 'bg-grass'
                  : 'bg-sunrise'
                : 'bg-bark/10'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
