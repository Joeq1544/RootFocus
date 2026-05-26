'use client'

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
} from 'react'
import ReactDOM from 'react-dom'
import { FocusTimer } from '@/components/timer/FocusTimer'

type SessionHandler = (data: { taskId: string; durationMinutes: number }) => Promise<void>

interface TimerContextValue {
  activeTaskId: string | null
  isModalOpen: boolean
  openTimer: (taskId: string, taskTitle: string) => void
  closeModal: () => void
  registerSessionHandler: (fn: SessionHandler) => void
}

const TimerContext = createContext<TimerContextValue>({
  activeTaskId: null,
  isModalOpen: false,
  openTimer: () => {},
  closeModal: () => {},
  registerSessionHandler: () => {},
})

export function useTimerContext() {
  return useContext(TimerContext)
}

export function TimerContextProvider({ children }: { children: ReactNode }) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeTaskTitle, setActiveTaskTitle] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const sessionHandlerRef = useRef<SessionHandler>(() => Promise.resolve())

  // Wait for document to be available (portal target)
  useEffect(() => setMounted(true), [])

  const openTimer = useCallback((taskId: string, taskTitle: string) => {
    setActiveTaskId(taskId)
    setActiveTaskTitle(taskTitle)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const registerSessionHandler = useCallback((fn: SessionHandler) => {
    sessionHandlerRef.current = fn
  }, [])

  const handleSessionComplete = useCallback(
    async (data: { taskId: string; durationMinutes: number }) => {
      await sessionHandlerRef.current(data)
    },
    [],
  )

  return (
    <TimerContext.Provider value={{ activeTaskId, isModalOpen, openTimer, closeModal, registerSessionHandler }}>
      {children}

      {mounted && activeTaskId && ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          {isModalOpen && (
            <div
              className="fixed inset-0 z-40 bg-soil/40 backdrop-blur-sm"
              onClick={closeModal}
            />
          )}

          {/* Modal card — kept mounted so timer survives close */}
          <div
            className="fixed left-1/2 top-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-mist p-8 shadow-2xl shadow-soil/30"
            style={{ display: isModalOpen ? 'block' : 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <FocusTimer
              taskId={activeTaskId}
              taskTitle={activeTaskTitle}
              onSessionComplete={handleSessionComplete}
              onClose={closeModal}
            />
          </div>

          {/* Minimized pill */}
          {!isModalOpen && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 shadow-lg transition-transform hover:scale-105"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sunrise opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sunrise" />
              </span>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-mist" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8 2 5 5 5 9c0 3.5 2.5 6.5 6 7.4V20H9v2h6v-2h-2v-3.6c3.5-.9 6-3.9 6-7.4 0-4-3-7-7-7z" />
              </svg>
              <span className="max-w-[120px] truncate text-xs font-semibold text-mist">
                {activeTaskTitle}
              </span>
            </button>
          )}
        </>,
        document.body,
      )}
    </TimerContext.Provider>
  )
}
