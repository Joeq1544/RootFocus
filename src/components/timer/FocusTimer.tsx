interface FocusTimerProps {
  durationMinutes: number
  onComplete: (minutes: number) => void
}

export function FocusTimer({ durationMinutes, onComplete }: FocusTimerProps) {
  return (
    <div data-testid="focus-timer">
      {durationMinutes}:00
    </div>
  )
}
