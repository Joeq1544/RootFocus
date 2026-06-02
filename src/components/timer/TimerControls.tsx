'use client'

import { TimerPhase } from '@/types'

interface TimerControlsProps {
  phase: TimerPhase
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

export function TimerControls({ phase, onStart, onPause, onReset }: TimerControlsProps) {
  const isIdle = phase === 'IDLE'
  const isRunning = phase === 'RUNNING'
  const isPaused = phase === 'PAUSED'
  const isCompleted = phase === 'COMPLETED' || phase === 'BREAK'

  const primaryLabel = isRunning ? 'Pause' : isPaused ? 'Resume' : 'Start'
  const primaryDisabled = isCompleted

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={primaryDisabled}
          onClick={isRunning ? onPause : onStart}
          className="rounded-[4px] bg-sunrise px-6 py-2 font-pixel text-sm font-bold text-bark shadow-pixel-sm transition-transform active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {primaryLabel}
        </button>

        {!isIdle && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-[4px] bg-panel-inset px-4 py-2 font-pixel text-sm font-bold text-bark shadow-pixel-sm transition-transform active:translate-y-0.5"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 text-[10px] text-soil/40">
        <span>
          <kbd className="rounded bg-soil/10 px-1.5 py-0.5 font-mono">Space</kbd>
          {' '}start / pause
        </span>
        <span>
          <kbd className="rounded bg-soil/10 px-1.5 py-0.5 font-mono">Esc</kbd>
          {' '}reset
        </span>
      </div>
    </div>
  )
}
