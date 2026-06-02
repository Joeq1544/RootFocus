'use client'

import { useState, FormEvent } from 'react'
import { useFocusTimer } from '@/hooks/useFocusTimer'
import { TimerControls } from './TimerControls'
import { TimerRepInfo } from '@/components/providers/TimerContext'

interface FocusTimerProps {
  taskId: string
  taskTitle: string
  durationMinutes?: number
  breakMinutes?: number
  repInfo?: TimerRepInfo | null
  onSessionComplete: (data: { taskId: string; durationMinutes: number; completedReps?: number }) => Promise<void>
  onClose: () => void
}

const CIRCUMFERENCE = 2 * Math.PI * 54 // r=54

const TIMER_PREFS_KEY = 'rootfocus.timerPrefs'
type TimerMode = 'pomodoro' | 'long' | 'custom'
interface TimerPrefs {
  mode: TimerMode
  workMinutes: number
  breakMinutes: number
}
const PRESETS: Record<'pomodoro' | 'long', { workMinutes: number; breakMinutes: number }> = {
  pomodoro: { workMinutes: 25, breakMinutes: 5 },
  long: { workMinutes: 50, breakMinutes: 10 },
}

function loadPrefs(fallback: TimerPrefs): TimerPrefs {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(TIMER_PREFS_KEY)
    if (raw) return { ...fallback, ...(JSON.parse(raw) as Partial<TimerPrefs>) }
  } catch {
    /* ignore */
  }
  return fallback
}

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
  repInfo,
  onSessionComplete,
  onClose,
}: FocusTimerProps) {
  const [pendingMinutes, setPendingMinutes] = useState<number | null>(null)
  const [repsInput, setRepsInput] = useState('')
  const [submittingReps, setSubmittingReps] = useState(false)

  // Pre-start setup: presets + custom, remembered in localStorage.
  const [prefs, setPrefs] = useState<TimerPrefs>(() =>
    loadPrefs({ mode: 'pomodoro', workMinutes: durationMinutes, breakMinutes }),
  )
  const [configuring, setConfiguring] = useState(true)

  const { phase, secondsLeft, totalSeconds, reducedMotion, start, pause, reset } = useFocusTimer({
    taskId,
    durationMinutes: prefs.workMinutes,
    breakMinutes: prefs.breakMinutes,
    isActive: !configuring,
    onComplete: async (mins) => {
      if (repInfo) {
        // Rep-based: wait for user to log reps before saving session
        setPendingMinutes(mins)
        setRepsInput('')
      } else {
        await onSessionComplete({ taskId, durationMinutes: mins })
      }
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

  async function submitReps(delta: number) {
    if (pendingMinutes === null) return
    setSubmittingReps(true)
    try {
      await onSessionComplete({
        taskId,
        durationMinutes: pendingMinutes,
        completedReps: delta,
      })
      setPendingMinutes(null)
      setRepsInput('')
    } finally {
      setSubmittingReps(false)
    }
  }

  async function handleRepsSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = Number(repsInput)
    if (!Number.isInteger(parsed) || parsed < 1) return
    await submitReps(parsed)
  }

  function choosePreset(mode: 'pomodoro' | 'long') {
    setPrefs({ mode, ...PRESETS[mode] })
  }
  function updateCustom(patch: Partial<TimerPrefs>) {
    setPrefs((p) => ({ ...p, mode: 'custom', ...patch }))
  }
  function beginSession() {
    try {
      window.localStorage.setItem(TIMER_PREFS_KEY, JSON.stringify(prefs))
    } catch {
      /* ignore */
    }
    setConfiguring(false)
    // start on the next tick so the hook picks up the (possibly new) duration
    setTimeout(() => start(), 0)
  }

  // ── Setup screen (choose duration before starting) ────────────────────────
  if (configuring) {
    const presetBtn = (mode: 'pomodoro' | 'long', label: string, sub: string) => (
      <button
        type="button"
        onClick={() => choosePreset(mode)}
        className={`flex flex-1 flex-col items-center rounded-[4px] px-2 py-2 font-pixel shadow-pixel-sm transition-transform active:translate-y-0.5 ${
          prefs.mode === mode ? 'bg-forest text-mist' : 'bg-panel-inset text-bark'
        }`}
      >
        <span className="text-sm font-bold">{label}</span>
        <span className="text-[10px] opacity-80">{sub}</span>
      </button>
    )
    return (
      <div className="flex flex-col gap-5">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-soil/50">New session</p>
          <h2 className="font-pixel truncate text-base font-bold text-soil">{taskTitle}</h2>
        </div>

        <div className="flex gap-2">
          {presetBtn('pomodoro', 'Pomodoro', '25 / 5')}
          {presetBtn('long', 'Long', '50 / 10')}
          <button
            type="button"
            onClick={() => setPrefs((p) => ({ ...p, mode: 'custom' }))}
            className={`flex flex-1 flex-col items-center rounded-[4px] px-2 py-2 font-pixel shadow-pixel-sm transition-transform active:translate-y-0.5 ${
              prefs.mode === 'custom' ? 'bg-forest text-mist' : 'bg-panel-inset text-bark'
            }`}
          >
            <span className="text-sm font-bold">Custom</span>
            <span className="text-[10px] opacity-80">choose</span>
          </button>
        </div>

        {prefs.mode === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 font-pixel text-xs font-bold text-bark">
              Focus (min)
              <input
                type="number"
                min={1}
                max={180}
                value={prefs.workMinutes}
                onChange={(e) => updateCustom({ workMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                className="rounded-[4px] border-2 border-panel-border bg-white px-2 py-1.5 text-sm text-soil outline-none focus:border-forest"
              />
            </label>
            <label className="flex flex-col gap-1 font-pixel text-xs font-bold text-bark">
              Break (min)
              <input
                type="number"
                min={1}
                max={60}
                value={prefs.breakMinutes}
                onChange={(e) => updateCustom({ breakMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                className="rounded-[4px] border-2 border-panel-border bg-white px-2 py-1.5 text-sm text-soil outline-none focus:border-forest"
              />
            </label>
          </div>
        )}

        <p className="text-center font-pixel text-sm text-bark/70">
          {prefs.workMinutes} min focus · {prefs.breakMinutes} min break
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[4px] bg-panel-inset px-4 py-2 font-pixel text-sm font-bold text-bark shadow-pixel-sm transition-transform active:translate-y-0.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={beginSession}
            className="flex-1 rounded-[4px] bg-sunrise px-4 py-2 font-pixel text-sm font-bold text-bark shadow-pixel-sm transition-transform active:translate-y-0.5"
          >
            Begin
          </button>
        </div>
      </div>
    )
  }

  // ── Rep-logging screen ───────────────────────────────────────────────────
  if (repInfo && pendingMinutes !== null) {
    const remaining = Math.max(0, repInfo.targetReps - repInfo.completedReps)
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="flex w-full items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-soil/50">Session done</p>
            <h2 className="font-pixel truncate text-base font-bold text-soil">{taskTitle}</h2>
          </div>
          <button
            type="button"
            onClick={() => submitReps(0)}
            aria-label="Skip rep logging"
            disabled={submittingReps}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-soil/40 transition-colors hover:bg-soil/10 hover:text-soil"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6 6 18 M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-sunrise/20">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-forest" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="text-center">
          <p className="font-pixel text-lg font-bold text-forest">Nice session!</p>
          <p className="mt-1 text-xs text-soil/60">
            {repInfo.completedReps} / {repInfo.targetReps} reps done · {remaining} to go
          </p>
        </div>

        <form onSubmit={handleRepsSubmit} className="flex w-full flex-col gap-3">
          <label htmlFor="timer-reps" className="text-center text-sm font-medium text-soil">
            How many reps did you log this session?
          </label>
          <input
            id="timer-reps"
            type="number"
            min={0}
            step={1}
            value={repsInput}
            onChange={(e) => setRepsInput(e.target.value)}
            placeholder="e.g. 10"
            autoFocus
            disabled={submittingReps}
            className="w-full rounded-lg border border-soil/30 bg-white/80 px-4 py-2.5 text-center text-soil placeholder-soil/40 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => submitReps(0)}
              disabled={submittingReps}
              className="flex-1 rounded-full border border-soil/30 px-4 py-2 text-sm font-semibold text-soil transition-colors hover:bg-soil/10"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submittingReps || repsInput.trim().length === 0}
              className="flex-1 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-mist transition-colors hover:bg-forest/80 disabled:opacity-50"
            >
              {submittingReps ? 'Saving…' : 'Log reps'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ── Regular timer view ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Header */}
      <div className="flex w-full items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-soil/50">Focus</p>
          <h2 className="font-pixel truncate text-base font-bold text-soil">{taskTitle}</h2>
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
