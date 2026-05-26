interface WaterDropIndicatorProps {
  urgencyScore: number
  className?: string
}

export function WaterDropIndicator({ urgencyScore, className = '' }: WaterDropIndicatorProps) {
  const score = Math.max(0, Math.min(10, urgencyScore))

  let color = 'text-blue-400'
  let fillRatio = 0.2
  let pulse = false

  if (score >= 10) {
    color = 'text-red-500'
    fillRatio = 1
    pulse = true
  } else if (score >= 7) {
    color = 'text-orange-500'
    fillRatio = 0.85
  } else if (score >= 4) {
    color = 'text-teal-500'
    fillRatio = 0.5
  }

  // viewBox 0 0 24 30; drop spans roughly y=2..28 (height 26)
  const fillTop = 28 - 26 * fillRatio

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} title={`Urgency ${score.toFixed(1)} / 10`}>
      <svg
        viewBox="0 0 24 30"
        className={`h-5 w-4 ${color} ${pulse ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`drop-clip-${score.toFixed(0)}`}>
            <path d="M12 2 C12 2 4 12 4 19 a8 8 0 0 0 16 0 C20 12 12 2 12 2 Z" />
          </clipPath>
        </defs>
        <path
          d="M12 2 C12 2 4 12 4 19 a8 8 0 0 0 16 0 C20 12 12 2 12 2 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="0"
          y={fillTop}
          width="24"
          height="30"
          fill="currentColor"
          clipPath={`url(#drop-clip-${score.toFixed(0)})`}
          opacity="0.85"
        />
      </svg>
      <span className="text-xs font-medium text-soil/70">{score.toFixed(1)}</span>
    </div>
  )
}
