'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface StreakContextValue {
  currentStreak: number
  updateStreak: (n: number) => void
}

const StreakContext = createContext<StreakContextValue>({
  currentStreak: 0,
  updateStreak: () => {},
})

export function useStreak() {
  return useContext(StreakContext)
}

export function StreakProvider({
  initialStreak,
  children,
}: {
  initialStreak: number
  children: ReactNode
}) {
  const [currentStreak, setCurrentStreak] = useState(initialStreak)
  return (
    <StreakContext.Provider value={{ currentStreak, updateStreak: setCurrentStreak }}>
      {children}
    </StreakContext.Provider>
  )
}
