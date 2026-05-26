'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useStreak } from '@/components/providers/StreakContext'
import { formatDateLong, formatMinutes } from '@/lib/format'

interface DashboardChromeProps {
  username: string
  initials: string
  todayMinutes: number
  children: React.ReactNode
}

const NAV_ITEMS = [
  { href: '/garden', label: 'Garden' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/settings', label: 'Settings' },
]

function NavIcon({ href }: { href: string }) {
  if (href === '/garden') return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8 2 5 5 5 9c0 3.5 2.5 6.5 6 7.4V20H9v2h6v-2h-2v-3.6c3.5-.9 6-3.9 6-7.4 0-4-3-7-7-7z" />
    </svg>
  )
  if (href === '/sessions') return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function DashboardChrome({
  username,
  initials,
  todayMinutes,
  children,
}: DashboardChromeProps) {
  const { logout } = useAuth()
  const { currentStreak } = useStreak()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-garden-scene">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-soil/15 bg-mist/95 backdrop-blur-sm transition-transform md:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-2 px-6 py-5">
          <svg className="h-6 w-6 text-forest" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C8 2 5 5 5 9c0 3.5 2.5 6.5 6 7.4V20H9v2h6v-2h-2v-3.6c3.5-.9 6-3.9 6-7.4 0-4-3-7-7-7z" />
          </svg>
          <span className="font-playfair text-lg font-bold text-forest">RootFocus</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-forest/10 text-forest' : 'text-soil hover:bg-soil/10'
                }`}
                onClick={() => setMobileNavOpen(false)}
              >
                <NavIcon href={item.href} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-soil/15 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-bold text-mist">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-forest">{username}</p>
              {todayMinutes > 0 && (
                <p className="text-[11px] text-soil/50">
                  Today: {formatMinutes(todayMinutes)}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-3 w-full rounded-full border border-soil/30 px-3 py-1.5 text-xs font-semibold text-soil transition-colors hover:border-forest hover:bg-forest hover:text-mist"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile nav backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-20 bg-soil/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-col md:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-soil/10 bg-mist/80 px-4 py-3 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-soil hover:bg-soil/10 md:hidden"
              aria-label="Open navigation"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M4 6h16 M4 12h16 M4 18h16" />
              </svg>
            </button>
            <p className="text-sm font-medium text-soil/70">{formatDateLong()}</p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-sunrise/20 px-3 py-1.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-sunrise" fill="currentColor" aria-hidden="true">
              <path d="M13.5 2 C 13.5 6, 8 7, 8 12 C 8 16, 11 19, 14 19 C 17 19, 19 16.5, 19 13 C 19 9.5, 16 8, 16.5 5 C 14 6, 13 4, 13.5 2 Z" />
            </svg>
            <span className="text-xs font-bold text-soil">
              {currentStreak} day{currentStreak === 1 ? '' : 's'} streak
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  )
}
