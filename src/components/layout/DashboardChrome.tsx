'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sprout, Wheat, Clock, Menu, LogOut, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useStreak } from '@/components/providers/StreakContext'
import { formatDateLong, formatMinutes } from '@/lib/format'
import { PixelSprite } from '@/components/pixel/sprites'
import { Avatar } from '@/components/ui/Avatar'

interface DashboardChromeProps {
  name: string | null
  username: string
  avatar: string | null
  todayMinutes: number
  children: React.ReactNode
}

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/garden', label: 'Garden', icon: Sprout },
  { href: '/harvest', label: 'Harvest', icon: Wheat },
  { href: '/sessions', label: 'Sessions', icon: Clock },
]

export function DashboardChrome({ name, username, avatar, todayMinutes, children }: DashboardChromeProps) {
  const { logout, user } = useAuth()
  const { currentStreak } = useStreak()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Prefer live auth user (reflects profile edits) over the server-rendered props.
  const displayName = user?.name ?? name ?? username
  const displayUsername = user?.username ?? username
  const displayAvatar = user?.avatar ?? avatar

  return (
    <div className="relative min-h-screen bg-sky-scene">
      <AmbientLayer />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-wood bg-[image:repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_7px,rgba(0,0,0,0.16)_7px_8px)] shadow-[3px_0_0_0_var(--wood-dark)] transition-transform md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <PixelSprite name="logo" className="h-8 w-8" title="RootFocus" />
          <span className="font-pixel text-xl font-bold text-mist drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
            RootFocus
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-2.5 rounded-[4px] px-3 py-2 font-pixel text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-sunrise text-bark shadow-[inset_0_0_0_2px_rgba(58,40,23,0.35)]'
                    : 'text-mist/90 hover:bg-wood-light'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.5} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="m-3 rounded-[4px] bg-wood-dark/50 p-3 shadow-[inset_0_0_0_2px_rgba(0,0,0,0.2)]">
          <Link
            href="/profile"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-2.5 rounded-[4px] p-1 transition-colors hover:bg-wood-light/50"
            title="View profile"
          >
            <Avatar name={displayName} username={displayUsername} avatar={displayAvatar} className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-pixel text-sm font-semibold text-mist">{displayName}</p>
              {todayMinutes > 0 ? (
                <p className="text-[11px] text-mist/60">Today · {formatMinutes(todayMinutes)}</p>
              ) : (
                <p className="text-[11px] text-mist/50">@{displayUsername}</p>
              )}
            </div>
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-clay px-3 py-1.5 font-pixel text-xs font-semibold text-mist shadow-pixel-sm transition-transform active:translate-y-0.5"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2.5} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile nav backdrop */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-20 bg-bark/40 md:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Main column */}
      <div className="relative z-10 flex min-h-screen flex-col md:pl-60">
        {/* Top banner */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-wood px-4 py-2.5 shadow-[0_3px_0_0_var(--wood-dark)] md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-[4px] bg-wood-light p-1.5 text-mist shadow-pixel-sm md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <p className="font-pixel text-sm font-medium text-mist/90">{formatDateLong()}</p>
          </div>

          <div className="flex items-center gap-2 rounded-[4px] bg-panel px-3 py-1.5 shadow-pixel-sm">
            <PixelSprite name="sun" className="sun-rays h-4 w-4" title="Streak" />
            <span className="font-pixel text-xs font-bold text-bark">
              {currentStreak} day{currentStreak === 1 ? '' : 's'}
            </span>
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 px-4 py-6 md:px-8 md:py-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}

/** Decorative pixel sky: sun, drifting cloud + butterfly. Non-interactive. */
function AmbientLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <PixelSprite name="sun" className="sun-rays absolute right-6 top-4 h-16 w-16 opacity-90" />
      <PixelSprite name="cloud" className="animate-drift absolute left-[18%] top-12 h-12 w-20 opacity-80" />
      <PixelSprite name="cloud" className="animate-drift absolute right-[24%] top-28 h-10 w-16 opacity-70" />
      <PixelSprite name="butterfly" className="animate-drift absolute left-[12%] top-40 h-8 w-8 opacity-90" />
    </div>
  )
}
