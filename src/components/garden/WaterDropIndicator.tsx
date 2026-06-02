interface WaterDropIndicatorProps {
  urgencyScore: number
  className?: string
}

// Pixel droplet mask: 'o' = outline, '#' = fillable interior, '.' = transparent.
const DROP = [
  '...oo...',
  '..o##o..',
  '..o##o..',
  '.o####o.',
  '.o####o.',
  'o######o',
  'o######o',
  'o######o',
  '.o####o.',
  '..oooo..',
]

/**
 * Pixel-art water drop whose interior fills from the bottom by urgency, tinted
 * blue→teal→orange→red. Keeps the `urgencyScore` contract.
 */
export function WaterDropIndicator({ urgencyScore, className = '' }: WaterDropIndicatorProps) {
  const score = Math.max(0, Math.min(10, urgencyScore))

  let water = '#3F90C4'
  let fillRatio = 0.25
  let pulse = false
  if (score >= 10) {
    water = '#E0533A'
    fillRatio = 1
    pulse = true
  } else if (score >= 7) {
    water = '#E08A3A'
    fillRatio = 0.85
  } else if (score >= 4) {
    water = '#3FB7A8'
    fillRatio = 0.55
  }

  const outline = '#2A4A66'
  const empty = '#CFE3EF'
  const fillStartRow = DROP.length - Math.round(DROP.length * fillRatio)

  const rects: React.ReactNode[] = []
  DROP.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      const fill = ch === 'o' ? outline : y >= fillStartRow ? water : empty
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />)
    }
  })

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} title={`Urgency ${score.toFixed(1)} / 10`}>
      <svg
        viewBox="0 0 8 10"
        className={`h-5 w-4 ${pulse ? 'animate-pulse' : ''}`}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {rects}
      </svg>
      <span className="font-mono text-xs font-medium text-soil/70">{score.toFixed(1)}</span>
    </div>
  )
}
