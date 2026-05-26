/**
 * Returns a human-friendly relative time for the given ISO timestamp.
 * Returns "Never watered" if the input is null.
 */
export function formatRelativeTime(date: string | null): string {
  if (!date) return 'Never watered'
  const diffMs = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `Watered ${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Watered ${hours}h ago`
  const days = Math.floor(hours / 24)
  return `Watered ${days}d ago`
}

/**
 * Returns a time-of-day greeting, e.g. "Good morning, Joe".
 * Hours: 5–11 morning, 12–17 afternoon, otherwise evening.
 */
export function getGreeting(username: string, now: Date = new Date()): string {
  const hour = now.getHours()
  let part = 'evening'
  if (hour >= 5 && hour < 12) part = 'morning'
  else if (hour >= 12 && hour < 18) part = 'afternoon'
  return `Good ${part}, ${username}`
}

/**
 * Formats a Date as "Wednesday, May 8".
 */
export function formatDateLong(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formats an ISO timestamp as a 12-hour time string, e.g. "2:34 PM".
 */
export function formatTimeOfDay(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Formats a total minute count as "1h 25m" or "45m".
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/**
 * Returns "Today", "Yesterday", or a formatted date like "May 8, 2026"
 * for use as session date group headers. Input is a YYYY-MM-DD string.
 */
export function formatDateGroup(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
