/**
 * Plays a three-note (C5→E5→G5) arpeggio chime using the Web Audio API.
 * No-op in SSR or when AudioContext is unavailable.
 */
export function playCompletionChime(): void {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.18
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.25, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      osc.start(t)
      osc.stop(t + 0.6)
    })
  } catch {
    // AudioContext blocked or unavailable — silently skip
  }
}
