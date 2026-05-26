'use client'

import { useFocusTimer } from '@/hooks/useFocusTimer'
import { TimerControls } from './TimerControls'

interface FocusTimerProps {
  taskId: string
  taskTitle: string
  durationMinutes?: number
  breakMinutes?: number
  onSessionComplete: (data: { taskId: string; durationMinutes: number }) => Promise<void>
  onClose: () => void
}

const CIRCUMFERENCE = 2 * Math.PI * 54 // r=54

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatTime(seconds: number) {
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`
}

export function FocusTimer({
  taskId,
  taskTitle,
  durationMinutes = 25,
  breakMinutes = 5,
  onSessionComplete,
  onClose,
}: FocusTimerProps) {
  const { phase, secondsLeft, totalSeconds, reducedMotion, start, pause, reset } = useFocusTimer({
    taskId,
    durationMinutes,
    breakMinutes,
    isActive: true,
    onComplete: async (mins) => {
      await onSessionComplete({ taskId, durationMinutes: mins })
    },
  })

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const ringColor =
    phase === 'BREAK'
      ? '#D4A843' // sunrise
      : secondsLeft <= 60
        ? '#EF4444' // red-500
        : secondsLeft <= 300
          ? '#D4A843' // sunrise
          : '#2D5016' // forest

  const phaseLabel =
    phase === 'IDLE' ? 'Ready' :
    phase === 'RUNNING' ? 'Focusing' :
    phase === 'PAUSED' ? 'Paused' :
    phase === 'BREAK' ? 'Break' :
    'Done!'

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Header */}
      <div className="flex w-full items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-soil/50">Focus</p>
          <h2 className="font-playfair truncate text-base font-bold text-soil">{taskTitle}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close timer"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-soil/40 transition-colors hover:bg-soil/10 hover:text-soil"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M18 6 6 18 M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Ring */}
      <div className="relative">
        <svg width="144" height="144" viewBox="0 0 120 120">
          {/* Track */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="rgba(107,66,38,0.15)"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            style={{ transition: reducedMotion ? 'none' : 'stroke-dashoffset 0.8s linear, stroke 0.5s ease' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {phase === 'COMPLETED' ? (
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-forest" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="font-mono text-2xl font-bold tabular-nums text-forest">
              {formatTime(secondsLeft)}
            </span>
          )}
          <span className="mt-0.5 text-[11px] font-medium text-soil/50">{phaseLabel}</span>
        </div>
      </div>

      {/* Completed message */}
      {phase === 'COMPLETED' && (
        <p className="text-sm font-semibold text-forest">Session saved!</p>
      )}

      {/* Break message */}
      {phase === 'BREAK' && (
        <p className="text-xs text-soil/60">
          Take a breather — next session starts when you&apos;re ready.
        </p>
      )}

      <TimerControls
        phase={phase}
        onStart={start}
        onPause={pause}
        onReset={reset}
      />
    </div>
  )
}
