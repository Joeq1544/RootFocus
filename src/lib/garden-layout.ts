/**
 * Spatial-layout helpers for the garden canvas. All positions are fractions
 * in [0,1] of the bed's width/height, so they scale across the small overview
 * bed and the full-screen zoom view alike. A tile's position is its CENTER.
 */

export interface Pos {
  x: number
  y: number
}

/** Grid used for snapping and default flow placement. */
export const GRID_COLS = 5
export const GRID_ROWS = 4

/**
 * Approximate fractional footprint of a tile (used for collision spacing).
 * Tiles are ~80px on a ~360px-wide bed → roughly a fifth of the width.
 */
export const TILE_FRACTION = 0.18

/** Inset so tiles never sit flush against the wooden bed edge. */
export const MARGIN = 0.1

/**
 * Boundary line fractions for an n-cell grid inset by MARGIN on both ends
 * (n+1 lines, from the leading edge to the trailing edge). Cell centers — the
 * snap targets — sit exactly midway between consecutive boundaries, so a grid
 * overlay drawn at these fractions lines up with where tiles snap.
 */
export function gridLineFractions(n: number): number[] {
  const usable = 1 - MARGIN * 2
  const out: number[] = []
  for (let i = 0; i <= n; i++) out.push(MARGIN + (usable * i) / n)
  return out
}

/**
 * Returns the center of grid cell (col,row) in fraction space, with the grid
 * inset by MARGIN on every side.
 */
function cellCenter(col: number, row: number, cols = GRID_COLS, rows = GRID_ROWS): Pos {
  const usable = 1 - MARGIN * 2
  const x = cols <= 1 ? 0.5 : MARGIN + (usable * (col + 0.5)) / cols
  const y = rows <= 1 ? 0.5 : MARGIN + (usable * (row + 0.5)) / rows
  return { x, y }
}

/**
 * Deterministic flow layout for tiles that have no saved position yet.
 * Fills left-to-right, top-to-bottom across the grid.
 */
export function defaultPositions(count: number): Pos[] {
  const out: Pos[] = []
  for (let i = 0; i < count; i++) {
    const col = i % GRID_COLS
    const row = Math.floor(i / GRID_COLS) % GRID_ROWS
    out.push(cellCenter(col, row))
  }
  return out
}

/** Rounds a fractional position to the nearest grid-cell center. */
export function snapToGrid(pos: Pos, cols = GRID_COLS, rows = GRID_ROWS): Pos {
  const usable = 1 - MARGIN * 2
  const col = Math.round(((pos.x - MARGIN) / usable) * cols - 0.5)
  const row = Math.round(((pos.y - MARGIN) / usable) * rows - 0.5)
  const clampedCol = Math.min(cols - 1, Math.max(0, col))
  const clampedRow = Math.min(rows - 1, Math.max(0, row))
  return cellCenter(clampedCol, clampedRow, cols, rows)
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

function dist(a: Pos, b: Pos): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * If `pos` overlaps any position in `others` (centers closer than `minDist`),
 * nudge it away along the vector from the nearest neighbour until clear, or to
 * the nearest free grid cell when `snap` is on. Bounded iterations; clamped to
 * [0,1]. `others` are the positions of the OTHER tiles (exclude the dragged one).
 */
export function resolveCollision(
  pos: Pos,
  others: Pos[],
  minDist = TILE_FRACTION,
  snap = false,
): Pos {
  const collides = (p: Pos) => others.some((o) => dist(p, o) < minDist)

  if (!collides(pos)) return pos

  if (snap) {
    // Spiral outward over grid cells from the snapped cell to find a free one.
    const start = snapToGrid(pos)
    if (!collides(start)) return start
    for (let ring = 1; ring <= Math.max(GRID_COLS, GRID_ROWS); ring++) {
      for (let dc = -ring; dc <= ring; dc++) {
        for (let dr = -ring; dr <= ring; dr++) {
          if (Math.abs(dc) !== ring && Math.abs(dr) !== ring) continue
          const candidate = {
            x: clamp01(start.x + (dc * (1 - MARGIN * 2)) / GRID_COLS),
            y: clamp01(start.y + (dr * (1 - MARGIN * 2)) / GRID_ROWS),
          }
          if (!collides(candidate)) return candidate
        }
      }
    }
    return start
  }

  // Free placement: push directly away from the nearest neighbour.
  let current = { ...pos }
  for (let i = 0; i < 24 && collides(current); i++) {
    let nearest = others[0]
    let best = Infinity
    for (const o of others) {
      const d = dist(current, o)
      if (d < best) {
        best = d
        nearest = o
      }
    }
    let dx = current.x - nearest.x
    let dy = current.y - nearest.y
    const len = Math.hypot(dx, dy) || 1
    dx /= len
    dy /= len
    const step = (minDist - best) + 0.02
    current = { x: clamp01(current.x + dx * step), y: clamp01(current.y + dy * step) }
  }
  return current
}
