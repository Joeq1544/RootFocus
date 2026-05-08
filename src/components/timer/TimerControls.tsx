interface TimerControlsProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

export function TimerControls({ isRunning, onStart, onPause, onReset }: TimerControlsProps) {
  return (
    <div data-testid="timer-controls">
      <button onClick={isRunning ? onPause : onStart}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button onClick={onReset}>Reset</button>
    </div>
  )
}
