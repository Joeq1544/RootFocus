'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { TimerPhase } from '@/types'
import { playCompletionChime } from '@/lib/chime'

interface UseFocusTimerOptions {
  taskId: string
  durationMinutes: number
  breakMinutes: number
  isActive: boolean
  onComplete: (durationMinutes: number) => Promise<void>
}

interface UseFocusTimerReturn {
  phase: TimerPhase
  secondsLeft: number
  totalSeconds: number
  reducedMotion: boolean
  start: () => void
  pause: () => void
  reset: () => void
}

export function useFocusTimer({
  durationMinutes,
  breakMinutes,
  isActive,
  onComplete,
}: UseFocusTimerOptions): UseFocusTimerReturn {
  const totalFocusSeconds = durationMinutes * 60
  const totalBreakSeconds = breakMinutes * 60

  const [phase, setPhase] = useState<TimerPhase>('IDLE')
  const [secondsLeft, setSecondsLeft] = useState(totalFocusSeconds)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (phaseRef.current !== 'IDLE' && phaseRef.current !== 'PAUSED') return
    setPhase('RUNNING')
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          // Transition handled in effect watching secondsLeft + phase
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const pause = useCallback(() => {
    clearTimer()
    setPhase('PAUSED')
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setPhase('IDLE')
    setSecondsLeft(totalFocusSeconds)
  }, [clearTimer, totalFocusSeconds])

  // Detect reaching zero while RUNNING
  useEffect(() => {
    if (phase !== 'RUNNING' || secondsLeft !== 0) return
    setPhase('COMPLETED')
    playCompletionChime()
    onComplete(durationMinutes).catch(console.error).finally(() => {
      setTimeout(() => {
        setPhase('BREAK')
        setSecondsLeft(totalBreakSeconds)
        intervalRef.current = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current!)
              intervalRef.current = null
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }, 2000)
    })
  }, [phase, secondsLeft, durationMinutes, totalBreakSeconds, onComplete])

  // Detect break reaching zero
  useEffect(() => {
    if (phase !== 'BREAK' || secondsLeft !== 0) return
    clearTimer()
    setPhase('IDLE')
    setSecondsLeft(totalFocusSeconds)
  }, [phase, secondsLeft, clearTimer, totalFocusSeconds])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (phaseRef.current === 'RUNNING') {
          pause()
        } else if (phaseRef.current === 'IDLE' || phaseRef.current === 'PAUSED') {
          start()
        }
      } else if (e.code === 'Escape') {
        e.preventDefault()
        reset()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isActive, start, pause, reset])

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), [clearTimer])

  const totalSeconds = phase === 'BREAK' ? totalBreakSeconds : totalFocusSeconds

  return { phase, secondsLeft, totalSeconds, reducedMotion, start, pause, reset }
}
