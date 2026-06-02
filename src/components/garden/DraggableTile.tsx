'use client'

import { KeyboardEvent, PointerEvent, ReactNode, useRef, useState } from 'react'
import { Pos, snapToGrid, resolveCollision } from '@/lib/garden-layout'

interface DraggableTileProps {
  xFrac: number
  yFrac: number
  /** Returns the bounding rect of the canvas the tile is positioned within. */
  getBedRect: () => DOMRect | null
  /** Positions of the OTHER tiles (for collision resolution on drop). */
  others: Pos[]
  snap: boolean
  onCommit: (pos: Pos) => void
  onActivate: () => void
  disabled?: boolean
  children: ReactNode
}

const MOVE_THRESHOLD_PX = 4

/**
 * Absolutely-positions a child on a fractional canvas and makes it draggable
 * via pointer events. A clean press (no movement past the threshold) fires
 * `onActivate` (click); a drag fires `onCommit` with the snapped, collision-
 * resolved position. Pointer capture keeps the drag smooth across the canvas.
 */
export function DraggableTile({
  xFrac,
  yFrac,
  getBedRect,
  others,
  snap,
  onCommit,
  onActivate,
  disabled,
  children,
}: DraggableTileProps) {
  const [drag, setDrag] = useState<Pos | null>(null)
  const movedRef = useRef(false)
  const startRef = useRef<{ px: number; py: number; x: number; y: number } | null>(null)

  function handlePointerDown(e: PointerEvent) {
    if (disabled) return
    if (e.button !== undefined && e.button !== 0) return
    movedRef.current = false
    startRef.current = { px: e.clientX, py: e.clientY, x: xFrac, y: yFrac }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent) {
    const start = startRef.current
    const rect = getBedRect()
    if (!start || !rect) return
    const dxPx = e.clientX - start.px
    const dyPx = e.clientY - start.py
    if (!movedRef.current && Math.hypot(dxPx, dyPx) < MOVE_THRESHOLD_PX) return
    movedRef.current = true
    const x = Math.min(1, Math.max(0, start.x + dxPx / rect.width))
    const y = Math.min(1, Math.max(0, start.y + dyPx / rect.height))
    setDrag({ x, y })
  }

  function handlePointerUp(e: PointerEvent) {
    const start = startRef.current
    startRef.current = null
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // pointer may already be released
    }

    if (!movedRef.current) {
      setDrag(null)
      onActivate()
      return
    }

    const rect = getBedRect()
    let pos: Pos = drag ?? { x: xFrac, y: yFrac }
    if (rect) {
      if (snap) pos = snapToGrid(pos)
      pos = resolveCollision(pos, others, undefined, snap)
    }
    setDrag(null)
    onCommit(pos)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate()
    }
  }

  const pos = drag ?? { x: xFrac, y: yFrac }
  const isDragging = drag !== null

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise/60 ${
        isDragging ? 'z-20 scale-105 cursor-grabbing' : 'z-0 cursor-grab'
      }`}
    >
      {children}
    </div>
  )
}
