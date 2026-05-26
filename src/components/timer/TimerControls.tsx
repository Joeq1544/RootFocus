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
          className="rounded-full bg-sunrise px-6 py-2 text-sm font-semibold text-soil shadow-sm transition-colors hover:bg-sunrise/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {primaryLabel}
        </button>

        {!isIdle && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-soil/30 px-4 py-2 text-sm font-semibold text-soil/70 transition-colors hover:border-soil/60 hover:text-soil"
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
