import { TaskStatus } from '@/types'

interface PlantSVGProps {
  status: TaskStatus
  className?: string
}

const SOIL = '#6B4226'
const SOIL_LIGHT = '#8B5E3C'
const LEAF = '#3D6B1F'
const LEAF_DARK = '#2D5016'
const LEAF_BRIGHT = '#5C9132'
const FLOWER = '#D4A843'
const FLOWER_LIGHT = '#E8C060'
const WILT_LEAF = '#A89150'
const WILT_TIP = '#7C5A1A'
const DEAD_BROWN = '#6B4226'
const DEAD_DRY = '#9A7B4F'
const GOLD = '#E8C060'

function Soil() {
  return (
    <ellipse cx="40" cy="68" rx="22" ry="6" fill={SOIL} />
  )
}

export function PlantSVG({ status, className = '' }: PlantSVGProps) {
  const animation =
    status === TaskStatus.GROWING || status === TaskStatus.BLOOMING
      ? 'animate-sway'
      : status === TaskStatus.COMPLETED
        ? 'animate-glow animate-sway'
        : ''

  return (
    <svg
      viewBox="0 0 80 80"
      className={`${animation} ${className}`}
      role="img"
      aria-label={`Plant in ${status.toLowerCase()} stage`}
    >
      {renderStage(status)}
    </svg>
  )
}

function renderStage(status: TaskStatus): React.ReactNode {
  switch (status) {
    case TaskStatus.SEED:
      return (
        <>
          <Soil />
          <ellipse cx="40" cy="64" rx="14" ry="5" fill={SOIL_LIGHT} />
          <path d="M37 60 Q40 56 43 60" stroke={LEAF_BRIGHT} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="40" cy="62" r="1.6" fill={LEAF_BRIGHT} />
        </>
      )
    case TaskStatus.SPROUT:
      return (
        <>
          <Soil />
          <ellipse cx="40" cy="65" rx="12" ry="3.5" fill={SOIL_LIGHT} />
          <path d="M40 64 Q40 56 40 50" stroke={LEAF_BRIGHT} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M40 56 Q34 53 32 49 Q36 49 40 53 Z" fill={LEAF_BRIGHT} />
          <path d="M40 52 Q46 49 48 45 Q44 45 40 49 Z" fill={LEAF_BRIGHT} />
        </>
      )
    case TaskStatus.GROWING:
      return (
        <>
          <Soil />
          <path d="M40 65 Q40 50 40 32" stroke={LEAF} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M40 56 Q30 53 24 47 Q32 50 40 53 Z" fill={LEAF} />
          <path d="M40 50 Q50 46 56 40 Q48 44 40 47 Z" fill={LEAF_BRIGHT} />
          <path d="M40 44 Q32 40 26 33 Q34 38 40 41 Z" fill={LEAF} />
          <path d="M40 38 Q48 34 53 28 Q46 32 40 35 Z" fill={LEAF_BRIGHT} />
          <path d="M40 32 Q40 28 38 25 Q42 27 42 32" fill={LEAF_DARK} />
        </>
      )
    case TaskStatus.BLOOMING:
      return (
        <>
          <Soil />
          <path d="M40 65 Q40 48 40 28" stroke={LEAF} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M40 56 Q30 53 24 47 Q32 50 40 53 Z" fill={LEAF} />
          <path d="M40 50 Q50 46 56 40 Q48 44 40 47 Z" fill={LEAF_BRIGHT} />
          <path d="M40 44 Q32 40 26 33 Q34 38 40 41 Z" fill={LEAF} />
          <path d="M40 38 Q48 34 53 28 Q46 32 40 35 Z" fill={LEAF_BRIGHT} />
          {/* flower */}
          <g>
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="40"
                cy="18"
                rx="5"
                ry="7"
                fill={FLOWER_LIGHT}
                transform={`rotate(${deg} 40 24)`}
              />
            ))}
            <circle cx="40" cy="24" r="3.5" fill={FLOWER} />
          </g>
        </>
      )
    case TaskStatus.WILTING:
      return (
        <g transform="rotate(8 40 70)">
          <Soil />
          <path d="M40 65 Q42 52 44 36" stroke={WILT_LEAF} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M40 56 Q30 60 22 62 Q30 56 38 53 Z" fill={WILT_LEAF} />
          <path d="M22 62 Q24 64 26 65" stroke={WILT_TIP} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M42 50 Q52 54 60 58 Q52 50 44 47 Z" fill={WILT_LEAF} />
          <path d="M60 58 Q58 60 56 61" stroke={WILT_TIP} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M43 42 Q34 46 28 50 Q34 42 41 39 Z" fill={WILT_LEAF} />
          <path d="M44 36 Q42 40 40 42" stroke={WILT_TIP} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      )
    case TaskStatus.DEAD:
      return (
        <>
          <Soil />
          <path d="M40 65 L41 50 L38 38 L42 28" stroke={DEAD_BROWN} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M38 38 Q30 36 26 40" stroke={DEAD_DRY} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M41 50 Q48 50 52 54" stroke={DEAD_DRY} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M42 28 Q46 26 47 22" stroke={DEAD_DRY} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>
      )
    case TaskStatus.COMPLETED:
      return (
        <>
          <Soil />
          <path d="M40 65 Q40 48 40 26" stroke={GOLD} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M40 56 Q30 53 24 47 Q32 50 40 53 Z" fill={GOLD} />
          <path d="M40 50 Q50 46 56 40 Q48 44 40 47 Z" fill={FLOWER_LIGHT} />
          <path d="M40 44 Q32 40 26 33 Q34 38 40 41 Z" fill={GOLD} />
          <g>
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="40"
                cy="16"
                rx="5.5"
                ry="7.5"
                fill={GOLD}
                transform={`rotate(${deg} 40 22)`}
              />
            ))}
            <circle cx="40" cy="22" r="3.5" fill={FLOWER} />
          </g>
          {/* sparkles */}
          <g fill={GOLD}>
            <path d="M14 18 L15 14 L16 18 L20 19 L16 20 L15 24 L14 20 L10 19 Z" opacity="0.8" />
            <path d="M62 32 L62.5 30 L63 32 L65 32.5 L63 33 L62.5 35 L62 33 L60 32.5 Z" opacity="0.7" />
            <path d="M22 50 L22.5 48 L23 50 L25 50.5 L23 51 L22.5 53 L22 51 L20 50.5 Z" opacity="0.6" />
          </g>
        </>
      )
  }
}
